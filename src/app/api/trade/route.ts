import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { address, type } = await req.json();
    if (!address) return NextResponse.json({ error: 'address required' }, { status: 400 });

    const vworldKey = process.env.NEXT_PUBLIC_VWORLD_API_KEY;
    const serviceKey = process.env.LURIS_API_KEY; // 사용자가 알려준 API 키 사용

    if (!vworldKey || !serviceKey) {
      return NextResponse.json({ error: 'API keys missing' }, { status: 500 });
    }

    // 1. 주소를 좌표로 변환 후 PNU 획득
    const geoRes = await fetch(
      `https://api.vworld.kr/req/address?service=address&request=getcoord&version=2.0&crs=epsg:4326&address=${encodeURIComponent(address)}&refine=true&format=json&type=road&key=${vworldKey}`
    );
    const geoData = await geoRes.json();
    const point = geoData?.response?.result?.point;
    if (!point) return NextResponse.json({ error: 'Coordinates not found' }, { status: 404 });

    const parcelRes = await fetch(
      `https://api.vworld.kr/req/data?service=data&request=GetFeature&data=LP_PA_CBND_BUBUN&key=${vworldKey}&geometry=false&attribute=true&bbox=${parseFloat(point.x)-0.0001},${parseFloat(point.y)-0.0001},${parseFloat(point.x)+0.0001},${parseFloat(point.y)+0.0001}&size=1&format=json`
    );
    const parcelData = await parcelRes.json();
    const pnu = parcelData?.response?.result?.featureCollection?.features?.[0]?.properties?.pnu;
    if (!pnu) return NextResponse.json({ error: 'PNU not found' }, { status: 404 });

    const sigunguCd = pnu.substring(0, 5); // 법정동 시군구코드 5자리 (LAWD_CD)

    // 2. 물건 종류에 따른 API 엔드포인트 결정
    const isCommercial = type.includes('상가') || type.includes('오피스') || type.includes('근린') || type.includes('사무실');
    const isLand = type.includes('토지') || type.includes('공장') || type.includes('대') || type.includes('전') || type.includes('답');
    
    let apiUrl = 'http://openapi.molit.go.kr/OpenAPI_ToolInstallPackage/service/rest/RTMSOBJSvc/getRTMSDataSvcAptTradeDev';
    if (isLand) {
      apiUrl = 'http://openapi.molit.go.kr/OpenAPI_ToolInstallPackage/service/rest/RTMSOBJSvc/getRTMSDataSvcLandTrade';
    } else if (isCommercial) {
      apiUrl = 'http://openapi.molit.go.kr/OpenAPI_ToolInstallPackage/service/rest/RTMSOBJSvc/getRTMSDataSvcNrgTrade';
    } else if (type.includes('빌라') || type.includes('다세대')) {
      apiUrl = 'http://openapi.molit.go.kr/OpenAPI_ToolInstallPackage/service/rest/RTMSOBJSvc/getRTMSDataSvcRHTrade';
    } else if (type.includes('오피스텔')) {
      apiUrl = 'http://openapi.molit.go.kr/OpenAPI_ToolInstallPackage/service/rest/RTMSOBJSvc/getRTMSDataSvcOffiTrade';
    }

    // 3. 최근 5개년 특정 월(예: 3개월 전) 데이터 병렬 조회
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    // 데이터 집계 지연을 고려해 3개월 전 달을 기준으로 5개년 조회
    let targetMonth = currentMonth - 3;
    let baseYear = currentYear;
    if (targetMonth <= 0) {
      targetMonth += 12;
      baseYear -= 1;
    }
    const monthStr = targetMonth.toString().padStart(2, '0');
    
    const years = [baseYear - 4, baseYear - 3, baseYear - 2, baseYear - 1, baseYear];
    
    const fetchPromises = years.map(async (y) => {
      const dealYmd = `${y}${monthStr}`;
      const reqUrl = `${apiUrl}?serviceKey=${encodeURIComponent(serviceKey)}&LAWD_CD=${sigunguCd}&DEAL_YMD=${dealYmd}`;
      
      try {
        const res = await fetch(reqUrl, { signal: AbortSignal.timeout(8000) });
        const text = await res.text();
        
        // XML 단순 파싱 (JSON 지원이 불확실한 구형 API 대비)
        const items = text.split('<item>');
        if (items.length <= 1) return { year: y.toString(), price: 0 };
        
        let totalAmount = 0;
        let totalArea = 0;
        let count = 0;

        for (let i = 1; i < items.length; i++) {
          const itemText = items[i];
          
          // 거래금액 추출 (쉼표 제거)
          const amountMatch = itemText.match(/<거래금액>([^<]+)<\/거래금액>/);
          // 면적 추출
          const areaMatch = itemText.match(/<전용면적>([^<]+)<\/전용면적>/) || itemText.match(/<거래면적>([^<]+)<\/거래면적>/);
          
          if (amountMatch && areaMatch) {
            const amount = parseInt(amountMatch[1].trim().replace(/,/g, ''), 10);
            const area = parseFloat(areaMatch[1].trim());
            
            if (!isNaN(amount) && !isNaN(area) && area > 0) {
              totalAmount += amount;
              totalArea += area;
              count++;
            }
          }
        }
        
        if (count === 0) return { year: y.toString(), price: 0 };
        
        // 평당 또는 ㎡당 단가 산출 (만원 단위) -> 1㎡당 만원으로 통일
        const avgPricePerSqm = totalAmount / totalArea; 
        return { year: y.toString(), price: avgPricePerSqm };
      } catch (err) {
        console.error(`Error fetching year ${y}:`, err);
        return { year: y.toString(), price: 0 };
      }
    });

    const results = await Promise.all(fetchPromises);
    
    // 데이터 보정 (0인 경우 이전/이후 년도 데이터로 보간)
    for (let i = 0; i < results.length; i++) {
      if (results[i].price === 0) {
        const prev = i > 0 ? results[i-1].price : 0;
        const next = i < results.length - 1 ? results[i+1].price : 0;
        if (prev > 0 && next > 0) results[i].price = (prev + next) / 2;
        else if (prev > 0) results[i].price = prev;
        else if (next > 0) results[i].price = next;
      }
    }

    return NextResponse.json({ trends: results, sigunguCd, apiUrl });

  } catch (err: any) {
    console.error('[trade API error]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
