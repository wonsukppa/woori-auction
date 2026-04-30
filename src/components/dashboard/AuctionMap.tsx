import React, { useEffect, useRef, useState } from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { AuctionProperty } from '../../types/auction';
import { formatPrice } from '../../utils/format';

const fixLeafletIcons = () => {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  });
};

interface AuctionMapProps {
  properties: AuctionProperty[];
  activeProperty: AuctionProperty | null;
  onSelect: (p: AuctionProperty) => void;
}

// Simple price formatter for markers (e.g., 3.4억, 5,200만)
const formatMarkerPrice = (price: number) => {
  if (price >= 100000000) {
    return `${(price / 100000000).toFixed(1)}억`;
  }
  return `${Math.floor(price / 10000).toLocaleString()}만`;
};

export default function AuctionMap({ properties, activeProperty, onSelect }: AuctionMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: number]: L.Marker; group: any }>({ group: null });
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [mapType, setMapType] = useState<'base' | 'sat' | 'cad'>('base');
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      fixLeafletIcons();
      require('leaflet.markercluster');
    }

    if (mapContainerRef.current && !leafletMap.current) {
      leafletMap.current = L.map(mapContainerRef.current, {
        center: [37.5665, 126.9780],
        zoom: 13,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(leafletMap.current);
    }

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  // Update Tile Layer when mapType changes
  useEffect(() => {
    if (!leafletMap.current) return;

    if (tileLayerRef.current) {
      leafletMap.current.removeLayer(tileLayerRef.current);
    }

    let url = 'http://mt0.google.com/vt/lyrs=m&hl=ko&x={x}&y={y}&z={z}'; // Default Roadmap
    if (mapType === 'sat') {
      url = 'http://mt0.google.com/vt/lyrs=y&hl=ko&x={x}&y={y}&z={z}'; // Satellite Hybrid
    } else if (mapType === 'cad') {
      // For Cadastral, we'll try to use a Vworld-style overlay or Google Terrain
      url = 'http://mt0.google.com/vt/lyrs=p&hl=ko&x={x}&y={y}&z={z}'; 
    }

    tileLayerRef.current = L.tileLayer(url, {
      attribution: '&copy; Google Maps'
    }).addTo(leafletMap.current);
  }, [mapType]);

  useEffect(() => {
    if (!leafletMap.current) return;

    if (markersRef.current.group) {
      leafletMap.current.removeLayer(markersRef.current.group);
    }

    // @ts-ignore
    const clusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
    });

    const newMarkers: { [key: number]: L.Marker; group: any } = { group: clusterGroup };

    properties.forEach(p => {
      if (!p.lat || !p.lng) return;

      const gradeColor = p.analysis.score >= 85 ? '#1268FB' : (p.analysis.score >= 70 ? '#059669' : '#d97706');
      const priceText = formatMarkerPrice(p.minPrice);
      
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            background: ${gradeColor};
            padding: 0 10px;
            height: 28px;
            border-radius: 14px;
            border: 2px solid white;
            box-shadow: 0 4px 15px rgba(0,0,0,0.25);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 11px;
            font-weight: 900;
            white-space: nowrap;
          ">
            ${priceText}
          </div>
          <div style="
            width: 0;
            height: 0;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-top: 8px solid ${gradeColor};
            margin-left: auto;
            margin-right: auto;
            margin-top: -1px;
          "></div>
        `,
        iconSize: [60, 36],
        iconAnchor: [30, 36],
      });

      const marker = L.marker([p.lat, p.lng], { icon: customIcon });
      
      marker.on('click', () => onSelect(p));
      
      marker.bindPopup(`
        <div style="padding: 5px; width: 180px;">
          <div style="font-size: 10px; color: #1268FB; font-weight: 800; margin-bottom: 2px;">${p.caseNo}</div>
          <div style="font-size: 13px; font-weight: 900; color: #111827;">${formatPrice(p.minPrice)}</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 4px; line-height: 1.4;">${p.address}</div>
        </div>
      `, {
        closeButton: false,
        offset: [0, -25]
      });

      clusterGroup.addLayer(marker);
      newMarkers[p.id] = marker;
    });

    if (leafletMap.current) {
      leafletMap.current.addLayer(clusterGroup);
    }
    
    markersRef.current = newMarkers;
  }, [properties, onSelect]);

  useEffect(() => {
    if (activeProperty && leafletMap.current && activeProperty.lat && activeProperty.lng) {
      // Small timeout to ensure markers are ready
      const moveMap = () => {
        leafletMap.current?.setView([activeProperty.lat, activeProperty.lng], 16, {
          animate: true,
          duration: 0.8
        });
        
        const marker = markersRef.current[activeProperty.id];
        if (marker) {
          // Open popup after a short delay to wait for animation
          setTimeout(() => {
            marker.openPopup();
          }, 800);
        }
      };

      moveMap();
    }
  }, [activeProperty]);

  return (
    <div style={{ flex: 1, position: 'relative', background: '#f8fafc' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />
      
      <div style={{ 
        position: 'absolute', 
        top: isMobile ? 'auto' : 24, 
        bottom: isMobile ? 80 : 'auto',
        left: isMobile ? 12 : 24, 
        zIndex: 5, 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 12,
        pointerEvents: 'none'
      }}>
        <div style={{ 
          background: 'rgba(255,255,255,0.9)', 
          padding: '10px 16px', 
          borderRadius: 16, 
          boxShadow: '0 4px 15px rgba(0,0,0,0.08)', 
          border: '1px solid #f1f5f9',
          backdropFilter: 'blur(8px)',
          pointerEvents: 'auto'
        }}>
          <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 800, marginBottom: 6, letterSpacing: '0.05em' }}>MAP VIEW</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { id: 'base', label: '일반' },
              { id: 'sat', label: '위성' },
              { id: 'cad', label: '지형' }
            ].map(type => (
              <button 
                key={type.id} 
                onClick={() => setMapType(type.id as any)}
                style={{ 
                  padding: '6px 12px', 
                  background: mapType === type.id ? '#1268FB' : '#f8fafc', 
                  border: '1px solid',
                  borderColor: mapType === type.id ? '#1268FB' : '#e2e8f0', 
                  borderRadius: 8, 
                  fontSize: 10, 
                  fontWeight: 700, 
                  color: mapType === type.id ? 'white' : '#64748b', 
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
