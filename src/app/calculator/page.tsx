'use client';
import React, { useState } from 'react';
import { ArrowLeft, Calculator, TrendingUp, RotateCcw } from 'lucide-react';
import Link from 'next/link';

const formatWon = (n: number) => {
  if (n >= 100000000) return `${(n / 100000000).toFixed(2)}억`;
  if (n >= 10000) return `${(n / 10000).toFixed(0)}만원`;
  return `${n.toLocaleString()}원`;
};

export default function CalculatorPage() {
  const [inputs, setInputs] = useState({
    purchasePrice: '',    // 낙찰가 (만원)
    marketPrice: '',      // 시세 (만원)
    acquisitionCost: '5', // 취득 부대비용 %
    rentalIncome: '',     // 월 임대수입 (만원)
    loanRatio: '60',      // LTV %
    loanRate: '4.5',      // 대출금리 %
  });
  const [result, setResult] = useState<any>(null);

  const calculate = () => {
    const purchase = Number(inputs.purchasePrice) * 10000;
    const market = Number(inputs.marketPrice) * 10000;
    const acqCostPct = Number(inputs.acquisitionCost) / 100;
    const rental = Number(inputs.rentalIncome) * 10000;
    const ltvPct = Number(inputs.loanRatio) / 100;
    const rate = Number(inputs.loanRate) / 100;

    if (!purchase || !market) return alert('낙찰가와 시세를 입력해주세요.');

    const totalCost = purchase * (1 + acqCostPct);
    const loanAmt = purchase * ltvPct;
    const selfFunds = totalCost - loanAmt;
    const annualInterest = loanAmt * rate;
    const annualRental = rental * 12;
    const netAnnualIncome = annualRental - annualInterest;
    const immediateGain = market - purchase;
    const roi = selfFunds > 0 ? (netAnnualIncome / selfFunds) * 100 : 0;
    const capRate = purchase > 0 ? (annualRental / purchase) * 100 : 0;

    setResult({ totalCost, loanAmt, selfFunds, annualInterest, annualRental, netAnnualIncome, immediateGain, roi, capRate });
  };

  const reset = () => { setInputs({ purchasePrice: '', marketPrice: '', acquisitionCost: '5', rentalIncome: '', loanRatio: '60', loanRate: '4.5' }); setResult(null); };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: '"Pretendard Variable", Pretendard, sans-serif' }}>
      <div style={{ background: 'white', borderBottom: '1px solid #f1f5f9', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/?menu=all"><button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><ArrowLeft size={24} color="#1e293b" /></button></Link>
            <h1 style={{ fontSize: 18, fontWeight: 900, color: '#1e293b', margin: 0 }}>수익률 계산기</h1>
          </div>
          <button onClick={reset} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
            <RotateCcw size={14} />초기화
          </button>
        </div>
      </div>

      <div style={{ padding: '20px 20px 120px' }}>
        {/* Input Section */}
        <div style={{ background: 'white', borderRadius: 20, padding: 20, border: '1px solid #f1f5f9', marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 900, marginBottom: 16, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calculator size={18} color="#e11d48" />물건 정보
          </h3>

          {[
            { label: '낙찰가 (만원)', key: 'purchasePrice', placeholder: '예) 50000 (5억)', unit: '만원' },
            { label: '시세 (만원)', key: 'marketPrice', placeholder: '예) 65000 (6.5억)', unit: '만원' },
            { label: '월 임대수입 (만원)', key: 'rentalIncome', placeholder: '예) 200 (200만원)', unit: '만원' },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 6 }}>{f.label}</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  value={(inputs as any)[f.key]}
                  onChange={e => setInputs(i => ({ ...i, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  style={{ width: '100%', padding: '12px 52px 12px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 15, fontWeight: 700, outline: 'none', boxSizing: 'border-box' }}
                />
                <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{f.unit}</span>
              </div>
            </div>
          ))}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {[
              { label: '부대비용', key: 'acquisitionCost', unit: '%' },
              { label: '대출비율(LTV)', key: 'loanRatio', unit: '%' },
              { label: '대출금리', key: 'loanRate', unit: '%' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 6 }}>{f.label}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    value={(inputs as any)[f.key]}
                    onChange={e => setInputs(i => ({ ...i, [f.key]: e.target.value }))}
                    style={{ width: '100%', padding: '10px 28px 10px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14, fontWeight: 700, outline: 'none', boxSizing: 'border-box' }}
                  />
                  <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: '#94a3b8' }}>{f.unit}</span>
                </div>
              </div>
            ))}
          </div>

          <button onClick={calculate} style={{ marginTop: 20, width: '100%', padding: '15px', background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)', color: 'white', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <TrendingUp size={18} />수익률 계산하기
          </button>
        </div>

        {/* Results */}
        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Key Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: '즉시 시세차익', value: formatWon(result.immediateGain), color: result.immediateGain > 0 ? '#059669' : '#e11d48', bg: result.immediateGain > 0 ? '#ecfdf5' : '#fff1f2' },
                { label: '연간 순수익', value: formatWon(result.netAnnualIncome), color: result.netAnnualIncome > 0 ? '#1268FB' : '#e11d48', bg: result.netAnnualIncome > 0 ? '#eff6ff' : '#fff1f2' },
                { label: '실질 ROI', value: `${result.roi.toFixed(2)}%`, color: result.roi > 5 ? '#059669' : result.roi > 0 ? '#d97706' : '#e11d48', bg: '#fffbeb' },
                { label: '캡레이트', value: `${result.capRate.toFixed(2)}%`, color: '#8b5cf6', bg: '#f5f3ff' },
              ].map((m, i) => (
                <div key={i} style={{ background: m.bg, borderRadius: 16, padding: 16, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, marginBottom: 6 }}>{m.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: m.color }}>{m.value}</div>
                </div>
              ))}
            </div>

            {/* Detail */}
            <div style={{ background: 'white', borderRadius: 16, padding: 20, border: '1px solid #f1f5f9' }}>
              <h4 style={{ fontSize: 14, fontWeight: 900, marginBottom: 14, color: '#1e293b' }}>상세 분석</h4>
              {[
                { label: '총 취득비용', value: formatWon(result.totalCost) },
                { label: '대출금액', value: formatWon(result.loanAmt) },
                { label: '실투자금', value: formatWon(result.selfFunds), highlight: true },
                { label: '연간 임대수입', value: formatWon(result.annualRental) },
                { label: '연간 이자비용', value: formatWon(result.annualInterest) },
                { label: '연간 순이익', value: formatWon(result.netAnnualIncome), highlight: true },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 5 ? '1px solid #f8fafc' : 'none' }}>
                  <span style={{ fontSize: 13, color: '#64748b' }}>{row.label}</span>
                  <span style={{ fontSize: 13, fontWeight: row.highlight ? 900 : 700, color: row.highlight ? '#1268FB' : '#1e293b' }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
