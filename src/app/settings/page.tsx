'use client';
import React, { useState } from 'react';
import { ArrowLeft, Bell, Moon, Shield, ChevronRight, Toggle } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    pushNewAuction: true,
    pushBidResult: true,
    pushAiAlert: true,
    darkMode: false,
    locationAccess: true,
    marketingEmail: false,
  });

  const toggle = (key: keyof typeof settings) =>
    setSettings(s => ({ ...s, [key]: !s[key] }));

  const ToggleSwitch = ({ active }: { active: boolean }) => (
    <div style={{
      width: 44, height: 24, borderRadius: 12, background: active ? '#1268FB' : '#e2e8f0',
      position: 'relative', cursor: 'pointer', transition: 'background 0.2s',
      flexShrink: 0
    }}>
      <div style={{
        width: 20, height: 20, borderRadius: '50%', background: 'white',
        position: 'absolute', top: 2, left: active ? 22 : 2,
        transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.15)'
      }} />
    </div>
  );

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: '#94a3b8', marginBottom: 8, paddingLeft: 4, letterSpacing: '0.05em' }}>{title}</div>
      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  );

  const Row = ({ label, desc, settingKey, isToggle = true }: { label: string; desc?: string; settingKey?: keyof typeof settings; isToggle?: boolean }) => (
    <div
      onClick={() => settingKey && toggle(settingKey)}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #f8fafc', cursor: 'pointer' }}
    >
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{label}</div>
        {desc && <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{desc}</div>}
      </div>
      {isToggle && settingKey ? (
        <ToggleSwitch active={settings[settingKey]} />
      ) : (
        <ChevronRight size={18} color="#d1d5db" />
      )}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: '"Pretendard Variable", Pretendard, sans-serif' }}>
      <div style={{ background: 'white', borderBottom: '1px solid #f1f5f9', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px' }}>
          <Link href="/?menu=all"><button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><ArrowLeft size={24} color="#1e293b" /></button></Link>
          <h1 style={{ fontSize: 18, fontWeight: 900, color: '#1e293b', margin: 0 }}>설정</h1>
        </div>
      </div>

      <div style={{ padding: '20px 20px 100px' }}>
        {/* Account Info */}
        <div style={{ background: 'white', borderRadius: 20, padding: '20px', marginBottom: 20, border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg, #1268FB, #1e40af)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 22, fontWeight: 900, color: 'white' }}>양</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#1e293b' }}>양동혁님</div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>프리미엄 멤버</div>
          </div>
          <span style={{ fontSize: 12, background: '#1268FB', color: 'white', padding: '4px 10px', borderRadius: 8, fontWeight: 700 }}>프로필 수정</span>
        </div>

        <Section title="🔔 알림 설정">
          <Row label="신규 경매 물건 알림" desc="관심 조건의 신규 물건 등록 시 알림" settingKey="pushNewAuction" />
          <Row label="낙찰 결과 알림" desc="입찰한 물건의 낙찰 결과 알림" settingKey="pushBidResult" />
          <Row label="AI 투자 경보" desc="급등·급락 물건 AI 감지 알림" settingKey="pushAiAlert" />
        </Section>

        <Section title="🎨 디스플레이">
          <Row label="다크 모드" desc="어두운 배경으로 전환" settingKey="darkMode" />
        </Section>

        <Section title="🔒 개인정보 & 보안">
          <Row label="위치정보 사용" desc="내 주변 경매 물건 탐색에 활용" settingKey="locationAccess" />
          <Row label="마케팅 정보 수신" desc="이메일로 경매 시황·이벤트 수신" settingKey="marketingEmail" />
          <Row label="개인정보 처리방침" isToggle={false} />
          <Row label="이용약관" isToggle={false} />
        </Section>

        <Section title="📱 앱 정보">
          <Row label="현재 버전" desc="v2.4.0" isToggle={false} />
          <Row label="오픈소스 라이선스" isToggle={false} />
          <Row label="고객센터 문의" isToggle={false} />
        </Section>

        <button style={{ width: '100%', padding: '14px', background: 'white', color: '#ef4444', border: '1px solid #fecaca', borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
          로그아웃
        </button>
      </div>
    </div>
  );
}
