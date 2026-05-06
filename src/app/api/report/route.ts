import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer, Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import React from 'react';
import path from 'path';
import fs from 'fs';
import { AuctionProperty } from '../../../types/auction';

const publicDir = path.join(process.cwd(), 'public');
const fontDir   = path.join(publicDir, 'fonts');
const getAsset  = (n: string) => { try { const p = path.join(publicDir, n); return fs.existsSync(p) ? fs.readFileSync(p) : null; } catch { return null; } };
const stampImg  = getAsset('stamp.png');

Font.register({
  family: 'GF',
  fonts: [
    { src: path.join(fontDir, 'NotoSansKR-Regular.ttf'), fontWeight: 400 },
    { src: path.join(fontDir, 'NotoSansKR-Bold.ttf'),    fontWeight: 700 },
  ],
});

// ── 프리미엄 모던 라이트 컬러 토큰 ──
const C = { 
  primary: '#2563EB',      // 모던 블루
  primaryBg: '#EFF6FF',    // 아주 연한 블루 배경
  accent: '#059669',       // 신뢰감 있는 에메랄드 그린
  accentBg: '#ECFDF5',
  red: '#E11D48',          // 명확한 로즈 레드
  textDark: '#0F172A',     // 진한 슬레이트 (거의 검정)
  textMid: '#475569',      // 중간 슬레이트
  textLight: '#94A3B8',    // 연한 슬레이트
  border: '#E2E8F0',       // 경계선
  bgGray: '#F8FAFC',       // 박스 배경용 아주 연한 회색
  white: '#FFFFFF' 
};

const S = StyleSheet.create({
  page:   { fontFamily: 'GF', backgroundColor: C.white, padding: '36 44', fontSize: 10, color: C.textDark },

  // ── 공통 헤더 ──
  hdr:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', borderBottomWidth: 1.5, borderBottomColor: C.primary, paddingBottom: 10, marginBottom: 20 },
  hLogo:  { fontSize: 16, fontWeight: 700, color: C.primary, letterSpacing: -0.5 },
  hSub:   { fontSize: 8, color: C.textMid, marginTop: 4, fontWeight: 700, letterSpacing: 0.5 },
  hMeta:  { textAlign: 'right' },
  hMetaT: { fontSize: 8, color: C.textLight, marginBottom: 2 },

  // ── 표지 타이틀 (블랙 박스 제거, 세련된 타이포 중심) ──
  coverBox:  { backgroundColor: C.bgGray, borderRadius: 12, padding: '24 30', marginBottom: 24, borderWidth: 1, borderColor: C.border },
  coverCase: { fontSize: 28, fontWeight: 700, color: C.textDark, marginBottom: 8, letterSpacing: -1 },
  coverAddr: { fontSize: 11, color: C.textMid, fontWeight: 400, marginBottom: 8 },
  coverType: { fontSize: 10, color: C.primary, fontWeight: 700 },

  // ── 스코어 대시보드 ──
  dash:   { flexDirection: 'row', borderRadius: 12, marginBottom: 24, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  dashL:  { width: '40%', backgroundColor: C.primaryBg, padding: '24 20', alignItems: 'center', justifyContent: 'center', borderRightWidth: 1, borderRightColor: C.border },
  dashR:  { flex: 1, padding: '20 24', gap: 12, backgroundColor: C.white },
  scoreLbl: { fontSize: 9, color: C.primary, fontWeight: 700, marginBottom: 12, letterSpacing: 1 },
  scoreValWrap: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 16 },
  scoreN: { fontSize: 64, fontWeight: 700, color: C.primary, lineHeight: 1, letterSpacing: -2 },
  scoreD: { fontSize: 16, color: C.primary, fontWeight: 700, marginLeft: 2 },
  badge:  { backgroundColor: C.primary, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 6 },
  badgeT: { fontSize: 10, color: C.white, fontWeight: 700 },
  
  mBox:   { backgroundColor: C.bgGray, borderRadius: 8, padding: '12 16', borderWidth: 1, borderColor: C.border },
  mLbl:   { fontSize: 8.5, color: C.textMid, fontWeight: 700, marginBottom: 4 },
  mVal:   { fontSize: 16, fontWeight: 700, color: C.textDark },

  // ── 섹션 ──
  secTitle: { fontSize: 12, fontWeight: 700, color: C.textDark, borderLeftWidth: 3, borderLeftColor: C.primary, paddingLeft: 10, marginBottom: 14 },
  grid2:    { flexDirection: 'row', gap: 12, marginBottom: 12 },
  card:     { flex: 1, backgroundColor: C.white, borderRadius: 10, padding: '16 20', borderWidth: 1, borderColor: C.border },
  cardLbl:  { fontSize: 9, color: C.textMid, fontWeight: 700, marginBottom: 8 },
  cardVal:  { fontSize: 15, fontWeight: 700, color: C.textDark },
  bar:      { height: 4, backgroundColor: C.border, borderRadius: 2, marginTop: 10, overflow: 'hidden' },
  barFill:  { height: '100%', borderRadius: 2 },

  // ── ROI 시뮬레이션 ──
  roiBox:   { borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: '20 24', marginBottom: 20, backgroundColor: C.white },
  roiHdr:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  roiRow:   { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  roiLbl:   { fontSize: 11, fontWeight: 400, color: C.textMid },
  roiVal:   { fontSize: 11, fontWeight: 700, color: C.textDark },
  roiTotal: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTopWidth: 2, borderTopColor: C.textDark, alignItems: 'flex-end' },
  roiProfit:{ fontSize: 32, fontWeight: 700, letterSpacing: -1 },

  // ── 의견 박스 ──
  vBox:  { backgroundColor: C.bgGray, borderRadius: 10, padding: '20 24', borderLeftWidth: 4, borderLeftColor: C.primary, marginBottom: 20 },
  vText: { fontSize: 10.5, color: C.textDark, lineHeight: 1.8 },

  // ── 건축 분석 (Page 3) ──
  archHdr:    { backgroundColor: C.bgGray, borderRadius: 10, padding: '12 16', marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: C.border },
  archHdrT:   { fontSize: 13, fontWeight: 700, color: C.textDark, marginBottom: 4 },
  archHdrS:   { fontSize: 9, color: C.textMid },
  archHdrInfo:{ fontSize: 9, color: C.textMid, textAlign: 'right', lineHeight: 1.5 },
  
  zoneGrid:   { flexDirection: 'row', gap: 10, marginBottom: 12 },
  zoneBox:    { flex: 1, backgroundColor: C.white, borderRadius: 10, padding: '12 0', alignItems: 'center', borderWidth: 1, borderColor: C.border },
  zoneLbl:    { fontSize: 8.5, color: C.textMid, fontWeight: 700, marginBottom: 6 },
  zoneVal:    { fontSize: 18, fontWeight: 700 },
  
  aSection:   { backgroundColor: C.white, borderRadius: 10, padding: '12 16', marginBottom: 10, borderWidth: 1, borderColor: C.border },
  aSectionT:  { fontSize: 11, fontWeight: 700, color: C.textDark, marginBottom: 10 },
  aRow:       { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  aLbl:       { fontSize: 9.5, color: C.textMid, fontWeight: 400 },
  aVal:       { fontSize: 10, fontWeight: 700, color: C.textDark },
  
  archPBox:   { backgroundColor: C.primaryBg, borderRadius: 10, padding: '12 16', marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: C.primary },
  archPLbl:   { fontSize: 10, color: C.primary, fontWeight: 700, marginBottom: 6 },
  archPVal:   { fontSize: 20, fontWeight: 700 },
  archROI:    { fontSize: 30, fontWeight: 700, textAlign: 'right', letterSpacing: -1 },
  archNote:   { fontSize: 8, color: C.textLight, lineHeight: 1.6, marginTop: 8 },

  // ── 푸터 ──
  footer:  { marginTop: 'auto', borderTopWidth: 1, borderTopColor: C.border, paddingTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerN: { fontSize: 9, fontWeight: 700, color: C.textDark, marginBottom: 4 },
  footerS: { fontSize: 8, color: C.textLight, lineHeight: 1.5 },
  stamp:   { width: 64, height: 64, opacity: 0.8 },
});

const t = (s: any) => s === undefined || s === null ? ' ' : ' ' + String(s).normalize('NFC');
const fW = (v: number) => {
  const e = Math.floor(v / 100000000), m = Math.floor((v % 100000000) / 10000);
  return t((e > 0 ? e.toLocaleString() + '억 ' : '') + (m > 0 ? m.toLocaleString() : '') + '만원');
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const p = body.property as AuctionProperty;
    const bid = body.bidPrice || p.minPrice;
    if (!p) return NextResponse.json({ error: 'No data' }, { status: 400 });

    const tax    = bid * 0.052;
    const profit = p.marketPrice - bid - tax;
    const roi    = (profit / bid) * 100;
    const isPos  = profit > 0;
    const grade  = p.analysis.score >= 90 ? 'S등급 (최우수 특수물건)' : p.analysis.score >= 80 ? 'A등급 (강력 추천)' : 'B등급 (투자 적격)';

    // 건축 수지 계산
    const zone       = { label: '제2종 일반주거', coverage: 60, far: 200, parkBase: 120, constCost: 750 };
    const landM2     = p.area || 100;
    const maxFloor   = landM2 * (zone.coverage / 100);
    const maxGFA     = landM2 * (zone.far / 100);
    const maxGFAPy   = maxGFA * 0.3025;
    const estFloors  = Math.max(2, Math.ceil(zone.far / zone.coverage));
    const parkCount  = Math.max(1, Math.ceil(maxGFA / zone.parkBase));
    const isFiloti   = parkCount > 3;
    const totalConst = Math.round(maxGFAPy * zone.constCost * 10000);
    const totalProj  = bid + totalConst;
    const estSale    = (p.marketPrice / (landM2 * 0.3025)) * maxGFAPy * 0.85;
    const devProfit  = estSale - totalProj;
    const devROI     = (devProfit / totalProj) * 100;

    const E = React.createElement;

    const PageHeader = (subtitle: string) => E(View, { style: S.hdr },
      E(View, null,
        E(Text, { style: S.hLogo }, t('우리옥션 AI MASTER')),
        E(Text, { style: S.hSub  }, t(subtitle)),
      ),
      E(View, { style: S.hMeta },
        E(Text, { style: S.hMetaT }, t(`발행일: ${new Date().toLocaleDateString('ko-KR')}`)),
        E(Text, { style: S.hMetaT }, t(`사건번호: ${p.caseNo}`)),
      ),
    );

    const PageFooter = () => E(View, { style: S.footer },
      E(View, null,
        E(Text, { style: S.footerN }, t('우리옥션 (WooriAuction) Spatial Intelligence')),
        E(Text, { style: S.footerS }, t('본 리포트는 AI 분석 데이터이며 법적 효력이 없습니다. 최종 투자 결정은 본인에게 있습니다.\n© 2026 WooriAuction. All rights reserved.')),
      ),
      stampImg ? E(Image, { src: stampImg, style: S.stamp }) : E(View, null),
    );

    const doc = E(Document, { title: '우리옥션 AI 분석 리포트' },

      // ════════════════════════════════════════
      // Page 1 · AI 분석 + 핵심 지표
      // ════════════════════════════════════════
      E(Page, { size: 'A4', style: S.page },
        PageHeader('OFFICIAL PROPERTY ANALYSIS REPORT — AI 물건 분석'),

        // 물건 타이틀 (세련된 라이트 그레이 박스)
        E(View, { style: S.coverBox },
          E(Text, { style: S.coverCase }, t(p.caseNo)),
          E(Text, { style: S.coverAddr }, t(`주소: ${p.address}`)),
          E(Text, { style: S.coverType }, t(`용도: ${p.type}  |  면적: ${p.area}㎡ (${(p.area * 0.3025).toFixed(1)}평)`)),
        ),

        // 스코어 대시보드
        E(View, { style: S.dash },
          E(View, { style: S.dashL },
            E(Text, { style: S.scoreLbl }, t('AI INVESTMENT SCORE')),
            E(View, { style: S.scoreValWrap },
              E(Text, { style: S.scoreN }, t(p.analysis.score)),
              E(Text, { style: S.scoreD }, t('/100')),
            ),
            E(View, { style: S.badge }, E(Text, { style: S.badgeT }, t(grade))),
          ),
          E(View, { style: S.dashR },
            E(View, { style: S.mBox },
              E(Text, { style: S.mLbl }, t('최저 매각가')),
              E(Text, { style: S.mVal }, fW(p.minPrice)),
            ),
            E(View, { style: S.mBox },
              E(Text, { style: S.mLbl }, t('인근 예상 시세')),
              E(Text, { style: S.mVal }, fW(p.marketPrice)),
            ),
          ),
        ),

        // 분석 지표 그리드
        E(Text, { style: S.secTitle }, t('상세 분석 지표')),
        E(View, { style: S.grid2 },
          E(View, { style: S.card },
            E(Text, { style: S.cardLbl }, t('수익성 (Profitability)')),
            E(Text, { style: S.cardVal }, t(`${p.analysis.profitScore}점`)),
            E(View, { style: S.bar }, E(View, { style: [S.barFill, { width: `${p.analysis.profitScore}%`, backgroundColor: C.primary }] })),
          ),
          E(View, { style: S.card },
            E(Text, { style: S.cardLbl }, t('안전성 (Safety)')),
            E(Text, { style: S.cardVal }, t(`${p.analysis.safetyScore}점`)),
            E(View, { style: S.bar }, E(View, { style: [S.barFill, { width: `${p.analysis.safetyScore}%`, backgroundColor: C.accent }] })),
          ),
        ),
        E(View, { style: S.grid2 },
          E(View, { style: S.card },
            E(Text, { style: S.cardLbl }, t('교통 인프라')),
            E(Text, { style: [S.cardVal, { fontSize: 11, color: C.textMid, fontWeight: 400 }] }, t(p.analysis.subwayInfo || '정보 없음')),
          ),
          E(View, { style: S.card },
            E(Text, { style: S.cardLbl }, t('주거·교육 환경')),
            E(Text, { style: [S.cardVal, { fontSize: 11, color: C.textMid, fontWeight: 400 }] }, t(p.analysis.schoolInfo || '정보 없음')),
          ),
        ),

        PageFooter(),
      ),

      // ════════════════════════════════════════
      // Page 2 · 투자 수익 시뮬레이션 + AI 의견
      // ════════════════════════════════════════
      E(Page, { size: 'A4', style: S.page },
        PageHeader('INVESTMENT ROI SIMULATION — 투자 수익 분석'),

        E(Text, { style: S.secTitle }, t('투자 수익 시뮬레이션')),
        E(View, { style: S.roiBox },
          E(View, { style: S.roiHdr },
            E(Text, { style: { fontSize: 11, fontWeight: 700, color: C.textDark } }, t('[AI 예상 투자 데이터 분석]')),
            E(Text, { style: { fontSize: 11, color: C.primary, fontWeight: 700 } }, t(`입찰 예정가: ${fW(bid)}`)),
          ),
          E(View, { style: S.roiRow },
            E(Text, { style: S.roiLbl }, t('예상 매도 시세')),
            E(Text, { style: S.roiVal }, fW(p.marketPrice)),
          ),
          E(View, { style: S.roiRow },
            E(Text, { style: S.roiLbl }, t('매수 예정가 (입찰가)')),
            E(Text, { style: [S.roiVal, { color: C.red }] }, t(`(-) ${fW(bid)}`)),
          ),
          E(View, { style: S.roiRow },
            E(Text, { style: S.roiLbl }, t('취득 부대비용 (취등록세 등 약 5.2%)')),
            E(Text, { style: [S.roiVal, { color: C.red }] }, t(`(-) ${fW(Math.round(tax))}`)),
          ),
          E(View, { style: S.roiTotal },
            E(Text, { style: { fontSize: 13, fontWeight: 700, color: C.textDark } }, t('순수익 (즉시 매도 시)')),
            E(View, { style: { alignItems: 'flex-end' } },
              E(Text, { style: [S.roiProfit, { color: isPos ? C.accent : C.red }] }, t(`${isPos ? '+' : ''}${fW(profit)}`)),
              E(Text, { style: { fontSize: 12, fontWeight: 700, color: isPos ? C.accent : C.red, marginTop: 4 } }, t(`수익률 ${roi.toFixed(1)}%`)),
            ),
          ),
        ),

        E(Text, { style: S.secTitle }, t('AI MASTER 종합 분석 의견')),
        E(View, { style: S.vBox },
          E(Text, { style: S.vText }, t(p.analysis.verdict)),
        ),

        PageFooter(),
      ),

      // ════════════════════════════════════════
      // Page 3 · 건축 수지 분석 (모던 라이트)
      // ════════════════════════════════════════
      E(Page, { size: 'A4', style: S.page },
        PageHeader('ARCHITECTURE FEASIBILITY REPORT — 건축 수지 분석'),

        // 헤더
        E(View, { style: S.archHdr },
          E(View, null,
            E(Text, { style: S.archHdrT }, t('AI 건축 수지 분석 엔진')),
            E(Text, { style: S.archHdrS }, t(`용도지역: ${zone.label}  |  국토교통부 표준 조례 기준`)),
          ),
          E(Text, { style: S.archHdrInfo }, t(`대지면적\n${landM2.toFixed(0)}㎡ (${(landM2*0.3025).toFixed(0)}평)`)),
        ),

        // 법규 3칸 (라이트 그레이 박스)
        E(View, { style: S.zoneGrid },
          E(View, { style: S.zoneBox },
            E(Text, { style: S.zoneLbl }, t('법정 건폐율')),
            E(Text, { style: [S.zoneVal, { color: C.primary }] }, t(`${zone.coverage}%`)),
          ),
          E(View, { style: S.zoneBox },
            E(Text, { style: S.zoneLbl }, t('법정 용적률')),
            E(Text, { style: [S.zoneVal, { color: '#7C3AED' }] }, t(`${zone.far}%`)),
          ),
          E(View, { style: S.zoneBox },
            E(Text, { style: S.zoneLbl }, t('예상 층수')),
            E(Text, { style: [S.zoneVal, { color: C.accent }] }, t(`지상 ${estFloors}층`)),
          ),
        ),

        // 건축 규모 + 주차 (2열 나란히)
        E(View, { style: { flexDirection: 'row', gap: 12, marginBottom: 12 } },
          E(View, { style: [S.aSection, { flex: 1, marginBottom: 0 }] },
            E(Text, { style: S.aSectionT }, t('건축 가능 규모')),
            E(View, { style: S.aRow }, E(Text, { style: S.aLbl }, t('대지 면적')), E(Text, { style: S.aVal }, t(`${landM2.toFixed(0)}㎡  (${(landM2*0.3025).toFixed(0)}평)`))),
            E(View, { style: S.aRow }, E(Text, { style: S.aLbl }, t('최대 바닥면적')), E(Text, { style: [S.aVal, { color: C.primary }] }, t(`${maxFloor.toFixed(0)}㎡  (${(maxFloor*0.3025).toFixed(0)}평)`))),
            E(View, { style: [S.aRow, { borderBottomWidth: 0 }] }, E(Text, { style: S.aLbl }, t('최대 연면적')), E(Text, { style: [S.aVal, { color: '#7C3AED' }] }, t(`${maxGFA.toFixed(0)}㎡  (${maxGFAPy.toFixed(0)}평)`))),
          ),
          E(View, { style: [S.aSection, { flex: 1, marginBottom: 0, backgroundColor: isFiloti ? '#FFF7ED' : C.accentBg, borderColor: isFiloti ? '#FED7AA' : '#A7F3D0' }] },
            E(Text, { style: [S.aSectionT, { color: isFiloti ? '#C2410C' : '#047857' }] }, t(`법정 주차 대수  ${isFiloti ? '⚠ 필로티 필요' : '✓ 자주식 가능'}`)),
            E(Text, { style: { fontSize: 34, fontWeight: 700, color: isFiloti ? '#EA580C' : '#059669', textAlign: 'center', marginVertical: 12, letterSpacing: -1 } }, t(`${parkCount}대`)),
            E(Text, { style: { fontSize: 8.5, color: isFiloti ? '#9A3412' : '#065F46', textAlign: 'center' } }, t(`연면적 ${maxGFA.toFixed(0)}㎡ ÷ ${zone.parkBase}㎡/대`)),
            isFiloti ? E(Text, { style: { fontSize: 8.5, color: '#9A3412', marginTop: 6, fontWeight: 700, textAlign: 'center' } }, t('→ 1층 필로티 주차 구조 권고')) : E(View, null),
          ),
        ),

        // 개발 수지표
        E(View, { style: S.aSection },
          E(Text, { style: S.aSectionT }, t('개발 사업성 분석 (Profitability)')),
          E(View, { style: { flexDirection: 'row', gap: 0 } },
            E(View, { style: { flex: 1 } },
              E(View, { style: S.aRow }, E(Text, { style: S.aLbl }, t('토지비 (낙찰가)')), E(Text, { style: S.aVal }, fW(bid))),
              E(View, { style: S.aRow }, E(Text, { style: S.aLbl }, t(`총 공사비 (${zone.constCost}만/평 × ${maxGFAPy.toFixed(0)}평)`)), E(Text, { style: [S.aVal, { color: C.red }] }, t(`(-) ${fW(totalConst)}`))),
              E(View, { style: S.aRow }, E(Text, { style: S.aLbl }, t('총 사업비')), E(Text, { style: [S.aVal, { color: C.textMid }] }, fW(totalProj))),
              E(View, { style: [S.aRow, { borderBottomWidth: 0, marginTop: 4 }] }, E(Text, { style: [S.aLbl, { fontWeight: 700, color: C.textDark }] }, t('분양 예상가 (시세기반 ×85%)')), E(Text, { style: [S.aVal, { color: C.primary, fontSize: 12 }] }, fW(Math.round(estSale)))),
            ),
          ),
        ),

        // 개발 ROI (하이라이트 박스)
        E(View, { style: S.archPBox },
          E(View, null,
            E(Text, { style: S.archPLbl }, t('개발 순이익')),
            E(Text, { style: [S.archPVal, { color: devProfit > 0 ? C.accent : C.red }] }, t(`${devProfit > 0 ? '+' : ''}${fW(Math.round(devProfit))}`)),
          ),
          E(View, { style: { alignItems: 'flex-end' } },
            E(Text, { style: { fontSize: 10, color: C.primary, fontWeight: 700, marginBottom: 6 } }, t('개발 ROI')),
            E(Text, { style: [S.archROI, { color: devROI > 0 ? C.accent : C.red }] }, t(`${devROI > 0 ? '+' : ''}${devROI.toFixed(1)}%`)),
          ),
        ),

        E(Text, { style: S.archNote }, t('* 용도지역은 반드시 토지이음(eum.go.kr) 또는 해당 시·군·구청에서 확인하십시오. 본 수치는 국토교통부 표준 조례 기반 AI 예측치로 실제 인허가 결과와 다를 수 있습니다.')),

        PageFooter(),
      ),
    );

    const pdf = await renderToBuffer(doc);
    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: { 'Content-Type': 'application/pdf' },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
