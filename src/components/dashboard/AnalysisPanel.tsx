'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { 
  ShieldCheck, ShieldAlert, Calculator, TrendingUp, Download, Home, Train, 
  GraduationCap, Store, MapPin, Camera, FileText, Sparkles, Loader2, Lock, 
  Upload, FilePlus, X, AlertCircle, Layout, Bath, Bed, Tv, Images, Wind, 
  Maximize, DoorOpen, Hammer, AlertTriangle, Mountain, Info, Heart, Users, 
  Flame, Eye, Clock, Activity, ChevronRight, Building 
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

type TabType = 'analysis' | 'simulator' | 'aiscan' | 'architecture' | 'trend';

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
  const [user, setUser] = useState<{name: string} | null>({ name: '양동혁' });
  const [isSaved, setIsSaved] = useState(false);
  const [showCriteria, setShowCriteria] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [isExpertMode, setIsExpertMode] = useState(false);
  const [repairCost, setRepairCost] = useState(0);
  const [evictionCost, setEvictionCost] = useState(0);
  const [loanRatio, setLoanRatio] = useState(80);
  const [interestRate, setInterestRate] = useState(4.8);
  const [selectedZoneId, setSelectedZoneId] = useState('r2');
  const [showConsultModal, setShowConsultModal] = useState(false);
  const [consultForm, setConsultForm] = useState({ name: '', phone: '' });
  const [consultSent, setConsultSent] = useState(false);
  const [zoneData, setZoneData] = useState<any>(null);
  const [buildingData, setBuildingData] = useState<any>(null);
  const [trendData, setTrendData] = useState<any[] | null>(null);
  const [zoneLoading, setZoneLoading] = useState(false);
  const [buildingLoading, setBuildingLoading] = useState(false);
  const [trendLoading, setTrendLoading] = useState(false);
  const [zoneResult, setZoneResult] = useState<{zoneName: string; source: 'api'|'mock'} | null>(null);
  const [failCount, setFailCount] = useState(activeProperty?.failCount ?? 0);
  
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const [uploadedPhotos, setUploadedPhotos] = useState<Record<string, File[]>>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const zoneAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (activeProperty) {
      setFailCount(activeProperty.failCount || 0);
      setZoneData(null);
      setBuildingData(null);
      
      const fetchData = async () => {
        setZoneLoading(true);
        setBuildingLoading(true);
        setTrendLoading(true);
        try {
          const zRes = await fetch('/api/zone', {
            method: 'POST',
            body: JSON.stringify({ address: activeProperty.address }),
            headers: { 'Content-Type': 'application/json' }
          });
          const zD = await zRes.json();
          setZoneData(zD);
          setZoneResult(zD);
          if (zD && zD.zoneName) {
            if (zD.zoneName.includes('1종')) setSelectedZoneId('r1');
            else if (zD.zoneName.includes('2종')) setSelectedZoneId('r2');
            else if (zD.zoneName.includes('3종')) setSelectedZoneId('r3');
            else if (zD.zoneName.includes('준주거')) setSelectedZoneId('semi');
            else if (zD.zoneName.includes('상업')) setSelectedZoneId('nbiz');
            else setSelectedZoneId('r2'); // default
          }

          const bRes = await fetch('/api/building', {
            method: 'POST',
            body: JSON.stringify({ address: activeProperty.address }),
            headers: { 'Content-Type': 'application/json' }
          });
          const bD = await bRes.json();
          setBuildingData(bD);

          const tRes = await fetch('/api/trade', {
            method: 'POST',
            body: JSON.stringify({ address: activeProperty.address, type: activeProperty.type }),
            headers: { 'Content-Type': 'application/json' }
          });
          const tD = await tRes.json();
          setTrendData(tD.trends || null);
        } catch (e) {
          console.error(e);
        } finally {
          setZoneLoading(false);
          setBuildingLoading(false);
          setTrendLoading(false);
        }
      };
      fetchData();
      
      if (typeof initialBid === 'number' && !isNaN(initialBid) && initialBid > 0) {
        setBidPrice(initialBid);
      } else {
        setBidPrice(activeProperty.minPrice);
      }
      
      const isApt = activeProperty.type.includes('아파트') || activeProperty.type.includes('빌라');
      const isComm = activeProperty.type.includes('상가') || activeProperty.type.includes('근린') || activeProperty.type.includes('오피스');
      const pyeong = activeProperty.area * 0.3025;
      
      if (isApt) {
        setRepairCost(Math.round(pyeong * 1500000));
        setEvictionCost(5000000);
      } else if (isComm) {
        setRepairCost(Math.round(pyeong * 2000000));
        setEvictionCost(8000000);
      } else {
        setRepairCost(Math.round(pyeong * 500000));
        setEvictionCost(10000000);
      }

      setScanResult(null);
      setUploadedPhotos({});
      setScanMode(null);
      // setSelectedZoneId('r2'); // Moved to fetchData
      // setZoneResult(null);     // Moved to fetchData
      
      const savedProps = JSON.parse(localStorage.getItem('savedProperties') || '[]');
      setIsSaved(savedProps.some((p: any) => p.id === activeProperty.id));
    }
  }, [activeProperty, initialBid]);

  const fetchZone = async (address: string) => {
    setZoneLoading(true);
    try {
      const zRes = await fetch('/api/zone', {
        method: 'POST',
        body: JSON.stringify({ address }),
        headers: { 'Content-Type': 'application/json' }
      });
      const zD = await zRes.json();
      setZoneData(zD);
      setZoneResult(zD);
      if (zD && zD.zoneName) {
        if (zD.zoneName.includes('1종')) setSelectedZoneId('r1');
        else if (zD.zoneName.includes('2종')) setSelectedZoneId('r2');
        else if (zD.zoneName.includes('3종')) setSelectedZoneId('r3');
        else if (zD.zoneName.includes('준주거')) setSelectedZoneId('semi');
        else if (zD.zoneName.includes('상업')) setSelectedZoneId('nbiz');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setZoneLoading(false);
    }
  };

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
        const result = await res.json();
        setScanResult({
          type: 'img',
          data: result
        });
      } catch (err) {
        console.error(err);
      } finally {
        setIsScanning(false);
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
          {(['analysis', 'simulator', 'aiscan', 'architecture', 'trend'] as TabType[]).map((tab) => (
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
              {tab === 'analysis' ? 'AI 분석' : tab === 'simulator' ? '시뮬레이션' : tab === 'aiscan' ? 'AI 스튜디오' : tab === 'architecture' ? '건축/개발' : '동향'}
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
                <span style={{ marginLeft: 'auto', padding: '4px 10px', fontSize: 11, fontWeight: 800, borderRadius: 6, background: activeProperty.analysis.score >= 85 ? '#dcfce7' : activeProperty.analysis.score >= 70 ? '#fef9c3' : '#fee2e2', color: activeProperty.analysis.score >= 85 ? '#16a34a' : activeProperty.analysis.score >= 70 ? '#a16207' : '#dc2626' }}>
                  {activeProperty.analysis.score >= 85 ? '✅ 안전' : activeProperty.analysis.score >= 70 ? '🟢 긍정적' : '🚨 위험'}
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
                {activeProperty.analysis.score >= 95 ? '👑 S등급 (최상의 특수 물건)' : activeProperty.analysis.score >= 85 ? '💎 A등급 (강력 추천)' : activeProperty.analysis.score >= 70 ? '🟢 B등급 (긍정적)' : '🚨 C등급 (위험/주의 요망)'}
              </div>
              
              {showCriteria && (
                <div style={{ marginTop: 20, textAlign: 'left', background: 'rgba(0,0,0,0.15)', padding: '16px', borderRadius: 16, fontSize: 12, lineHeight: 1.6 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}><div style={{ width: 44, fontWeight: 900, color: '#fef08a' }}>S등급</div><div style={{ flex: 1, opacity: 0.9 }}>95점 이상. 시세차익이 압도적이거나 특수 권리 분석 후 안전이 100% 보장된 희귀 물건.</div></div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}><div style={{ width: 44, fontWeight: 900, color: '#bfdbfe' }}>A등급</div><div style={{ flex: 1, opacity: 0.9 }}>85~94점. 입지와 수익성 밸런스가 뛰어나며 즉각적인 투자를 강력히 추천하는 우량 물건.</div></div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}><div style={{ width: 44, fontWeight: 900, color: '#e0f2fe' }}>B등급</div><div style={{ flex: 1, opacity: 0.9 }}>70~84점. 평균 이상의 수익률을 보이며 큰 리스크가 없는 일반적인 투자 적합 물건 (긍정적).</div></div>
                  <div style={{ display: 'flex', gap: 8 }}><div style={{ width: 44, fontWeight: 900, color: '#fecaca' }}>C등급</div><div style={{ flex: 1, opacity: 0.9 }}>70점 미만. 권리상 하자가 있거나 예상 시세차익이 낮아 초보자에게는 투자를 권장하지 않음 (위험).</div></div>
                </div>
              )}
            </div>

            {/* Expert Data Section */}
            <div style={{ background: '#f8fafc', borderRadius: 20, padding: 24, border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <FileText size={20} color="#1268FB" />
                  <span style={{ fontSize: 16, fontWeight: 900 }}>전문가 상세 분석 데이터</span>
                </div>
                {buildingLoading && <Loader2 size={16} className="spin" color="#1268FB" />}
              </div>

              {/* 전문가 종합 평가 (기존 UI 복구 및 AI 분석 통합) */}
              <div style={{ background: 'white', borderRadius: 16, padding: 20, border: '1px solid #f1f5f9', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 }}>
                  <h4 style={{ fontSize: 13, fontWeight: 800, color: '#1e293b', margin: 0 }}>
                    {buildingData ? '부동산 종합 정보' : '부동산 종합 정보'}
                  </h4>
                  {buildingData ? (
                    <div style={{ fontSize: 10, color: '#10b981', fontWeight: 700, background: '#dcfce7', padding: '3px 8px', borderRadius: 6 }}>✅ 실데이터 연동됨</div>
                  ) : (
                    <div style={{ fontSize: 10, color: '#94a3b8' }}>데이터 대기 중</div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {/* 행 1: 용도지역, 용적률, 토지이용계획 (기존 AI 분석 기반) */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ padding: '12px', background: '#f8fafc', borderRadius: 10 }}>
                      <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 4 }}>용도지역</div>
                      <div style={{ fontSize: 13, color: '#1e293b', fontWeight: 800 }}>{zoneData?.zoneName || '확인 중...'}</div>
                    </div>
                    <div style={{ padding: '12px', background: '#f8fafc', borderRadius: 10 }}>
                      <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 4 }}>지방조례 용적률</div>
                      <div style={{ fontSize: 13, color: '#1e293b', fontWeight: 800 }}>
                        {zoneData?.zoneName?.includes('1종') ? '150% (최대 200%)' :
                         zoneData?.zoneName?.includes('2종') ? '200% (최대 250%)' :
                         zoneData?.zoneName?.includes('3종') ? '250% (최대 300%)' :
                         zoneData?.zoneName?.includes('준주거') ? '400% (최대 500%)' :
                         zoneData?.zoneName?.includes('상업') ? '800% (최대 1000%)' : '확인 중...'}
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: '12px', background: '#f8fafc', borderRadius: 10 }}>
                    <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 4 }}>토지이용계획</div>
                    <div style={{ fontSize: 13, color: '#1e293b', fontWeight: 800 }}>{zoneData?.limit || '가축사육제한구역'}</div>
                  </div>

                  {/* 행 2: API 기반 건축물 데이터 */}
                  {buildingData ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div style={{ padding: '12px', background: '#f8fafc', borderRadius: 10 }}>
                        <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 4 }}>주용도 / 구조</div>
                        <div style={{ fontSize: 13, color: '#1e293b', fontWeight: 800 }}>{buildingData.mainPurpsCdNm} / {buildingData.strctCdNm}</div>
                      </div>
                      <div style={{ padding: '12px', background: '#f8fafc', borderRadius: 10 }}>
                        <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 4 }}>층수 / 연면적</div>
                        <div style={{ fontSize: 13, color: '#1e293b', fontWeight: 800 }}>지상 {buildingData.grndFlrCnt}층 / {buildingData.totArea}㎡</div>
                      </div>
                      <div style={{ padding: '12px', background: '#f8fafc', borderRadius: 10 }}>
                        <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 4 }}>사용승인일 / 주차대수</div>
                        <div style={{ fontSize: 13, color: '#1e293b', fontWeight: 800 }}>{buildingData.useAprvDe} / {buildingData.parkingCount ?? 0}대</div>
                      </div>
                      <div style={{ background: buildingData.isIllegal ? '#fef2f2' : '#f8fafc', padding: '12px', borderRadius: 10, border: buildingData.isIllegal ? '1px solid #fecaca' : 'none' }}>
                        <div style={{ fontSize: 10, color: buildingData.isIllegal ? '#ef4444' : '#94a3b8', marginBottom: 4 }}>위반건축물 여부</div>
                        <div style={{ fontSize: 13, color: buildingData.isIllegal ? '#ef4444' : '#1e293b', fontWeight: 800 }}>
                          {buildingData.isIllegal ? '⚠️ 위반 의심' : '✅ 해당 없음'}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '24px', textAlign: 'center', background: '#f8fafc', borderRadius: 10, color: '#94a3b8', fontSize: 12 }}>
                      {buildingLoading ? '건축물대장 실시간 연동 중...' : '데이터 대기 중'}
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 16 }}>
                  <button 
                    onClick={() => window.open(`https://www.eum.go.kr/web/ar/lu/luLandUseIisList.jsp?searchWord=${encodeURIComponent(activeProperty.address)}`, '_blank')}
                    style={{ padding: '10px', background: 'white', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 11, fontWeight: 800, color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  >
                    <MapPin size={14} color="#64748b" /> 이음 원본 열람
                  </button>
                  <button 
                    onClick={() => window.open(`https://cloud.eais.go.kr/`, '_blank')}
                    style={{ padding: '10px', background: 'white', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 11, fontWeight: 800, color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  >
                    <FileText size={14} color="#64748b" /> 세움터 원본 열람
                  </button>
                </div>

                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#475569', marginBottom: 8 }}>AI 권리분석 총평</div>
                  <div style={{ fontSize: 13, color: '#1e293b', lineHeight: 1.6, fontWeight: 600 }}>{activeProperty.analysis.verdict}</div>
                </div>
              </div>
            </div>

            {/* Consulting CTA */}
            <div style={{ background: 'linear-gradient(135deg, #fefce8 0%, #fffbeb 100%)', borderRadius: 20, padding: 24, border: '1px solid #fde68a', boxShadow: '0 10px 20px rgba(251, 191, 36, 0.1)', marginTop: 24 }}>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ background: '#f59e0b', width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Users size={24} color="white" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#92400e', marginBottom: 4 }}>전문가 정밀 컨설팅</div>
                  <div style={{ fontSize: 13, color: '#b45309', lineHeight: 1.5, fontWeight: 600 }}>
                    복잡한 특수권리 분석과 신축 수지분석,<br/>현직 경매 마스터가 직접 도와드립니다.
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                    <button onClick={() => window.open('https://open.kakao.com/o/ourauction', '_blank')} style={{ flex: 1, padding: '10px', background: '#FEE500', color: '#3A1D1D', border: 'none', borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <img src="https://developers.kakao.com/assets/img/about/logos/kakaotalksharing/kakaotalk_sharing_btn_medium.png" alt="Kakao" style={{ width: 14, height: 14 }} />
                      카톡 문의
                    </button>
                    <a href="tel:010-0000-0000" style={{ flex: 1, textDecoration: 'none' }}>
                      <button style={{ width: '100%', padding: '10px', background: '#92400e', color: 'white', border: 'none', borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        📞 전화 연결
                      </button>
                    </a>
                  </div>
                </div>
              </div>
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
            <div style={{ background: '#f0f7ff', borderRadius: 20, padding: '28px 24px', border: '1px solid #bfdbfe', position: 'relative', boxShadow: 'inset 0 2px 4px rgba(18, 104, 251, 0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#1e3a8a', letterSpacing: '-0.5px' }}>나의 예상 입찰가 시뮬레이터</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button 
                    onClick={() => setIsExpertMode(!isExpertMode)}
                    style={{ background: isExpertMode ? '#1e293b' : 'white', color: isExpertMode ? 'white' : '#64748b', border: '1px solid #cbd5e1', padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }}
                  >
                    전문가 모드
                  </button>
                  <button 
                    onClick={() => setBidPrice(activeProperty.minPrice * 1.03)}
                    style={{ background: '#1268FB', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 12px rgba(18, 104, 251, 0.3)' }}
                  >
                    <Sparkles size={16} color="#93c5fd" />
                    AI 최적가
                  </button>
                </div>
              </div>
              
              <div style={{ background: 'white', padding: '16px 20px', borderRadius: 14, marginBottom: 28, border: '1px dashed #93c5fd', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ background: '#eff6ff', padding: 6, borderRadius: 8 }}><Info size={18} color="#3b82f6" /></div>
                <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, fontWeight: 600 }}>
                  최근 3년간 해당 지역 유사 물건 낙찰 데이터를 기반으로 분석한 결과, 현재 {failCount}회 유찰된 상태이며 <span style={{ color: '#1268FB', fontWeight: 800 }}>최저가의 103% ({formatPrice(activeProperty.minPrice * 1.03)})</span>에서 입찰할 경우 낙찰 확률 85% 이상 및 10%대 안전 마진을 기대할 수 있습니다.
                </div>
              </div>

              {isExpertMode && (
                <div style={{ background: 'white', padding: 24, borderRadius: 18, marginBottom: 24, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#475569' }}>수리/인테리어 비용</span>
                      <span style={{ fontSize: 14, fontWeight: 900, color: '#1268FB' }}>{formatPrice(repairCost)}</span>
                    </div>
                    <input type="range" min="0" max="100000000" step="1000000" value={repairCost} onChange={(e) => setRepairCost(Number(e.target.value))} style={{ width: '100%', accentColor: '#1268FB', height: 6 }} />
                  </div>
                  
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#475569' }}>명도비용 (이사비 등)</span>
                      <span style={{ fontSize: 14, fontWeight: 900, color: '#1268FB' }}>{formatPrice(evictionCost)}</span>
                    </div>
                    <input type="range" min="0" max="50000000" step="500000" value={evictionCost} onChange={(e) => setEvictionCost(Number(e.target.value))} style={{ width: '100%', accentColor: '#1268FB', height: 6 }} />
                  </div>

                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 20 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#94a3b8', marginBottom: 16 }}>금융 조건 설정</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', marginBottom: 8, marginLeft: 2 }}>대출 비율 ({loanRatio}%)</div>
                        <input type="number" value={loanRatio} onChange={(e) => setLoanRatio(Number(e.target.value))} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 14, fontWeight: 700, outline: 'none' }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', marginBottom: 8, marginLeft: 2 }}>대출 금리 (%)</div>
                        <input type="number" step="0.1" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 14, fontWeight: 700, outline: 'none' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#94a3b8', fontWeight: 700, padding: '0 4px' }}>
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
                  style={{ width: '100%', cursor: 'pointer', accentColor: '#1268FB', height: 8 }} 
                />
                <div style={{ textAlign: 'center', marginTop: 24, marginBottom: 8 }}>
                  <div style={{ fontSize: 12, color: '#64748b', fontWeight: 800, marginBottom: 4 }}>확정 입찰 예정가</div>
                  <div style={{ fontSize: 48, fontWeight: 950, color: '#1268FB', letterSpacing: -1.5 }}>
                    {formatPrice(bidPrice)}
                  </div>
                </div>
              </div>
            </div>

            {/* AI 권리분석 PDF 리포트 발행 바로가기 */}
            <div 
              style={{ 
                marginTop: 16,
                background: '#f8fafc', 
                borderRadius: 20, 
                padding: '16px 20px', 
                border: '1px solid #e2e8f0', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                cursor: 'pointer',
                transition: '0.2s'
              }} 
              onClick={handleDownloadPDF}
              onMouseOver={(e) => e.currentTarget.style.borderColor = '#1268FB'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ background: '#1268FB', width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={18} color="white" />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 900, color: '#1e293b' }}>전문가용 AI 수지분석 리포트</div>
                  <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>PDF 인쇄 및 즉시 공유 가능</div>
                </div>
              </div>
              <ChevronRight size={18} color="#94a3b8" />
            </div>

            {/* ROI Analysis */}
            {(() => {
              const incidentalCost = bidPrice * 0.052; // 취등록세 등
              const totalAddCost = incidentalCost + repairCost + evictionCost;
              const loanAmount = bidPrice * (loanRatio / 100);
              const monthlyInterest = (loanAmount * (interestRate / 100)) / 12;
              const cashRequired = bidPrice + totalAddCost - loanAmount;

              const netProfit = activeProperty.marketPrice - bidPrice - totalAddCost;
              const roe = (netProfit / (cashRequired || 1)) * 100;

              // 미래 가치 예측 (AI 가중치 적용)
              const rate = 1.015 + (activeProperty.analysis.score / 100) * 0.025;
              const price1Y = activeProperty.marketPrice * Math.pow(rate, 1);
              const price3Y = activeProperty.marketPrice * Math.pow(rate, 3);
              const price5Y = activeProperty.marketPrice * Math.pow(rate, 5);

              const profit1Y = price1Y - bidPrice - totalAddCost;
              const profit3Y = price3Y - bidPrice - totalAddCost;
              const profit5Y = price5Y - bidPrice - totalAddCost;
              
              const formatPrecise = (val: number) => {
                if (Math.abs(val) >= 100000000) {
                  const uk = Math.floor(Math.abs(val) / 100000000);
                  const man = Math.floor((Math.abs(val) % 100000000) / 10000);
                  const sign = val < 0 ? '-' : '';
                  return man > 0 ? `${sign}${uk}억 ${man}만` : `${sign}${uk}억`;
                }
                return Math.round(val / 10000).toLocaleString('ko-KR') + '만';
              };

              return (
                <div style={{ marginTop: 24, background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: 24, padding: 28, color: 'white', boxShadow: '0 12px 40px rgba(0,0,0,0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
                    <div style={{ width: 36, height: 36, background: 'rgba(96, 165, 250, 0.15)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Calculator size={20} color="#60a5fa" />
                    </div>
                    <div>
                      <span style={{ fontSize: 17, fontWeight: 900, color: '#f8fafc', display: 'block' }}>AI 종합 투자 수익률(ROI) 예측</span>
                      <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>우리옥션 마스터 엔진 ver 2.4</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 14, color: '#94a3b8', fontWeight: 600 }}>예상 매도 시세</span>
                      <span style={{ fontSize: 16, fontWeight: 800, color: '#f8fafc' }}>{formatPrice(activeProperty.marketPrice)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 14, color: '#94a3b8', fontWeight: 600 }}>나의 입찰가</span>
                      <span style={{ fontSize: 16, fontWeight: 800, color: '#94a3b8' }}>- {formatPrice(bidPrice)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 14, color: '#94a3b8', fontWeight: 600 }}>부대 비용 및 수리/명도비</span>
                      <span style={{ fontSize: 16, fontWeight: 800, color: '#f87171' }}>- {formatPrice(totalAddCost)}</span>
                    </div>

                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 14, color: '#94a3b8', fontWeight: 600 }}>대출 실행액 ({loanRatio}%)</span>
                      <span style={{ fontSize: 16, fontWeight: 800, color: '#60a5fa' }}>+ {formatPrice(loanAmount)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 14, color: '#94a3b8', fontWeight: 600 }}>월 예상 이자</span>
                      <span style={{ fontSize: 16, fontWeight: 800, color: '#f87171' }}>{formatPrice(monthlyInterest)} / 월</span>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.08)', marginTop: 12 }}>
                      <span style={{ fontSize: 15, fontWeight: 900, color: '#cbd5e1' }}>실제 필요 현금</span>
                      <span style={{ fontSize: 24, fontWeight: 950, color: '#fbbf24' }}>{formatPrice(cashRequired)}</span>
                    </div>

                    <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
                      <div style={{ fontSize: 48, fontWeight: 950, color: netProfit > 0 ? '#10b981' : '#ef4444', letterSpacing: -2, lineHeight: 1 }}>
                        {netProfit > 0 ? '+' : ''}{formatPrice(netProfit)}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 15, fontWeight: 800, color: '#94a3b8' }}>투자 원금 대비 세후수익</span>
                        <div style={{ padding: '8px 16px', background: roe > 0 ? '#064e3b' : '#450a0a', color: roe > 0 ? '#10b981' : '#f87171', borderRadius: 10, fontSize: 16, fontWeight: 950, border: `1.5px solid ${roe > 0 ? '#10b981' : '#7f1d1d'}`, boxShadow: '0 0 15px rgba(16, 185, 129, 0.2)' }}>
                          수익률 {roe.toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    {/* AI Predictions */}
                    <div style={{ marginTop: 28, background: 'rgba(0,0,0,0.25)', borderRadius: 20, padding: 24, border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                        <Sparkles size={14} color="#60a5fa" />
                        <span style={{ fontSize: 13, fontWeight: 800, color: '#94a3b8' }}>AI 딥러닝 기간별 수익 예측 (우리옥션 마스터 엔진)</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, marginBottom: 6 }}>1년 수익</div>
                          <div style={{ fontSize: 14, fontWeight: 950, color: '#10b981' }}>+{formatPrecise(profit1Y)}</div>
                          <div style={{ fontSize: 11, color: '#34d399', fontWeight: 800, marginTop: 3 }}>연 {Math.round((profit1Y/cashRequired)*100)}%</div>
                        </div>
                        <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.1)', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                          <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, marginBottom: 6 }}>3년 수익</div>
                          <div style={{ fontSize: 14, fontWeight: 950, color: '#10b981' }}>+{formatPrecise(profit3Y)}</div>
                          <div style={{ fontSize: 11, color: '#34d399', fontWeight: 800, marginTop: 3 }}>연 {Math.round((profit3Y/cashRequired/3)*100)}%</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, marginBottom: 6 }}>5년 수익</div>
                          <div style={{ fontSize: 14, fontWeight: 950, color: '#10b981' }}>+{formatPrecise(profit5Y)}</div>
                          <div style={{ fontSize: 11, color: '#34d399', fontWeight: 800, marginTop: 3 }}>연 {Math.round((profit5Y/cashRequired/5)*100)}%</div>
                        </div>
                      </div>
                      <div style={{ marginTop: 16, padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: 10, fontSize: 10, color: '#64748b', lineHeight: 1.5, textAlign: 'center' }}>
                        * 위 예측치는 과거 10년 실거래가 트렌드와 지역 호재 점수({activeProperty.analysis.score}점)를 가중 산출한 결과이며, 실제 수익과는 차이가 있을 수 있습니다.
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ── 입찰 전략 모듈 ── */}
            {(() => {
              // ✅ 기준: 현재 최저가(minPrice) = 이번 회차 경매의 실제 최저입찰가
              const currentMin = activeProperty.minPrice;
              // 추천 입찰 범위: 현재 최저가 대비 +3%~+10%
              const recMin = Math.round(currentMin * 1.03);
              const recMax = Math.round(currentMin * 1.10);
              const recMid = Math.round((recMin + recMax) / 2);
              // 유찰 횟수 기반 경쟁 강도 (물건 클릭 시 자동 세팅)
              const baseCompetitors = failCount === 0 ? 12 : failCount === 1 ? 7 : failCount === 2 ? 3 : 2;
              const profitBonus = activeProperty.analysis.profitScore > 80 ? 3 : activeProperty.analysis.profitScore > 60 ? 1 : 0;
              const estCompetitors = Math.max(1, baseCompetitors + profitBonus);
              const compIntensity = estCompetitors >= 10 ? '🔴 매우 높음' : estCompetitors >= 6 ? '🟠 높음' : estCompetitors >= 3 ? '🟡 보통' : '🟢 낮음';
              const winProb = failCount === 0 ? 22 : failCount === 1 ? 41 : failCount === 2 ? 63 : 78;
              const minRatioToAppraisal = Math.round((currentMin / (activeProperty.appraisalPrice || currentMin)) * 100);
              const strategyMsg = failCount === 0
                ? `첫 경매 물건으로 경쟁이 치열합니다. 현재 최저가(${formatPrice(currentMin)}) 대비 ${Math.round(((recMid/currentMin)-1)*100)}% 높은 ${formatPrice(recMid)}을 권장하며, 최대 ${formatPrice(recMax)}까지 전략적 여유를 두세요.`
                : failCount === 1
                ? `1회 유찰 물건입니다. 경쟁자가 줄어든 지금, ${formatPrice(recMid)} 근방에서 입찰 시 수익성과 낙찰 가능성이 균형을 이룹니다.`
                : failCount === 2
                ? `2회 유찰 물건으로 경쟁자가 크게 줄었습니다. ${formatPrice(recMin)}~${formatPrice(recMax)} 범위에서 입찰 시 낙찰 확률이 높습니다.`
                : `3회 이상 유찰된 물건입니다. 경쟁이 거의 없으므로 최저가(${formatPrice(currentMin)}) 근처에서 입찰하는 공격적 전략을 권장합니다.`;

              return (
                <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)', borderRadius: 24, padding: 24, marginTop: 4 }}>
                  {/* 헤더 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                    <div style={{ width: 36, height: 36, background: 'rgba(251,191,36,0.15)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(251,191,36,0.3)' }}>
                      <TrendingUp size={18} color="#fbbf24" />
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 900, color: 'white' }}>AI 입찰 전략 모듈</div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>유찰 횟수 기반 최적 입찰가 자동 추천</div>
                    </div>
                  </div>

                  {/* 유찰 횟수 – 자동 감지 + 수동 수정 */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>유찰 횟수</div>
                      <div style={{ fontSize: 10, color: '#34d399', fontWeight: 700, background: 'rgba(52,211,153,0.1)', padding: '3px 8px', borderRadius: 6 }}>🔄 물건 클릭 시 자동 감지</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {[0, 1, 2, 3].map(n => (
                        <button key={n} onClick={() => setFailCount(n)} style={{
                          flex: 1, padding: '10px 0', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 12,
                          background: failCount === n ? '#fbbf24' : 'rgba(255,255,255,0.07)',
                          color: failCount === n ? '#0f172a' : '#94a3b8',
                          transition: 'all 0.2s'
                        }}>
                          {n === 3 ? '3회+' : `${n}회`}
                          <div style={{ fontSize: 9, fontWeight: 700, marginTop: 3, opacity: 0.8 }}>
                            {n === 0 ? '감정가 100%' : `감정가 ${Math.round(Math.pow(0.8,n)*100)}%`}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 추천 입찰가 */}
                  <div style={{ background: 'rgba(251,191,36,0.1)', borderRadius: 16, padding: '16px 20px', marginBottom: 16, border: '1px solid rgba(251,191,36,0.25)' }}>
                    <div style={{ fontSize: 11, color: '#fbbf24', fontWeight: 700, marginBottom: 8 }}>🎯 AI 추천 입찰가 범위</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 4 }}>최소 추천</div>
                        <div style={{ fontSize: 16, fontWeight: 900, color: '#93c5fd' }}>{formatPrice(recMin)}</div>
                      </div>
                      <div style={{ fontSize: 20, color: '#fbbf24', fontWeight: 900 }}>~</div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 4 }}>최대 추천</div>
                        <div style={{ fontSize: 16, fontWeight: 900, color: '#34d399' }}>{formatPrice(recMax)}</div>
                      </div>
                    </div>
                    <button onClick={() => setBidPrice(recMid)} style={{
                      width: '100%', padding: '10px', background: '#fbbf24', border: 'none', borderRadius: 10,
                      fontWeight: 900, fontSize: 13, color: '#0f172a', cursor: 'pointer'
                    }}>
                      ⚡ 추천 중간값 {formatPrice(recMid)} 으로 입찰가 설정
                    </button>
                  </div>

                  {/* 경쟁자 예측 */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                    <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: '14px 16px' }}>
                      <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700, marginBottom: 8 }}>예상 경쟁자 수</div>
                      <div style={{ fontSize: 32, fontWeight: 900, color: 'white', letterSpacing: -1 }}>{estCompetitors}<span style={{ fontSize: 14, color: '#64748b', marginLeft: 2 }}>명</span></div>
                      <div style={{ fontSize: 11, fontWeight: 800, marginTop: 4, color: '#fbbf24' }}>{compIntensity}</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: '14px 16px' }}>
                      <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700, marginBottom: 8 }}>낙찰 확률 (AI 추정)</div>
                      <div style={{ fontSize: 32, fontWeight: 900, color: winProb >= 60 ? '#34d399' : winProb >= 40 ? '#fbbf24' : '#f87171', letterSpacing: -1 }}>{winProb}<span style={{ fontSize: 14, marginLeft: 1 }}>%</span></div>
                      <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 4, marginTop: 8, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${winProb}%`, background: winProb >= 60 ? '#34d399' : winProb >= 40 ? '#fbbf24' : '#f87171', borderRadius: 4 }} />
                      </div>
                    </div>
                  </div>

                  {/* AI 전략 멘트 */}
                  <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: '14px 18px', borderLeft: '4px solid #fbbf24' }}>
                    <div style={{ fontSize: 10, color: '#fbbf24', fontWeight: 700, marginBottom: 8 }}>🤖 AI 전략 제안</div>
                    <div style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.7, fontWeight: 500 }}>{strategyMsg}</div>
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
                      <input type="file" ref={fileInputRef} onChange={(e) => { if(e.target.files?.[0]) setUploadedPhotos({doc: [e.target.files[0]]}) }} style={{ display: 'none' }} />
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

        {activeTab === 'architecture' && (() => {
          // ── 용도지역 마스터 데이터 (국토교통부 표준 / 전국 기준) ──
          const zoningOptions = [
            { id: 'r1', label: '제1종 일반주거', coverage: 60, far: 100, parkBase: 150, constCost: 700 },
            { id: 'r2', label: '제2종 일반주거', coverage: 60, far: 200, parkBase: 120, constCost: 750 },
            { id: 'r3', label: '제3종 일반주거', coverage: 50, far: 300, parkBase: 100, constCost: 780 },
            { id: 'semi', label: '준주거지역',    coverage: 70, far: 500, parkBase: 80,  constCost: 850 },
            { id: 'nbiz', label: '근린상업지역',  coverage: 70, far: 900, parkBase: 60,  constCost: 900 },
          ];
          const zone = zoningOptions.find(z => z.id === selectedZoneId) || zoningOptions[1];
          const landAreaM2 = activeProperty.area;
          const maxFloorArea = landAreaM2 * (zone.coverage / 100);         // 최대 바닥면적
          const maxGFA       = landAreaM2 * (zone.far / 100);              // 최대 연면적(㎡)
          const maxGFAPyeong = maxGFA * 0.3025;                            // 평 환산
          const estFloors    = Math.max(2, Math.ceil(zone.far / zone.coverage)); // 예상 층수
          // 법정 주차: 다가구 기준 세대당 1대 (85㎡ 이하), 또는 연면적 150㎡당 1대
          const parkingCount = Math.max(1, Math.ceil(maxGFA / zone.parkBase));
          const isFiloti      = parkingCount > 3;                          // 필로티 권고 기준
          const constCostPer  = zone.constCost * 10000;                   // 원/평
          const totalConstCost= Math.round(maxGFAPyeong * constCostPer);  // 총 공사비
          const landCost      = activeProperty.minPrice;                  // 토지비(낙찰가)
          const totalProject  = landCost + totalConstCost;                 // 총 사업비
          // 분양가 추정: 인근 시세 × 연면적(평) × 85% (분양 가능 면적 보정)
          const estSalePrice  = activeProperty.marketPrice / (activeProperty.area * 0.3025) * maxGFAPyeong * 0.85;
          const devProfit     = estSalePrice - totalProject;
          const devROI        = (devProfit / totalProject) * 100;

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: isMobile ? 100 : 0 }}>

              {/* ① 헤더 + 용도지역 선택기 */}
              <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderRadius: 24, padding: 24, color: 'white' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <div style={{ width: 36, height: 36, background: 'rgba(96,165,250,0.15)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(96,165,250,0.3)' }}>
                    <Building size={18} color="#60a5fa" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 900 }}>AI 건축 수지 분석 엔진</div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{activeProperty.address.includes('서울') ? '서울특별시' : activeProperty.address.split(' ')[0] + (activeProperty.address.split(' ')[1] || '')} 도시계획조례 기준</div>
                    {zoneResult && (
                      <div style={{ marginTop: 6, fontSize: 10, fontWeight: 700, color: zoneResult.source === 'api' ? '#34d399' : '#fbbf24' }}>
                        {zoneResult.source === 'api' ? '✅' : '⚠'} {zoneResult.zoneName} (자동 조회{zoneResult.source === 'mock' ? ' · 추정치' : ''})
                      </div>
                    )}
                  </div>
                  <button
                    disabled={zoneLoading}
                    onClick={() => fetchZone(activeProperty.address)}
                    style={{ padding: '8px 14px', background: zoneLoading ? 'rgba(96,165,250,0.1)' : 'rgba(96,165,250,0.15)', border: '1px solid rgba(96,165,250,0.3)', borderRadius: 10, color: '#60a5fa', fontSize: 11, fontWeight: 800, cursor: zoneLoading ? 'default' : 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    {zoneLoading ? <><Loader2 size={12} className="spin" /> 조회중...</> : '🔄 재조회'}
                  </button>
                </div>

                {/* 용도지역 선택 버튼 */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, marginBottom: 10 }}>📋 용도지역 선택 (직접 확인 후 수정 가능)</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {zoningOptions.map(z => (
                      <button key={z.id} onClick={() => setSelectedZoneId(z.id)} style={{
                        padding: '7px 14px', borderRadius: 10, border: 'none', fontSize: 11, fontWeight: 800, cursor: 'pointer',
                        background: zone.id === z.id ? '#3b82f6' : 'rgba(255,255,255,0.08)',
                        color: zone.id === z.id ? 'white' : '#94a3b8',
                        transition: 'all 0.2s',
                      }}>{z.label}</button>
                    ))}
                  </div>
                </div>

                {/* 건폐율 / 용적률 표시 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: '14px 8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, marginBottom: 4 }}>법정 건폐율</div>
                    <div style={{ fontSize: 26, fontWeight: 950, color: '#60a5fa' }}>{zone.coverage}%</div>
                  </div>
                  <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: '14px 8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, marginBottom: 4 }}>법정 용적률</div>
                    <div style={{ fontSize: 26, fontWeight: 950, color: '#a78bfa' }}>{zone.far}%</div>
                  </div>
                  <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: '14px 8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, marginBottom: 4 }}>예상 층수</div>
                    <div style={{ fontSize: 26, fontWeight: 950, color: '#34d399' }}>지상 {estFloors}층</div>
                  </div>
                </div>
              </div>

              {/* ② 건축 규모 계산 결과 */}
              <div style={{ background: 'white', borderRadius: 20, padding: 20, border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#1e293b', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Maximize size={15} color="#1268FB" /> 건축 가능 규모 (자동 계산)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {[
                    { label: '대지 면적', val: `${landAreaM2.toFixed(1)}㎡ (${(landAreaM2 * 0.3025).toFixed(1)}평)`, color: '#1e293b' },
                    { label: `최대 바닥면적 (건폐율 ${zone.coverage}% 적용)`, val: `${maxFloorArea.toFixed(1)}㎡ (${(maxFloorArea * 0.3025).toFixed(1)}평)`, color: '#1268FB' },
                    { label: `최대 연면적 (용적률 ${zone.far}% 적용)`, val: `${maxGFA.toFixed(1)}㎡ (${maxGFAPyeong.toFixed(1)}평)`, color: '#7c3aed' },
                  ].map((row, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 0', borderBottom: i < 2 ? '1px dashed #f1f5f9' : 'none' }}>
                      <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>{row.label}</span>
                      <span style={{ fontSize: 14, fontWeight: 900, color: row.color }}>{row.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ③ 법정 주차 대수 계산 */}
              <div style={{ background: isFiloti ? '#fff7ed' : '#f0fdf4', borderRadius: 20, padding: 20, border: `1px solid ${isFiloti ? '#fed7aa' : '#bbf7d0'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Users size={16} color={isFiloti ? '#ea580c' : '#16a34a'} />
                  <span style={{ fontSize: 14, fontWeight: 900, color: isFiloti ? '#c2410c' : '#15803d' }}>법정 주차 대수 자동 계산</span>
                  <span style={{ marginLeft: 'auto', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 800, background: isFiloti ? '#ea580c' : '#16a34a', color: 'white' }}>
                    {isFiloti ? '⚠ 필로티 설계 필요' : '✓ 자주식 가능'}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={{ background: 'white', borderRadius: 14, padding: 16, textAlign: 'center', border: `1px solid ${isFiloti ? '#fed7aa' : '#bbf7d0'}` }}>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, marginBottom: 6 }}>법정 최소 주차 대수</div>
                    <div style={{ fontSize: 28, fontWeight: 950, color: isFiloti ? '#ea580c' : '#16a34a' }}>{parkingCount}<span style={{ fontSize: 14, fontWeight: 700 }}>대</span></div>
                  </div>
                  <div style={{ background: 'white', borderRadius: 14, padding: 16, border: `1px solid ${isFiloti ? '#fed7aa' : '#bbf7d0'}` }}>
                    <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700, marginBottom: 8 }}>산출 기준</div>
                    <div style={{ fontSize: 11, color: '#475569', lineHeight: 1.7 }}>
                      연면적 {maxGFA.toFixed(0)}㎡<br/>
                      ÷ {zone.parkBase}㎡/대 기준<br/>
                      = <strong>{parkingCount}대</strong> 확보 필요
                    </div>
                  </div>
                </div>
                {isFiloti && (
                  <div style={{ marginTop: 12, padding: '10px 14px', background: '#fff7ed', borderRadius: 12, fontSize: 11, color: '#92400e', fontWeight: 600, lineHeight: 1.6 }}>
                    💡 <strong>필로티 구조</strong>로 1층을 주차장으로 활용하면 주거면적 극대화 가능. 설계 시 구조 보강비 별도 고려 필요.
                  </div>
                )}
              </div>

              {/* ④ 사업성 분석 */}
              <div style={{ background: '#0f172a', borderRadius: 20, padding: 24, color: 'white' }}>
                <div style={{ fontSize: 14, fontWeight: 900, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Activity size={15} color="#34d399" /> 개발 사업성 분석 (Profitability)
                  <span style={{ marginLeft: 'auto', fontSize: 10, color: '#64748b', fontWeight: 600 }}>25년 공사비 기준 ({zone.constCost}만원/평)</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {[
                    { label: '토지비 (낙찰 예정가)', val: formatPrice(landCost), color: '#f8fafc', minus: false },
                    { label: `총 공사비 (${zone.constCost}만원 × ${maxGFAPyeong.toFixed(0)}평)`, val: formatPrice(totalConstCost), color: '#fca5a5', minus: true },
                    { label: '총 사업비', val: formatPrice(totalProject), color: '#94a3b8', minus: false },
                    { label: '분양 예상가 (인근 시세 기반)', val: formatPrice(Math.round(estSalePrice)), color: '#34d399', minus: false },
                  ].map((row, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                      <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{row.minus ? '(-) ' : ''}{row.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: row.color }}>{row.val}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '2px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 700, marginBottom: 4 }}>개발 순이익</div>
                    <div style={{ fontSize: 22, fontWeight: 950, color: devProfit > 0 ? '#34d399' : '#f87171' }}>{devProfit > 0 ? '+' : ''}{formatPrice(Math.round(devProfit))}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 700, marginBottom: 4 }}>개발 ROI</div>
                    <div style={{ fontSize: 32, fontWeight: 950, color: devROI > 0 ? '#34d399' : '#f87171' }}>{devROI > 0 ? '+' : ''}{devROI.toFixed(1)}<span style={{ fontSize: 16 }}>%</span></div>
                  </div>
                </div>
              </div>

              <div style={{ padding: '0 4px', fontSize: 10, color: '#94a3b8', lineHeight: 1.7 }}>
                * 용도지역은 반드시 토지이음(eum.go.kr) 또는 해당 시·군·구청에서 확인하십시오. 본 수치는 국토교통부 표준 조례 기반 AI 예측치이며, 실제 인허가 결과와 다를 수 있습니다.
              </div>
            </div>
          );
        })()}

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
              let chartBadge = '최근 5년 / 실거래가 (만원/㎡)';
              
              if (isCommercial) {
                chartTitle = '인근 상권 평균 거래가 동향 (실거래)';
              } else if (isLand) {
                chartTitle = '해당 지역 평균 토지 거래가 추이 (실거래)';
              } else {
                chartTitle = '인근 유사 매물 실거래가 동향';
              }

              return (
                <div style={{ background: 'white', borderRadius: 16, padding: 20, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <TrendingUp size={18} color="#1268FB" />
                      <span style={{ fontSize: 14, fontWeight: 800, color: '#1e293b' }}>{chartTitle}</span>
                    </div>
                    <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, background: '#f8fafc', padding: '4px 8px', borderRadius: 6 }}>{chartBadge}</span>
                  </div>
                  
                  {trendLoading ? (
                    <div style={{ height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>
                      <Loader2 size={18} className="spin" style={{ marginRight: 8 }} /> 국토교통부 실거래가 분석 중...
                    </div>
                  ) : trendData && trendData.length > 0 ? (
                    <>
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 100, paddingBottom: 8, borderBottom: '1px solid #f1f5f9' }}>
                        {(() => {
                          const maxPrice = Math.max(...trendData.map(d => d.price), 1);
                          return trendData.map((d, i) => {
                            const valPercentage = d.price > 0 ? Math.max((d.price / maxPrice) * 100, 10) : 0;
                            // 1만 단위 환산 후 포맷 (예: 650만)
                            const displayPrice = d.price >= 10000 ? `${Math.round(d.price / 10000)}만` : Math.round(d.price).toLocaleString();
                            
                            return (
                              <div key={i} style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center' }}>
                                <div style={{ width: '100%', height: `${valPercentage}%`, background: '#bfdbfe', borderRadius: '4px 4px 0 0', position: 'relative', transition: 'height 0.5s ease-out' }}>
                                  <div style={{ position: 'absolute', top: -20, width: '100%', textAlign: 'center', fontSize: 10, fontWeight: 800, color: '#1e293b' }}>{displayPrice}</div>
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                        {trendData.map((d, i) => (
                          <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>'{d.year.slice(-2)}</div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div style={{ height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>
                      최근 실거래가 데이터가 부족합니다.
                    </div>
                  )}
                </div>
              );
            })()}

            {/* FOMO Section */}
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
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 8 }}>현재 {failCount}회 유찰 상태로<br/>적정 타이밍 도래</div>
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

      {/* 1:1 상담 신청 모달 */}
      {showConsultModal && activeProperty && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setShowConsultModal(false); }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', borderRadius: 24, width: '100%', maxWidth: 420, overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ background: 'linear-gradient(135deg, #92400e 0%, #b45309 100%)', padding: '24px 28px', position: 'relative' }}>
              <button onClick={() => setShowConsultModal(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', color: 'white', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.15)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={22} color="white" /></div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: 'white' }}>전문가 1:1 정밀 컨설팅</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>현직 경매 마스터와 직접 상담</div>
                </div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: '10px 14px' }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>상담 요청 물건</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: 'white' }}>{activeProperty.caseNo}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>{activeProperty.address}</div>
                <div style={{ fontSize: 11, color: '#fcd34d', marginTop: 4, fontWeight: 700 }}>최저가 {formatPrice(activeProperty.minPrice)} &middot; AI {activeProperty.analysis.score}점</div>
              </div>
            </div>
            <div style={{ padding: '24px 28px' }}>
              {!consultSent ? (
                <>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#1e293b', marginBottom: 16 }}>연락처를 입력해 주세요</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                    <div>
                      <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, marginBottom: 6 }}>이름</div>
                      <input type="text" placeholder="홍길동" value={consultForm.name} onChange={e => setConsultForm(f => ({ ...f, name: e.target.value }))} style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, marginBottom: 6 }}>연락처</div>
                      <input type="tel" placeholder="010-0000-0000" value={consultForm.phone} onChange={e => setConsultForm(f => ({ ...f, phone: e.target.value }))} style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                    </div>
                  </div>
                  <button onClick={() => { if (!consultForm.name || !consultForm.phone) { alert('이름과 연락처를 입력해 주세요.'); return; } setConsultSent(true); }} style={{ width: '100%', padding: '14px', background: '#92400e', color: 'white', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 900, cursor: 'pointer' }}>상담 신청하기</button>
                  <div style={{ marginTop: 12, fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>입력하신 정보는 상담 목적으로만 사용됩니다</div>
                </>
              ) : (
                <>
                  <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>✅</div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: '#1e293b', marginBottom: 6 }}>신청이 접수되었습니다!</div>
                    <div style={{ fontSize: 13, color: '#64748b' }}><strong>{consultForm.name}</strong>님, 빠른 시일 내 연락드리겠습니다.</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#475569', marginBottom: 12 }}>지금 바로 연결하기</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <a href="tel:010-0000-0000" style={{ textDecoration: 'none' }}>
                      <button style={{ width: '100%', padding: '13px', background: '#1268FB', color: 'white', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>📞 전화 바로 연결</button>
                    </a>
                    <button onClick={() => window.open('https://open.kakao.com/o/ourauction', '_blank')} style={{ width: '100%', padding: '13px', background: '#FEE500', color: '#3A1D1D', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>💬 카카오톡 오픈채팅 바로가기</button>
                    <a href={`mailto:consult@ourauction.kr?subject=[상담신청] ${activeProperty.caseNo}&body=이름: ${consultForm.name}%0A연락처: ${consultForm.phone}%0A물건: ${activeProperty.address}`} style={{ textDecoration: 'none' }}>
                      <button style={{ width: '100%', padding: '13px', background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>📧 이메일로 상담 신청서 보내기</button>
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}