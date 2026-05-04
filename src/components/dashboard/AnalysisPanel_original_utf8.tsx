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
  if (type.includes('?곴?') || type.includes('?ㅽ뵾??) || type.includes('洹쇰┛') || type.includes('?щТ??)) {
    return [
      { id: 'ext', name: '?꾨㈃/媛꾪뙋', icon: <Store size={18} /> },
      { id: 'interior', name: '?대??꾧꼍', icon: <Layout size={18} /> },
      { id: 'hvac', name: '泥쒖옣/怨듭“', icon: <Wind size={18} /> },
      { id: 'floor', name: '諛붾떏/踰쎌껜', icon: <Maximize size={18} /> },
      { id: 'utility', name: '?뺣퉬???붿옣??, icon: <Bath size={18} /> },
      { id: 'entrance', name: '異쒖엯援?蹂듬룄', icon: <DoorOpen size={18} /> },
    ];
  } else if (type.includes('?좎?') || type.includes('怨듭옣')) {
    return [
      { id: 'road', name: '吏꾩엯濡??꾨줈', icon: <AlertTriangle size={18} /> },
      { id: 'boundary', name: '寃쎄퀎/?쒖뒪', icon: <Mountain size={18} /> },
      { id: 'ground', name: '?좊ぉ/諛곗닔', icon: <Hammer size={18} /> },
      { id: 'surround', name: '二쇰??섍꼍', icon: <MapPin size={18} /> },
    ];
  }
  return [
    { id: 'plan', name: '?꾨㈃/?됰㈃??, icon: <Layout size={18} /> },
    { id: 'living', name: '嫄곗떎', icon: <Tv size={18} /> },
    { id: 'kitchen', name: '二쇰갑', icon: <Store size={18} /> },
    { id: 'room', name: '諛?移⑥떎', icon: <Bed size={18} /> },
    { id: 'bath', name: '?뺤떎/?붿옣??, icon: <Bath size={18} /> },
    { id: 'veranda', name: '踰좊???湲고?', icon: <Home size={18} /> },
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
        alert('移댁뭅??SDK ?쒕쾭 ?묒냽???ㅽ뙣?덉뒿?덈떎. ?ㅽ듃?뚰겕 ?곹깭瑜??뺤씤??二쇱꽭??');
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
      alert('移댁뭅??湲곕뒫??遺덈윭?????놁뒿?덈떎. 愿묎퀬 李⑤떒 ?꾨줈洹몃옩(AdBlock)??耳쒖졇 ?덈떎硫??꾧퀬 ?ㅼ떆 ?쒕룄??二쇱꽭??');
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
        alert(`移댁뭅??珥덇린???ㅽ뙣: ${e.message}`);
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
          title: `[?곕━?μ뀡] AI 遺꾩꽍 由ы룷??- ${activeProperty.caseNo}`,
          description: `${activeProperty.address}\nAI ?ъ옄 ?뺤떊 吏?? ${activeProperty.analysis.score}??,
          imageUrl: activeProperty.image || 'https://images.unsplash.com/photo-1560514446-4a60f9947506?q=80&w=400&auto=format&fit=crop',
          link: {
            mobileWebUrl: window.location.href,
            webUrl: window.location.href,
          },
        },
        itemContent: {
          profileText: '?곕━?μ뀡 AI MASTER',
          items: [
            { item: '媛먯젙媛', itemOp: `${(activeProperty.price / 100000000).toFixed(2)}?? },
            { item: '理쒖?媛', itemOp: `${(activeProperty.minPrice / 100000000).toFixed(2)}?? },
            { item: '遺꾩꽍?먯닔', itemOp: `${activeProperty.analysis.score}?? },
          ],
        },
        buttons: [
          {
            title: '由ы룷???뺤씤?섍린',
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
      alert('移댁뭅?ㅽ넚 怨듭쑀 以??ㅻ쪟媛 諛쒖깮?덉뒿?덈떎.');
    }
  };



  const handleSaveProperty = () => {
    if (!activeProperty) return;
    const savedProps = JSON.parse(localStorage.getItem('savedProperties') || '[]');
    if (isSaved) {
      const newProps = savedProps.filter((p: any) => p.id !== activeProperty.id);
      localStorage.setItem('savedProperties', JSON.stringify(newProps));
      setIsSaved(false);
      alert('愿??臾쇨굔?먯꽌 ?댁젣?섏뿀?듬땲??');
    } else {
      const propToSave = {
        ...activeProperty,
        savedBidPrice: bidPrice,
        savedAt: new Date().toISOString()
      };
      savedProps.push(propToSave);
      localStorage.setItem('savedProperties', JSON.stringify(savedProps));
      setIsSaved(true);
      alert('留덉씠?섏씠吏 愿??臾쇨굔?쇰줈 ??λ릺?덉뒿?덈떎.');
    }
  };

  if (!activeProperty) return (
    <aside style={{ width: 440, background: 'white', borderLeft: '1px solid #e5e7eb', padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#9ca3af', textAlign: 'center' }}>臾쇨굔???좏깮?섎㈃ AI 遺꾩꽍???쒖옉?⑸땲??</div>
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
            title: '?좎닚??沅뚮━ 由ъ뒪??媛먯?',
            desc: `?낅줈?쒕맂 ?깃린遺 遺꾩꽍 寃곌낵, ?꾧뎄??湲곗옱??2023??洹쇱??밴텒???꾩감???뺤젙?쇱옄蹂대떎 ?좎닚?꾩엯?덈떎. ?숈같 ??蹂댁쬆湲??몄닔媛 諛쒖깮???뺣쪧 92%?낅땲??`,
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
            title: `AI ?뺣? 寃ъ쟻 吏꾨떒 (${allFiles.length}??`,
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
            title: '遺꾩꽍 ?ㅻ쪟',
            desc: e.message || '?대?吏 遺꾩꽍 以??ㅻ쪟媛 諛쒖깮?덉뒿?덈떎.',
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
        throw new Error(err.error || 'PDF ?앹꽦 ?ㅽ뙣');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `?곕━?μ뀡_AI由ы룷??${activeProperty.caseNo}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('PDF Error:', error);
      alert(`由ы룷???앹꽦 ?ㅻ쪟: ${error.message}`);
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
        {/* 紐⑤컮?쇱슜 ?쒕옒洹??몃뱾 (?쒓컖?? 諛??リ린 踰꾪듉 */}
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
                {tab === 'analysis' ? 'AI 遺꾩꽍' : tab === 'simulator' ? '?쒕??덉씠?? : tab === 'aiscan' ? 'AI ?ㅽ뒠?붿삤' : '?숉뼢'}
              </button>
            ))}
          </div>
          <button 
            onClick={handleSaveProperty}
            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 14px', background: isSaved ? '#fef2f2' : 'white', border: `1px solid ${isSaved ? '#fca5a5' : '#e2e8f0'}`, borderRadius: 20, color: isSaved ? '#ef4444' : '#64748b', fontSize: 12, fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0, marginLeft: 8 }}
          >
            <Heart size={14} fill={isSaved ? '#ef4444' : 'transparent'} color={isSaved ? '#ef4444' : '#94a3b8'} />
            {isSaved ? '??λ맖' : '???}
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }} className="cscroll">
          {activeTab === 'analysis' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ background: 'linear-gradient(135deg, #1268FB 0%, #0a4db5 100%)', borderRadius: 24, padding: 32, color: 'white', textAlign: 'center', boxShadow: '0 10px 30px rgba(18, 104, 251, 0.3)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, opacity: 0.9 }}>AI ?ъ옄 ?뺤떊 吏??/div>
                  <Info size={16} color="white" style={{ opacity: 0.8, cursor: 'pointer' }} onClick={() => setShowCriteria(!showCriteria)} />
                </div>
                <div style={{ fontSize: 64, fontWeight: 900, letterSpacing: -2 }}>{activeProperty.analysis.score}<span style={{ fontSize: 24, opacity: 0.7 }}> / 100</span></div>
                <div style={{ marginTop: 16, padding: '8px 16px', background: 'rgba(255,255,255,0.2)', borderRadius: 40, fontSize: 14, fontWeight: 800, display: 'inline-block' }}>{activeProperty.analysis.score >= 95 ? '?몣 S?깃툒 (理쒖긽???뱀닔 臾쇨굔)' : activeProperty.analysis.score >= 85 ? '狩?A?깃툒 (媛뺣젰 異붿쿇)' : activeProperty.analysis.score >= 70 ? '??B?깃툒 (湲띿젙??' : '?좑툘 C?깃툒 (二쇱쓽 ?붾쭩)'}</div>
                
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
                  <button onClick={() => setShowCriteria(!showCriteria)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: 'white', borderRadius: 20, padding: '4px 12px', fontSize: 11, cursor: 'pointer', opacity: 0.9 }}>
                    ?깃툒 ?먯젙 湲곗? {showCriteria ? '?묎린' : '蹂닿린'}
                  </button>
                </div>
                
                {showCriteria && (
                  <div style={{ marginTop: 20, textAlign: 'left', background: 'rgba(0,0,0,0.15)', padding: '16px', borderRadius: 16, fontSize: 12, lineHeight: 1.6 }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}><div style={{ width: 44, fontWeight: 900, color: '#fef08a' }}>S?깃툒</div><div style={{ flex: 1, opacity: 0.9 }}>95???댁긽. ?쒖꽭李⑥씡???뺣룄?곸씠嫄곕굹 ?뱀닔 沅뚮━ 遺꾩꽍 ???덉쟾??100% 蹂댁옣???ш? 臾쇨굔.</div></div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}><div style={{ width: 44, fontWeight: 900, color: '#bfdbfe' }}>A?깃툒</div><div style={{ flex: 1, opacity: 0.9 }}>85~94?? ?낆?? ?섏씡??諛몃윴?ㅺ? ?곗뼱??利됯컖?곸씤 ?ъ옄瑜?媛뺣젰??異붿쿇?섎뒗 ?곕웾 臾쇨굔.</div></div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}><div style={{ width: 44, fontWeight: 900, color: '#e0f2fe' }}>B?깃툒</div><div style={{ flex: 1, opacity: 0.9 }}>70~84?? ?됯퇏 ?섏????섏씡瑜좎쓣 蹂댁씠硫???由ъ뒪?ш? ?녿뒗 ?쇰컲?곸씤 ?ъ옄 ?곹빀 臾쇨굔.</div></div>
                    <div style={{ display: 'flex', gap: 8 }}><div style={{ width: 44, fontWeight: 900, color: '#fecaca' }}>C?깃툒</div><div style={{ flex: 1, opacity: 0.9 }}>70??誘몃쭔. 沅뚮━???섏옄媛 ?덇굅???덉긽 ?쒖꽭李⑥씡????븘 珥덈낫?먯뿉寃뚮뒗 ?ъ옄瑜?沅뚯옣?섏? ?딆쓬.</div></div>
                  </div>
                )}
              </div>
              <div style={{ background: 'white', borderRadius: 20, padding: 24, border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}><MapPin size={20} color="#1268FB" /><span style={{ fontSize: 16, fontWeight: 900 }}>AI ?낆? ?뺣? 吏꾨떒</span></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><div style={{ background: '#eff6ff', width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Train size={20} color="#1268FB" /></div><div><div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>媛源뚯슫 吏?섏쿋??/div><div style={{ fontSize: 13, fontWeight: 800 }}>{activeProperty.analysis.subwayInfo}</div></div></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><div style={{ background: '#ecfdf5', width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><GraduationCap size={20} color="#059669" /></div><div><div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>媛源뚯슫 ?숆탳</div><div style={{ fontSize: 13, fontWeight: 800 }}>{activeProperty.analysis.schoolInfo}</div></div></div>
                </div>
              </div>
              <div style={{ background: '#f0f7ff', borderRadius: 20, padding: 24, border: '1px solid #bfdbfe' }}><div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}><ShieldCheck size={20} color="#1268FB" /><span style={{ fontSize: 16, fontWeight: 900, color: '#1e40af' }}>AI 留덉뒪??醫낇빀 ?먯젙</span></div><div style={{ fontSize: 14, lineHeight: 1.6, color: '#334155', fontWeight: 600 }}>"{activeProperty.analysis.verdict}"</div></div>
            </div>
          ) : activeTab === 'aiscan' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {!user ? (
                <div style={{ padding: 40, background: '#f8fafc', borderRadius: 24, border: '1px dashed #cbd5e1', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
                  <div style={{ width: 64, height: 64, background: '#EFF6FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Lock size={32} color="#1268FB" /></div>
                  <div><div style={{ fontSize: 18, fontWeight: 900, color: '#111827', marginBottom: 8 }}>?뚯썝 ?꾩슜 ?쒕퉬??/div><div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>AI ?깃린遺 遺꾩꽍 諛??ъ쭊 寃ъ쟻 湲곕뒫?<br/>?곕━?μ뀡 ?뚯썝留??댁슜 媛?ν빀?덈떎.</div></div>
                  <Link href="/login" style={{ width: '100%', textDecoration: 'none' }}><button style={{ width: '100%', padding: '14px', background: '#1268FB', color: 'white', border: 'none', borderRadius: 12, fontWeight: 800, cursor: 'pointer' }}>濡쒓렇?명븯怨?遺꾩꽍 ?쒖옉?섍린</button></Link>
                </div>
              ) : (
                <>
                  <div style={{ padding: 20, background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', borderRadius: 24, border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 20, color: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><Sparkles size={22} color="#1268FB" /> AI 鍮꾩쟾 ?ㅽ뒠?붿삤</div>
                    {!scanMode ? (
                      <div style={{ display: 'flex', gap: 12 }}>
                        <button onClick={() => setScanMode('doc')} style={{ flex: 1, padding: '24px', background: 'white', border: '1px solid #e2e8f0', borderRadius: 20, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}><FileText size={32} color="#1268FB" /><span style={{ fontSize: 14, fontWeight: 800 }}>?깃린遺 遺꾩꽍</span></button>
                        <button onClick={() => setScanMode('img')} style={{ flex: 1, padding: '24px', background: 'white', border: '1px solid #e2e8f0', borderRadius: 20, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}><Camera size={32} color="#059669" /><span style={{ fontSize: 14, fontWeight: 800 }}>?꾩옣 ?ъ쭊 遺꾩꽍</span></button>
                      </div>
                    ) : scanMode === 'doc' ? (
                      <div style={{ position: 'relative', minHeight: 180, border: '2px dashed #1268FB', borderRadius: 20, background: 'white', padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                        {isScanning && <div className="scan-line" />}
                        <input type="file" ref={fileInputRef} onChange={(e) => { if(e.target.files?.[0]) setUploadedPhotos({doc: [e.target.files[0]]}); }} style={{ display: 'none' }} />
                        {!uploadedPhotos.doc ? (
                          <>
                            <Upload size={40} color="#1268FB" style={{ opacity: 0.5 }} />
                            <div style={{ fontSize: 14, fontWeight: 800, color: '#475569' }}>遺?숈궛 ?깃린遺?깅낯(PDF/JPG)</div>
                            <button onClick={() => fileInputRef.current?.click()} style={{ padding: '8px 16px', background: '#1268FB', color: 'white', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>?뚯씪 ?좏깮</button>
                            <button onClick={() => setScanMode(null)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} color="#94a3b8" /></button>
                          </>
                        ) : (
                          <>
                            <FilePlus size={40} color="#1268FB" />
                            <div style={{ fontSize: 14, fontWeight: 800 }}>{uploadedPhotos.doc[0].name}</div>
                            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                              <button onClick={startAnalysis} style={{ padding: '10px 24px', background: '#1268FB', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>遺꾩꽍 ?쒖옉</button>
                              <button onClick={() => setUploadedPhotos({})} style={{ padding: '10px 16px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>痍⑥냼</button>
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ fontSize: 14, fontWeight: 800, color: '#1268FB', textAlign: 'left' }}>
                            {activeProperty.type} ?꾩슜 吏꾨떒 紐⑤뱶 ?쒖꽦 ??
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
                                    {count > 0 ? `??${count}???꾨즺` : '?ъ쭊 ?꾩슂'}
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
                            AI ?뺣? 寃ъ쟻 ?쒖옉
                          </button>
                          <button onClick={() => { setScanMode(null); setUploadedPhotos({}); }} style={{ flex: 1, padding: '14px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>痍⑥냼</button>
                        </div>
                      </div>
                    )}
                  </div>

                  {isScanning && (
                    <div style={{ padding: 32, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                      <Loader2 size={32} color="#1268FB" className="spin" />
                      <div style={{ fontSize: 15, fontWeight: 900, color: '#1268FB' }}>{activeProperty.type} 留욎땄???뺣? 吏꾨떒 以?..</div>
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
                                  <span>{item.name}</span><span style={{ fontWeight: 800 }}>??{(item.price / 10000).toLocaleString()}留?/span>
                                </div>
                              ))}
                            </div>
                          )}
                          <div style={{ padding: 20, background: 'white', borderRadius: 16, border: scanResult.type === 'doc' ? '1px solid #fecaca' : '1px solid #bbf7d0', textAlign: 'center' }}>
                            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700, marginBottom: 6 }}>{scanResult.type === 'doc' ? '理쒖쥌 沅뚮━ ?덉쟾 吏?? : '珥??덉긽 ?섎━鍮?}</div>
                            <div style={{ fontSize: 32, fontWeight: 900, color: scanResult.type === 'doc' ? '#ef4444' : '#059669' }}>
                              {scanResult.type === 'doc' ? `${scanResult.data.score} / 100` : `??${(scanResult.data.total / 10000).toLocaleString()}留?}
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
              {/* 湲곗〈 ?쒖옣 媛寃?鍮꾧탳 */}
              <div style={{ background: '#f8fafc', borderRadius: 16, padding: 20, border: '1px solid #e2e8f0' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}><span style={{ fontSize: 14, fontWeight: 800, color: '#1e293b' }}>?쒖옣 媛寃?鍮꾧탳</span><span style={{ fontSize: 12, padding: '4px 8px', background: '#dcfce7', color: '#166534', borderRadius: 6, fontWeight: 700 }}>?쒖꽭 ?鍮?{marketGapValue}% ???/span></div><div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: 13, color: '#64748b' }}>?멸렐 ?됯퇏 ?쒖꽭</span><span style={{ fontSize: 14, fontWeight: 800 }}>??{(activeProperty.marketPrice / 100000000).toFixed(2)}??/span></div><div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: 13, color: '#64748b' }}>?섏쓽 ?덉긽 ?낆같媛</span><span style={{ fontSize: 14, fontWeight: 800, color: '#1268FB' }}>??{(bidPrice / 100000000).toFixed(2)}??/span></div></div></div>
              
              {/* ?섏쓽 ?덉긽 ?낆같媛 ?щ씪?대뜑 諛?AI 異붿쿇媛 */}
              <div style={{ background: '#f0f7ff', borderRadius: 16, padding: 24, border: '1px solid #bfdbfe', position: 'relative', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#1e3a8a' }}>?섏쓽 ?덉긽 ?낆같媛 ?쒕??덉씠??/div>
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
                        AI 理쒖쟻 ?낆같媛 ?곸슜
                      </button>
                    )
                  })()}
                </div>
                
                <div style={{ background: 'white', padding: '14px 18px', borderRadius: 12, marginBottom: 24, border: '1px dashed #93c5fd', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <Info size={18} color="#3b82f6" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#1e3a8a', marginBottom: 6 }}>珥덈낫?먮? ?꾪븳 AI ?낆같 媛?대뱶</div>
                    <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
                      理쒓렐 3?꾧컙 ?대떦 吏???좎궗 臾쇨굔???숈같 鍮낅뜲?댄꽣瑜??λ윭?앹쑝濡?遺꾩꽍??寃곌낵, <strong>?쒖꽭??82% ??{(activeProperty.marketPrice * 0.82 / 100000000).toFixed(2)}??</strong>?먯꽌 ?낆같??寃쎌슦 媛???댁긽?곸씤 諛몃윴???숈같 ?뺣쪧 85% ?댁긽 諛?10%? ?덉쟾 留덉쭊 ?뺣낫)瑜?蹂댁뿬以띾땲??
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', fontWeight: 700 }}>
                    <span>理쒖? 留ㅺ컖媛 ({(activeProperty.minPrice / 100000000).toFixed(1)}??</span>
                    <span>?쒖꽭 110% ({(activeProperty.marketPrice * 1.1 / 100000000).toFixed(1)}??</span>
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
                    <span style={{ fontSize: 13, color: '#64748b', fontWeight: 700, marginRight: 10 }}>?꾩옱 ?ㅼ젙???낆같媛:</span>
                    <span style={{ fontSize: 22, fontWeight: 900, color: '#1268FB', letterSpacing: '-0.5px' }}>{(bidPrice / 100000000).toFixed(2)}??/span>
                  </div>
                </div>
              </div>



              {/* AI ?덉긽 ?ъ옄 ?섏씡瑜?(ROI) */}
              {(() => {
                const incidentalCost = bidPrice * 0.052; // 痍⑤뱷??諛?遺?鍮꾩슜 ??5.2% 媛??                const netProfit = activeProperty.marketPrice - bidPrice - incidentalCost;
                const roi = (netProfit / bidPrice) * 100;
                
                return (
                  <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: 16, padding: 24, color: 'white', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
                      <Calculator size={18} color="#60a5fa" />
                      <span style={{ fontSize: 15, fontWeight: 800 }}>AI ?덉긽 ?ъ옄 ?섏씡瑜?(ROI)</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 12 }}>
                        <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>?덉긽 留ㅻ룄 ?쒖꽭</span>
                        <span style={{ fontSize: 14, fontWeight: 700 }}>??{(activeProperty.marketPrice / 100000000).toFixed(2)}??/span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 12 }}>
                        <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>?섏쓽 ?낆같媛</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8' }}>- ??{(bidPrice / 100000000).toFixed(2)}??/span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 12 }}>
                        <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>遺? 鍮꾩슜 (痍⑤뱷????5.2%)</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8' }}>- ??{(incidentalCost / 10000000).toFixed(1)}泥쒕쭔</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, alignItems: 'flex-end' }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: '#cbd5e1' }}>?숈같 ??利됱떆 留ㅻ룄 ???쒖닔??/span>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 26, fontWeight: 900, color: roi > 0 ? '#34d399' : '#f87171', letterSpacing: '-1px' }}>
                            {roi > 0 ? '+' : ''}??{(netProfit / 100000000).toFixed(2)}??                          </div>
                          <div style={{ fontSize: 13, color: roi > 0 ? '#10b981' : '#ef4444', fontWeight: 800, marginTop: 6, background: roi > 0 ? 'rgba(52, 211, 153, 0.1)' : 'rgba(248, 113, 113, 0.1)', padding: '4px 8px', borderRadius: 6, display: 'inline-block' }}>
                            利됱떆 留덉쭊??{roi.toFixed(1)}%
                          </div>
                        </div>
                      </div>

                      {/* ?κ린 蹂댁쑀 ?쒕??덉씠??*/}
                      <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 16, marginTop: 8 }}>
                        <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12, fontWeight: 600 }}>AI ?쒓퀎??遺꾩꽍 紐⑤뜽: 蹂댁쑀 湲곌컙蹂?媛移??곸듅 ?덉륫移?/div>
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
                                <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 6, fontWeight: 600 }}>{plan.years}????留ㅻ룄</div>
                                <div style={{ fontSize: 14, fontWeight: 800, color: futureProfit > 0 ? '#34d399' : '#f87171' }}>
                                  +{ (futureProfit / 100000000).toFixed(2) }??                                </div>
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
              {/* 湲곗〈 吏???숈같 ?몃젋???붿빟 */}
              <div style={{ background: '#f8f9fa', borderRadius: 16, padding: 20, border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <TrendingUp size={16} color="#1268FB" />
                  <span style={{ fontSize: 14, fontWeight: 800 }}>吏???숈같媛???몃젋??/span>
                </div>
                <div style={{ fontSize: 14, color: '#374151', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600 }}>?대떦 愿??踰뺤썝 / ?⑸룄 湲곗?</span>
                  <strong style={{ color: '#1268FB', fontSize: 18 }}>87.4%</strong>
                </div>
              </div>

              {/* 臾쇨굔 ?좏삎蹂??숈쟻 ?숉뼢 李⑦듃 (?쒕??덉씠?곗뿉???대룞?? */}
              {(() => {
                const isCommercial = activeProperty.type.includes('?곴?') || activeProperty.type.includes('?щТ??) || activeProperty.type.includes('?ㅽ뵾??);
                const isLand = activeProperty.type.includes('?좎?') || activeProperty.type.includes('怨듭옣') || activeProperty.type.includes('??) || activeProperty.type.includes('??);
                
                let chartTitle = '?멸렐 ?좎궗 留ㅻЪ ?쒖꽭 ?숉뼢';
                let chartBadge = '理쒓렐 5??/ 諛섍꼍 1km';
                
                if (isCommercial) {
                  chartTitle = '?멸렐 ?곴텒 ?됯퇏 嫄곕옒媛 ?숉뼢';
                  chartBadge = '理쒓렐 5??/ ?〓떦 ?④?';
                } else if (isLand) {
                  chartTitle = '?대떦 ?꾩? 媛쒕퀎怨듭떆吏媛 異붿씠';
                  chartBadge = '理쒓렐 5??/ 援?넗遺 怨좎떆';
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
                          displayValue = `${(basePrice / 10000).toFixed(1)}留?;
                        } else if (isCommercial) {
                          const basePrice = (activeProperty.marketPrice / 250) * d.factor;
                          displayValue = `${Math.floor(basePrice / 10000)}留?;
                        } else {
                          const basePrice = activeProperty.marketPrice * d.factor;
                          displayValue = `${(basePrice / 100000000).toFixed(1)}??;
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

              {/* 1. ?ㅼ떆媛?寃쎌웳 移섏뿴??(FOMO) */}
              <div style={{ background: '#fff5f5', borderRadius: 16, padding: 20, border: '1px solid #fed7aa', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <Flame size={18} color="#ef4444" />
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#991b1b' }}>?ㅼ떆媛??낆같 寃쎌웳??(?믪쓬)</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#b91c1c', fontWeight: 600 }}>?ㅻ뒛 議고쉶??諛?愿??吏묒쨷??湲곕컲 ?덉륫</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Eye size={14} color="#ef4444" /><span style={{ fontSize: 13, fontWeight: 800, color: '#7f1d1d' }}>1,245??/span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Heart size={14} fill="#ef4444" color="#ef4444" /><span style={{ fontSize: 13, fontWeight: 800, color: '#7f1d1d' }}>42紐?李?/span></div>
                </div>
              </div>

              {/* 2. 吏???됯퇏 ?좎같 ?잛닔 諛?諛⑹뼱??*/}
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1, background: 'white', borderRadius: 16, padding: 20, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', textAlign: 'center' }}>
                  <Clock size={24} color="#64748b" style={{ margin: '0 auto 12px' }} />
                  <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700, marginBottom: 4 }}>??吏???됯퇏 ?좎같</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: '#0f172a' }}>1.8<span style={{ fontSize: 14, fontWeight: 600, color: '#64748b' }}> ??/span></div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 8 }}>?꾩옱 2???좎같 ?곹깭濡?br/>?곸젙 ??대컢 ?꾨옒</div>
                </div>
                
                {/* 3. 鍮낅뜲?댄꽣 ?곴텒/?낆? ?ㅽ꺈 */}
                <div style={{ flex: 1, background: 'white', borderRadius: 16, padding: 20, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', textAlign: 'center' }}>
                  <Activity size={24} color="#10b981" style={{ margin: '0 auto 12px' }} />
                  <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700, marginBottom: 4 }}>?대떦 ?곴텒 ?앹〈??/div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: '#0f172a' }}>65.2<span style={{ fontSize: 14, fontWeight: 600, color: '#64748b' }}> %</span></div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 8 }}>諛섍꼍 1km 湲곗?<br/>?쇱씪 ?좊룞?멸뎄 1.2留?/div>
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
            {isPdfLoading ? <><Loader2 size={18} className="spin" /> AI 由ы룷???앹꽦 以?..</> : <><Download size={18} /> AI 沅뚮━遺꾩꽍 PDF 由ы룷??諛쒗뻾</>}
          </button>
          <button
            onClick={shareToKakao}
            style={{ width: '100%', padding: '14px', background: '#FEE500', border: 'none', borderRadius: 12, color: '#000000', fontSize: 14, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <img src="https://developers.kakao.com/assets/img/about/logos/kakaotalksharing/kakaotalk_sharing_btn_medium.png" alt="Kakao" style={{ width: 18, height: 18 }} />
            移댁뭅?ㅽ넚?쇰줈 由ы룷??怨듭쑀
          </button>
        </div>
      </aside>
      {/* PDF???쒕쾭?ъ씠??/api/report)?먯꽌 ?앹꽦?⑸땲??*/}
    </>
  );
}
