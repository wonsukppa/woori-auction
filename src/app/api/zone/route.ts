import { NextRequest, NextResponse } from 'next/server';

// ── 용도지역 코드 → 앱 내부 ID 매핑 ──
const ZONE_MAP: Record<string, string> = {
  '제1종전용주거지역': 'r1', '제1종일반주거지역': 'r1',
  '제2종일반주거지역': 'r2', '제2종전용주거지역': 'r2',
  '제3종일반주거지역': 'r3',
  '준주거지역': 'semi',
  '근린상업지역': 'nbiz', '일반상업지역': 'nbiz', '유통상업지역': 'nbiz', '중심상업지역': 'nbiz',
  '준공업지역': 'semi', '일반공업지역': 'semi',
};

// ── 주소 키워드 기반 Mock 추정 (API 키 없을 때 fallback) ──
function mockZoneFromAddress(address: string): { zoneId: string; zoneName: string; source: 'mock' } {
  if (address.includes('상가') || address.includes('상업') || address.includes('명동') || address.includes('강남대로') || address.includes('홍대')) {
    return { zoneId: 'nbiz', zoneName: '근린상업지역', source: 'mock' };
  }
  if (address.includes('준주거') || address.includes('역세권') || address.includes('신림') || address.includes('영등포')) {
    return { zoneId: 'semi', zoneName: '준주거지역', source: 'mock' };
  }
  if (address.includes('3종') || address.includes('은평') || address.includes('마포') || address.includes('성동') || address.includes('광진')) {
    return { zoneId: 'r3', zoneName: '제3종 일반주거지역', source: 'mock' };
  }
  if (address.includes('1종') || address.includes('단독') || address.includes('전원')) {
    return { zoneId: 'r1', zoneName: '제1종 일반주거지역', source: 'mock' };
  }
  // 기본: 제2종 일반주거
  return { zoneId: 'r2', zoneName: '제2종 일반주거지역', source: 'mock' };
}

export async function POST(req: NextRequest) {
  try {
    const { address } = await req.json();
    if (!address) return NextResponse.json({ error: 'address required' }, { status: 400 });

    const vworldKey = process.env.NEXT_PUBLIC_VWORLD_API_KEY;

    // ── VWorld + 국토부 API 호출 (실제 키가 있을 때만) ──
    if (vworldKey) {
      try {
        // 1단계: VWorld Geocoding → 좌표 획득
        const geoRes = await fetch(
          `https://api.vworld.kr/req/address?service=address&request=getcoord&version=2.0&crs=epsg:4326&address=${encodeURIComponent(address)}&refine=true&simple=false&format=json&type=road&key=${vworldKey}`,
          { signal: AbortSignal.timeout(5000) }
        );
        const geoData = await geoRes.json();
        const item = geoData?.response?.result?.items?.[0];

        if (item) {
          const { x: lng, y: lat } = item.point;

          // 2단계: VWorld 필지 조회 → PNU 획득
          const parcelRes = await fetch(
            `https://api.vworld.kr/req/data?service=data&request=GetFeature&data=LP_PA_CBND_BUBUN&key=${vworldKey}&geometry=false&attribute=true&bbox=${parseFloat(lng)-0.001},${parseFloat(lat)-0.001},${parseFloat(lng)+0.001},${parseFloat(lat)+0.001}&size=3&page=1&format=json`,
            { signal: AbortSignal.timeout(5000) }
          );
          const parcelData = await parcelRes.json();
          const pnu = parcelData?.response?.result?.featureCollection?.features?.[0]?.properties?.pnu;

          if (pnu) {
            // 3단계: 국토부 토지이용계획 API → 용도지역 조회
            const lurisKey = process.env.LURIS_API_KEY || process.env.NEXT_PUBLIC_VWORLD_API_KEY || vworldKey;
            const lurisRes = await fetch(
              `https://apis.data.go.kr/1613000/LandUseService/getLandUseInfo?serviceKey=${encodeURIComponent(lurisKey)}&pnu=${pnu}&numOfRows=10&pageNo=1&returnType=json`,
              { signal: AbortSignal.timeout(5000) }
            );
            const lurisData = await lurisRes.json();
            const items = lurisData?.landUseInfo?.item;
            const zoneRaw: string = Array.isArray(items) ? items[0]?.prposAreaDstrcNm : items?.prposAreaDstrcNm;

            if (zoneRaw) {
              const normalized = zoneRaw.replace(/\s/g, '');
              const zoneId = Object.entries(ZONE_MAP).find(([k]) => normalized.includes(k.replace(/\s/g, '')))?.[1] || 'r2';
              return NextResponse.json({ zoneId, zoneName: zoneRaw, source: 'api', pnu, lat, lng });
            }
          }
        }
      } catch (apiErr) {
        console.warn('[zone/route] API call failed, falling back to mock:', apiErr);
      }
    }

    // ── Fallback: Mock ──
    const mock = mockZoneFromAddress(address);
    return NextResponse.json(mock);

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
