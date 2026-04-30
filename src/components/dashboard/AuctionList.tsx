import React, { useState, useEffect } from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { RefreshCw, Search, Landmark, Home, Store, MapPin, Building, Factory } from 'lucide-react';
import { AuctionProperty } from '../../types/auction';
import { formatPrice } from '../../utils/format';
import Link from 'next/link';

interface AuctionListProps {
  properties: AuctionProperty[];
  activeProperty: AuctionProperty | null;
  onSelect: (p: AuctionProperty) => void;
  isLoading: boolean;
  onRefresh: () => void;
}

const getAssetUI = (type: string) => {
  if (type === '아파트' || type === '오피스텔') return { icon: <Home size={14} />, color: '#1268FB', bg: '#eff6ff' };
  if (type === '상가' || type === '사무실') return { icon: <Store size={14} />, color: '#8b5cf6', bg: '#f5f3ff' };
  if (type === '토지') return { icon: <MapPin size={14} />, color: '#059669', bg: '#ecfdf5' };
  if (type === '공장') return { icon: <Factory size={14} />, color: '#d97706', bg: '#fffbeb' };
  return { icon: <Building size={14} />, color: '#6b7280', bg: '#f3f4f6' };
};

const getGrade = (score: number) => {
  if (score >= 95) return { label: 'S', color: '#B45309', bg: '#FEF3C7', border: '#FDE68A' };
  if (score >= 85) return { label: 'A', color: '#1268FB', bg: '#EFF6FF', border: '#DBEAFE' };
  if (score >= 70) return { label: 'B', color: '#0369A1', bg: '#F0F9FF', border: '#E0F2FE' };
  if (score >= 50) return { label: 'C', color: '#B45309', bg: '#FFFBEB', border: '#FEF3C7' };
  return { label: 'F', color: '#B91C1C', bg: '#FEF2F2', border: '#FECACA' };
};

const AuctionList: React.FC<AuctionListProps> = ({ properties, activeProperty, onSelect, isLoading, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('전체');
  const [priceRange, setPriceRange] = useState('전체 가격');
  const [sortOption, setSortOption] = useState('최신순');
  const [user, setUser] = useState<{name: string} | null>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [showMobileList, setShowMobileList] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  // Sync scroll with activeProperty
  useEffect(() => {
    if (activeProperty) {
      const element = document.getElementById(`property-${activeProperty.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [activeProperty]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    window.location.reload();
  };

  // Real Filtering Logic
  const filteredProperties = properties.filter(p => {
    const matchesSearch = p.address.includes(searchTerm) || p.caseNo.includes(searchTerm);
    const matchesFilter = activeFilter === '전체' || p.type.includes(activeFilter);
    let matchesPrice = true;
    if (priceRange === '3억 이하') matchesPrice = p.minPrice <= 300000000;
    if (priceRange === '3억~5억') matchesPrice = p.minPrice > 300000000 && p.minPrice <= 500000000;
    if (priceRange === '5억 이상') matchesPrice = p.minPrice > 500000000;

    return matchesSearch && matchesFilter && matchesPrice;
  }).sort((a, b) => {
    if (sortOption === '최저가순') return a.minPrice - b.minPrice;
    if (sortOption === '시세차익순') return (b.marketPrice - b.minPrice) - (a.marketPrice - a.minPrice);
    return 0; // 최신순
  });

  return (
    <>
    {/* 모바일 화면에서 리스트 열기/닫기 토글 버튼 (리스트가 숨겨져 있을 때만 지도 위에 표시) */}
    {isMobile && !showMobileList && (
      <button 
        onClick={() => setShowMobileList(true)}
        style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 100, background: '#1268FB', color: 'white', padding: '12px 24px', borderRadius: 30, fontWeight: 800, border: 'none', boxShadow: '0 4px 12px rgba(18, 104, 251, 0.4)' }}
      >
        경매 물건 목록 보기 ({filteredProperties.length}건)
      </button>
    )}

    <aside style={{ 
      width: isMobile ? '100%' : 440, 
      height: isMobile ? (showMobileList ? '80vh' : '0px') : '100%',
      position: isMobile ? 'absolute' : 'static',
      bottom: 0,
      left: 0,
      background: 'white', 
      borderRight: isMobile ? 'none' : '1px solid #e5e7eb', 
      borderTopLeftRadius: isMobile ? 24 : 0,
      borderTopRightRadius: isMobile ? 24 : 0,
      display: 'flex', 
      flexDirection: 'column', 
      flexShrink: 0, 
      zIndex: isMobile ? 200 : 10,
      transition: 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s',
      overflow: 'hidden',
      boxShadow: isMobile ? '0 -10px 40px rgba(0,0,0,0.1)' : 'none'
    }}>
      {/* 모바일용 드래그 핸들 (시각적) 및 닫기 버튼 */}
      {isMobile && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '12px 24px 0', position: 'relative' }}>
          <div style={{ width: 40, height: 5, background: '#e2e8f0', borderRadius: 10 }} />
          <button onClick={() => setShowMobileList(false)} style={{ position: 'absolute', right: 24, background: 'none', border: 'none', fontSize: 24, color: '#94a3b8' }}>&times;</button>
        </div>
      )}
      {/* Header */}
      <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f1f3f5' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, background: '#1268FB', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Landmark size={20} color="white" /></div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 900, color: '#1268FB', lineHeight: 1 }}>우리옥션 AI</div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>실시간 경매 분석 플랫폼</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Link href="/mypage" style={{ textDecoration: 'none' }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: '#1e40af', cursor: 'pointer', padding: '4px 6px', background: '#dbeafe', borderRadius: 6, whiteSpace: 'nowrap' }}>마이페이지</div>
                </Link>
                <div onClick={handleLogout} style={{ fontSize: 10, fontWeight: 800, color: '#ef4444', cursor: 'pointer', padding: '4px 6px', background: '#fef2f2', borderRadius: 6, whiteSpace: 'nowrap' }}>로그아웃</div>
                <div style={{ fontSize: 12, fontWeight: 900, color: '#374151', marginLeft: 4, whiteSpace: 'nowrap' }}>{user.name}님</div>
              </div>
            ) : (
              <Link href="/login" style={{ textDecoration: 'none' }}>
                <div style={{ width: 32, height: 32, background: '#f3f4f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><span style={{ fontSize: 10, fontWeight: 800, color: '#6b7280' }}>로그인</span></div>
              </Link>
            )}
            <RefreshCw onClick={onRefresh} size={18} color="#9ca3af" style={{ cursor: 'pointer' }} className={isLoading ? 'spin' : ''} />
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          <Search size={16} color="#9ca3af" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            placeholder="사건번호, 지역명 검색..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '11px 12px 11px 40px', background: '#f3f4f6', border: 'none', borderRadius: 10, fontSize: 14, color: '#374151', outline: 'none', boxSizing: 'border-box' }} 
          />
        </div>
      </div>

      {/* Filter Chips - Category */}
      <div style={{ padding: '16px 24px 8px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {['전체', '아파트', '상가', '오피스텔', '토지', '공장'].map((f) => (
          <button 
            key={f} 
            onClick={() => setActiveFilter(f)}
            style={{ 
              padding: '6px 14px', borderRadius: 20, border: 'none', 
              background: activeFilter === f ? '#1268FB' : '#f3f4f6', 
              color: activeFilter === f ? 'white' : '#4b5563', 
              fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Filter Chips - Price Range */}
      <div style={{ padding: '0 24px 16px', display: 'flex', gap: 6, flexWrap: 'wrap', borderBottom: '1px solid #f1f3f5' }}>
        {['전체 가격', '3억 이하', '3억~5억', '5억 이상'].map((pr) => (
          <button 
            key={pr} 
            onClick={() => setPriceRange(pr)}
            style={{ 
              padding: '4px 10px', borderRadius: 6, border: '1px solid',
              borderColor: priceRange === pr ? '#1268FB' : '#e5e7eb',
              background: priceRange === pr ? '#eff6ff' : 'white', 
              color: priceRange === pr ? '#1268FB' : '#6b7280', 
              fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            {pr}
          </button>
        ))}
      </div>

      {/* Property List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 20px' }} className="cscroll">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '16px 0' }}>
          <div style={{ fontSize: 12, color: '#9ca3af' }}>총 <span style={{ color: '#1268FB', fontWeight: 800 }}>{filteredProperties.length}건</span> 검색됨</div>
          <select 
            value={sortOption} 
            onChange={(e) => setSortOption(e.target.value)}
            style={{ 
              padding: '4px 8px', borderRadius: 6, border: '1px solid #e5e7eb', 
              fontSize: 11, color: '#4b5563', fontWeight: 700, outline: 'none', cursor: 'pointer', background: 'white'
            }}
          >
            <option value="최신순">최신 등록순</option>
            <option value="최저가순">최저 매각가순</option>
            <option value="시세차익순">최대 시세차익순</option>
          </select>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredProperties.map(p => {
            const isSelected = activeProperty?.id === p.id;
            const grade = getGrade(p.analysis.score);
            const assetUI = getAssetUI(p.type);
            
            return (
              <div 
                key={p.id} 
                id={`property-${p.id}`}
                onClick={() => onSelect(p)}
                style={{ 
                  padding: 16, background: isSelected ? '#f0f7ff' : 'white', borderRadius: 16, 
                  border: isSelected ? '2px solid #1268FB' : '1px solid #f1f3f5', 
                  cursor: 'pointer', transition: 'all 0.2s',
                  boxShadow: isSelected ? '0 8px 20px rgba(18, 104, 251, 0.1)' : 'none'
                }}
              >
                <div style={{ display: 'flex', gap: 14 }}>
                  <div style={{ 
                    width: 56, height: 56, background: grade.bg, borderRadius: 12, 
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: `1px solid ${grade.border}` 
                  }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: grade.color }}>{grade.label}</div>
                    <div style={{ fontSize: 7, color: grade.color, fontWeight: 800 }}>AI 등급</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#1268FB', marginBottom: 2 }}>{p.caseNo}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 6px', background: assetUI.bg, borderRadius: 4 }}>
                        {assetUI.icon}
                        <span style={{ fontSize: 9, fontWeight: 800, color: assetUI.color }}>{p.type}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: 17, fontWeight: 900, color: '#111827' }}>{formatPrice(p.minPrice)}</div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 3, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.address}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
    </>
  );
};

export default AuctionList;
