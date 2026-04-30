import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Svg,
  Circle,
  Rect,
  Path,
  Line,
  G,
} from '@react-pdf/renderer';
import { AuctionProperty } from '../../types/auction';
import path from 'path';

// ─── 폰트 등록 (한글 완벽 지원) ────────────────────────────────────────────────
const fontPath = path.join(process.cwd(), 'public', 'fonts', 'NotoSansKR-Regular.ttf');
const fontBoldPath = path.join(process.cwd(), 'public', 'fonts', 'NotoSansKR-Bold.ttf');

Font.register({
  family: 'NotoSansKR',
  fonts: [
    { src: fontPath, fontWeight: 400 },
    { src: fontBoldPath, fontWeight: 700 },
  ],
});

// ─── 스타일 정의 ─────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  page: {
    fontFamily: 'NotoSansKR',
    backgroundColor: '#ffffff',
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 42,
    fontSize: 9,
    color: '#1e293b',
    position: 'relative',
  },
  // 워터마크
  watermark: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.04,
    zIndex: 0,
  },
  // 헤더
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderBottomWidth: 3,
    borderBottomColor: '#1268FB',
    paddingBottom: 10,
    marginBottom: 18,
  },
  headerLogo: {
    fontSize: 20,
    fontWeight: 700,
    color: '#1268FB',
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 9,
    color: '#64748b',
    fontWeight: 400,
    marginTop: 2,
  },
  headerDate: {
    fontSize: 8,
    color: '#94a3b8',
    textAlign: 'right',
  },
  // 물건 정보
  caseTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: '#0f172a',
    marginBottom: 4,
  },
  caseAddress: {
    fontSize: 10,
    color: '#475569',
    marginBottom: 16,
  },
  // AI 확신 지수 카드
  scoreCard: {
    backgroundColor: '#1268FB',
    borderRadius: 14,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  scoreLeft: {
    flexDirection: 'column',
  },
  scoreLabelText: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: 400,
    marginBottom: 4,
  },
  scoreNumberText: {
    fontSize: 52,
    fontWeight: 700,
    color: '#ffffff',
    lineHeight: 1,
  },
  scoreUnit: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: 400,
  },
  gradeBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  gradeBadgeText: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: 700,
  },
  // 2열 정보 그리드
  grid2: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  card: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardLabel: {
    fontSize: 8,
    color: '#94a3b8',
    fontWeight: 400,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  cardValue: {
    fontSize: 13,
    fontWeight: 700,
    color: '#0f172a',
  },
  cardValueSub: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 2,
  },
  // 진행 바
  barBg: {
    height: 5,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    marginTop: 6,
    marginBottom: 2,
  },
  barFill: {
    height: 5,
    borderRadius: 3,
  },
  // ROI 시뮬레이션 섹션
  roiCard: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },
  roiTitle: {
    fontSize: 9,
    color: '#94a3b8',
    fontWeight: 400,
    marginBottom: 10,
  },
  roiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  roiRowLast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    marginTop: 4,
    alignItems: 'flex-end',
  },
  roiLabel: {
    fontSize: 8,
    color: '#94a3b8',
  },
  roiValue: {
    fontSize: 9,
    color: '#e2e8f0',
    fontWeight: 700,
  },
  roiProfit: {
    fontSize: 20,
    fontWeight: 700,
  },
  roiRate: {
    fontSize: 9,
    fontWeight: 700,
  },
  // 예측 박스
  predRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  predBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 6,
    padding: 8,
    alignItems: 'center',
  },
  predYear: {
    fontSize: 8,
    color: '#94a3b8',
    marginBottom: 4,
  },
  predVal: {
    fontSize: 11,
    fontWeight: 700,
    color: '#34d399',
  },
  // AI 판정
  verdictBox: {
    backgroundColor: '#eff6ff',
    borderLeftWidth: 4,
    borderLeftColor: '#1268FB',
    padding: 14,
    borderRadius: 8,
    marginBottom: 14,
  },
  verdictTitle: {
    fontSize: 9,
    fontWeight: 700,
    color: '#1268FB',
    marginBottom: 6,
  },
  verdictText: {
    fontSize: 9,
    color: '#334155',
    lineHeight: 1.7,
    fontWeight: 400,
  },
  // 푸터
  footer: {
    position: 'absolute',
    bottom: 28,
    left: 42,
    right: 42,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 0.5,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
  },
  footerText: {
    fontSize: 7,
    color: '#94a3b8',
    lineHeight: 1.6,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 700,
    color: '#475569',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
});

// ─── 유틸 함수 ───────────────────────────────────────────────────────────────
const formatOk = (n: number) => `${(n / 100000000).toFixed(2)}억`;
const today = () => new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

function getGrade(score: number) {
  if (score >= 95) return '👑 S등급 (최상위 특수 물건)';
  if (score >= 85) return '⭐ A등급 (강력 추천)';
  if (score >= 70) return '✅ B등급 (긍정적)';
  return '⚠️ C등급 (주의 요망)';
}

// ─── SVG 워터마크 ─────────────────────────────────────────────────────────────
function WatermarkSvg() {
  const marks = [];
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 4; col++) {
      marks.push({ x: col * 160 + 40, y: row * 120 + 40 });
    }
  }
  return (
    <Svg style={S.watermark} viewBox="0 0 595 842">
      {marks.map((m, i) => (
        <G key={i} transform={`translate(${m.x}, ${m.y}) rotate(-30)`}>
          <Text
            style={{ fontSize: 14, fill: '#1268FB', fontFamily: 'NotoSansKR' }}
            x={0}
            y={0}
          >
            우리옥션 AI MASTER
          </Text>
        </G>
      ))}
    </Svg>
  );
}

// ─── SVG 직인 ────────────────────────────────────────────────────────────────
function StampSvg() {
  return (
    <Svg viewBox="0 0 100 100" style={{ width: 80, height: 80 }}>
      {/* 외부 원 */}
      <Circle cx="50" cy="50" r="46" stroke="#dc2626" strokeWidth="2.5" fill="none" />
      {/* 내부 원 */}
      <Circle cx="50" cy="50" r="38" stroke="#dc2626" strokeWidth="1" fill="none" />
      {/* 가로 중간선 */}
      <Line x1="12" y1="50" x2="88" y2="50" stroke="#dc2626" strokeWidth="0.8" />
      {/* 위쪽 텍스트: 우리옥션 */}
      <Text style={{ fontSize: 11, fill: '#dc2626', fontFamily: 'NotoSansKR', fontWeight: 700 }} x="50" y="36" textAnchor="middle">
        우리옥션
      </Text>
      {/* 중간 텍스트: AI MASTER */}
      <Text style={{ fontSize: 8, fill: '#dc2626', fontFamily: 'NotoSansKR', fontWeight: 400 }} x="50" y="47" textAnchor="middle">
        AI MASTER
      </Text>
      {/* 아래쪽 텍스트: 분석 확인 */}
      <Text style={{ fontSize: 10, fill: '#dc2626', fontFamily: 'NotoSansKR', fontWeight: 700 }} x="50" y="65" textAnchor="middle">
        분석 확인
      </Text>
      {/* 날짜 */}
      <Text style={{ fontSize: 6, fill: '#dc2626', fontFamily: 'NotoSansKR', fontWeight: 400 }} x="50" y="76" textAnchor="middle">
        {today()}
      </Text>
    </Svg>
  );
}

// ─── 진행 바 컴포넌트 ─────────────────────────────────────────────────────────
function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <View style={S.barBg}>
      <View style={[S.barFill, { width: `${value}%`, backgroundColor: color }]} />
    </View>
  );
}

// ─── 메인 문서 컴포넌트 ─────────────────────────────────────────────────────
interface Props {
  property: AuctionProperty;
  bidPrice?: number;
}

export default function AuctionReportDocument({ property, bidPrice }: Props) {
  const bid = bidPrice || property.minPrice;
  const incidentalCost = bid * 0.052;
  const netProfit = property.marketPrice - bid - incidentalCost;
  const roi = (netProfit / bid) * 100;
  const isProfit = netProfit > 0;

  const predictions = [
    { years: 1, rate: 1.035 },
    { years: 3, rate: 1.108 },
    { years: 5, rate: 1.187 },
  ].map(p => ({
    years: p.years,
    profit: property.marketPrice * p.rate - bid - incidentalCost,
  }));

  return (
    <Document>
      <Page size="A4" style={S.page}>
        {/* 워터마크 (배경) */}
        <WatermarkSvg />

        {/* ── 헤더 ── */}
        <View style={S.header}>
          <View>
            <Text style={S.headerLogo}>우리옥션 AI MASTER</Text>
            <Text style={S.headerSub}>AI 부동산 정밀 분석 리포트</Text>
          </View>
          <View>
            <Text style={S.headerDate}>발행일: {today()}</Text>
            <Text style={S.headerDate}>보고서 번호: {property.caseNo}</Text>
          </View>
        </View>

        {/* ── 물건 기본 정보 ── */}
        <Text style={S.caseTitle}>{property.caseNo}</Text>
        <Text style={S.caseAddress}>📍 {property.address} · {property.type}</Text>

        {/* ── AI 확신 지수 카드 ── */}
        <View style={S.scoreCard}>
          <View style={S.scoreLeft}>
            <Text style={S.scoreLabelText}>AI 투자 확신 지수</Text>
            <Text style={S.scoreNumberText}>
              {property.analysis.score}
              <Text style={S.scoreUnit}> / 100</Text>
            </Text>
            <View style={S.gradeBadge}>
              <Text style={S.gradeBadgeText}>{getGrade(property.analysis.score)}</Text>
            </View>
          </View>
          <View style={{ alignItems: 'center', gap: 12 }}>
            {/* 핵심 수치 우측 배치 */}
            <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: 12, minWidth: 120, alignItems: 'center' }}>
              <Text style={{ fontSize: 8, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>최저 매각가</Text>
              <Text style={{ fontSize: 14, fontWeight: 700, color: '#ffffff' }}>{formatOk(property.minPrice)}</Text>
            </View>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: 12, minWidth: 120, alignItems: 'center' }}>
              <Text style={{ fontSize: 8, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>인근 시세</Text>
              <Text style={{ fontSize: 14, fontWeight: 700, color: '#ffffff' }}>{formatOk(property.marketPrice)}</Text>
            </View>
          </View>
        </View>

        {/* ── 상세 분석 지표 2열 그리드 ── */}
        <Text style={S.sectionTitle}>상세 분석 지표</Text>
        <View style={S.grid2}>
          <View style={S.card}>
            <Text style={S.cardLabel}>수익성 지수</Text>
            <ProgressBar value={property.analysis.profitScore} color="#1268FB" />
            <Text style={S.cardValue}>{property.analysis.profitScore}점</Text>
          </View>
          <View style={S.card}>
            <Text style={S.cardLabel}>권리/안전성 지수</Text>
            <ProgressBar value={property.analysis.safetyScore} color="#059669" />
            <Text style={S.cardValue}>{property.analysis.safetyScore}점</Text>
          </View>
        </View>
        <View style={S.grid2}>
          <View style={S.card}>
            <Text style={S.cardLabel}>교통 환경</Text>
            <Text style={S.cardValue}>{property.analysis.subwayInfo || '정보 없음'}</Text>
          </View>
          <View style={S.card}>
            <Text style={S.cardLabel}>교육 학군</Text>
            <Text style={S.cardValue}>{property.analysis.schoolInfo || '정보 없음'}</Text>
          </View>
        </View>

        {/* ── ROI 시뮬레이션 ── */}
        <Text style={[S.sectionTitle, { marginTop: 4 }]}>투자 수익률 시뮬레이션 (입찰가 기준)</Text>
        <View style={S.roiCard}>
          <Text style={S.roiTitle}>📊 AI 예상 투자 수익률 (ROI) — 입찰가: {formatOk(bid)}</Text>
          <View style={S.roiRow}>
            <Text style={S.roiLabel}>예상 매도 시세</Text>
            <Text style={S.roiValue}>{formatOk(property.marketPrice)}</Text>
          </View>
          <View style={S.roiRow}>
            <Text style={S.roiLabel}>입찰가</Text>
            <Text style={S.roiValue}>- {formatOk(bid)}</Text>
          </View>
          <View style={S.roiRow}>
            <Text style={S.roiLabel}>부대비용 (취득세 등 5.2%)</Text>
            <Text style={S.roiValue}>- {(incidentalCost / 10000000).toFixed(1)}천만원</Text>
          </View>
          <View style={S.roiRowLast}>
            <Text style={{ fontSize: 9, color: '#cbd5e1', fontWeight: 700 }}>즉시 매도 시 순수익</Text>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[S.roiProfit, { color: isProfit ? '#34d399' : '#f87171' }]}>
                {isProfit ? '+' : ''}{formatOk(netProfit)}
              </Text>
              <Text style={[S.roiRate, { color: isProfit ? '#34d399' : '#f87171' }]}>
                즉시 마진율 {roi.toFixed(1)}%
              </Text>
            </View>
          </View>
          {/* 보유 기간별 예측 */}
          <View style={S.predRow}>
            {predictions.map(p => (
              <View key={p.years} style={S.predBox}>
                <Text style={S.predYear}>{p.years}년 후 매도</Text>
                <Text style={[S.predVal, { color: p.profit > 0 ? '#34d399' : '#f87171' }]}>
                  +{formatOk(p.profit)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── AI 종합 판정 ── */}
        <View style={S.verdictBox}>
          <Text style={S.verdictTitle}>✦ AI 종합 판정</Text>
          <Text style={S.verdictText}>{property.analysis.verdict}</Text>
        </View>

        {/* ── 푸터 + 직인 ── */}
        <View style={S.footer}>
          <Text style={S.footerText}>
            본 리포트는 우리옥션 AI v25.0 분석 엔진에 의해 자동 생성되었습니다.{'\n'}
            분석 결과는 참고용이며 최종 투자의 책임은 본인에게 있습니다.{'\n'}
            © 2026 우리옥션(WooriAuction). All rights reserved.
          </Text>
          <StampSvg />
        </View>
      </Page>
    </Document>
  );
}
