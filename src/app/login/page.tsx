'use client';

import React, { useState } from 'react';
import { Landmark, Mail, Lock, ArrowRight, ArrowLeft, Github, Chrome, ShieldCheck, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
    const payload = isLogin ? { email, password } : { email, password, name };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '알 수 없는 오류가 발생했습니다.');
      }

      if (isLogin) {
        localStorage.setItem('user', JSON.stringify(data.user));
        alert(`${data.user.name}님, 환영합니다!`);
        router.push('/');
      } else {
        alert('회원가입이 완료되었습니다. 로그인해 주세요.');
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main style={{ 
      minHeight: '100vh', 
      background: 'radial-gradient(circle at top right, #f0f7ff, #ffffff)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: 20
    }}>
      <button 
        onClick={() => router.push('/')}
        style={{ position: 'absolute', top: 24, left: 24, background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', fontWeight: 800, color: '#475569', zIndex: 10 }}
      >
        <ArrowLeft size={18} /> 메인으로 돌아가기
      </button>

      <div style={{ 
        width: '100%', maxWidth: 440, background: 'rgba(255, 255, 255, 0.8)', 
        backdropFilter: 'blur(20px)', borderRadius: 32, padding: 48, 
        boxShadow: '0 25px 50px -12px rgba(18, 104, 251, 0.15)', border: '1px solid rgba(255, 255, 255, 0.3)' 
      }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ 
            width: 56, height: 56, background: '#1268FB', borderRadius: 16, 
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', 
            boxShadow: '0 10px 20px rgba(18, 104, 251, 0.3)' 
          }}>
            <Landmark size={28} color="white" />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#111827', letterSpacing: '-1px', marginBottom: 8 }}>
            {isLogin ? '반갑습니다!' : '전문가의 시작'}
          </h1>
          <p style={{ fontSize: 14, color: '#64748b', fontWeight: 500 }}>
            {isLogin ? '우리옥션 AI로 현명한 투자를 시작하세요' : '회원가입 후 AI 정밀 분석을 이용해 보세요'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
          {error && <div style={{ padding: '12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, color: '#b91c1c', fontSize: 13, fontWeight: 600 }}>{error}</div>}
          
          {!isLogin && (
            <input 
              type="text" placeholder="성함" required value={name} onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', padding: '14px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, outline: 'none', fontSize: 14, boxSizing: 'border-box' }} 
            />
          )}
          <div style={{ position: 'relative' }}>
            <Mail size={18} color="#94a3b8" style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="email" placeholder="이메일 주소" required value={email} onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '14px 44px 14px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, outline: 'none', fontSize: 14, boxSizing: 'border-box' }} 
            />
          </div>
          <div style={{ position: 'relative' }}>
            <Lock size={18} color="#94a3b8" style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="password" placeholder="비밀번호" required value={password} onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '14px 44px 14px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, outline: 'none', fontSize: 14, boxSizing: 'border-box' }} 
            />
          </div>

          {isLogin && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-8px' }}>
              <button 
                type="button" 
                onClick={() => alert('등록하신 이메일로 비밀번호 재설정 링크를 발송해 드립니다. (준비 중)')} 
                style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0 }}
              >
                아이디/비밀번호 찾기
              </button>
            </div>
          )}

          <button 
            type="submit" disabled={isLoading}
            style={{ 
              width: '100%', padding: '16px', background: '#1268FB', color: 'white', 
              border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 800, 
              cursor: isLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: '0 10px 25px rgba(18, 104, 251, 0.3)', opacity: isLoading ? 0.7 : 1
            }}>
            {isLoading ? <Loader2 size={18} className="spin" /> : (isLogin ? '로그인' : '계정 만들기')} 
            {!isLoading && <ArrowRight size={18} />}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
          <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>또는 간편 로그인</span>
          <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
          <button style={{ flex: 1, padding: '12px', background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, cursor: 'pointer', display: 'flex', justifyContent: 'center' }}>
            <Chrome size={20} color="#64748b" />
          </button>
          <button style={{ flex: 1, padding: '12px', background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, cursor: 'pointer', display: 'flex', justifyContent: 'center' }}>
            <Github size={20} color="#64748b" />
          </button>
        </div>

        <div style={{ textAlign: 'center' }}>
          <button 
            onClick={() => setIsLogin(!isLogin)}
            style={{ background: 'none', border: 'none', color: '#1268FB', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
          >
            {isLogin ? '아직 회원이 아니신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
          </button>
        </div>
      </div>
    </main>
  );
}
