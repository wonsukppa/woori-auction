'use client';
import React, { useState } from 'react';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function RightsAnalysisPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ caseNo: '', address: '', type: '', memo: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!form.caseNo || !form.address) return alert('사건번호와 주소를 입력해주세요.');
    setSubmitted(true);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: '"Pretendard Variable", Pretendard, sans-serif' }}>
      <div style={{ background: 'white', borderBottom: '1px solid #f1f5f9', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px' }}>
          <Link href="/?menu=all"><button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><ArrowLeft size={24} color="#1e293b" /></button></Link>
          <h1 style={{ fontSize: 18, fontWeight: 900, color: '#1e293b', margin: 0 }}>권리분석 요청</h1>
        </div>
      </div>

      <div style={{ padding: '24px 20px 100px' }}>
        {submitted ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, background: '#ecfdf5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
              <CheckCircle size={40} color="#059669" />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: '#1e293b', marginBottom: 8 }}>신청 완료!</h2>
            <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7, marginBottom: 32 }}>
              권리분석 요청이 접수되었습니다.<br />전문 법무사가 48시간 내에 연락드립니다.
            </p>
            <Link href="/?menu=all">
              <button style={{ padding: '14px 32px', background: '#059669', color: 'white', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: 'pointer' }}>
                메인으로 돌아가기
              </button>
            </Link>
          </div>
        ) : (
          <>
            {/* Service Info */}
            <div style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', borderRadius: 20, padding: 20, color: 'white', marginBottom: 24 }}>
              <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 4 }}>⚖️ 전문가 서비스</div>
              <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>권리분석 요청</div>
              <div style={{ fontSize: 13, opacity: 0.8, lineHeight: 1.6 }}>법무사 및 경매 전문가가 직접 분석하여<br />48시간 내 결과를 제공합니다</div>
              <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
                {[{ v: '48h', l: '평균응답' }, { v: '98%', l: '만족도' }, { v: '500+', l: '분석완료' }].map((s, i) => (
                  <div key={i}>
                    <div style={{ fontSize: 18, fontWeight: 900 }}>{s.v}</div>
                    <div style={{ fontSize: 11, opacity: 0.7 }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <div style={{ background: 'white', borderRadius: 20, padding: 20, border: '1px solid #f1f5f9' }}>
              <h3 style={{ fontSize: 16, fontWeight: 900, color: '#1e293b', marginBottom: 20 }}>물건 정보 입력</h3>

              {[
                { label: '사건번호 *', key: 'caseNo', placeholder: '예) 2024타경100000' },
                { label: '물건 주소 *', key: 'address', placeholder: '예) 서울특별시 강남구 역삼동 123-4' },
                { label: '물건 유형', key: 'type', placeholder: '예) 아파트, 상가, 토지 등' },
              ].map(field => (
                <div key={field.key} style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>{field.label}</label>
                  <input
                    value={(form as any)[field.key]}
                    onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    style={{ width: '100%', padding: '12px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14, color: '#374151', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              ))}

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>추가 요청사항</label>
                <textarea
                  value={form.memo}
                  onChange={e => setForm(f => ({ ...f, memo: e.target.value }))}
                  placeholder="특별히 확인이 필요한 사항을 입력해주세요"
                  rows={4}
                  style={{ width: '100%', padding: '12px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14, color: '#374151', outline: 'none', boxSizing: 'border-box', resize: 'none' }}
                />
              </div>

              <button onClick={handleSubmit} style={{ width: '100%', padding: '15px', background: '#059669', color: 'white', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 900, cursor: 'pointer' }}>
                권리분석 신청하기
              </button>
              <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', marginTop: 12 }}>
                신청 후 담당 전문가가 카카오톡으로 연락드립니다
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
