'use client';
import React, { useEffect, Suspense } from 'react';
import { useMediaQuery } from '../hooks/useMediaQuery';
import AuctionList from '../components/dashboard/AuctionList';
import dynamic from 'next/dynamic';
const AuctionMap = dynamic(() => import('../components/dashboard/AuctionMap'), { ssr: false });
import AnalysisPanel from '../components/dashboard/AnalysisPanel';
import MobileBottomSheet from '../components/dashboard/MobileBottomSheet';
import { useAuctionData } from '../hooks/useAuctionData';
import { useSearchParams } from 'next/navigation';
import { Search, Bell, Home as HomeIcon, Map as MapIcon, Star, User, Menu } from 'lucide-react';

function HomeContent() {
  const { properties, activeProperty, setActiveProperty, isLoading, refresh } = useAuctionData();
  const [priceDisplayMode, setPriceDisplayMode] = React.useState<'total' | 'pyeong' | 'm2'>('total');
  const searchParams = useSearchParams();
  const idParam = searchParams?.get('id');
  const bidParam = searchParams?.get('bid');

  useEffect(() => {
    if (idParam && properties.length > 0) {
      const p = properties.find(x => String(x.id) === idParam);
      if (p && (!activeProperty || activeProperty.id !== p.id)) {
        setActiveProperty(p);
      }
    }
  }, [idParam, properties, setActiveProperty]); 

  const [gradeFilter, setGradeFilter] = React.useState<string | null>(null);
  // URL ?menu=all 파라미터를 읽어 초기 탭을 설정 (서브페이지 뒤로가기 지원)
  const menuParam = searchParams?.get('menu');
  const [activeMenu, setActiveMenu] = React.useState<string>(menuParam || 'map');

  // menuParam이 변경될 때(CSR 라우팅) 상태도 업데이트
  useEffect(() => {
    if (menuParam) setActiveMenu(menuParam);
  }, [menuParam]);

  const getGrade = (score: number) => {
    if (score >= 90) return 'S';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    return 'C';
  };

  const filteredProperties = properties.filter(p => {
    if (!gradeFilter) return true; // null = 전체 보기
    return getGrade(p.analysis?.score || 0) === gradeFilter;
  });

  const isMobile = useMediaQuery('(max-width: 768px)');

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
      {!isMobile && (
        <AuctionList 
          properties={filteredProperties} 
          activeProperty={activeProperty} 
          onSelect={setActiveProperty} 
          isLoading={isLoading} 
          onRefresh={refresh} 
        />
      )}

      {/* Mobile-Only Header */}
      {isMobile && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          background: activeMenu === 'map' ? 'rgba(255,255,255,0.85)' : 'white',
          backdropFilter: activeMenu === 'map' ? 'blur(12px)' : 'none',
          WebkitBackdropFilter: activeMenu === 'map' ? 'blur(12px)' : 'none' as any,
          zIndex: 200,
          boxShadow: activeMenu === 'map' ? 'none' : '0 2px 10px rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Top Row: Title & Icons */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            height: 56
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20, fontWeight: 900, color: '#1268FB', letterSpacing: '-0.02em' }}>우리옥션 <span style={{ color: '#1e293b' }}>AI</span></span>
            </div>
            <div style={{ display: 'flex', gap: 16, color: '#64748b' }}>
              <Search size={22} />
              <Bell size={22} />
            </div>
          </div>
        </div>
      )}

      {/* Main App Area */}
      <div style={{ 
        flex: isMobile ? 'none' : 1,
        width: isMobile ? '100%' : 'auto', 
        height: isMobile ? (activeMenu === 'map' ? '100%' : 'calc(100% - 64px)') : '100%', 
        position: 'relative', 
        overflow: 'hidden',
        marginTop: isMobile ? (activeMenu === 'map' ? 0 : 56) : 0
      }}>
        {activeMenu === 'map' ? (
          <div style={{ display: 'flex', width: '100%', height: '100%', position: 'relative' }}>
            <div style={{ flex: 1, position: 'relative', height: '100%' }}>
              {/* Floating Grade Filters - Moved inside Map container so it centers relative to Map */}
              <div style={{ 
                position: 'absolute', 
                top: isMobile ? 'auto' : 24, 
                bottom: isMobile ? 140 : 'auto',
                left: '50%', 
                transform: 'translateX(-50%)', 
                zIndex: 1000, 
                display: 'flex', 
                background: 'rgba(255, 255, 255, 0.95)', 
                padding: '6px', 
                borderRadius: 40, 
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)', 
                border: '1px solid #e2e8f0', 
                pointerEvents: 'auto',
                backdropFilter: 'blur(10px)',
                overflowX: 'auto',
                maxWidth: 'calc(100% - 32px)'
              }} className="cscroll-hidden">
                {['전체 보기', 'S등급', 'A등급', 'B등급', 'C등급'].map(grade => {
                  // '전체 보기' → null, 'S등급' → 'S', 'A등급' → 'A', ...
                  const gradeValue = grade === '전체 보기' ? null : grade.replace('등급', '');
                  const isActive = gradeFilter === gradeValue;
                  return (
                    <button 
                      key={grade} 
                      onClick={() => setGradeFilter(gradeValue)}
                      style={{ 
                        padding: isMobile ? '8px 14px' : '10px 28px', 
                        border: 'none', 
                        background: isActive ? '#1268FB' : 'transparent', 
                        color: isActive ? 'white' : '#475569', 
                        fontSize: isMobile ? 12 : 14, 
                        fontWeight: 900, 
                        borderRadius: 32, 
                        cursor: 'pointer', 
                        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)', 
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {grade}
                    </button>
                  );
                })}
              </div>

              <AuctionMap 
                properties={filteredProperties} 
                activeProperty={activeProperty} 
                onSelect={setActiveProperty} 
                priceDisplayMode={priceDisplayMode}
                setPriceDisplayMode={setPriceDisplayMode}
              />
            </div>
            
            {!isMobile && activeProperty && (
              <div style={{ flexShrink: 0, height: '100%', position: 'relative', right: 0, top: 0, zIndex: 200 }}>
                <AnalysisPanel 
                  activeProperty={activeProperty} 
                  initialBid={bidParam ? Number(bidParam) : null}
                  priceDisplayMode={priceDisplayMode}
                  setPriceDisplayMode={setPriceDisplayMode}
                  onClose={() => setActiveProperty(null)}
                />
              </div>
            )}

            {/* Mobile Bottom Sheet - always rendered on mobile */}
            {isMobile && (
              <MobileBottomSheet 
                properties={filteredProperties}
                activeProperty={activeProperty}
                onSelect={setActiveProperty}
                isLoading={isLoading}
                onRefresh={refresh}
                priceDisplayMode={priceDisplayMode}
                setPriceDisplayMode={setPriceDisplayMode}
              />
            )}
          </div>
        ) : (
          <div style={{ height: '100%', overflowY: 'auto', background: '#f8fafc' }} className="cscroll-hidden">
            {activeMenu === 'home' && (
              <div style={{ padding: 20 }}>
                <div style={{ background: 'linear-gradient(135deg, #1268FB 0%, #1e40af 100%)', borderRadius: 24, padding: 24, color: 'white', marginBottom: 24, boxShadow: '0 8px 32px rgba(18,104,251,0.2)' }}>
                  <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8, margin: 0 }}>우리옥션 AI 대시보드</h2>
                  <p style={{ fontSize: 14, opacity: 0.8, marginBottom: 20 }}>오늘의 경매 인사이트를 확인하세요</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: 16, borderRadius: 16, backdropFilter: 'blur(10px)' }}>
                      <span style={{ fontSize: 12, opacity: 0.8 }}>오늘의 신건</span>
                      <div style={{ fontSize: 20, fontWeight: 900, marginTop: 4 }}>128건</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: 16, borderRadius: 16, backdropFilter: 'blur(10px)' }}>
                      <span style={{ fontSize: 12, opacity: 0.8 }}>평균 낙찰률</span>
                      <div style={{ fontSize: 20, fontWeight: 900, marginTop: 4 }}>76.4%</div>
                    </div>
                  </div>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 16, color: '#1e293b' }}>최근 본 물건</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {filteredProperties.slice(0, 3).map(p => (
                    <div key={p.id} onClick={() => { setActiveMenu('map'); setActiveProperty(p); }} style={{ background: 'white', padding: 16, borderRadius: 20, border: '1px solid #e2e8f0', display: 'flex', gap: 16, cursor: 'pointer' }}>
                      <div style={{ width: 80, height: 80, background: '#f1f5f9', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <HomeIcon size={24} color="#94a3b8" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#1268FB' }}>{p.id}</div>
                        <div style={{ fontSize: 15, fontWeight: 900, marginTop: 2 }}>{p.type}</div>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{p.address}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeMenu === 'interest' && (
              <div style={{ padding: 20 }}>
                <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 20 }}>관심 물건</h2>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                  <Star size={48} style={{ marginBottom: 16, opacity: 0.2 }} />
                  <p style={{ fontWeight: 700 }}>저장된 물건이 없습니다</p>
                  <button onClick={() => setActiveMenu('map')} style={{ marginTop: 16, padding: '10px 24px', background: '#1268FB', color: 'white', border: 'none', borderRadius: 12, fontWeight: 800 }}>지도로 이동</button>
                </div>
              </div>
            )}
            {activeMenu === 'my' && (
              <div style={{ padding: 0 }}>
                <div style={{ background: 'white', padding: '40px 20px 30px', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ width: 80, height: 80, background: '#f1f5f9', borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={40} color="#cbd5e1" />
                  </div>
                  <h2 style={{ fontSize: 20, fontWeight: 900 }}>양동혁님</h2>
                  <p style={{ fontSize: 14, color: '#64748b' }}>프리미엄 투자자</p>
                  <button style={{ marginTop: 20, width: '100%', padding: '14px', border: '1px solid #e2e8f0', background: 'white', borderRadius: 12, fontSize: 14, fontWeight: 800 }}>프로필 수정</button>
                </div>
                <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ background: 'white', padding: 16, borderRadius: 16, border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
                    <span>AI 리포트 이용권</span>
                    <span style={{ fontWeight: 800, color: '#1268FB' }}>3회 남음</span>
                  </div>
                  <div style={{ background: 'white', padding: 16, borderRadius: 16, border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
                    <span>프리미엄 멤버십</span>
                    <span style={{ fontWeight: 800, color: '#10b981' }}>구독 중</span>
                  </div>
                </div>
              </div>
            )}
            {activeMenu === 'all' && (
              <div style={{ padding: '24px 20px 100px' }}>
                <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8, color: '#1e293b' }}>전체 메뉴</h2>
                <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 24 }}>우리옥션 AI의 모든 기능을 이용하세요</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  {[
                    { label: '공지사항', desc: '최신 업데이트 및 소식', icon: Bell, color: '#1268FB', bg: '#eff6ff', href: '/notices' },
                    { label: '경매 기초 강의', desc: '경매 입문 교육 콘텐츠', icon: MapIcon, color: '#8b5cf6', bg: '#f5f3ff', href: '/education' },
                    { label: '권리분석 요청', desc: '전문가 권리분석 의뢰', icon: Star, color: '#059669', bg: '#ecfdf5', href: '/rights-analysis' },
                    { label: '현장조사 동행', desc: '현장 전문가 동행 서비스', icon: User, color: '#d97706', bg: '#fffbeb', href: '/field-survey' },
                    { label: '수익률 계산기', desc: '투자 수익률 시뮬레이션', icon: Menu, color: '#e11d48', bg: '#fff1f2', href: '/calculator' },
                    { label: '설정', desc: '앱 환경설정 및 알림', icon: HomeIcon, color: '#64748b', bg: '#f8fafc', href: '/settings' },
                  ].map((m, i) => (
                    <a
                      key={i}
                      href={m.href}
                      style={{ 
                        background: 'white', padding: '20px 16px', borderRadius: 20, 
                        display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10, 
                        border: '1px solid #f1f5f9', textDecoration: 'none', color: 'inherit',
                        cursor: 'pointer', transition: 'all 0.2s',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                        WebkitTapHighlightColor: 'rgba(0,0,0,0.05)'
                      }}
                      onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)', e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.08)')}
                      onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)', e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)')}
                    >
                      <div style={{ 
                        width: 44, height: 44, background: m.bg, borderRadius: 12, 
                        display: 'flex', alignItems: 'center', justifyContent: 'center' 
                      }}>
                        <m.icon size={22} color={m.color} />
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#1e293b' }}>{m.label}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{m.desc}</div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── MOBILE BOTTOM NAVIGATION ── */}
      {isMobile && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          width: '100%',
          height: 64,
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          zIndex: 2000, // Highest z-index to stay on top
          paddingBottom: 'env(safe-area-inset-bottom)',
          pointerEvents: 'auto'
        }}>
          {[
            { id: 'home', icon: HomeIcon, label: '홈' },
            { id: 'map', icon: MapIcon, label: '경매지도' },
            { id: 'interest', icon: Star, label: '관심물건' },
            { id: 'my', icon: User, label: '마이' },
            { id: 'all', icon: Menu, label: '전체' }
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                border: 'none',
                background: 'none',
                color: activeMenu === item.id ? '#1268FB' : '#64748b',
                cursor: 'pointer',
                flex: 1,
                padding: '8px 0',
                transition: 'all 0.2s',
                pointerEvents: 'auto'
              }}
            >
              <item.icon size={20} strokeWidth={activeMenu === item.id ? 2.5 : 2} />
              <span style={{ fontSize: 10, fontWeight: activeMenu === item.id ? 800 : 500 }}>{item.label}</span>
            </button>
          ))}
        </div>
      )}

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
