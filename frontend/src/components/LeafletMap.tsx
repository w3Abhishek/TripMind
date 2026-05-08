'use client';

import { useEffect, useRef } from 'react';
import { ExternalLink } from 'lucide-react';

interface LeafletMapProps {
  destination: string;
}

export default function LeafletMap({ destination }: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);

  useEffect(() => {
    let isCancelled = false;
    
    if (!mapRef.current || mapInstanceRef.current) return;

    // Dynamically import Leaflet so it never runs on the server
    import('leaflet').then((L) => {
      if (isCancelled || !mapRef.current) return;
      
      // Prevent strict mode double-initialization
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((mapRef.current as any)._leaflet_id) return;

      // Fix default marker icon paths broken by webpack
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // Start with a world view; geocode via Nominatim
      const map = L.map(mapRef.current).setView([20, 0], 2);
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      // Geocode via Nominatim (no API key needed)
      fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(destination)}&format=json&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      )
        .then(r => r.json())
        .then((results) => {
          if (isCancelled || !mapInstanceRef.current) return;
          if (results?.length) {
            const { lat, lon, display_name } = results[0];
            const latlng: [number, number] = [parseFloat(lat), parseFloat(lon)];
            map.setView(latlng, 12);
            L.marker(latlng)
              .addTo(map)
              .bindPopup(`<b>${display_name}</b>`)
              .openPopup();
          }
        })
        .catch(() => {
          // Nominatim failed — just stay on world view
        });
    });

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (mapInstanceRef.current as any).remove();
        mapInstanceRef.current = null;
      }
    };
  }, [destination]);

  const osmSearchUrl = `https://www.openstreetmap.org/search?query=${encodeURIComponent(destination)}`;

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 border-b border-border flex items-center justify-between bg-card">
        <h3 className="font-semibold text-foreground text-sm">📍 {destination}</h3>
        <a
          href={osmSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary flex items-center gap-1 hover:underline"
        >
          Open in OSM <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Map container — Leaflet CSS loaded via CDN link in layout */}
      <div ref={mapRef} style={{ height: 280, width: '100%' }} />
    </div>
  );
}
