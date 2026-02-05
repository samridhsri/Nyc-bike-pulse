import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { createPulseDot } from './map/pulseEffect';

// TODO: Move to environment variable (e.g., import.meta.env.VITE_MAPBOX_TOKEN)
mapboxgl.accessToken = 'pk.eyJ1Ijoic2FtcmlkaHNyaSIsImEiOiJjbWw1dmdhc3cwN21oM2Vvam1yaDRmNjkyIn0.Jg9HHheZrB4w9FPWnxOytg';

interface StationInfo {
  legacy_id: string;
  lat: number;
  lon: number;
  capacity: number;
}

interface LiveStatus {
  legacy_id: string;
  num_bikes_available: number;
}

interface MapViewProps {
  info: StationInfo[];
  liveStatus: LiveStatus[];
}

export const MapView = ({ info, liveStatus }: MapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-73.9857, 40.7484],
      zoom: 12.5,
      pitch: 45, // That 3D premium look
      bearing: -15,
      antialias: true
    });

    mapRef.current = map;

    map.on('load', () => {
      // Add pulse effect images
      map.addImage('pulse-low', createPulseDot(map, '0, 255, 0', 3000));
      map.addImage('pulse-medium', createPulseDot(map, '255, 165, 0', 2000));
      map.addImage('pulse-high', createPulseDot(map, '255, 0, 0', 1000));

      // Create GeoJSON from station data
      const stations = info.map(s => {
        const status = liveStatus.find(ls => ls.legacy_id === s.legacy_id);
        const bikes = status?.num_bikes_available || 0;
        const risk = 1 - (bikes / s.capacity); // 1.0 is empty, 0.0 is full

        return {
          type: 'Feature' as const,
          properties: {
            risk,
            bikes,
            pulseSpeed: risk > 0.8 ? 1 : 3 // Fast pulse for high risk
          },
          geometry: {
            type: 'Point' as const,
            coordinates: [s.lon, s.lat]
          }
        };
      });

      // Add source
      map.addSource('stations', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: stations
        }
      });

      // Add layer with conditional styling based on risk
      map.addLayer({
        id: 'station-pulses',
        type: 'symbol',
        source: 'stations',
        layout: {
          'icon-image': [
            'case',
            ['>=', ['get', 'risk'], 0.8], 'pulse-high',
            ['>=', ['get', 'risk'], 0.5], 'pulse-medium',
            'pulse-low'
          ],
          'icon-allow-overlap': true
        }
      });
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [info, liveStatus]);

  return <div ref={mapContainer} className="h-screen w-full" />;
};