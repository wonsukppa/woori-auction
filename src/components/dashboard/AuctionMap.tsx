import React, { useEffect, useRef, useState } from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { Navigation } from 'lucide-react';
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
  priceDisplayMode: 'total' | 'pyeong' | 'm2';
  setPriceDisplayMode: (mode: 'total' | 'pyeong' | 'm2') => void;
}

// Simple price formatter for markers (e.g., 3.4억, 5,200만)
const formatMarkerPrice = (price: number) => {
  if (price >= 100000000) {
    return `${(price / 100000000).toFixed(1)}억`;
  }
  return `${Math.floor(price / 10000).toLocaleString()}만`;
};

export default function AuctionMap({ properties, activeProperty, onSelect, priceDisplayMode, setPriceDisplayMode }: AuctionMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapType, setMapType] = useState<'base' | 'sat'>('base');
  const [showCadastral, setShowCadastral] = useState(false);
  const leafletMap = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: number]: L.Marker; group: any }>({ group: null });
  const isMobile = useMediaQuery('(max-width: 768px)');
  const baseLayerRef = useRef<L.TileLayer | null>(null);
  const cadLayerRef = useRef<L.TileLayer | null>(null);
  const vworldLayerRef = useRef<L.TileLayer | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      fixLeafletIcons();
      require('leaflet.markercluster');
    }

    if (mapContainerRef.current && !leafletMap.current) {
      leafletMap.current = L.map(mapContainerRef.current, {
        center: [37.5665, 126.9780],
        zoom: 13,
        maxZoom: 22,
        minZoom: 6,
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

  // Update All Layers
  useEffect(() => {
    if (!leafletMap.current) return;

    // 1. Clean up everything first to prevent stacking
    if (baseLayerRef.current) leafletMap.current.removeLayer(baseLayerRef.current);
    if (cadLayerRef.current) leafletMap.current.removeLayer(cadLayerRef.current);
    if (vworldLayerRef.current) leafletMap.current.removeLayer(vworldLayerRef.current);

    // 2. Add Base Layer (HTTPS)
    let baseUrl = 'https://mt0.google.com/vt/lyrs=m&hl=ko&x={x}&y={y}&z={z}'; // Roadmap
    if (mapType === 'sat') {
      baseUrl = 'https://mt0.google.com/vt/lyrs=y&hl=ko&x={x}&y={y}&z={z}'; // Satellite Hybrid
    }
    const vworldKey = process.env.NEXT_PUBLIC_VWORLD_API_KEY || '9686FCE1-E736-314F-9979-FAB924182366';

    // 3. Define Layers
    if (showCadastral) {
      // MODE: Professional Cadastral (Integrated Vworld Engine)
      const vworldBaseUrl = `https://api.vworld.kr/req/wmts/1.0.0/${vworldKey}/Base/{z}/{y}/{x}.png`;
      baseLayerRef.current = L.tileLayer(vworldBaseUrl, {
        zIndex: 1,
        maxNativeZoom: 19, // Vworld base ends at 19
        maxZoom: 22
      }).addTo(leafletMap.current);

      const vworldCadUrl = `https://api.vworld.kr/req/wmts/1.0.0/${vworldKey}/LP_PA_CBND_BUBUN/{z}/{y}/{x}.png`;
      cadLayerRef.current = L.tileLayer(vworldCadUrl, {
        zIndex: 2,
        opacity: 0.9,
        transparent: true,
        maxNativeZoom: 19, // Vworld cadastral ends at 19
        maxZoom: 22
      }).addTo(leafletMap.current);

    } else {
      // MODE: Standard Google Maps
      const baseUrl = mapType === 'base' 
        ? 'https://mt1.google.com/vt/lyrs=m&hl=ko&x={x}&y={y}&z={z}'
        : 'https://mt1.google.com/vt/lyrs=y&hl=ko&x={x}&y={y}&z={z}';
      
      baseLayerRef.current = L.tileLayer(baseUrl, {
        attribution: '&copy; Google Maps',
        zIndex: 1,
        maxNativeZoom: 20,
        maxZoom: 22
      }).addTo(leafletMap.current);
    }
  }, [mapType, showCadastral]);

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

      const score = p.analysis.score;
      const gradeColor = score >= 85 ? '#1268FB' : (score >= 70 ? '#059669' : '#d97706');
      
      // Calculate display text based on mode (Total Price vs Price per Unit)
      let labelText = '';
      let unitText = '';
      
      if (priceDisplayMode === 'total') {
        labelText = formatMarkerPrice(p.minPrice);
        unitText = '';
      } else if (priceDisplayMode === 'm2') {
        const m2Price = p.minPrice / (p.area || 1);
        labelText = `${Math.round(m2Price / 10000).toLocaleString()}만`;
        unitText = '/㎡';
      } else if (priceDisplayMode === 'pyeong') {
        const pyeongPrice = (p.minPrice / (p.area || 1)) * 3.3058;
        labelText = `${Math.round(pyeongPrice / 10000).toLocaleString()}만`;
        unitText = '/평';
      }

      // Building Type Label (Shortened for Mobile)
      const typeLabel = p.type.length > 2 ? p.type.substring(0, 2) : p.type;
      
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
            <div style="
              background: ${gradeColor};
              padding: 0 10px;
              height: ${isMobile ? '30px' : '26px'};
              border-radius: 8px;
              border: 1.5px solid white;
              box-shadow: 0 6px 16px rgba(0,0,0,0.2);
              display: flex;
              align-items: center;
              gap: 2px;
              color: white;
              font-size: 11px;
              font-weight: 800;
              white-space: nowrap;
              transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            ">
              <span style="
                background: white;
                color: ${gradeColor};
                padding: 1px 4px;
                border-radius: 4px;
                font-size: 9px;
                font-weight: 900;
                margin-right: 4px;
              ">${typeLabel}</span>
              ${labelText}<span style="font-size: 9px; font-weight: 400; opacity: 0.9;">${unitText}</span>
              <div style="
                background: rgba(255,255,255,0.2);
                color: white;
                padding: 1px 5px;
                border-radius: 4px;
                font-size: 10px;
                font-weight: 900;
                margin-left: 4px;
                border: 1px solid rgba(255,255,255,0.3);
              ">
                ${score}
              </div>
            </div>
            <div style="
              width: 0;
              height: 0;
              border-left: 5px solid transparent;
              border-right: 5px solid transparent;
              border-top: 6px solid ${gradeColor};
              margin-top: -1px;
            "></div>
          </div>
        `,
        iconSize: [isMobile ? 130 : 120, 40],
        iconAnchor: [isMobile ? 65 : 60, 36],
      });

      const marker = L.marker([p.lat, p.lng], { icon: customIcon });
      
      marker.on('click', () => onSelect(p));
      
      marker.bindPopup(`
        <div style="padding: 5px; width: 180px;">
          <div style="font-size: 10px; color: #1268FB; font-weight: 800; margin-bottom: 2px;">${p.caseNo}</div>
          <div style="font-size: 13px; font-weight: 900; color: #111827;">${priceDisplayMode === 'total' ? formatPrice(p.minPrice) : (labelText + unitText)}</div>
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
  }, [properties, onSelect, priceDisplayMode]);

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

  const handleMyLocation = () => {
    if (!navigator.geolocation) {
      alert('이 브라우저에서는 위치 정보를 지원하지 않습니다.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (leafletMap.current) {
          leafletMap.current.setView([latitude, longitude], 16, { animate: true });
          
          // Add a temporary blue dot for user location
          const userIcon = L.divIcon({
            className: 'user-location',
            html: `<div style="width: 14px; height: 14px; background: #1268FB; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(18,104,251,0.5);"></div>`,
            iconSize: [14, 14],
            iconAnchor: [7, 7]
          });
          L.marker([latitude, longitude], { icon: userIcon }).addTo(leafletMap.current);
        }
      },
      (error) => {
        console.error('Geolocation Error:', error);
        alert('위치 정보를 가져올 수 없습니다. 권한 설정을 확인해주세요.');
      }
    );
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#f8fafc' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />
      
      {/* ── PRICE UNIT TOGGLE: Top Right Desktop Only ── */}
      <div style={{ 
        position: 'absolute', 
        top: 24, 
        left: 'auto',
        right: 24, 
        zIndex: 1000,
        pointerEvents: 'auto',
        display: isMobile ? 'none' : 'block'
      }}>
        <div style={{ 
          background: 'white', 
          padding: '4px', 
          borderRadius: 12, 
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)', 
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'row',
          gap: 4
        }}>
          {(['total', 'm2', 'pyeong'] as const).map(mode => (
            <button 
              key={mode} 
              onClick={() => setPriceDisplayMode(mode)}
              style={{ 
                padding: '8px 16px', 
                border: 'none', 
                background: priceDisplayMode === mode ? '#1268FB' : 'white', 
                color: priceDisplayMode === mode ? 'white' : '#64748b', 
                fontSize: 12, 
                fontWeight: 900, 
                borderRadius: 8, 
                cursor: 'pointer',
                transition: 'all 0.2s',
                minWidth: 50
              }}
            >
              {mode === 'total' ? '총액' : mode === 'm2' ? '㎡' : '평'}
            </button>
          ))}
        </div>
      </div>

      {/* GPS Button - Bottom Left (Desktop) / Bottom Right (Mobile) */}
      <div style={{
        position: 'absolute',
        bottom: isMobile ? 120 : 100,
        left: isMobile ? 'auto' : 24,
        right: isMobile ? 24 : 'auto',
        zIndex: 10,
        pointerEvents: 'auto'
      }}>
        <button 
          onClick={handleMyLocation}
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'white',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
            cursor: 'pointer',
            color: '#1268FB',
            transition: 'all 0.2s'
          }}
        >
          <Navigation size={24} fill="#1268FB" />
        </button>
      </div>

      {/* ── MAP TYPE & LAYERS: Bottom Left Desktop Only ── */}
      <div style={{ 
        position: 'absolute', 
        bottom: isMobile ? 'auto' : 160, 
        top: isMobile ? 80 : 'auto',
        left: 24,
        zIndex: 1000, 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 12,
        pointerEvents: 'none'
      }}>
        {/* Base Map Switcher */}
        <div style={{
          background: 'white',
          padding: 4,
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          pointerEvents: 'auto'
        }}>
          {[
            { id: 'base', label: '일반' },
            { id: 'sat', label: '위성' }
          ].map(type => (
            <button 
              key={type.id} 
              onClick={() => setMapType(type.id as any)}
              style={{ 
                padding: '8px 12px',
                height: 36,
                background: mapType === type.id ? '#1268FB' : 'white', 
                border: 'none',
                borderRadius: 8, 
                fontSize: 12, 
                fontWeight: 900, 
                color: mapType === type.id ? 'white' : '#475569', 
                cursor: 'pointer',
                transition: 'all 0.2s',
                minWidth: 50
              }}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Specialized Overlays */}
        <div style={{
          background: 'white',
          padding: 4,
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          border: '1px solid #e2e8f0',
          display: 'flex',
          pointerEvents: 'auto'
        }}>
          <button 
            onClick={() => setShowCadastral(!showCadastral)}
            style={{ 
              padding: '8px 12px',
              height: 36,
              background: showCadastral ? '#f59e0b' : 'white', 
              border: 'none',
              borderRadius: 8, 
              fontSize: 12, 
              fontWeight: 900, 
              color: showCadastral ? 'white' : '#475569', 
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              whiteSpace: 'nowrap'
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: showCadastral ? 'white' : '#f59e0b' }}></span>
            지적도
          </button>
        </div>
      </div>
    </div>
  );
}
