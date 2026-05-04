'use client';
import React from 'react';
import { ArrowLeft, Bell, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const notices = [
  { id: 1, title: '우리옥션 AI v2.4 업데이트 안내', date: '2024-05-01', isNew: true, content: 'AI 분석 모델 업그레이드, 모바일 UI 개선, 카카오 공유 기능 추가' },
  { id: 2, title: '5월 경매 일정 공지', date: '2024-04-28', isNew: true, content: '법원 경매 일정 변경 안내 및 공휴일 휴정 일정을 확인하세요.' },
  { id: 3, title: '권리분석 서비스 이용 안내', date: '2024-04-20', isNew: false, content: '전문가 권리분석 서비스 신청 방법 및 처리 기간 안내입니다.' },
  { id: 4, title: '개인정보 처리방침 개정 안내', date: '2024-04-10', isNew: false, content: '개인정보 처리방침이 일부 개정되었습니다. 내용을 확인해주세요.' },
  { id: 5, title: '시스템 점검 안내 (4/15 02:00~06:00)', date: '2024-04-08', isNew: false, content: '서버 정기 점검으로 인해 서비스 이용이 일시 중단됩니다.' },
];

export default function NoticesPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: '"Pretendard Variable", Pretendard, sans-serif' }}>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #f1f5f9', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px' }}>
          <Link href="/?menu=all">
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 4 }}>
              <ArrowLeft size={24} color="#1e293b" />
            </button>
          </Link>
          <h1 style={{ fontSize: 18, fontWeight: 900, color: '#1e293b', margin: 0 }}>공지사항</h1>
        </div>
      </div>

      {/* Notice List */}
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {notices.map(notice => (
          <div key={notice.id} style={{
            background: 'white', borderRadius: 16, padding: '18px 16px',
            border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            cursor: 'pointer'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  {notice.isNew && (
                    <span style={{ 
                      background: '#1268FB', color: 'white', fontSize: 10, fontWeight: 800,
                      padding: '2px 6px', borderRadius: 4 
                    }}>NEW</span>
                  )}
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>{notice.date}</span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#1e293b', marginBottom: 6, lineHeight: 1.4 }}>
                  {notice.title}
                </div>
                <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>
                  {notice.content}
                </div>
              </div>
              <ChevronRight size={18} color="#d1d5db" style={{ flexShrink: 0, marginTop: 2 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
