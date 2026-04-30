import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer, Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import React from 'react';
import path from 'path';
import fs from 'fs';
import { AuctionProperty } from '../../../types/auction';

// ─── 리소스 로드 ─────────────────────────────────────────────────────────────
const publicDir = path.join(process.cwd(), 'public');
const fontDir   = path.join(publicDir, 'fonts');

const getAsset = (name: string) => {
  try {
    const p = path.join(publicDir, name);
    return fs.existsSync(p) ? fs.readFileSync(p) : null;
  } catch { return null; }
};

const stampImg = getAsset('stamp.png');
const wmImg    = getAsset('watermark.png');

Font.register({
  family: 'GlobalFont',
  fonts: [
    { src: path.join(fontDir, 'NotoSansKR-Regular.ttf'), fontWeight: 400 },
    { src: path.join(fontDir, 'NotoSansKR-Bold.ttf'),    fontWeight: 700 },
  ],
});

// ─── 고밀도 고선명 프리미엄 디자인 (Overlap & Sharpness Fix) ──────────────────
const S = StyleSheet.create({
  page: {
    fontFamily: 'GlobalFont',
    backgroundColor: '#ffffff',
    padding: 40,
    fontSize: 10,
    color: '#000000',
  },
  background: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 },
  watermark: { position: 'absolute', top: '30%', left: '20%', width: '60%', opacity: 0.01 },
  
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    borderBottomWidth: 3, borderBottomColor: '#0000FF', paddingBottom: 10, marginBottom: 20,
  },
  headerLogo: { fontSize: 22, fontWeight: 700, color: '#0000FF' },
  headerSub: { fontSize: 8.5, color: '#000000', marginTop: 3, fontWeight: 700 },
  headerMeta: { textAlign: 'right' },
  metaText: { fontSize: 8, color: '#000000' },
  
  titleArea: { marginBottom: 15 },
  caseNo: { fontSize: 32, fontWeight: 700, color: '#000000', marginBottom: 5 },
  address: { fontSize: 13, color: '#000000', fontWeight: 400 },

  // 대시보드 (여백 대폭 확보하여 겹침 방지)
  dashboard: {
    backgroundColor: '#F0F4FF',
    borderRadius: 15,
    flexDirection: 'row',
    paddingVertical: 30, // 패딩 늘림
    paddingHorizontal: 25,
    marginBottom: 25,
    borderWidth: 1.5,
    borderColor: '#0000FF',
  },
  dashLeft: {
    flex: 1,
    borderRightWidth: 1.5,
    borderRightColor: '#D0D0FF',
    paddingRight: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreLabel: { fontSize: 9, color: '#0000FF', marginBottom: 10, fontWeight: 700 },
  scoreGroup: { 
    flexDirection: 'row', 
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginBottom: 15, // 아래 등급 배지와의 간격 확보
  },
  scoreValue: { 
    fontSize: 70, 
    fontWeight: 700, 
    color: '#0000FF', 
    lineHeight: 1,
    marginRight: 10, // /100 과의 간격 확보
  },
  scoreMax: { 
    fontSize: 18, 
    color: '#0000FF', 
    marginBottom: 10, // 아래선에 맞춤
  },
  
  gradeBadge: {
    marginTop: 10, // 스코어 그룹과의 확실한 분리
    backgroundColor: '#0000FF',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 7,
  },
  gradeText: { fontSize: 12, color: '#ffffff', fontWeight: 700 },
  
  dashRight: {
    flex: 1, paddingLeft: 25, justifyContent: 'center', gap: 12,
  },
  metricBox: {
    backgroundColor: '#ffffff', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#0000FF',
  },
  metricLabel: { fontSize: 9, color: '#000000', marginBottom: 4, fontWeight: 700 },
  metricValue: { fontSize: 16, fontWeight: 700, color: '#000000' },

  // 섹션
  sectionTitle: {
    fontSize: 13, fontWeight: 700, color: '#000000', marginBottom: 15, borderLeftWidth: 5, borderLeftColor: '#0000FF', paddingLeft: 10,
  },
  grid2: { flexDirection: 'row', gap: 15, marginBottom: 15 },
  card: {
    flex: 1, backgroundColor: '#ffffff', borderRadius: 12, padding: 15, borderWidth: 1, borderColor: '#E0E0E0',
  },
  cardLabel: { fontSize: 9, color: '#000000', fontWeight: 700, marginBottom: 8 },
  cardValue: { fontSize: 15, fontWeight: 700, color: '#000000' },
  barBg: { height: 8, backgroundColor: '#EEEEEE', borderRadius: 4, marginTop: 8, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },

  // ROI
  roiBox: {
    backgroundColor: '#ffffff', borderRadius: 15, borderWidth: 2, borderColor: '#0000FF', padding: 25, marginBottom: 30,
  },
  roiHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 15, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#E0E0E0',
  },
  roiRow: {
    flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  roiLabel: { fontSize: 11, color: '#000000', fontWeight: 700 },
  roiVal: { fontSize: 12, fontWeight: 700, color: '#000000' },
  roiTotal: {
    flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, paddingTop: 15, borderTopWidth: 3, borderTopColor: '#0000FF', alignItems: 'flex-end',
  },
  roiProfit: { fontSize: 32, fontWeight: 700 },

  // 판정 박스
  verdictBox: {
    backgroundColor: '#F0F5FF', borderRadius: 12, padding: 25, borderLeftWidth: 8, borderLeftColor: '#0000FF', marginBottom: 40,
  },
  verdictText: { fontSize: 11, color: '#000000', lineHeight: 2.0, textAlign: 'justify' },

  // 푸터
  footer: {
    marginTop: 'auto', borderTopWidth: 2, borderTopColor: '#000000', paddingTop: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  footerNote: { fontSize: 9, color: '#000000', lineHeight: 1.6, fontWeight: 700 },
  stamp: { width: 90, height: 90 },
});

// ─── 유틸리티 ────────────────────────────────────────────────────────────────
const t = (s: any) => {
  if (s === undefined || s === null) return " ";
  return " " + String(s).normalize('NFC');
};

const fW = (v: number) => {
  const e = Math.floor(v / 100000000);
  const m = Math.floor((v % 100000000) / 10000);
  let res = "";
  if (e > 0) res += e.toLocaleString() + "억 ";
  if (m > 0) res += m.toLocaleString();
  res += "만원";
  return t(res);
};

// ─── 문서 조립 ──────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const p = body.property as AuctionProperty;
    const bid = body.bidPrice || p.minPrice;
    
    if (!p) return NextResponse.json({ error: "No data" }, { status: 400 });

    const tax = bid * 0.052;
    const profit = p.marketPrice - bid - tax;
    const roi = (profit / bid) * 100;
    const isPos = profit > 0;
    const gradeTxt = p.analysis.score >= 90 ? "S등급 (최우수 특수물건)" : p.analysis.score >= 80 ? "A등급 (강력 추천)" : "B등급 (투자 적격)";

    const E = React.createElement;

    const doc = E(Document, { title: "우리옥션 AI 분석 리포트" },
      // ── Page 1 ──
      E(Page, { size: "A4", style: S.page },
        wmImg && E(View, { style: S.background, fixed: true }, E(Image, { src: wmImg, style: S.watermark })),
        
        E(View, { style: S.header },
          E(View, null,
            E(Text, { style: S.headerLogo }, t("우리옥션 AI MASTER")),
            E(Text, { style: S.headerSub }, t("OFFICIAL PROPERTY ANALYSIS REPORT")),
          ),
          E(View, { style: S.headerMeta },
            E(Text, { style: S.metaText }, t(`발행일: ${new Date().toLocaleDateString('ko-KR')}`)),
            E(Text, { style: S.metaText }, t(`사건번호: ${p.caseNo}`)),
          ),
        ),

        E(View, { style: S.titleArea },
          E(Text, { style: S.caseNo }, t(p.caseNo)),
          E(Text, { style: S.address }, t(`주소: ${p.address} | 용도: ${p.type}`)),
        ),

        // 겹침 해결된 스코어보드
        E(View, { style: S.dashboard },
          E(View, { style: S.dashLeft },
            E(Text, { style: S.scoreLabel }, t("AI INVESTMENT SCORE")),
            E(View, { style: S.scoreGroup },
              E(Text, { style: S.scoreValue }, t(p.analysis.score)),
              E(Text, { style: S.scoreMax }, t("/ 100")),
            ),
            E(View, { style: S.gradeBadge }, 
              E(Text, { style: S.gradeText }, t(gradeTxt))
            ),
          ),
          E(View, { style: S.dashRight },
            E(View, { style: S.metricBox },
              E(Text, { style: S.metricLabel }, t("최저 매각가")),
              E(Text, { style: S.metricValue }, fW(p.minPrice)),
            ),
            E(View, { style: S.metricBox },
              E(Text, { style: S.metricLabel }, t("인근 예상 시세")),
              E(Text, { style: S.metricValue }, fW(p.marketPrice)),
            ),
          ),
        ),

        E(Text, { style: S.sectionTitle }, t("상세 분석 지표")),
        E(View, { style: S.grid2 },
          E(View, { style: S.card },
            E(Text, { style: S.cardLabel }, t("수익성 분석 (Profitability Analysis)")),
            E(Text, { style: S.cardValue }, t(`${p.analysis.profitScore} 점`)),
            E(View, { style: S.barBg }, E(View, { style: [S.barFill, { width: `${p.analysis.profitScore}%`, backgroundColor: '#0000FF' }] })),
          ),
          E(View, { style: S.card },
            E(Text, { style: S.cardLabel }, t("안전성 분석 (Safety Analysis)")),
            E(Text, { style: S.cardValue }, t(`${p.analysis.safetyScore} 점`)),
            E(View, { style: S.barBg }, E(View, { style: [S.barFill, { width: `${p.analysis.safetyScore}%`, backgroundColor: '#00CC66' }] })),
          ),
        ),
        E(View, { style: S.grid2 },
          E(View, { style: S.card },
            E(Text, { style: S.cardLabel }, t("교통 인프라")),
            E(Text, { style: S.cardValue }, t(p.analysis.subwayInfo || '정보 없음')),
          ),
          E(View, { style: S.card },
            E(Text, { style: S.cardLabel }, t("주거 및 교육환경")),
            E(Text, { style: S.cardValue }, t(p.analysis.schoolInfo || '정보 없음')),
          ),
        ),
      ),

      // ── Page 2 ──
      E(Page, { size: "A4", style: S.page },
        wmImg && E(View, { style: S.background, fixed: true }, E(Image, { src: wmImg, style: S.watermark })),

        E(Text, { style: S.sectionTitle }, t("투자 수익 시뮬레이션")),
        E(View, { style: S.roiBox },
          E(View, { style: S.roiHeader },
            E(Text, { style: { fontSize: 11, fontWeight: 700 } }, t("[AI 예상 투자 데이터 분석]")),
            E(Text, { style: { fontSize: 10, color: '#0000FF', fontWeight: 700 } }, t(`입찰 예정가: ${fW(bid)}`)),
          ),
          E(View, { style: S.roiRow }, E(Text, { style: S.roiLabel }, t("예상 매도 시세")), E(Text, { style: S.roiVal }, fW(p.marketPrice))),
          E(View, { style: S.roiRow }, E(Text, { style: S.roiLabel }, t("매수 예정가 (입찰가)")), E(Text, { style: S.roiVal }, t(`- ${fW(bid)}`))),
          E(View, { style: S.roiRow }, E(Text, { style: S.roiLabel }, t("취득 부대비용 (약 5.2%)")), E(Text, { style: S.roiVal }, t(`- ${fW(Math.round(tax))}`))),
          E(View, { style: S.roiTotal },
            E(Text, { style: { fontSize: 14, fontWeight: 700 } }, t("순수익 (즉시 매도 시)")),
            E(View, { style: { alignItems: 'flex-end' } },
              E(Text, { style: [S.roiProfit, { color: isPos ? '#009900' : '#FF0000' }] }, t(`${isPos ? '+' : ''}${fW(profit)}`)),
              E(Text, { style: { fontSize: 12, fontWeight: 700, color: isPos ? '#009900' : '#FF0000', marginTop: 5 } }, t(`수익률 ${roi.toFixed(1)}%`)),
            ),
          ),
        ),

        E(View, { style: { marginBottom: 20 } },
          E(Text, { style: S.sectionTitle }, t("AI MASTER 종합 분석 의견")),
          E(View, { style: S.verdictBox },
            E(Text, { style: S.verdictText }, t(p.analysis.verdict)),
          ),
        ),

        E(View, { style: S.footer },
          E(View, null,
            E(Text, { style: { fontSize: 11, fontWeight: 700, color: '#000000', marginBottom: 5 } }, t("우리옥션 (WooriAuction) Spatial Intelligence")),
            E(Text, { style: S.footerNote }, t("본 리포트는 인공지능 분석 데이터이며 법적 효력이 없습니다.\n최종 투자의 결정은 본인에게 있으며 본 리포트는 참고용으로만 사용하십시오.\n© 2026 WooriAuction. All rights reserved.")),
          ),
          stampImg && E(Image, { src: stampImg, style: S.stamp }),
        ),
      ),
    );

    const pdf = await renderToBuffer(doc);
    return new NextResponse(pdf, {
      status: 200,
      headers: { 'Content-Type': 'application/pdf' },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
