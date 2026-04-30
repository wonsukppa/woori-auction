'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Landmark, Heart, Calculator, MapPin, Trash2, Home, Store, Building, Factory } from 'lucide-react';
import { formatPrice } from '../../utils/format';

const getGrade = (score: number) => {
  if (score >= 95) return { label: 'S', color: '#B45309', bg: '#FEF3C7', border: '#FDE68A' };
  if (score >= 85) return { label: 'A', color: '#1268FB', bg: '#EFF6FF', border: '#DBEAFE' };
  if (score >= 70) return { label: 'B', color: '#0369A1', bg: '#F0F9FF', border: '#E0F2FE' };
  if (score >= 50) return { label: 'C', color: '#B45309', bg: '#FFFBEB', border: '#FEF3C7' };
  return { label: 'F', color: '#B91C1C', bg: '#FEF2F2', border: '#FECACA' };
};

const getAssetUI = (type: string) => {
  if (type === '아파트' || type === '오피스텔') return { icon: <Home size={14} />, color: '#1268FB', bg: '#eff6ff' };
  if (type === '상가' || type === '사무실') return { icon: <Store size={14} />, color: '#8b5cf6', bg: '#f5f3ff' };
  if (type === '토지') return { icon: <MapPin size={14} />, color: '#059669', bg: '#ecfdf5' };
  if (type === '공장') return { icon: <Factory size={14} />, color: '#d97706', bg: '#fffbeb' };
  return { icon: <Building size={14} />, color: '#6b7280', bg: '#f3f4f6' };
};

export default function MyPage() {
  const [savedProperties, setSavedProperties] = useState<any[]>([]);
  const [user, setUser] = useState<{name: string} | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
    
    const props = JSON.parse(localStorage.getItem('savedProperties') || '[]');
    // Sort by savedAt descending
    props.sort((a: any, b: any) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
    setSavedProperties(props);
  }, []);

  const handleRemove = (id: string) => {
    if (confirm('해당 물건을 관심 목록에서 삭제하시겠습니까?')) {
      const newProps = savedProperties.filter(p => p.id !== id);
      setSavedProperties(newProps);
      localStorage.setItem('savedProperties', JSON.stringify(newProps));
    }
  };

  // Calculate totals
  const totalBids = savedProperties.reduce((sum, p) => sum + (p.savedBidPrice || p.minPrice), 0);
  const totalExpectedProfit = savedProperties.reduce((sum, p) => {
    const bid = p.savedBidPrice || p.minPrice;
    const incidentalCost = bid * 0.052;
    return sum + (p.marketPrice - bid - incidentalCost);
  }, 0);
  const sGradeCount = savedProperties.filter(p => p.analysis?.score >= 95).length;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <header style={{ background: 'white', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', fontWeight: 600 }}>
              <ArrowLeft size={18} /> 지도 홈으로
            </Link>
            <div style={{ width: 1, height: 24, background: '#e2e8f0' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, background: '#1268FB', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Landmark size={18} color="white" /></div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#1e293b' }}>내 투자 포트폴리오</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ background: '#fef2f2', color: '#ef4444', padding: '6px 12px', borderRadius: 20, fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Heart size={14} fill="#ef4444" /> 저장한 물건 {savedProperties.length}건
            </div>
            {user && <div style={{ fontSize: 14, fontWeight: 800, color: '#334155' }}>{user.name}님</div>}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        {/* Dashboard Widgets */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 40 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600, marginBottom: 8 }}>관심 물건 총 모의 입찰액</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#1e293b', letterSpacing: '-1px' }}>{(totalBids / 100000000).toFixed(1)}억</div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: 16, padding: 24, color: 'white', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600, marginBottom: 8 }}>즉시 매도 시나리오 총 기대 수익</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#34d399', letterSpacing: '-1px' }}>+{(totalExpectedProfit / 100000000).toFixed(2)}억</div>
          </div>
          <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600, marginBottom: 8 }}>발견한 AI S등급 특수 물건</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#B45309', letterSpacing: '-1px' }}>{sGradeCount}건</div>
          </div>
        </div>

        {/* Gallery View */}
        {savedProperties.length === 0 ? (
          <div style={{ background: 'white', borderRadius: 16, padding: 60, textAlign: 'center', border: '1px dashed #cbd5e1' }}>
            <Heart size={48} color="#cbd5e1" style={{ marginBottom: 16 }} />
            <div style={{ fontSize: 18, fontWeight: 800, color: '#475569', marginBottom: 8 }}>관심 물건이 없습니다.</div>
            <div style={{ fontSize: 14, color: '#64748b' }}>지도에서 AI 분석을 진행하고 마음에 드는 물건을 저장해 보세요.</div>
            <Link href="/" style={{ textDecoration: 'none' }}><button style={{ marginTop: 24, padding: '12px 24px', background: '#1268FB', color: 'white', border: 'none', borderRadius: 8, fontWeight: 800, cursor: 'pointer' }}>지도에서 물건 찾기</button></Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 24 }}>
            {savedProperties.map(p => {
              const grade = getGrade(p.analysis?.score || 0);
              const assetUI = getAssetUI(p.type);
              const bid = p.savedBidPrice || p.minPrice;
              const incidentalCost = bid * 0.052;
              const netProfit = p.marketPrice - bid - incidentalCost;
              const roi = (netProfit / bid) * 100;
              
              return (
                <div key={p.id} style={{ background: 'white', borderRadius: 20, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 10px 20px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column' }}>
                  {/* Photo area mockup - using a placeholder map image since we don't have real images */}
                  <div style={{ height: 160, background: '#f1f5f9', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 12, left: 12, padding: '4px 10px', background: 'rgba(0,0,0,0.6)', color: 'white', borderRadius: 6, fontSize: 11, fontWeight: 800, backdropFilter: 'blur(4px)' }}>
                      {p.caseNo}
                    </div>
                    <div style={{ position: 'absolute', top: 12, right: 12, width: 40, height: 40, background: grade.bg, borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: `1px solid ${grade.border}`, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                      <div style={{ fontSize: 16, fontWeight: 900, color: grade.color }}>{grade.label}</div>
                    </div>
                  </div>
                  
                  <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 6px', background: assetUI.bg, borderRadius: 4 }}>
                        {assetUI.icon}
                        <span style={{ fontSize: 10, fontWeight: 800, color: assetUI.color }}>{p.type}</span>
                      </div>
                      <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>저장일: {new Date(p.savedAt).toLocaleDateString()}</span>
                    </div>
                    
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#1e293b', marginBottom: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {p.address}
                    </div>
                    
                    <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                          <span style={{ color: '#64748b' }}>감정가</span>
                          <span style={{ fontWeight: 600, color: '#475569' }}>{formatPrice(p.price)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                          <span style={{ color: '#64748b' }}>최저가</span>
                          <span style={{ fontWeight: 800, color: '#111827' }}>{formatPrice(p.minPrice)}</span>
                        </div>
                      </div>

                      <div style={{ background: '#f8fafc', padding: '12px', borderRadius: 12, marginBottom: 12, border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span style={{ fontSize: 11, color: '#1268FB', fontWeight: 800 }}>나의 시뮬레이션 입찰가</span>
                          <span style={{ fontSize: 14, fontWeight: 900, color: '#1e3a8a' }}>{formatPrice(bid)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>예상 시세차익 (명도 후)</span>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 16, fontWeight: 900, color: roi > 0 ? '#10b981' : '#ef4444' }}>
                              {roi > 0 ? '+' : ''}{(netProfit / 100000000).toFixed(2)}억
                            </div>
                            <div style={{ fontSize: 10, color: roi > 0 ? '#10b981' : '#ef4444', fontWeight: 800 }}>수익률 {roi.toFixed(1)}%</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', borderTop: '1px solid #e2e8f0' }}>
                    <Link href={`/?id=${p.id}`} style={{ flex: 1, padding: 12, textAlign: 'center', background: '#f8fafc', color: '#1268FB', fontSize: 13, fontWeight: 800, textDecoration: 'none', borderRight: '1px solid #e2e8f0' }}>
                      상세 분석 다시보기
                    </Link>
                    <button onClick={() => handleRemove(p.id)} style={{ width: 48, background: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
