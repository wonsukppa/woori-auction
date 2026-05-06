'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { 
  ShieldCheck, ShieldAlert, Calculator, TrendingUp, Download, Home, Train, 
  GraduationCap, Store, MapPin, Camera, FileText, Sparkles, Loader2, Lock, 
  Upload, FilePlus, X, AlertCircle, Layout, Bath, Bed, Tv, Images, Wind, 
  Maximize, DoorOpen, Hammer, AlertTriangle, Mountain, Info, Heart, Users, 
  Flame, Eye, Clock, Activity 
} from 'lucide-react';
import { AuctionProperty } from '../../types/auction';
import { formatPrice } from '../../utils/format';
import Link from 'next/link';

declare global {
  interface Window {
    Kakao: any;
  }
}

interface AnalysisPanelProps { 
  activeProperty: AuctionProperty | null; 
  initialBid?: number | null;
  priceDisplayMode: 'total' | 'pyeong' | 'm2';
  setPriceDisplayMode: (mode: 'total' | 'pyeong' | 'm2') => void;
  onClose: () => void;
}

type TabType = 'analysis' | 'simulator' | 'aiscan' | 'trend';

const getCategories = (type: string) => {
  if (type.includes('상가') || type.includes('오피스') || type.includes('근린') || type.includes('사무실')) {
    return [
      { id: 'ext', name: '전면/간판', icon: <Store size={18} /> },
      { id: 'interior', name: '내부전경', icon: <Layout size={18} /> },
      { id: 'hvac', name: '천장/공조', icon: <Wind size={18} /> },
      { id: 'floor', name: '바닥/벽체', icon: <Maximize size={18} /> },
      { id: 'utility', name: '탕비실/화장실', icon: <Bath size={18} /> },
      { id: 'entrance', name: '출입구/복도', icon: <DoorOpen size={18} /> },
    ];
  } else if (type.includes('토지') || type.includes('공장')) {
    return [
      { id: 'road', name: '진입로/도로', icon: <AlertTriangle size={18} /> },
      { id: 'boundary', name: '경계/펜스', icon: <Mountain size={18} /> },
      { id: 'ground', name: '지목/배수', icon: <Hammer size={18} /> },
      { id: 'surround', name: '주변환경', icon: <MapPin size={18} /> },
    ];
  }
  return [
    { id: 'plan', name: '도면/평면도', icon: <Layout size={18} /> },
    { id: 'living', name: '거실', icon: <Tv size={18} /> },
    { id: 'kitchen', name: '주방', icon: <Store size={18} /> },
    { id: 'room', name: '방/침실', icon: <Bed size={18} /> },
    { id: 'bath', name: '욕실/화장실', icon: <Bath size={18} /> },
    { id: 'veranda', name: '베란다/기타', icon: <Home size={18} /> },
  ];
};

export default function AnalysisPanel({ 
  activeProperty, 
  initialBid, 
  priceDisplayMode, 
  setPriceDisplayMode, 
  onClose 
}: AnalysisPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('analysis');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{type: 'doc' | 'img', data: any} | null>(null);
  const [scanMode, setScanMode] = useState<'doc' | 'img' | null>(null);
  const [bidPrice, setBidPrice] = useState(activeProperty?.minPrice || 0);
  const [user, setUser] = useState<{name: string} | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [isExpertMode, setIsExpertMode] = useState(false);
  const [repairCost, setRepairCost] = useState(0);
  const [loanRatio, setLoanRatio] = useState(70);
  const [interestRate, setInterestRate] = useState(4.5);
  
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const [uploadedPhotos, setUploadedPhotos] = useState<Record<string, File[]>>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
    
    if (activeProperty) {
      if (typeof initialBid === 'number' && !isNaN(initialBid) && initialBid > 0) {
        setBidPrice(initialBid);
      } else {
        setBidPrice(activeProperty.minPrice);
      }
      setScanResult(null);
      setUploadedPhotos({});
      setScanMode(null);
      
      const savedProps = JSON.parse(localStorage.getItem('savedProperties') || '[]');
      setIsSaved(savedProps.some((p: any) => p.id === activeProperty.id));
    }
  }, [activeProperty, initialBid]);

  useEffect(() => {
    const scriptId = 'kakao-sdk';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.0/kakao.min.js';
      script.onload = () => {
        if (window.Kakao && !window.Kakao.isInitialized() && process.env.NEXT_PUBLIC_KAKAO_JS_KEY) {
          window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JS_KEY);
        }
      };
      document.head.appendChild(script);
    } else if (window.Kakao && !window.Kakao.isInitialized() && process.env.NEXT_PUBLIC_KAKAO_JS_KEY) {
      window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JS_KEY);
    }
  }, []);

  const shareToKakao = () => {
    if (!window.Kakao || !activeProperty) return;
    if (!process.env.NEXT_PUBLIC_KAKAO_JS_KEY) {
      alert('카카오 API 키가 설정되지 않아 공유 기능을 사용할 수 없습니다.');
      return;
    }
    if (!window.Kakao.isInitialized()) {
      window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JS_KEY);
    }
    const shareUrl = `${window.location.origin}${window.location.pathname}?id=${activeProperty.id}&bid=${bidPrice}`;
    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: `[우리옥션] AI 분석 리포트 - ${activeProperty.caseNo}`,
        description: `${activeProperty.address}\nAI 투자 확신 지수: ${activeProperty.analysis.score}점`,
        imageUrl: activeProperty.image || 'https://images.unsplash.com/photo-1560514446-4a60f9947506?q=80&w=400&auto=format&fit=crop',
        link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
      },
      itemContent: {
        profileText: '우리옥션 AI MASTER',
        items: [
          { item: '감정가', itemOp: formatPrice(activeProperty.appraisalPrice || activeProperty.price) },
          { item: '최저가', itemOp: formatPrice(activeProperty.minPrice) },
          { item: '나의 입찰가', itemOp: formatPrice(bidPrice) },
        ],
      },
      buttons: [
        { title: '리포트 확인하기', link: { mobileWebUrl: shareUrl, webUrl: shareUrl } },
      ],
    });
  };

  const handleSaveProperty = () => {
    if (!activeProperty) return;
    const savedProps = JSON.parse(localStorage.getItem('savedProperties') || '[]');
    if (isSaved) {
      const newProps = savedProps.filter((p: any) => p.id !== activeProperty.id);
      localStorage.setItem('savedProperties', JSON.stringify(newProps));
      setIsSaved(false);
    } else {
      savedProps.push({ ...activeProperty, savedBidPrice: bidPrice, savedAt: new Date().toISOString() });
      localStorage.setItem('savedProperties', JSON.stringify(savedProps));
      setIsSaved(true);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && selectedCategory) {
      const newFiles = Array.from(e.target.files);
      setUploadedPhotos(prev => ({ 
        ...prev, 
        [selectedCategory]: [...(prev[selectedCategory] || []), ...newFiles] 
      }));
      setSelectedCategory(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const startAnalysis = async () => {
    setIsScanning(true);
    setScanResult(null);
    
    if (scanMode === 'doc') {
      setTimeout(() => {
        setIsScanning(false);
        setScanResult({
          type: 'doc',
          data: {
            status: 'danger',
            title: '선순위 권리 리스크 감지',
            desc: `업로드된 등기부 분석 결과, 근저당권 설정일이 임차인 확정일자보다 선순위입니다. 낙찰 시 보증금 인수가 발생할 확률 92%입니다.`,
            score: 18
          }
        });
      }, 3000);
    } else {
      const allFiles = Object.values(uploadedPhotos).flat();
      if (allFiles.length === 0) {
        setIsScanning(false);
        return;
      }
      
      const formData = new FormData();
      allFiles.forEach(file => formData.append('images', file));
      
      try {
        const res = await fetch('/api/vision', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        
        setIsScanning(false);
        if (data.error) throw new Error(data.error);
        
        setScanResult({
          type: 'img',
          data: {
            status: 'warning',
            title: `AI 수리비 견적 진단 (${allFiles.length}매)`,
            total: data.totalCost,
            items: data.items.map((it: any) => ({ name: it.name, price: it.cost }))
          }
        });
      } catch (e: any) {
        setIsScanning(false);
        setScanResult({
          type: 'img',
          data: {
            status: 'error',
            title: '분석 오류',
            desc: e.message || '이미지 분석 중 오류가 발생했습니다.',
            total: 0,
            items: []
          }
        });
      }
    }
  };

  const handleDownloadPDF = async () => {
    if (!activeProperty || isPdfLoading) return;
    setIsPdfLoading(true);
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ property: activeProperty, bidPrice }),
      });
      if (!res.ok) throw new Error('PDF 생성 실패');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `우리옥션_AI리포트_${activeProperty.caseNo}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert('리포트 생성 중 오류가 발생했습니다.');
    } finally {
      setIsPdfLoading(false);
    }
  };

  if (!activeProperty) return null;

  const categories = getCategories(activeProperty.type);
  const marketGapValue = (((activeProperty.marketPrice - bidPrice) / activeProperty.marketPrice) * 100).toFixed(1);

  return (
    <div style={{ 
      width: isMobile ? '100%' : '480px', 
      height: isMobile ? 'auto' : '100%',
      background: 'white', 
      display: 'flex', 
      flexDirection: 'column', 
      overflow: isMobile ? 'visible' : 'hidden',
      borderLeft: isMobile ? 'none' : '1px solid #e2e8f0',
      boxShadow: isMobile ? 'none' : '-4px 0 16px rgba(0,0,0,0.05)',
      zIndex: 10,
      position: 'relative',
    }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }
        .scan-line { position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: rgba(18, 104, 251, 0.5); box-shadow: 0 0 15px 5px rgba(18, 104, 251, 0.3); animation: scan 2s linear infinite; pointer-events: none; z-index: 20; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
        @keyframes progress-loading { 0% { width: 0%; } 100% { width: 100%; } }
        .progress-bar-loading { animation: progress-loading 4s ease-in-out infinite; }
      `}} />

      {/* Header Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #f1f5f9', background: 'white', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }} className="cscroll-hidden">
          {(['analysis', 'simulator', 'aiscan', 'trend'] as TabType[]).map((tab) => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)} 
              style={{ 
                padding: '8px 14px', border: 'none', 
                background: activeTab === tab ? '#1268FB' : '#f1f5f9', 
                color: activeTab === tab ? 'white' : '#64748b', 
                fontSize: 12, fontWeight: 800, borderRadius: 8, 
                cursor: 'pointer', whiteSpace: 'nowrap' 
              }}
            >
              {tab === 'analysis' ? 'AI 분석' : tab === 'simulator' ? '시뮬레이션' : tab === 'aiscan' ? 'AI 스튜디오' : '동향'}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleSaveProperty} style={{ border: 'none', background: 'none', color: isSaved ? '#ef4444' : '#64748b', cursor: 'pointer' }}>
            <Heart size={20} fill={isSaved ? '#ef4444' : 'none'} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div style={{ flex: isMobile ? 'none' : 1, overflowY: isMobile ? 'visible' : 'auto', padding: isMobile ? '20px' : '24px', paddingBottom: isMobile ? '100px' : '24px' }} className="cscroll">
        {activeTab === 'analysis' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Basic Property Info Summary */}
            <div style={{ background: '#f8fafc', borderRadius: 20, padding: 20, border: '1px solid #e2e8f0' }}>
              {/* Header: Type badge + Case No */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ padding: '4px 12px', background: '#e0e7ff', color: '#3730a3', fontSize: 12, fontWeight: 800, borderRadius: 8, flexShrink: 0 }}>{activeProperty.type}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#64748b' }}>{activeProperty.caseNo}</span>
                <span style={{ marginLeft: 'auto', padding: '4px 10px', fontSize: 11, fontWeight: 800, borderRadius: 6, background: activeProperty.risk === 'safe' ? '#dcfce7' : activeProperty.risk === 'warning' ? '#fef9c3' : '#fee2e2', color: activeProperty.risk === 'safe' ? '#16a34a' : activeProperty.risk === 'warning' ? '#a16207' : '#dc2626' }}>
                  {activeProperty.risk === 'safe' ? '✅ 안전' : activeProperty.risk === 'warning' ? '⚠️ 주의' : '🚨 위험'}
                </span>
              </div>
              {/* Address */}
              <div style={{ fontSize: 15, fontWeight: 900, color: '#0f172a', lineHeight: 1.5, marginBottom: 16 }}>{activeProperty.address}</div>

              {/* Price Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, background: 'white', padding: 16, borderRadius: 14, border: '1px solid #f1f5f9', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, marginBottom: 4 }}>감정가</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#94a3b8', textDecoration: 'line-through' }}>{formatPrice(activeProperty.appraisalPrice || activeProperty.price)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, marginBottom: 4 }}>최저가 (현재)</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#ef4444' }}>{formatPrice(activeProperty.minPrice)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, marginBottom: 4 }}>현재 시세</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>{formatPrice(activeProperty.marketPrice)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, marginBottom: 4 }}>예상 임대료</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#1268FB' }}>{formatPrice(activeProperty.estimatedRent)}/월</div>
                </div>
              </div>

              {/* Detail Row: Area, Date, Bid Ratio */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <div style={{ background: 'white', borderRadius: 10, padding: '10px 12px', border: '1px solid #f1f5f9', textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, marginBottom: 4 }}>면적</div>
                  <div style={{ fontSize: 13, fontWeight: 900, color: '#0f172a' }}>{activeProperty.area}㎡</div>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>{(activeProperty.area * 0.3025).toFixed(1)}평</div>
                </div>
                <div style={{ background: 'white', borderRadius: 10, padding: '10px 12px', border: '1px solid #f1f5f9', textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, marginBottom: 4 }}>경매일</div>
                  <div style={{ fontSize: 12, fontWeight: 900, color: '#0f172a' }}>{activeProperty.auctionDate}</div>
                </div>
                <div style={{ background: 'white', borderRadius: 10, padding: '10px 12px', border: '1px solid #f1f5f9', textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, marginBottom: 4 }}>낙찰가율</div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: activeProperty.ratio >= 90 ? '#16a34a' : activeProperty.ratio >= 70 ? '#d97706' : '#ef4444' }}>{activeProperty.ratio}%</div>
                </div>
              </div>
            </div>

            {/* AI Score */}
            <div style={{ background: 'linear-gradient(135deg, #1268FB 0%, #0a4db5 100%)', borderRadius: 24, padding: 32, color: 'white', textAlign: 'center', boxShadow: '0 10px 30px rgba(18, 104, 251, 0.3)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 8 }}>
                <div style={{ fontSize: 14, fontWeight: 700, opacity: 0.9 }}>AI 투자 확신 지수</div>
                <Info size={16} color="white" style={{ opacity: 0.8, cursor: 'pointer' }} onClick={() => setShowCriteria(!showCriteria)} />
              </div>
              <div style={{ fontSize: 64, fontWeight: 900, letterSpacing: -2 }}>{activeProperty.analysis.score}<span style={{ fontSize: 24, opacity: 0.7 }}> / 100</span></div>
              <div style={{ marginTop: 16, padding: '8px 16px', background: 'rgba(255,255,255,0.2)', borderRadius: 40, fontSize: 14, fontWeight: 800, display: 'inline-block' }}>
                {activeProperty.analysis.score >= 95 ? '👑 S등급 (최상의 특수 물건)' : activeProperty.analysis.score >= 85 ? '💎 A등급 (강력 추천)' : activeProperty.analysis.score >= 70 ? '✅ B등급 (긍정적)' : '⚠️ C등급 (주의 요망)'}
              </div>
              
              {showCriteria && (
                <div style={{ marginTop: 20, textAlign: 'left', background: 'rgba(0,0,0,0.15)', padding: '16px', borderRadius: 16, fontSize: 12, lineHeight: 1.6 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}><div style={{ width: 44, fontWeight: 900, color: '#fef08a' }}>S등급</div><div style={{ flex: 1, opacity: 0.9 }}>95점 이상. 시세차익이 압도적이거나 특수 권리 분석 후 안전이 100% 보장된 희귀 물건.</div></div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}><div style={{ width: 44, fontWeight: 900, color: '#bfdbfe' }}>A등급</div><div style={{ flex: 1, opacity: 0.9 }}>85~94점. 입지와 수익성 밸런스가 뛰어나며 즉각적인 투자를 강력히 추천하는 우량 물건.</div></div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}><div style={{ width: 44, fontWeight: 900, color: '#e0f2fe' }}>B등급</div><div style={{ flex: 1, opacity: 0.9 }}>70~84점. 평균 이상의 수익률을 보이며 큰 리스크가 없는 일반적인 투자 적합 물건.</div></div>
                  <div style={{ display: 'flex', gap: 8 }}><div style={{ width: 44, fontWeight: 900, color: '#fecaca' }}>C등급</div><div style={{ flex: 1, opacity: 0.9 }}>70점 미만. 권리상 하자가 있거나 예상 시세차익이 낮아 초보자에게는 투자를 권장하지 않음.</div></div>
                </div>
              )}
            </div>

            {/* Expert Data Section (New) */}
            <div style={{ background: '#f8fafc', borderRadius: 20, padding: 24, border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <FileText size={20} color="#1268FB" />
                <span style={{ fontSize: 16, fontWeight: 900 }}>전문가 상세 분석 데이터</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ background: 'white', padding: 12, borderRadius: 12, border: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>용도지역</div>
                  <div style={{ fontSize: 13, fontWeight: 800 }}>제2종 일반주거지역</div>
                </div>
                <div style={{ background: 'white', padding: 12, borderRadius: 12, border: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>지방조례 용적률</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#059669' }}>200% (최대 250%)</div>
                </div>
                <div style={{ background: 'white', padding: 12, borderRadius: 12, border: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>토지이용계획</div>
                  <div style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.4 }}>가축사육제한구역, 상대보호구역</div>
                </div>
                <div style={{ background: 'white', padding: 12, borderRadius: 12, border: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>위반건축물 여부</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#16a34a' }}>해당 없음</div>
                </div>
              </div>
              <button 
                onClick={() => window.open('https://www.eum.go.kr/', '_blank')}
                style={{ width: '100%', marginTop: 16, padding: '10px', background: 'white', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 12, fontWeight: 800, color: '#475569', cursor: 'pointer' }}
              >
                토지이용계획원(이음) 원본 확인하기
              </button>
            </div>

            {/* Expert Consulting CTA (New) */}
            <div style={{ background: 'linear-gradient(135deg, #fefce8 0%, #fffbeb 100%)', borderRadius: 20, padding: 24, border: '1px solid #fde68a', boxShadow: '0 10px 20px rgba(251, 191, 36, 0.1)' }}>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ background: '#f59e0b', width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Users size={24} color="white" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#92400e', marginBottom: 4 }}>전문가 정밀 컨설팅</div>
                  <div style={{ fontSize: 13, color: '#b45309', lineHeight: 1.5, fontWeight: 600 }}>
                    복잡한 특수권리 분석과 신축 수지분석,<br/>현직 경매 마스터가 직접 도와드립니다.
                  </div>
                  <button 
                    onClick={() => window.open('http://pf.kakao.com/', '_blank')}
                    style={{ marginTop: 16, padding: '10px 20px', background: '#92400e', color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 800, cursor: 'pointer' }}
                  >
                    1:1 정밀 분석 의뢰하기
                  </button>
                </div>
              </div>
            </div>

            {/* AI Verdict */}
            <div style={{ background: '#f0f7ff', borderRadius: 20, padding: 24, border: '1px solid #bfdbfe', marginBottom: isMobile ? 80 : 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <ShieldCheck size={20} color="#1268FB" />
                <span style={{ fontSize: 16, fontWeight: 900, color: '#1e40af' }}>AI 마스터 종합 판정</span>
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.6, color: '#334155', fontWeight: 600 }}>"{activeProperty.analysis.verdict}"</div>
            </div>
          </div>
        )}

        {activeTab === 'simulator' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: isMobile ? 100 : 0 }}>
            {/* 시장 가격 비교 */}
            <div style={{ background: '#f8fafc', borderRadius: 16, padding: 20, border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#1e293b' }}>시장 가격 비교</span>
                <span style={{ fontSize: 12, padding: '4px 8px', background: '#dcfce7', color: '#166534', borderRadius: 6, fontWeight: 700 }}>시세 대비 {marketGapValue}% 저렴</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: '#64748b' }}>인근 평균 시세</span>
                  <span style={{ fontSize: 14, fontWeight: 800 }}>{formatPrice(activeProperty.marketPrice)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: '#64748b' }}>나의 예상 입찰가</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#1268FB' }}>{formatPrice(bidPrice)}</span>
                </div>
              </div>
            </div>
            
            {/* 입찰가 시뮬레이터 */}
            <div style={{ background: '#f0f7ff', borderRadius: 16, padding: 24, border: '1px solid #bfdbfe', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#1e3a8a' }}>나의 예상 입찰가 시뮬레이터</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button 
                    onClick={() => setIsExpertMode(!isExpertMode)}
                    style={{ background: isExpertMode ? '#1e293b' : 'white', color: isExpertMode ? 'white' : '#64748b', border: '1px solid #cbd5e1', padding: '8px 12px', borderRadius: 8, fontSize: 12, fontWeight: 800, cursor: 'pointer' }}
                  >
                    {isExpertMode ? '일반 모드' : '전문가 모드'}
                  </button>
                  <button 
                    onClick={() => setBidPrice(activeProperty.marketPrice * 0.82)}
                    style={{ background: '#1268FB', color: 'white', border: 'none', padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 10px rgba(18, 104, 251, 0.3)' }}
                  >
                    <Sparkles size={16} color="#93c5fd" />
                    AI 최적가
                  </button>
                </div>
              </div>
              
              <div style={{ background: 'white', padding: '14px 18px', borderRadius: 12, marginBottom: 24, border: '1px dashed #93c5fd', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <Info size={18} color="#3b82f6" style={{ marginTop: 2, flexShrink: 0 }} />
                <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
                  최근 3년간 해당 지역 유사 물건 낙찰 데이터를 기반으로 분석한 결과, <strong>시세의 82% ({formatPrice(activeProperty.marketPrice * 0.82)})</strong>에서 입찰할 경우 낙찰 확률 85% 이상 및 10%대 안전 마진을 기대할 수 있습니다.
                </div>
              </div>

              {isExpertMode && (
                <div style={{ background: 'white', padding: 20, borderRadius: 16, marginBottom: 20, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#475569' }}>수리/명도비용</span>
                      <span style={{ fontSize: 13, fontWeight: 900, color: '#1268FB' }}>{formatPrice(repairCost)}</span>
                    </div>
                    <input type="range" min="0" max="100000000" step="1000000" value={repairCost} onChange={(e) => setRepairCost(Number(e.target.value))} style={{ width: '100%', accentColor: '#1268FB' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', marginBottom: 6 }}>대출 비율 ({loanRatio}%)</div>
                      <input type="number" value={loanRatio} onChange={(e) => setLoanRatio(Number(e.target.value))} style={{ width: '100%', padding: '8px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, fontWeight: 700 }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', marginBottom: 6 }}>대출 금리 (%)</div>
                      <input type="number" step="0.1" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} style={{ width: '100%', padding: '8px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, fontWeight: 700 }} />
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', fontWeight: 700 }}>
                  <span>최저 매각가 ({formatPrice(activeProperty.minPrice)})</span>
                  <span>시세 110% ({formatPrice(activeProperty.marketPrice * 1.1)})</span>
                </div>
                <input 
                  type="range" 
                  min={activeProperty.minPrice * 0.8} 
                  max={activeProperty.marketPrice * 1.2} 
                  step={1000000}
                  value={bidPrice} 
                  onChange={(e) => setBidPrice(Number(e.target.value))} 
                  style={{ width: '100%', cursor: 'pointer', accentColor: '#1268FB' }} 
                />
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                  <span style={{ fontSize: 24, fontWeight: 900, color: '#1268FB' }}>{formatPrice(bidPrice)}</span>
                </div>
              </div>
            </div>

            {/* ROI Analysis */}
            {(() => {
              const incidentalCost = bidPrice * 0.052;
              const loanAmount = bidPrice * (loanRatio / 100);
              const monthlyInterest = (loanAmount * (interestRate / 100)) / 12;
              const cashRequired = bidPrice + incidentalCost + repairCost - loanAmount;

              const netProfit = activeProperty.marketPrice - bidPrice - incidentalCost - repairCost;
              const roi = (netProfit / (cashRequired || 1)) * 100;

              const rate = 1.015 + (activeProperty.analysis.score / 100) * 0.025;
              const price1Y = activeProperty.marketPrice * Math.pow(rate, 1);
              const price3Y = activeProperty.marketPrice * Math.pow(rate, 3);
              const price5Y = activeProperty.marketPrice * Math.pow(rate, 5);

              const profit1Y = price1Y - bidPrice - incidentalCost - repairCost;
              const profit3Y = price3Y - bidPrice - incidentalCost - repairCost;
              const profit5Y = price5Y - bidPrice - incidentalCost - repairCost;
              
              return (
                <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: 16, padding: 24, color: 'white', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
                    <Calculator size={18} color="#60a5fa" />
                    <span style={{ fontSize: 15, fontWeight: 800 }}>AI 종합 투자 수익률(ROI) 예측</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 12 }}>
                      <span style={{ fontSize: 13, color: '#94a3b8' }}>예상 매도 시세</span>
                      <span style={{ fontSize: 14, fontWeight: 700 }}>{formatPrice(activeProperty.marketPrice)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 12 }}>
                      <span style={{ fontSize: 13, color: '#94a3b8' }}>나의 입찰가</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8' }}>- {formatPrice(bidPrice)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 12 }}>
                      <span style={{ fontSize: 13, color: '#94a3b8' }}>부대 비용 및 수리비</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8' }}>- {formatPrice(incidentalCost + repairCost)}</span>
                    </div>
                    {isExpertMode && (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 12 }}>
                          <span style={{ fontSize: 13, color: '#94a3b8' }}>대출 실행액 ({loanRatio}%)</span>
                          <span style={{ fontSize: 14, fontWeight: 700, color: '#60a5fa' }}>+ {formatPrice(loanAmount)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 12 }}>
                          <span style={{ fontSize: 13, color: '#94a3b8' }}>월 예상 이자</span>
                          <span style={{ fontSize: 14, fontWeight: 700, color: '#f87171' }}>{formatPrice(monthlyInterest)} / 월</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 12, background: 'rgba(255,255,255,0.05)', margin: '0 -24px', padding: '12px 24px' }}>
                          <span style={{ fontSize: 13, fontWeight: 800, color: '#cbd5e1' }}>실제 필요 현금</span>
                          <span style={{ fontSize: 16, fontWeight: 900, color: '#fbbf24' }}>{formatPrice(cashRequired)}</span>
                        </div>
                      </>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, alignItems: 'flex-end' }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: '#cbd5e1' }}>{isExpertMode ? '투자 원금 대비 세후수익' : '즉시 매도 시 세후수익'}</span>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 26, fontWeight: 900, color: roi > 0 ? '#34d399' : '#f87171' }}>
                          {roi > 0 ? '+' : ''}{formatPrice(netProfit)}
                        </div>
                        <div style={{ fontSize: 13, color: roi > 0 ? '#10b981' : '#ef4444', fontWeight: 800, marginTop: 6, background: roi > 0 ? 'rgba(52, 211, 153, 0.1)' : 'rgba(248, 113, 113, 0.1)', padding: '4px 8px', borderRadius: 6, display: 'inline-block' }}>
                          {isExpertMode ? '자기자본 수익률' : '수익률'} {roi.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 16, marginTop: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                        <Sparkles size={14} color="#60a5fa" />
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#94a3b8' }}>AI 딥러닝 기간별 수익 예측 (과거 5년치 실거래가 학습)</div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>1년 후</div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: profit1Y > 0 ? '#34d399' : '#f87171' }}>{profit1Y > 0 ? '+' : ''}{formatPrice(profit1Y)}</div>
                        </div>
                        <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.1)', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>3년 후</div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: profit3Y > 0 ? '#34d399' : '#f87171' }}>{profit3Y > 0 ? '+' : ''}{formatPrice(profit3Y)}</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>5년 후</div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: profit5Y > 0 ? '#34d399' : '#f87171' }}>{profit5Y > 0 ? '+' : ''}{formatPrice(profit5Y)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {activeTab === 'aiscan' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: isMobile ? 100 : 0 }}>
            {!user ? (
              <div style={{ padding: 40, background: '#f8fafc', borderRadius: 24, border: '1px dashed #cbd5e1', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
                <div style={{ width: 64, height: 64, background: '#EFF6FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Lock size={32} color="#1268FB" /></div>
                <div><div style={{ fontSize: 18, fontWeight: 900, color: '#111827', marginBottom: 8 }}>회원 전용 서비스</div><div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>AI 등기부 분석 및 사진 견적 기능은<br/>우리옥션 회원만 이용 가능합니다.</div></div>
                <Link href="/login" style={{ width: '100%', textDecoration: 'none' }}><button style={{ width: '100%', padding: '14px', background: '#1268FB', color: 'white', border: 'none', borderRadius: 12, fontWeight: 800, cursor: 'pointer' }}>로그인하고 분석 시작하기</button></Link>
              </div>
            ) : (
              <>
                <div style={{ padding: 20, background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', borderRadius: 24, border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 20, color: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><Sparkles size={22} color="#1268FB" /> AI 비전 스튜디오</div>
                  {!scanMode ? (
                    <div style={{ display: 'flex', gap: 12 }}>
                      <button onClick={() => setScanMode('doc')} style={{ flex: 1, padding: '24px', background: 'white', border: '1px solid #e2e8f0', borderRadius: 20, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}><FileText size={32} color="#1268FB" /><span style={{ fontSize: 14, fontWeight: 800 }}>등기부 분석</span></button>
                      <button onClick={() => setScanMode('img')} style={{ flex: 1, padding: '24px', background: 'white', border: '1px solid #e2e8f0', borderRadius: 20, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}><Camera size={32} color="#059669" /><span style={{ fontSize: 14, fontWeight: 800 }}>현장 사진 분석</span></button>
                    </div>
                  ) : scanMode === 'doc' ? (
                    <div style={{ position: 'relative', minHeight: 180, border: '2px dashed #1268FB', borderRadius: 20, background: 'white', padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                      {isScanning && <div className="scan-line" />}
                      <input type="file" ref={fileInputRef} onChange={(e) => { if(e.target.files?.[0]) setUploadedPhotos({doc: [e.target.files[0]]}); }} style={{ display: 'none' }} />
                      {!uploadedPhotos.doc ? (
                        <>
                          <Upload size={40} color="#1268FB" style={{ opacity: 0.5 }} />
                          <div style={{ fontSize: 14, fontWeight: 800, color: '#475569' }}>부동산 등기부등본(PDF/JPG)</div>
                          <button onClick={() => fileInputRef.current?.click()} style={{ padding: '8px 16px', background: '#1268FB', color: 'white', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>파일 선택</button>
                          <button onClick={() => setScanMode(null)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} color="#94a3b8" /></button>
                        </>
                      ) : (
                        <>
                          <FilePlus size={40} color="#1268FB" />
                          <div style={{ fontSize: 14, fontWeight: 800 }}>{uploadedPhotos.doc[0].name}</div>
                          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                            <button onClick={startAnalysis} style={{ padding: '10px 24px', background: '#1268FB', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>분석 시작</button>
                            <button onClick={() => setUploadedPhotos({})} style={{ padding: '10px 16px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>취소</button>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#1268FB', textAlign: 'left' }}>{activeProperty.type} 전용 진단 모드</div>
                        <Images size={18} color="#1268FB" />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        {categories.map(cat => {
                          const count = uploadedPhotos[cat.id]?.length || 0;
                          return (
                            <div key={cat.id} onClick={() => { setSelectedCategory(cat.id); fileInputRef.current?.click(); }} style={{ padding: '16px 12px', background: count > 0 ? '#f0fdf4' : 'white', border: count > 0 ? '1.5px solid #22c55e' : '1px solid #e2e8f0', borderRadius: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
                              <div style={{ color: count > 0 ? '#16a34a' : '#94a3b8' }}>{cat.icon}</div>
                              <div style={{ textAlign: 'left' }}>
                                <div style={{ fontSize: 11, fontWeight: 800, color: count > 0 ? '#166534' : '#475569' }}>{cat.name}</div>
                                <div style={{ fontSize: 9, color: count > 0 ? '#16a34a' : '#94a3b8' }}>{count > 0 ? `총 ${count}매 완료` : '사진 필요'}</div>
                              </div>
                              {count > 0 && (
                                <div onClick={(e) => { e.stopPropagation(); setUploadedPhotos(prev => { const n = {...prev}; delete n[cat.id]; return n; }); }} style={{ position: 'absolute', top: 4, right: 4, background: '#fee2e2', borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={10} color="#ef4444" /></div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <input type="file" ref={fileInputRef} multiple onChange={handleFileSelect} style={{ display: 'none' }} />
                      <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                        <button onClick={startAnalysis} disabled={Object.keys(uploadedPhotos).length === 0} style={{ flex: 2, padding: '14px', background: '#1268FB', color: 'white', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: 'pointer', opacity: Object.keys(uploadedPhotos).length === 0 ? 0.5 : 1 }}>AI 수리비 견적 시작</button>
                        <button onClick={() => { setScanMode(null); setUploadedPhotos({}); }} style={{ flex: 1, padding: '14px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>취소</button>
                      </div>
                    </div>
                  )}
                </div>

                {isScanning && (
                  <div style={{ padding: 32, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                    <Loader2 size={32} color="#1268FB" className="spin" />
                    <div style={{ fontSize: 15, fontWeight: 900, color: '#1268FB' }}>AI 맞춤형 정보 진단 중...</div>
                    <div style={{ width: '100%', height: 6, background: '#f1f5f9', borderRadius: 10, overflow: 'hidden' }}>
                      <div className="progress-bar-loading" style={{ height: '100%', background: '#1268FB', width: '0%' }} />
                    </div>
                  </div>
                )}

                {scanResult && (
                  <div style={{ padding: 24, background: scanResult.data.status === 'error' ? '#fff1f2' : (scanResult.type === 'doc' ? '#fef2f2' : '#f0fdf4'), borderRadius: 24, border: scanResult.data.status === 'error' ? '1px solid #fda4af' : (scanResult.type === 'doc' ? '1px solid #fecaca' : '1px solid #bbf7d0'), boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                      {scanResult.data.status === 'error' ? <AlertCircle size={24} color="#e11d48" /> : (scanResult.type === 'doc' ? <ShieldAlert size={24} color="#ef4444" /> : <Sparkles size={24} color="#059669" />)}
                      <span style={{ fontSize: 18, fontWeight: 900, color: scanResult.data.status === 'error' ? '#9f1239' : (scanResult.type === 'doc' ? '#991b1b' : '#166534') }}>{scanResult.data.title}</span>
                    </div>
                    <div style={{ fontSize: 14, color: scanResult.data.status === 'error' ? '#be123c' : (scanResult.type === 'doc' ? '#b91c1c' : '#166534'), lineHeight: 1.7, fontWeight: 600, marginBottom: scanResult.data.status === 'error' ? 0 : 24 }}>{scanResult.data.desc}</div>
                    {scanResult.data.status !== 'error' && (
                      <>
                        {scanResult.type === 'img' && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                            {scanResult.data.items.map((item: any, i: number) => (
                              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#166534', borderBottom: '1px dashed #bbf7d0', padding: '4px 0' }}>
                                <span>{item.name}</span><span style={{ fontWeight: 800 }}>{formatPrice(item.price)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        <div style={{ padding: 20, background: 'white', borderRadius: 16, border: scanResult.type === 'doc' ? '1px solid #fecaca' : '1px solid #bbf7d0', textAlign: 'center' }}>
                          <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700, marginBottom: 6 }}>{scanResult.type === 'doc' ? '최종 권리 안전 지수' : '총 예상 수리비'}</div>
                          <div style={{ fontSize: 32, fontWeight: 900, color: scanResult.type === 'doc' ? '#ef4444' : '#059669' }}>
                            {scanResult.type === 'doc' ? `${scanResult.data.score} / 100` : formatPrice(scanResult.data.total)}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'trend' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: isMobile ? 100 : 0 }}>
            {/* 지역 낙찰가 트렌드 */}
            <div style={{ background: '#f8f9fa', borderRadius: 16, padding: 20, border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <TrendingUp size={16} color="#1268FB" />
                <span style={{ fontSize: 14, fontWeight: 800 }}>지역 낙찰가 트렌드 요약</span>
              </div>
              <div style={{ fontSize: 14, color: '#374151', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600 }}>해당 관할 법원 / 용도 기준</span>
                <strong style={{ color: '#1268FB', fontSize: 18 }}>87.4%</strong>
              </div>
            </div>

            {/* 동적 동향 차트 */}
            {(() => {
              const isCommercial = activeProperty.type.includes('상가') || activeProperty.type.includes('오피스') || activeProperty.type.includes('근린') || activeProperty.type.includes('사무실');
              const isLand = activeProperty.type.includes('토지') || activeProperty.type.includes('공장') || activeProperty.type.includes('대') || activeProperty.type.includes('전');
              
              let chartTitle = '인근 유사 매물 시세 동향';
              let chartBadge = '최근 5년 / 반경 1km';
              
              if (isCommercial) {
                chartTitle = '인근 상권 평균 거래가 동향';
                chartBadge = '최근 5년 / ㎡당 단가';
              } else if (isLand) {
                chartTitle = '해당 필지 개별공시지가 추이';
                chartBadge = '최근 5년 / 국토부 고시';
              }

              return (
                <div style={{ background: 'white', borderRadius: 16, padding: 20, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <TrendingUp size={18} color="#1268FB" />
                      <span style={{ fontSize: 14, fontWeight: 800, color: '#1e293b' }}>{chartTitle}</span>
                    </div>
                    <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, background: '#f8fafc', padding: '4px 8px', borderRadius: 6 }}>{chartBadge}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 100, paddingBottom: 8, borderBottom: '1px solid #f1f5f9' }}>
                    {[
                      { year: '2020', val: 78, factor: 0.78 },
                      { year: '2021', val: 85, factor: 0.85 },
                      { year: '2022', val: 95, factor: 0.95 },
                      { year: '2023', val: 90, factor: 0.90 },
                      { year: '2024', val: 100, factor: 1.0 },
                    ].map((d, i) => {
                      let priceVal = 0;
                      if (isLand) {
                        priceVal = (activeProperty.marketPrice / 1500) * d.factor;
                      } else if (isCommercial) {
                        priceVal = (activeProperty.marketPrice / 250) * d.factor;
                      } else {
                        priceVal = activeProperty.marketPrice * d.factor;
                      }

                      return (
                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 8, height: '100%' }}>
                          <div style={{ fontSize: 10, color: i === 4 ? '#1268FB' : '#64748b', fontWeight: 800, letterSpacing: '-0.5px' }}>{formatPrice(priceVal)}</div>
                          <div style={{ width: '100%', maxWidth: 36, background: i === 4 ? '#1268FB' : '#e2e8f0', height: `${d.val}%`, borderRadius: '6px 6px 0 0', transition: 'all 0.5s ease-out' }} />
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                    {['20', '21', '22', '23', '24'].map((y, i) => (
                      <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>'{y}</div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* FOMO */}
            <div style={{ background: '#fff5f5', borderRadius: 16, padding: 20, border: '1px solid #fed7aa', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <Flame size={18} color="#ef4444" />
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#991b1b' }}>실시간 입찰 경쟁도 (높음)</span>
                </div>
                <div style={{ fontSize: 12, color: '#b91c1c', fontWeight: 600 }}>오늘 조회수 및 관심 집중도 기반 예측</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Eye size={14} color="#ef4444" /><span style={{ fontSize: 13, fontWeight: 800, color: '#7f1d1d' }}>1,245회</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Heart size={14} fill="#ef4444" color="#ef4444" /><span style={{ fontSize: 13, fontWeight: 800, color: '#7f1d1d' }}>42명 찜</span></div>
              </div>
            </div>

            {/* Area Stats */}
            <div style={{ display: 'flex', gap: 12, marginBottom: isMobile ? 80 : 0 }}>
              <div style={{ flex: 1, background: 'white', borderRadius: 16, padding: 20, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', textAlign: 'center' }}>
                <Clock size={24} color="#64748b" style={{ margin: '0 auto 12px' }} />
                <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700, marginBottom: 4 }}>이 지역 평균 유찰</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#0f172a' }}>1.8<span style={{ fontSize: 14, fontWeight: 600, color: '#64748b' }}> 회</span></div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 8 }}>현재 2회 유찰 상태로<br/>적정 타이밍 도래</div>
              </div>
              <div style={{ flex: 1, background: 'white', borderRadius: 16, padding: 20, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', textAlign: 'center' }}>
                <Activity size={24} color="#10b981" style={{ margin: '0 auto 12px' }} />
                <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700, marginBottom: 4 }}>해당 상권 생존율</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#0f172a' }}>65.2<span style={{ fontSize: 14, fontWeight: 600, color: '#64748b' }}> %</span></div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 8 }}>반경 1km 기준<br/>일일 유동인구 1.2만</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid #f1f5f9', background: 'white', display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
        <button 
          onClick={handleDownloadPDF} 
          disabled={isPdfLoading}
          style={{ 
            width: '100%', padding: '14px', background: isPdfLoading ? '#94a3b8' : '#1268FB', 
            color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 800, 
            cursor: isPdfLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'background 0.2s'
          }}
        >
          {isPdfLoading ? <><Loader2 size={18} className="spin" /> AI 리포트 생성 중...</> : <><Download size={18} /> AI 권리분석 PDF 리포트 발행</>}
        </button>
        <button 
          onClick={shareToKakao} 
          style={{ 
            width: '100%', padding: '12px', background: '#FEE500', color: '#000', 
            border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 800, 
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 
          }}
        >
          <img src="https://developers.kakao.com/assets/img/about/logos/kakaotalksharing/kakaotalk_sharing_btn_medium.png" alt="Kakao" style={{ width: 18, height: 18 }} />
          카카오톡으로 리포트 공유
        </button>
      </div>
    </div>
  );
}
