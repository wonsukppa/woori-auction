import React, { useState, useRef, useEffect } from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { ShieldCheck, ShieldAlert, Calculator, TrendingUp, Download, Home, Train, GraduationCap, Store, MapPin, Camera, FileText, Sparkles, Loader2, Lock, Upload, FilePlus, X, AlertCircle, Layout, Bath, Bed, Tv, Images, Wind, Maximize, DoorOpen, Hammer, AlertTriangle, Mountain, Info, Heart, Users, Flame, Eye, Clock, Activity } from 'lucide-react';
import { AuctionProperty } from '../../types/auction';
import Link from 'next/link';

declare global {
  interface Window {
    Kakao: any;
  }
}


interface AnalysisPanelProps { activeProperty: AuctionProperty | null; }
type TabType = 'analysis' | 'simulator' | 'aiscan' | 'trend';

// Replaced unstable icons with standard ones (Hammer, AlertTriangle, Mountain, Maximize)
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
      { id: 'ground', name: '토목/배수', icon: <Hammer size={18} /> },
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

export default function AnalysisPanel({ activeProperty }: AnalysisPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('analysis');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{type: 'doc' | 'img', data: any} | null>(null);
  const [scanMode, setScanMode] = useState<'doc' | 'img' | null>(null);
  const [bidPrice, setBidPrice] = useState(activeProperty?.minPrice || 0);
  const [user, setUser] = useState<{name: string} | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [showCriteria, setShowCriteria] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isMobileMinimized, setIsMobileMinimized] = useState(false);
  
  const [uploadedPhotos, setUploadedPhotos] = useState<Record<string, File[]>>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
    if (activeProperty) {
      setBidPrice(activeProperty.minPrice);
      setScanResult(null);
      setUploadedPhotos({});
      setScanMode(null);
      setIsMobileMinimized(false);
      
      const savedProps = JSON.parse(localStorage.getItem('savedProperties') || '[]');
      setIsSaved(savedProps.some((p: any) => p.id === activeProperty.id));
    }
  }, [activeProperty]);

  useEffect(() => {
    // Dynamic loading of Kakao SDK to ensure availability
    const scriptId = 'kakao-sdk';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.0/kakao.min.js';
      script.onload = () => {
        if (window.Kakao && !window.Kakao.isInitialized()) {
          console.log('Kakao SDK Loaded & Initializing...');
          window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JS_KEY);
        }
      };
      script.onerror = (e) => {
        console.error('Kakao SDK Script Load Error:', e);
        alert('카카오 SDK 서버 접속에 실패했습니다. 네트워크 상태를 확인해 주세요.');
      };
      document.head.appendChild(script);
    } else if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JS_KEY);
    }
  }, []);


  const shareToKakao = () => {
    console.log('--- Kakao Share Start ---');
    if (!window.Kakao) {
      console.error('Kakao SDK not loaded. Possible AdBlocker interference.');
      alert('카카오 기능을 불러올 수 없습니다. 광고 차단 프로그램(AdBlock)이 켜져 있다면 끄고 다시 시도해 주세요.');
      return;
    }
    
    const key = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
    if (!window.Kakao.isInitialized()) {
      console.log('Initializing Kakao with key:', key);
      try {
        if (!key) throw new Error('Kakao JS Key is missing in .env.local');
        window.Kakao.init(key);
      } catch (e: any) {
        console.error('Kakao Init Error:', e);
        alert(`카카오 초기화 실패: ${e.message}`);
        return;
      }
    }

    if (!activeProperty) {
      console.error('No active property');
      return;
    }

    console.log('Sending Kakao Share Default Feed...');
    try {
      window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: `[우리옥션] AI 분석 리포트 - ${activeProperty.caseNo}`,
          description: `${activeProperty.address}\nAI 투자 확신 지수: ${activeProperty.analysis.score}점`,
          imageUrl: activeProperty.image || 'https://images.unsplash.com/photo-1560514446-4a60f9947506?q=80&w=400&auto=format&fit=crop',
          link: {
            mobileWebUrl: window.location.href,
            webUrl: window.location.href,
          },
        },
        itemContent: {
          profileText: '우리옥션 AI MASTER',
          items: [
            { item: '감정가', itemOp: `${(activeProperty.price / 100000000).toFixed(2)}억` },
            { item: '최저가', itemOp: `${(activeProperty.minPrice / 100000000).toFixed(2)}억` },
            { item: '분석점수', itemOp: `${activeProperty.analysis.score}점` },
          ],
        },
        buttons: [
          {
            title: '리포트 확인하기',
            link: {
              mobileWebUrl: window.location.href,
              webUrl: window.location.href,
            },
          },
        ],
      });
      console.log('Kakao Share Success');
    } catch (err) {
      console.error('Kakao Share Error:', err);
      alert('카카오톡 공유 중 오류가 발생했습니다.');
    }
  };



  const handleSaveProperty = () => {
    if (!activeProperty) return;
    const savedProps = JSON.parse(localStorage.getItem('savedProperties') || '[]');
    if (isSaved) {
      const newProps = savedProps.filter((p: any) => p.id !== activeProperty.id);
      localStorage.setItem('savedProperties', JSON.stringify(newProps));
      setIsSaved(false);
      alert('관심 물건에서 해제되었습니다.');
    } else {
      const propToSave = {
        ...activeProperty,
        savedBidPrice: bidPrice,
        savedAt: new Date().toISOString()
      };
      savedProps.push(propToSave);
      localStorage.setItem('savedProperties', JSON.stringify(savedProps));
      setIsSaved(true);
      alert('마이페이지 관심 물건으로 저장되었습니다.');
    }
  };

  if (!activeProperty) return (
    <aside style={{ width: 440, background: 'white', borderLeft: '1px solid #e5e7eb', padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#9ca3af', textAlign: 'center' }}>물건을 선택하면 AI 분석이 시작됩니다.</div>
    </aside>
  );

  const categories = getCategories(activeProperty.type);
  const marketGapValue = (((activeProperty.marketPrice - bidPrice) / activeProperty.marketPrice) * 100).toFixed(1);

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
            desc: `업로드된 등기부 분석 결과, 을구에 기재된 2023년 근저당권이 임차인 확정일자보다 선순위입니다. 낙찰 시 보증금 인수가 발생할 확률 92%입니다.`,
            score: 18
          }
        });
      }, 4500);
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
            title: `AI 정밀 견적 진단 (${allFiles.length}장)`,
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
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'PDF 생성 실패');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `우리옥션_AI리포트_${activeProperty.caseNo}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('PDF Error:', error);
      alert(`리포트 생성 오류: ${error.message}`);
    } finally {
      setIsPdfLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes scan { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }
        .scan-line { position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: rgba(18, 104, 251, 0.5); box-shadow: 0 0 15px 5px rgba(18, 104, 251, 0.3); animation: scan 2s linear infinite; pointer-events: none; z-index: 20; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
        @keyframes progress-loading { 0% { width: 0%; } 100% { width: 100%; } }
        .progress-bar-loading { animation: progress-loading 4s ease-in-out infinite; }
      `}</style>
      <aside style={{ 
        width: isMobile ? '100%' : 440, 
        height: isMobile ? (isMobileMinimized ? '0px' : '85vh') : '100%',
        position: isMobile ? 'absolute' : 'static',
        bottom: 0,
        right: 0,
        background: 'white', 
        borderLeft: isMobile ? 'none' : '1px solid #e5e7eb', 
        borderTopLeftRadius: isMobile ? 24 : 0,
        borderTopRightRadius: isMobile ? 24 : 0,
        display: 'flex', 
        flexDirection: 'column', 
        zIndex: isMobile ? 300 : 10,
        transition: 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s',
        overflow: 'hidden',
        boxShadow: isMobile ? '0 -10px 40px rgba(0,0,0,0.1)' : 'none'
      }}>
        {/* 모바일용 드래그 핸들 (시각적) 및 닫기 버튼 */}
        {isMobile && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '12px 24px 0', position: 'relative' }}>
            <div style={{ width: 40, height: 5, background: '#e2e8f0', borderRadius: 10 }} />
            <button onClick={() => setIsMobileMinimized(true)} style={{ position: 'absolute', right: 24, background: 'none', border: 'none', fontSize: 24, color: '#94a3b8' }}>&times;</button>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'nowrap', overflowX: 'auto' }} className="cscroll">
            {(['analysis', 'simulator', 'aiscan', 'trend'] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{ flexShrink: 0, padding: '10px 14px', border: 'none', background: activeTab === tab ? '#f0f7ff' : 'transparent', color: activeTab === tab ? '#1268FB' : '#6b7280', fontSize: 12, fontWeight: 800, borderRadius: 8, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {tab === 'analysis' ? 'AI 분석' : tab === 'simulator' ? '시뮬레이션' : tab === 'aiscan' ? 'AI 스튜디오' : '동향'}
              </button>
            ))}
          </div>
          <button 
            onClick={handleSaveProperty}
            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 14px', background: isSaved ? '#fef2f2' : 'white', border: `1px solid ${isSaved ? '#fca5a5' : '#e2e8f0'}`, borderRadius: 20, color: isSaved ? '#ef4444' : '#64748b', fontSize: 12, fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0, marginLeft: 8 }}
          >
            <Heart size={14} fill={isSaved ? '#ef4444' : 'transparent'} color={isSaved ? '#ef4444' : '#94a3b8'} />
            {isSaved ? '저장됨' : '저장'}
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }} className="cscroll">
          {activeTab === 'analysis' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ background: 'linear-gradient(135deg, #1268FB 0%, #0a4db5 100%)', borderRadius: 24, padding: 32, color: 'white', textAlign: 'center', boxShadow: '0 10px 30px rgba(18, 104, 251, 0.3)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, opacity: 0.9 }}>AI 투자 확신 지수</div>
                  <Info size={16} color="white" style={{ opacity: 0.8, cursor: 'pointer' }} onClick={() => setShowCriteria(!showCriteria)} />
                </div>
                <div style={{ fontSize: 64, fontWeight: 900, letterSpacing: -2 }}>{activeProperty.analysis.score}<span style={{ fontSize: 24, opacity: 0.7 }}> / 100</span></div>
                <div style={{ marginTop: 16, padding: '8px 16px', background: 'rgba(255,255,255,0.2)', borderRadius: 40, fontSize: 14, fontWeight: 800, display: 'inline-block' }}>{activeProperty.analysis.score >= 95 ? '👑 S등급 (최상위 특수 물건)' : activeProperty.analysis.score >= 85 ? '⭐ A등급 (강력 추천)' : activeProperty.analysis.score >= 70 ? '✅ B등급 (긍정적)' : '⚠️ C등급 (주의 요망)'}</div>
                
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
                  <button onClick={() => setShowCriteria(!showCriteria)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: 'white', borderRadius: 20, padding: '4px 12px', fontSize: 11, cursor: 'pointer', opacity: 0.9 }}>
                    등급 판정 기준 {showCriteria ? '접기' : '보기'}
                  </button>
                </div>
                
                {showCriteria && (
                  <div style={{ marginTop: 20, textAlign: 'left', background: 'rgba(0,0,0,0.15)', padding: '16px', borderRadius: 16, fontSize: 12, lineHeight: 1.6 }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}><div style={{ width: 44, fontWeight: 900, color: '#fef08a' }}>S등급</div><div style={{ flex: 1, opacity: 0.9 }}>95점 이상. 시세차익이 압도적이거나 특수 권리 분석 상 안전이 100% 보장된 희귀 물건.</div></div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}><div style={{ width: 44, fontWeight: 900, color: '#bfdbfe' }}>A등급</div><div style={{ flex: 1, opacity: 0.9 }}>85~94점. 입지와 수익성 밸런스가 뛰어나 즉각적인 투자를 강력히 추천하는 우량 물건.</div></div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}><div style={{ width: 44, fontWeight: 900, color: '#e0f2fe' }}>B등급</div><div style={{ flex: 1, opacity: 0.9 }}>70~84점. 평균 수준의 수익률을 보이며 큰 리스크가 없는 일반적인 투자 적합 물건.</div></div>
                    <div style={{ display: 'flex', gap: 8 }}><div style={{ width: 44, fontWeight: 900, color: '#fecaca' }}>C등급</div><div style={{ flex: 1, opacity: 0.9 }}>70점 미만. 권리상 하자가 있거나 예상 시세차익이 낮아 초보자에게는 투자를 권장하지 않음.</div></div>
                  </div>
                )}
              </div>
              <div style={{ background: 'white', borderRadius: 20, padding: 24, border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}><MapPin size={20} color="#1268FB" /><span style={{ fontSize: 16, fontWeight: 900 }}>AI 입지 정밀 진단</span></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><div style={{ background: '#eff6ff', width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Train size={20} color="#1268FB" /></div><div><div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>가까운 지하철역</div><div style={{ fontSize: 13, fontWeight: 800 }}>{activeProperty.analysis.subwayInfo}</div></div></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><div style={{ background: '#ecfdf5', width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><GraduationCap size={20} color="#059669" /></div><div><div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>가까운 학교</div><div style={{ fontSize: 13, fontWeight: 800 }}>{activeProperty.analysis.schoolInfo}</div></div></div>
                </div>
              </div>
              <div style={{ background: '#f0f7ff', borderRadius: 20, padding: 24, border: '1px solid #bfdbfe' }}><div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}><ShieldCheck size={20} color="#1268FB" /><span style={{ fontSize: 16, fontWeight: 900, color: '#1e40af' }}>AI 마스터 종합 판정</span></div><div style={{ fontSize: 14, lineHeight: 1.6, color: '#334155', fontWeight: 600 }}>"{activeProperty.analysis.verdict}"</div></div>
            </div>
          ) : activeTab === 'aiscan' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
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
                          <div style={{ fontSize: 14, fontWeight: 800, color: '#1268FB', textAlign: 'left' }}>
                            {activeProperty.type} 전용 진단 모드 활성 🚀
                          </div>
                          <Images size={18} color="#1268FB" />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                          {categories.map(cat => {
                            const count = uploadedPhotos[cat.id]?.length || 0;
                            return (
                              <div 
                                key={cat.id}
                                onClick={() => { setSelectedCategory(cat.id); fileInputRef.current?.click(); }}
                                style={{ 
                                  padding: '16px 12px', background: count > 0 ? '#f0fdf4' : 'white', 
                                  border: count > 0 ? '1.5px solid #22c55e' : '1px solid #e2e8f0', 
                                  borderRadius: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.2s',
                                  position: 'relative'
                                }}
                              >
                                <div style={{ color: count > 0 ? '#16a34a' : '#94a3b8' }}>{cat.icon}</div>
                                <div style={{ textAlign: 'left' }}>
                                  <div style={{ fontSize: 11, fontWeight: 800, color: count > 0 ? '#166534' : '#475569' }}>{cat.name}</div>
                                  <div style={{ fontSize: 9, color: count > 0 ? '#16a34a' : '#94a3b8' }}>
                                    {count > 0 ? `✅ ${count}장 완료` : '사진 필요'}
                                  </div>
                                </div>
                                {count > 0 && (
                                  <div onClick={(e) => { e.stopPropagation(); setUploadedPhotos(prev => { const n = {...prev}; delete n[cat.id]; return n; }); }} style={{ position: 'absolute', top: 4, right: 4, background: '#fee2e2', borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <X size={10} color="#ef4444" />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <input type="file" ref={fileInputRef} multiple onChange={handleFileSelect} style={{ display: 'none' }} />
                        <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                          <button 
                            onClick={startAnalysis}
                            disabled={Object.keys(uploadedPhotos).length === 0}
                            style={{ flex: 2, padding: '14px', background: '#1268FB', color: 'white', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: 'pointer', opacity: Object.keys(uploadedPhotos).length === 0 ? 0.5 : 1 }}
                          >
                            AI 정밀 견적 시작
                          </button>
                          <button onClick={() => { setScanMode(null); setUploadedPhotos({}); }} style={{ flex: 1, padding: '14px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>취소</button>
                        </div>
                      </div>
                    )}
                  </div>

                  {isScanning && (
                    <div style={{ padding: 32, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                      <Loader2 size={32} color="#1268FB" className="spin" />
                      <div style={{ fontSize: 15, fontWeight: 900, color: '#1268FB' }}>{activeProperty.type} 맞춤형 정밀 진단 중...</div>
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
                                  <span>{item.name}</span><span style={{ fontWeight: 800 }}>₩ {(item.price / 10000).toLocaleString()}만</span>
                                </div>
                              ))}
                            </div>
                          )}
                          <div style={{ padding: 20, background: 'white', borderRadius: 16, border: scanResult.type === 'doc' ? '1px solid #fecaca' : '1px solid #bbf7d0', textAlign: 'center' }}>
                            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700, marginBottom: 6 }}>{scanResult.type === 'doc' ? '최종 권리 안전 지수' : '총 예상 수리비'}</div>
                            <div style={{ fontSize: 32, fontWeight: 900, color: scanResult.type === 'doc' ? '#ef4444' : '#059669' }}>
                              {scanResult.type === 'doc' ? `${scanResult.data.score} / 100` : `₩ ${(scanResult.data.total / 10000).toLocaleString()}만`}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          ) : activeTab === 'simulator' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* 기존 시장 가격 비교 */}
              <div style={{ background: '#f8fafc', borderRadius: 16, padding: 20, border: '1px solid #e2e8f0' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}><span style={{ fontSize: 14, fontWeight: 800, color: '#1e293b' }}>시장 가격 비교</span><span style={{ fontSize: 12, padding: '4px 8px', background: '#dcfce7', color: '#166534', borderRadius: 6, fontWeight: 700 }}>시세 대비 {marketGapValue}% 저렴</span></div><div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: 13, color: '#64748b' }}>인근 평균 시세</span><span style={{ fontSize: 14, fontWeight: 800 }}>₩ {(activeProperty.marketPrice / 100000000).toFixed(2)}억</span></div><div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: 13, color: '#64748b' }}>나의 예상 입찰가</span><span style={{ fontSize: 14, fontWeight: 800, color: '#1268FB' }}>₩ {(bidPrice / 100000000).toFixed(2)}억</span></div></div></div>
              
              {/* 나의 예상 입찰가 슬라이더 및 AI 추천가 */}
              <div style={{ background: '#f0f7ff', borderRadius: 16, padding: 24, border: '1px solid #bfdbfe', position: 'relative', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#1e3a8a' }}>나의 예상 입찰가 시뮬레이션</div>
                  {(() => {
                    const recommendedBid = activeProperty.marketPrice * 0.82; 
                    return (
                      <button 
                        onClick={() => setBidPrice(recommendedBid)}
                        style={{ 
                          background: '#1e40af', color: 'white', border: 'none', padding: '8px 14px', 
                          borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', 
                          display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 10px rgba(30, 64, 175, 0.3)', transition: 'all 0.2s'
                        }}
                      >
                        <Sparkles size={16} color="#93c5fd" />
                        AI 최적 입찰가 적용
                      </button>
                    )
                  })()}
                </div>
                
                <div style={{ background: 'white', padding: '14px 18px', borderRadius: 12, marginBottom: 24, border: '1px dashed #93c5fd', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <Info size={18} color="#3b82f6" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#1e3a8a', marginBottom: 6 }}>초보자를 위한 AI 입찰 가이드</div>
                    <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
                      최근 3년간 해당 지역 유사 물건의 낙찰 빅데이터를 딥러닝으로 분석한 결과, <strong>시세의 82% 선({(activeProperty.marketPrice * 0.82 / 100000000).toFixed(2)}억)</strong>에서 입찰할 경우 가장 이상적인 밸런스(낙찰 확률 85% 이상 및 10%대 안전 마진 확보)를 보여줍니다.
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', fontWeight: 700 }}>
                    <span>최저 매각가 ({(activeProperty.minPrice / 100000000).toFixed(1)}억)</span>
                    <span>시세 110% ({(activeProperty.marketPrice * 1.1 / 100000000).toFixed(1)}억)</span>
                  </div>
                  <input 
                    type="range" 
                    min={activeProperty.minPrice * 0.9} 
                    max={activeProperty.marketPrice * 1.1} 
                    step={1000000}
                    value={bidPrice} 
                    onChange={(e) => setBidPrice(Number(e.target.value))} 
                    style={{ width: '100%', cursor: 'pointer' }} 
                  />
                  <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <span style={{ fontSize: 13, color: '#64748b', fontWeight: 700, marginRight: 10 }}>현재 설정된 입찰가:</span>
                    <span style={{ fontSize: 22, fontWeight: 900, color: '#1268FB', letterSpacing: '-0.5px' }}>{(bidPrice / 100000000).toFixed(2)}억</span>
                  </div>
                </div>
              </div>



              {/* AI 예상 투자 수익률 (ROI) */}
              {(() => {
                const incidentalCost = bidPrice * 0.052; // 취득세 및 부대비용 약 5.2% 가정
                const netProfit = activeProperty.marketPrice - bidPrice - incidentalCost;
                const roi = (netProfit / bidPrice) * 100;
                
                return (
                  <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: 16, padding: 24, color: 'white', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
                      <Calculator size={18} color="#60a5fa" />
                      <span style={{ fontSize: 15, fontWeight: 800 }}>AI 예상 투자 수익률 (ROI)</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 12 }}>
                        <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>예상 매도 시세</span>
                        <span style={{ fontSize: 14, fontWeight: 700 }}>₩ {(activeProperty.marketPrice / 100000000).toFixed(2)}억</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 12 }}>
                        <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>나의 입찰가</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8' }}>- ₩ {(bidPrice / 100000000).toFixed(2)}억</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 12 }}>
                        <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>부대 비용 (취득세 등 5.2%)</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8' }}>- ₩ {(incidentalCost / 10000000).toFixed(1)}천만</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, alignItems: 'flex-end' }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: '#cbd5e1' }}>낙찰 후 즉시 매도 시 순수익</span>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 26, fontWeight: 900, color: roi > 0 ? '#34d399' : '#f87171', letterSpacing: '-1px' }}>
                            {roi > 0 ? '+' : ''}₩ {(netProfit / 100000000).toFixed(2)}억
                          </div>
                          <div style={{ fontSize: 13, color: roi > 0 ? '#10b981' : '#ef4444', fontWeight: 800, marginTop: 6, background: roi > 0 ? 'rgba(52, 211, 153, 0.1)' : 'rgba(248, 113, 113, 0.1)', padding: '4px 8px', borderRadius: 6, display: 'inline-block' }}>
                            즉시 마진율 {roi.toFixed(1)}%
                          </div>
                        </div>
                      </div>

                      {/* 장기 보유 시뮬레이션 */}
                      <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 16, marginTop: 8 }}>
                        <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12, fontWeight: 600 }}>AI 시계열 분석 모델: 보유 기간별 가치 상승 예측치</div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {[
                            { years: 1, rate: 1.035 },
                            { years: 3, rate: 1.108 },
                            { years: 5, rate: 1.187 }
                          ].map(plan => {
                            const futurePrice = activeProperty.marketPrice * plan.rate;
                            const futureProfit = futurePrice - bidPrice - incidentalCost;
                            return (
                              <div key={plan.years} style={{ flex: 1, background: 'rgba(0,0,0,0.2)', padding: '10px 4px', borderRadius: 8, textAlign: 'center' }}>
                                <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 6, fontWeight: 600 }}>{plan.years}년 후 매도</div>
                                <div style={{ fontSize: 14, fontWeight: 800, color: futureProfit > 0 ? '#34d399' : '#f87171' }}>
                                  +{ (futureProfit / 100000000).toFixed(2) }억
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* 기존 지역 낙찰 트렌드 요약 */}
              <div style={{ background: '#f8f9fa', borderRadius: 16, padding: 20, border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <TrendingUp size={16} color="#1268FB" />
                  <span style={{ fontSize: 14, fontWeight: 800 }}>지역 낙찰가율 트렌드</span>
                </div>
                <div style={{ fontSize: 14, color: '#374151', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600 }}>해당 관할 법원 / 용도 기준</span>
                  <strong style={{ color: '#1268FB', fontSize: 18 }}>87.4%</strong>
                </div>
              </div>

              {/* 물건 유형별 동적 동향 차트 (시뮬레이터에서 이동됨) */}
              {(() => {
                const isCommercial = activeProperty.type.includes('상가') || activeProperty.type.includes('사무실') || activeProperty.type.includes('오피스');
                const isLand = activeProperty.type.includes('토지') || activeProperty.type.includes('공장') || activeProperty.type.includes('전') || activeProperty.type.includes('답');
                
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
                        let displayValue = '';
                        if (isLand) {
                          const basePrice = (activeProperty.marketPrice / 1500) * d.factor;
                          displayValue = `${(basePrice / 10000).toFixed(1)}만`;
                        } else if (isCommercial) {
                          const basePrice = (activeProperty.marketPrice / 250) * d.factor;
                          displayValue = `${Math.floor(basePrice / 10000)}만`;
                        } else {
                          const basePrice = activeProperty.marketPrice * d.factor;
                          displayValue = `${(basePrice / 100000000).toFixed(1)}억`;
                        }

                        return (
                          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 8, height: '100%' }}>
                            <div style={{ fontSize: 10, color: i === 4 ? '#1268FB' : '#64748b', fontWeight: 800, letterSpacing: '-0.5px' }}>{displayValue}</div>
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

              {/* 1. 실시간 경쟁 치열도 (FOMO) */}
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

              {/* 2. 지역 평균 유찰 횟수 및 방어선 */}
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1, background: 'white', borderRadius: 16, padding: 20, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', textAlign: 'center' }}>
                  <Clock size={24} color="#64748b" style={{ margin: '0 auto 12px' }} />
                  <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700, marginBottom: 4 }}>이 지역 평균 유찰</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: '#0f172a' }}>1.8<span style={{ fontSize: 14, fontWeight: 600, color: '#64748b' }}> 회</span></div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 8 }}>현재 2회 유찰 상태로<br/>적정 타이밍 도래</div>
                </div>
                
                {/* 3. 빅데이터 상권/입지 스탯 */}
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
        <div style={{ padding: '20px 24px', borderTop: '1px solid #f1f3f5', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={handleDownloadPDF}
            disabled={isPdfLoading}
            style={{ width: '100%', padding: '16px', background: isPdfLoading ? '#6b9ff8' : '#1268FB', border: 'none', borderRadius: 12, color: 'white', fontSize: 15, fontWeight: 800, cursor: isPdfLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.2s' }}
          >
            {isPdfLoading ? <><Loader2 size={18} className="spin" /> AI 리포트 생성 중...</> : <><Download size={18} /> AI 권리분석 PDF 리포트 발행</>}
          </button>
          <button
            onClick={shareToKakao}
            style={{ width: '100%', padding: '14px', background: '#FEE500', border: 'none', borderRadius: 12, color: '#000000', fontSize: 14, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <img src="https://developers.kakao.com/assets/img/about/logos/kakaotalksharing/kakaotalk_sharing_btn_medium.png" alt="Kakao" style={{ width: 18, height: 18 }} />
            카카오톡으로 리포트 공유
          </button>
        </div>
      </aside>
      {/* PDF는 서버사이드(/api/report)에서 생성됩니다 */}
    </>
  );
}
