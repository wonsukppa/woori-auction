import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { address } = await req.json();
    if (!address) return NextResponse.json({ error: 'address required' }, { status: 400 });

    const vworldKey = process.env.NEXT_PUBLIC_VWORLD_API_KEY;
    const serviceKey = process.env.LURIS_API_KEY;

    if (!vworldKey || !serviceKey) {
      return NextResponse.json({ error: 'API keys missing' }, { status: 500 });
    }

    // 1단계: VWorld Geocoding -> 좌표 및 PNU 획득
    const geoRes = await fetch(
      `https://api.vworld.kr/req/address?service=address&request=getcoord&version=2.0&crs=epsg:4326&address=${encodeURIComponent(address)}&refine=true&format=json&type=road&key=${vworldKey}`
    );
    const geoData = await geoRes.json();
    const point = geoData?.response?.result?.point;

    if (!point) return NextResponse.json({ error: 'Could not find coordinates' }, { status: 404 });

    // 2단계: VWorld 데이터 API -> PNU 획득
    const parcelRes = await fetch(
      `https://api.vworld.kr/req/data?service=data&request=GetFeature&data=LP_PA_CBND_BUBUN&key=${vworldKey}&geometry=false&attribute=true&bbox=${parseFloat(point.x)-0.0001},${parseFloat(point.y)-0.0001},${parseFloat(point.x)+0.0001},${parseFloat(point.y)+0.0001}&size=1&format=json`
    );
    const parcelData = await parcelRes.json();
    const pnu = parcelData?.response?.result?.featureCollection?.features?.[0]?.properties?.pnu;

    if (!pnu) return NextResponse.json({ error: 'Could not find PNU' }, { status: 404 });

    // 3단계: PNU 파싱 (시군구5 + 법정동5 + 산1 + 번4 + 호4)
    const sigunguCd = pnu.substring(0, 5);
    const bjdongCd = pnu.substring(5, 10);
    const bun = pnu.substring(11, 15).replace(/^0+/, '');
    const ji = pnu.substring(15, 19).replace(/^0+/, '');

    // 4단계: 국토부 건축물대장 표제부 조회
    const buildingRes = await fetch(
      `https://apis.data.go.kr/1613000/BldRgstHubService/getBrTitleInfo?serviceKey=${encodeURIComponent(serviceKey)}&sigunguCd=${sigunguCd}&bjdongCd=${bjdongCd}&bun=${bun}&ji=${ji}&numOfRows=10&pageNo=1&_type=json`,
      { signal: AbortSignal.timeout(5000) }
    );
    
    const buildingData = await buildingRes.json();
    const item = buildingData?.response?.body?.items?.item;
    const info = Array.isArray(item) ? item[0] : item;

    if (!info) {
      return NextResponse.json({ message: 'No building data found' }, { status: 200 });
    }

    return NextResponse.json({
      mainPurpsCdNm: info.mainPurpsCdNm || '정보없음', // 주용도
      strctCdNm: info.strctCdNm || '정보없음',         // 구조
      platArea: info.platArea || 0,                 // 대지면적
      archArea: info.archArea || 0,                 // 건축면적
      totArea: info.totArea || 0,                   // 연면적
      useAprvDe: info.useAprvDe || '정보없음',        // 사용승인일
      grndFlrCnt: info.grndFlrCnt || 0,             // 지상층수
      ugndFlrCnt: info.ugndFlrCnt || 0,             // 지하층수
      parkingCount: (info.indrAutoUtcnt || 0) + (info.indrMechUtcnt || 0) + (info.oudrAutoUtcnt || 0) + (info.oudrMechUtcnt || 0), // 총 주차대수
      isIllegal: info.itmsCnt > 0,                  // 위반건축물 여부 (추정)
      pnu
    });

  } catch (err: any) {
    console.error('[building API error]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
