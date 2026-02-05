import { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface StationFeature {
  type: 'Feature';
  properties: {
    id: string;
    name: string;
    bikes: number;
    risk: number;
    capacity: number;
    pulseSpeed: number;
  };
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
}

export interface SystemStats {
  totalStations: number;
  totalBikes: number;
  totalCapacity: number;
  criticalCount: number;
  lowCount: number;
  healthyCount: number;
  systemLoad: number; // percentage of total capacity in use
  lastUpdated: Date;
}

export const useBikeData = () => {
  const [data, setData] = useState<any>(null);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch(`${API_URL}/api/stations`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json = await response.json();

      if (!json.success) {
        throw new Error(json.error || 'Failed to fetch station data');
      }

      let totalBikes = 0;
      let totalCapacity = 0;
      let criticalCount = 0;
      let lowCount = 0;
      let healthyCount = 0;

      const features: StationFeature[] = json.stations.map((station: any) => {
        totalBikes += station.bikes;
        totalCapacity += station.capacity;
        if (station.risk > 0.8) criticalCount++;
        else if (station.risk > 0.4) lowCount++;
        else healthyCount++;

        return {
          type: 'Feature',
          properties: {
            id: station.id,
            name: station.name,
            bikes: station.bikes,
            risk: station.risk,
            capacity: station.capacity,
            pulseSpeed: station.pulse_speed,
          },
          geometry: {
            type: 'Point',
            coordinates: [station.lon, station.lat],
          },
        };
      });

      setData({ type: 'FeatureCollection', features });
      setStats({
        totalStations: json.stations.length,
        totalBikes,
        totalCapacity,
        criticalCount,
        lowCount,
        healthyCount,
        systemLoad: totalCapacity > 0 ? Math.round((totalBikes / totalCapacity) * 100) : 0,
        lastUpdated: new Date(),
      });
      setIsLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Failed to fetch Citi Bike data:', errorMessage);
      setError(errorMessage);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 60000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  return { data, stats, error, isLoading, refetch: fetchStatus };
};
