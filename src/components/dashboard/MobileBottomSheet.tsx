'use client';
import React, { useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown, List, BarChart3, MapPin, X, Map } from 'lucide-react';
import { AuctionProperty } from '../../types/auction';
import AnalysisPanel from './AnalysisPanel';
import { formatPrice } from '../../utils/format';
import { Home, Store, Factory, Building } from 'lucide-react';

interface MobileBottomSheetProps {
  properties: AuctionProperty[];
  activeProperty: AuctionProperty | null;
  onSelect: (p: AuctionProperty | null) => void;
  isLoading: boolean;
  onRefresh: () => void;
  priceDisplayMode: 'total' | 'pyeong' | 'm2';
  setPriceDisplayMode: (mode: 'total' | 'pyeong' | 'm2') => void;
}

const getGrade = (score: number) => {
  if (score >= 95) return { label: 'S', color: '#B45309', bg: '#FEF3C7', border: '#FDE68A' };
  if (score >= 85) return { label: 'A', color: '#1268FB', bg: '#EFF6FF', border: '#DBEAFE' };
  if (score >= 70) return { label: 'B', color: '#0369A1', bg: '#F0F9FF', border: '#E0F2FE' };
  return { label: 'C', color: '#B45309', bg: '#FFFBEB', border: '#FEF3C7' };
};

const getAssetUI = (type: string) => {
  if (type === '아파트' || type === '오피스텔') return { icon: <Home size={12} />, color: '#1268FB', bg: '#eff6ff' };
  if (type === '상가' || type === '사무실') return { icon: <Store size={12} />, color: '#8b5cf6', bg: '#f5f3ff' };
  if (type === '토지') return { icon: <MapPin size={12} />, color: '#059669', bg: '#ecfdf5' };
  if (type === '공장') return { icon: <Factory size={12} />, color: '#d97706', bg: '#fffbeb' };
  return { icon: <Building size={12} />, color: '#6b7280', bg: '#f3f4f6' };
};

// Height states:
// 'hidden' = 0 (sheet not visible)
// 'peek' = 70px (just the handle is visible)
// 'half' = 55vh (half screen - list or detail)
// 'full' = calc(100% - 64px) (full screen minus bottom nav)
type SheetHeight = 'hidden' | 'peek' | 'half' | 'full';

// View modes
type ViewMode = 'list' | 'detail';

export default function MobileBottomSheet({
  properties,
  activeProperty,
  onSelect,
  isLoading,
  onRefresh,
  priceDisplayMode,
  setPriceDisplayMode,
}: MobileBottomSheetProps) {
  const [sheetHeight, setSheetHeight] = useState<SheetHeight>('peek');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('전체');
  const contentRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number>(0);

  const getHeightValue = (h: SheetHeight) => {
    switch (h) {
      case 'hidden': return '0px';
      case 'peek': return '70px';
      case 'half': return '55vh';
      case 'full': return '100%';
    }
  };

  // When a property is selected from the list:
  // 1. Collapse sheet to peek so map is fully visible and can pan
  // 2. After 1.2 seconds bring sheet back to half with detail view
  useEffect(() => {
    if (activeProperty) {
      setSheetHeight('peek');
      setViewMode('detail');
      const timer = setTimeout(() => {
        setSheetHeight('half');
      }, 1200);
      return () => clearTimeout(timer);
    } else {
      setViewMode('list');
      setSheetHeight('half');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProperty?.id]);

  const filteredProperties = properties.filter(p => {
    const matchesSearch = p.address.includes(searchTerm) || p.caseNo.includes(searchTerm);
    const matchesFilter = activeFilter === '전체' || p.type.includes(activeFilter);
    return matchesSearch && matchesFilter;
  });

  const handlePropertyClick = (p: AuctionProperty) => {
    // 1. Collapse sheet immediately so map becomes visible and can pan
    setSheetHeight('peek');
    setViewMode('detail');
    // 2. Trigger the property selection (AuctionMap will pan to location)
    onSelect(p);
    // 3. After map has panned (1.2s), bring sheet back up
    setTimeout(() => {
      setSheetHeight('half');
    }, 1200);
  };

  const toggleHeight = () => {
    if (sheetHeight === 'peek') setSheetHeight('half');
    else if (sheetHeight === 'half') setSheetHeight('peek'); // tap to collapse → show full map
    else setSheetHeight('half'); // full → half
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const delta = e.changedTouches[0].clientY - touchStartY.current;
    if (delta > 30) {
      // Swiped DOWN → collapse to peek (full map view)
      setSheetHeight('peek');
    } else if (delta < -30) {
      // Swiped UP → expand
      if (sheetHeight === 'peek') setSheetHeight('half');
      else if (sheetHeight === 'half') setSheetHeight('full');
    }
  };

  const showDimmer = sheetHeight === 'full';

  return (
    <div style={{
      position: 'absolute',
      bottom: 64, // Sit above the fixed bottom nav bar (64px)
      left: 0,
      width: '100%',
      height: 'calc(100% - 64px)',
      zIndex: 500,
      pointerEvents: 'none',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
    }}>
      {/* Dimmer — only when full screen */}
      {showDimmer && (
        <div
          onClick={() => setSheetHeight('half')}
          style={{
            position: 'absolute', top: 0, left: 0,
            width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.25)',
            pointerEvents: 'auto',
          }}
        />
      )}

      {/* ── Bottom Sheet ── */}
      <div style={{
        width: '100%',
        height: getHeightValue(sheetHeight),
        background: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        boxShadow: '0 -6px 24px rgba(0,0,0,0.12)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'height 0.35s cubic-bezier(0.4,0,0.2,1)',
        overflow: 'hidden',
        pointerEvents: 'auto',
        position: 'relative',
      }}>

        {/* ── Handle / Header ── */}
        <div
          onClick={toggleHeight}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{
            flexShrink: 0,
            width: '100%',
            padding: '10px 16px 8px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
            background: 'white',
            borderBottom: sheetHeight !== 'peek' ? '1px solid #f1f5f9' : 'none',
            touchAction: 'none',
            userSelect: 'none',
          }}
        >
          {/* Drag handle pill with direction hint */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <div style={{ width: 36, height: 4, background: '#d1d5db', borderRadius: 2 }} />
            {sheetHeight !== 'peek' && (
              <ChevronDown size={14} color="#cbd5e1" strokeWidth={2.5} />
            )}
            {sheetHeight === 'peek' && (
              <ChevronUp size={14} color="#1268FB" strokeWidth={2.5} />
            )}
          </div>

          {/* Property name when in peek mode */}
          {sheetHeight === 'peek' && activeProperty && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '2px 0' }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, background: '#eff6ff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <BarChart3 size={16} color="#1268FB" />
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: 12, fontWeight: 900, color: '#1268FB', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {activeProperty.caseNo} — {formatPrice(activeProperty.minPrice)}
                </div>
                <div style={{ fontSize: 11, color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {activeProperty.address}
                </div>
              </div>
              <ChevronUp size={18} color="#94a3b8" style={{ flexShrink: 0 }} />
            </div>
          )}

          {/* Expand hint when peek with no property */}
          {sheetHeight === 'peek' && !activeProperty && (
            <div style={{ fontSize: 12, fontWeight: 800, color: '#1268FB' }}>
              경매 물건 목록 보기 ({properties.length}건) ↑
            </div>
          )}
        </div>

        {/* ── View Toggle (only when not peek) ── */}
        {sheetHeight !== 'peek' && (
          <div style={{ flexShrink: 0, display: 'flex', gap: 10, padding: '10px 14px', background: 'white', borderBottom: '1px solid #f1f5f9' }}>
            <button
              onClick={() => setViewMode('list')}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '10px', border: 'none', borderRadius: 10,
                background: viewMode === 'list' ? '#1268FB' : '#f1f5f9',
                color: viewMode === 'list' ? 'white' : '#64748b',
                fontSize: 13, fontWeight: 800, cursor: 'pointer',
              }}
            >
              <List size={16} />
              리스트 모드
            </button>
            <button
              onClick={() => { if (activeProperty) setViewMode('detail'); }}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '10px', border: 'none', borderRadius: 10,
                background: viewMode === 'detail' ? '#1268FB' : '#f1f5f9',
                color: viewMode === 'detail' ? 'white' : '#64748b',
                fontSize: 13, fontWeight: 800, cursor: 'pointer',
                opacity: activeProperty ? 1 : 0.4,
              }}
            >
              <BarChart3 size={16} />
              상세 분석
            </button>

            {/* Close / minimize button */}
            {activeProperty && (
              <button
                onClick={() => { onSelect(null); setSheetHeight('peek'); }}
                style={{
                  width: 40, height: 40, border: 'none', borderRadius: 10,
                  background: '#f1f5f9', color: '#64748b', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>
        )}

        {/* ── Content Area ── */}
        {sheetHeight !== 'peek' && (
          <div
            ref={contentRef}
            style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' as any, paddingBottom: 160 }}
          >
            {viewMode === 'list' ? (
              /* ── LIST MODE ── */
              <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 100 }}>
                {/* Search bar */}
                <input
                  placeholder="사건번호, 지역명 검색..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 14px', background: '#f3f4f6',
                    border: 'none', borderRadius: 10, fontSize: 13, color: '#374151',
                    outline: 'none', boxSizing: 'border-box',
                  }}
                />

                {/* Category filter chips */}
                <div style={{ display: 'flex', gap: 6, overflowX: 'auto', flexWrap: 'nowrap' }} className="cscroll-hidden">
                  {['전체', '아파트', '상가', '오피스텔', '토지', '공장'].map(f => (
                    <button
                      key={f}
                      onClick={() => setActiveFilter(f)}
                      style={{
                        padding: '6px 14px', borderRadius: 20, border: 'none', flexShrink: 0,
                        background: activeFilter === f ? '#1268FB' : '#f3f4f6',
                        color: activeFilter === f ? 'white' : '#4b5563',
                        fontSize: 12, fontWeight: 700, cursor: 'pointer',
                      }}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>
                  총 <span style={{ color: '#1268FB', fontWeight: 800 }}>{filteredProperties.length}건</span>
                </div>

                {/* Property cards */}
                {filteredProperties.map(p => {
                  const grade = getGrade(p.analysis.score);
                  const assetUI = getAssetUI(p.type);
                  const isSelected = activeProperty?.id === p.id;

                  return (
                    <div
                      key={p.id}
                      onClick={() => handlePropertyClick(p)}
                      style={{
                        padding: '14px', borderRadius: 14,
                        background: isSelected ? '#f0f7ff' : 'white',
                        border: isSelected ? '2px solid #1268FB' : '1px solid #f1f3f5',
                        cursor: 'pointer', display: 'flex', gap: 12,
                        boxShadow: isSelected ? '0 4px 16px rgba(18,104,251,0.1)' : 'none',
                      }}
                    >
                      {/* Grade badge */}
                      <div style={{
                        width: 48, height: 48, background: grade.bg, borderRadius: 10,
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        justifyContent: 'center', border: `1px solid ${grade.border}`, flexShrink: 0,
                      }}>
                        <div style={{ fontSize: 18, fontWeight: 900, color: grade.color }}>{grade.label}</div>
                        <div style={{ fontSize: 7, color: grade.color, fontWeight: 800 }}>AI 등급</div>
                      </div>

                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: '#1268FB' }}>{p.caseNo}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '2px 6px', background: assetUI.bg, borderRadius: 4 }}>
                            {assetUI.icon}
                            <span style={{ fontSize: 9, fontWeight: 800, color: assetUI.color }}>{p.type}</span>
                          </div>
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 900, color: '#111827' }}>{formatPrice(p.minPrice)}</div>
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p.address}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* ── DETAIL MODE ── */
              activeProperty ? (
                <AnalysisPanel
                  activeProperty={activeProperty}
                  priceDisplayMode={priceDisplayMode}
                  setPriceDisplayMode={setPriceDisplayMode}
                  onClose={() => { onSelect(null); setSheetHeight('peek'); }}
                />
              ) : (
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', height: '100%', color: '#94a3b8', padding: 40, textAlign: 'center'
                }}>
                  <MapPin size={48} style={{ marginBottom: 16, opacity: 0.2 }} />
                  <p style={{ fontSize: 15, fontWeight: 700 }}>분석할 물건을 선택해주세요</p>
                  <p style={{ fontSize: 13, marginTop: 6 }}>리스트에서 물건을 탭하면<br/>지도에서 위치를 확인하고 분석합니다</p>
                  <button
                    onClick={() => setViewMode('list')}
                    style={{
                      marginTop: 20, padding: '10px 24px', background: '#1268FB', color: 'white',
                      border: 'none', borderRadius: 10, fontWeight: 800, fontSize: 14, cursor: 'pointer'
                    }}
                  >
                    리스트 보기
                  </button>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
