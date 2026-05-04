'use client';
import React, { useState } from 'react';
import { ArrowLeft, Play, Clock, BookOpen, ChevronRight, Lock } from 'lucide-react';
import Link from 'next/link';

const courses = [
  {
    id: 1, title: '경매 입문 1강: 법원경매란?', duration: '18분', free: true,
    desc: '법원경매의 개념, 진행 절차, 일반 매매와의 차이점을 알아봅니다.',
    category: '기초', thumb: '📖'
  },
  {
    id: 2, title: '경매 입문 2강: 권리분석 기초', duration: '24분', free: true,
    desc: '말소기준권리, 인수주의, 소제주의 등 핵심 개념을 쉽게 설명합니다.',
    category: '기초', thumb: '⚖️'
  },
  {
    id: 3, title: '경매 입문 3강: 명도 전략', duration: '21분', free: false,
    desc: '낙찰 후 점유자 명도 방법, 인도명령 신청 절차를 상세히 안내합니다.',
    category: '기초', thumb: '🏠'
  },
  {
    id: 4, title: '중급 1강: 아파트 경매 완전정복', duration: '35분', free: false,
    desc: '아파트 경매의 특수성, 임차인 분석, 낙찰가 산정 전략을 다룹니다.',
    category: '중급', thumb: '🏢'
  },
  {
    id: 5, title: '중급 2강: 상가·사무실 투자 전략', duration: '42분', free: false,
    desc: '상업용 부동산 경매의 특징과 수익률 계산법, 임차인 리스크를 분석합니다.',
    category: '중급', thumb: '🏪'
  },
  {
    id: 6, title: '고급 1강: AI를 활용한 물건 선별', duration: '55분', free: false,
    desc: '우리옥션 AI 점수 체계를 심층 이해하고 S등급 물건을 선별하는 방법을 학습합니다.',
    category: '고급', thumb: '🤖'
  },
];

const categoryColors: Record<string, { bg: string; color: string }> = {
  '기초': { bg: '#ecfdf5', color: '#059669' },
  '중급': { bg: '#eff6ff', color: '#1268FB' },
  '고급': { bg: '#fdf4ff', color: '#9333ea' },
};

export default function EducationPage() {
  const [activeCategory, setActiveCategory] = useState('전체');
  const filtered = activeCategory === '전체' ? courses : courses.filter(c => c.category === activeCategory);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: '"Pretendard Variable", Pretendard, sans-serif' }}>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #f1f5f9', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px' }}>
          <Link href="/?menu=all"><button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><ArrowLeft size={24} color="#1e293b" /></button></Link>
          <h1 style={{ fontSize: 18, fontWeight: 900, color: '#1e293b', margin: 0 }}>경매 기초 강의</h1>
        </div>
      </div>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', padding: '24px 20px', color: 'white' }}>
        <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 4 }}>📚 우리옥션 AI 교육 센터</div>
        <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>경매 전문가로 성장하세요</div>
        <div style={{ fontSize: 13, opacity: 0.8 }}>입문부터 고급까지 단계별 커리큘럼</div>
        <div style={{ display: 'flex', gap: 16, marginTop: 20 }}>
          {[{ v: '6+', l: '강의' }, { v: '2', l: '무료' }, { v: '4.9', l: '평점' }].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 900 }}>{s.v}</div>
              <div style={{ fontSize: 11, opacity: 0.7 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter */}
      <div style={{ padding: '16px 20px 8px', display: 'flex', gap: 8 }}>
        {['전체', '기초', '중급', '고급'].map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            style={{ padding: '8px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
              background: activeCategory === cat ? '#8b5cf6' : '#f1f5f9',
              color: activeCategory === cat ? 'white' : '#64748b', fontSize: 13, fontWeight: 700 }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Course List */}
      <div style={{ padding: '8px 20px 100px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(course => {
          const catStyle = categoryColors[course.category] || { bg: '#f1f5f9', color: '#64748b' };
          return (
            <div key={course.id} style={{ background: 'white', borderRadius: 16, padding: '16px', border: '1px solid #f1f5f9', cursor: 'pointer' }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 56, height: 56, background: catStyle.bg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
                  {course.thumb}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center' }}>
                    <span style={{ background: catStyle.bg, color: catStyle.color, fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 4 }}>{course.category}</span>
                    {course.free ? (
                      <span style={{ background: '#ecfdf5', color: '#059669', fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 4 }}>무료</span>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 2, color: '#94a3b8', fontSize: 10 }}><Lock size={10} />프리미엄</span>
                    )}
                    <span style={{ display: 'flex', alignItems: 'center', gap: 2, color: '#94a3b8', fontSize: 11, marginLeft: 'auto' }}>
                      <Clock size={11} />{course.duration}
                    </span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#1e293b', marginBottom: 4 }}>{course.title}</div>
                  <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>{course.desc}</div>
                </div>
              </div>
              <button style={{ marginTop: 12, width: '100%', padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: course.free ? '#8b5cf6' : '#f1f5f9', color: course.free ? 'white' : '#94a3b8',
                fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                {course.free ? <><Play size={14} />지금 수강하기</> : <><Lock size={14} />프리미엄 전용</>}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
