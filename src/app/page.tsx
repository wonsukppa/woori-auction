'use client';
import React, { useEffect, Suspense } from 'react';
import AuctionList from '../components/dashboard/AuctionList';
import dynamic from 'next/dynamic';
const AuctionMap = dynamic(() => import('../components/dashboard/AuctionMap'), { ssr: false });
import AnalysisPanel from '../components/dashboard/AnalysisPanel';
import { useAuctionData } from '../hooks/useAuctionData';
import { useSearchParams } from 'next/navigation';

function HomeContent() {
  const { properties, activeProperty, setActiveProperty, isLoading, refresh } = useAuctionData();
  const searchParams = useSearchParams();
  const idParam = searchParams?.get('id');

  useEffect(() => {
    if (idParam && properties.length > 0) {
      const p = properties.find(x => String(x.id) === idParam);
      if (p && (!activeProperty || activeProperty.id !== p.id)) {
        setActiveProperty(p);
      }
    }
  }, [idParam, properties, setActiveProperty]); 

  const [gradeFilter, setGradeFilter] = React.useState<string>('ALL');

  const getGrade = (score: number) => {
    if (score >= 90) return 'S';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    return 'C';
  };

  const filteredProperties = properties.filter(p => {
    if (gradeFilter === 'ALL') return true;
    return getGrade(p.analysis?.score || 0) === gradeFilter;
  });

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      width: '100vw', 
      overflow: 'hidden', 
      fontFamily: '"Pretendard Variable", Pretendard, sans-serif', 
      background: '#f8f9fa' 
    }}>
      {/* ── LEFT PANEL: Auction List ── */}
      <AuctionList 
        properties={filteredProperties} 
        activeProperty={activeProperty} 
        onSelect={setActiveProperty} 
        isLoading={isLoading} 
        onRefresh={refresh} 
      />

      {/* ── CENTER PANEL: Interactive Map ── */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
        <div style={{ 
          position: 'absolute', 
          top: 20, 
          left: '50%', 
          transform: 'translateX(-50%)', 
          zIndex: 10, 
          display: 'flex', 
          gap: 6, 
          background: 'rgba(255,255,255,0.9)', 
          padding: '6px 10px', 
          borderRadius: 25, 
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)', 
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.3)',
          whiteSpace: 'nowrap',
          flexWrap: 'nowrap',
          maxWidth: 'calc(100vw - 40px)',
          overflowX: 'auto'
        }} className="cscroll-hidden">
          {['ALL', 'S', 'A', 'B', 'C'].map(g => (
            <button key={g} onClick={() => setGradeFilter(g)} style={{ 
              padding: '6px 12px', 
              borderRadius: 20, 
              border: 'none', 
              background: gradeFilter === g ? '#1268FB' : 'transparent', 
              color: gradeFilter === g ? 'white' : '#475569', 
              fontWeight: 800, 
              fontSize: 12, 
              cursor: 'pointer', 
              transition: 'all 0.2s',
              flexShrink: 0
            }}>
              {g === 'ALL' ? '전체 보기' : `${g}등급`}
            </button>
          ))}
        </div>
        <AuctionMap 
          properties={filteredProperties} 
          activeProperty={activeProperty} 
          onSelect={setActiveProperty} 
        />
      </div>

      {/* ── RIGHT PANEL: AI Analysis & Calculator ── */}
      <AnalysisPanel 
        activeProperty={activeProperty} 
      />

      {/* Global Styles */}
      <style jsx global>{`
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable.min.css');
        * { box-sizing: border-box; }
        body { margin: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes scan { 0%{top:0;opacity:0} 50%{opacity:1} 100%{top:100%;opacity:0} }
        .spin { animation: spin 1s linear infinite; }
        .scan-line { position:absolute;top:0;left:0;width:100%;height:2px;background:#1268FB;box-shadow:0 0 12px #1268FB;animation:scan 2s ease-in-out infinite;pointer-events:none; }
        .cscroll::-webkit-scrollbar { width:4px; }
        .cscroll::-webkit-scrollbar-thumb { background:#e5e7eb;border-radius:4px; }
        .cscroll-hidden::-webkit-scrollbar { display: none; }
        .cscroll-hidden { -ms-overflow-style: none; scrollbar-width: none; }
        
        /* Custom Marker & Cluster Styles */
        .db-cluster-badge {
          width: 40px;
          height: 40px;
          background: #1268FB;
          border: 3px solid white;
          border-radius: 50%;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 15px;
          box-shadow: 0 4px 15px rgba(18, 104, 251, 0.4);
        }
        .db-marker-container {
          background: white;
          border: 2px solid #1268FB;
          border-radius: 8px;
          padding: 6px 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          white-space: nowrap;
          transition: all 0.2s;
        }
        .db-marker-container.active {
          background: #1268FB;
          color: white;
          transform: translateY(-5px) scale(1.1);
        }
        .db-marker-badge { display: flex; align-items: center; gap: 4px; }
        .db-marker-prefix { font-size: 11px; font-weight: 800; color: #1268FB; }
        .db-marker-container.active .db-marker-prefix { color: rgba(255,255,255,0.8); }
        .db-marker-price { font-size: 14px; font-weight: 900; }
        .db-marker-arrow {
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 0; height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-top: 8px solid #1268FB;
        }
        .db-custom-cluster, .dabang-marker-icon { background: none !important; border: none !important; }
      `}</style>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
