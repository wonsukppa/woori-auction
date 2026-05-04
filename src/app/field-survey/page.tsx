'use client';
import React, { useState } from 'react';
import { ArrowLeft, MapPin, Calendar, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function FieldSurveyPage() {
  const [form, setForm] = useState({ caseNo: '', address: '', date: '', contact: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!form.caseNo || !form.contact) return alert('사건번호와 연락처를 입력해주세요.');
    setSubmitted(true);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: '"Pretendard Variable", Pretendard, sans-serif' }}>
      <div style={{ background: 'white', borderBottom: '1px solid #f1f5f9', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px' }}>
          <Link href="/?menu=all"><button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><ArrowLeft size={24} color="#1e293b" /></button></Link>
          <h1 style={{ fontSize: 18, fontWeight: 900, color: '#1e293b', margin: 0 }}>현장조사 동행</h1>
        </div>
      </div>

      <div style={{ padding: '24px 20px 100px' }}>
        {submitted ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, background: '#fffbeb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
              <CheckCircle size={40} color="#d97706" />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>신청 완료!</h2>
            <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7 }}>
              현장조사 동행 신청이 접수되었습니다.<br />24시간 내 담당 전문가가 연락드립니다.
            </p>
            <Link href="/?menu=all"><button style={{ marginTop: 32, padding: '14px 32px', background: '#d97706', color: 'white', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: 'pointer' }}>메인으로 돌아가기</button></Link>
          </div>
        ) : (
          <>
            <div style={{ background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)', borderRadius: 20, padding: 20, color: 'white', marginBottom: 24 }}>
              <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 4 }}>🔍 프리미엄 서비스</div>
              <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>현장조사 동행 서비스</div>
              <div style={{ fontSize: 13, opacity: 0.8, lineHeight: 1.6 }}>경매 전문가가 함께 현장을 방문하여<br />물건 상태·점유 현황·주변 시세를 확인합니다</div>
              <div style={{ display: 'flex', gap: 20, marginTop: 16 }}>
                {[{ v: '200+', l: '동행완료' }, { v: '4.9★', l: '만족도' }, { v: '24h', l: '응답시간' }].map((s, i) => (
                  <div key={i}><div style={{ fontSize: 18, fontWeight: 900 }}>{s.v}</div><div style={{ fontSize: 11, opacity: 0.7 }}>{s.l}</div></div>
                ))}
              </div>
            </div>

            {/* What's included */}
            <div style={{ background: 'white', borderRadius: 16, padding: 20, border: '1px solid #f1f5f9', marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 900, marginBottom: 14 }}>포함 서비스</h3>
              {['현장 방문 동행 및 물건 상태 점검', '점유자 확인 및 명도 난이도 평가', '주변 시세 및 임대 수요 현장 조사', '조사 결과 보고서 제공 (PDF)'].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 20, height: 20, background: '#fffbeb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 10 }}>✓</span>
                  </div>
                  <span style={{ fontSize: 13, color: '#374151' }}>{item}</span>
                </div>
              ))}
            </div>

            {/* Form */}
            <div style={{ background: 'white', borderRadius: 20, padding: 20, border: '1px solid #f1f5f9' }}>
              <h3 style={{ fontSize: 16, fontWeight: 900, marginBottom: 20 }}>동행 신청</h3>
              {[
                { label: '사건번호 *', key: 'caseNo', placeholder: '예) 2024타경100000' },
                { label: '물건 주소', key: 'address', placeholder: '예) 서울 강남구 역삼동 123' },
                { label: '희망 방문일', key: 'date', placeholder: '예) 2024-05-20 (협의 가능)', type: 'text' },
                { label: '연락처 *', key: 'contact', placeholder: '010-1234-5678' },
              ].map(field => (
                <div key={field.key} style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>{field.label}</label>
                  <input
                    value={(form as any)[field.key]}
                    onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    style={{ width: '100%', padding: '12px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              ))}
              <button onClick={handleSubmit} style={{ width: '100%', padding: '15px', background: '#d97706', color: 'white', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 900, cursor: 'pointer' }}>
                동행 신청하기
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
