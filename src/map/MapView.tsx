import { useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { createPulseDot } from './pulseEffect';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const getRiskLabel = (risk: number) => {
  if (risk > 0.8) return 'Critical';
  if (risk > 0.4) return 'Low';
  return 'Healthy';
};

const getRiskColor = (risk: number) => {
  if (risk > 0.8) return '#ef4444';
  if (risk > 0.4) return '#f59e0b';
  return '#22c55e';
};

export const MapView: React.FC<{ data: any }> = ({ data }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const popup = useRef<mapboxgl.Popup | null>(null);

  const handleStationClick = useCallback((e: mapboxgl.MapLayerMouseEvent) => {
    if (!e.features?.length || !map.current) return;

    const feature = e.features[0];
    const coords = (feature.geometry as any).coordinates.slice();
    const { name, bikes, capacity, risk } = feature.properties as any;
    const riskVal = parseFloat(risk);
    const pct = capacity > 0 ? Math.round((bikes / capacity) * 100) : 0;

    popup.current?.remove();
    popup.current = new mapboxgl.Popup({
      closeButton: false,
      className: 'station-popup',
      maxWidth: '240px',
      offset: 15,
    })
      .setLngLat(coords)
      .setHTML(`
        <div style="
          background: rgba(10,10,15,0.92);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 14px 16px;
          font-family: 'Inter', system-ui, sans-serif;
          color: white;
          min-width: 200px;
        ">
          <div style="font-size:13px;font-weight:700;margin-bottom:8px;line-height:1.3;">${name}</div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:10px;">
            <span style="
              display:inline-block;width:8px;height:8px;border-radius:50%;
              background:${getRiskColor(riskVal)};
              box-shadow: 0 0 6px ${getRiskColor(riskVal)};
            "></span>
            <span style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:${getRiskColor(riskVal)}">
              ${getRiskLabel(riskVal)}
            </span>
          </div>
          <div style="
            background: rgba(255,255,255,0.05);
            border-radius: 8px;
            padding: 10px 12px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          ">
            <div>
              <div style="font-size:10px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.5px;">Bikes</div>
              <div style="font-size:18px;font-weight:700;">${bikes}</div>
            </div>
            <div>
              <div style="font-size:10px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.5px;">Capacity</div>
              <div style="font-size:18px;font-weight:700;">${capacity}</div>
            </div>
          </div>
          <div style="margin-top:10px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
              <span style="font-size:10px;color:rgba(255,255,255,0.4);text-transform:uppercase;">Fill</span>
              <span style="font-size:10px;font-weight:600;">${pct}%</span>
            </div>
            <div style="height:4px;background:rgba(255,255,255,0.08);border-radius:2px;overflow:hidden;">
              <div style="
                height:100%;width:${pct}%;border-radius:2px;
                background: ${getRiskColor(riskVal)};
                transition: width 0.3s ease;
              "></div>
            </div>
          </div>
        </div>
      `)
      .addTo(map.current);
  }, []);

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-73.9857, 40.7484],
      zoom: 13,
      pitch: 45,
      bearing: -15,
      antialias: true,
    });

    map.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

    map.current.on('load', () => {
      if (!map.current) return;

      map.current.addImage('pulse-red', createPulseDot(map.current, '231, 76, 60', 1200) as any);
      map.current.addImage('pulse-amber', createPulseDot(map.current, '241, 196, 15', 2000) as any);
      map.current.addImage('pulse-green', createPulseDot(map.current, '46, 204, 113', 3000) as any);

      map.current.addSource('stations', {
        type: 'geojson',
        data: data,
      });

      map.current.addLayer({
        id: 'station-pulses',
        type: 'symbol',
        source: 'stations',
        layout: {
          'icon-image': [
            'case',
            ['>', ['get', 'risk'], 0.8], 'pulse-red',
            ['>', ['get', 'risk'], 0.4], 'pulse-amber',
            'pulse-green',
          ],
          'icon-allow-overlap': true,
          'icon-size': [
            'interpolate', ['linear'], ['zoom'],
            10, 0.3,
            13, 0.5,
            16, 0.7,
          ],
        },
      });

      map.current.on('click', 'station-pulses', handleStationClick);

      map.current.on('mouseenter', 'station-pulses', () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });
      map.current.on('mouseleave', 'station-pulses', () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      });
    });

    return () => map.current?.remove();
  }, [handleStationClick]);

  useEffect(() => {
    const source = map.current?.getSource('stations') as mapboxgl.GeoJSONSource | undefined;
    if (source) source.setData(data);
  }, [data]);

  return <div ref={mapContainer} className="absolute inset-0 w-full h-full" />;
};
