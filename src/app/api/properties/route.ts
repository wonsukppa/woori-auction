import { NextResponse } from 'next/server';
import { AuctionProperty } from '../../../types/auction';

export async function GET() {
  const propertyTypes = ['아파트', '오피스텔', '상가', '사무실', '토지', '공장'];
  
  // Realistic Investment Hubs in Seoul
  const realCoordinates = [
    { lat: 37.4981, lng: 127.0276, area: '강남구 역삼동' },
    { lat: 37.5140, lng: 127.0565, area: '강남구 삼성동' },
    { lat: 37.5031, lng: 127.0047, area: '서초구 반포동' },
    { lat: 37.5133, lng: 127.1001, area: '송파구 잠실동' },
    { lat: 37.5484, lng: 126.9124, area: '마포구 합정동' },
    { lat: 37.5365, lng: 127.0065, area: '용산구 한남동' },
    { lat: 37.5213, lng: 126.9242, area: '영등포구 여의도동' },
    { lat: 37.5407, lng: 127.0692, area: '광진구 자양동' },
    { lat: 37.5796, lng: 126.9368, area: '서대문구 연희동' },
    { lat: 37.5612, lng: 126.9942, area: '중구 을지로' },
  ];

  const properties: any = Array.from({ length: 15 }).map((_, i) => {
    const type = propertyTypes[i % propertyTypes.length];
    const coord = realCoordinates[i % realCoordinates.length];
    
    // Deterministic prices based on index i instead of Math.random()
    const seed = (i + 1) * 13.37;
    const priceFactor = (seed % 1); // 0 ~ 1
    
    let minPrice = 200000000 + (priceFactor * 800000000);
    if (type === '토지') minPrice = 50000000 + (priceFactor * 200000000);
    if (type === '상가') minPrice = 300000000 + (priceFactor * 1200000000);

    const marketPrice = minPrice * (1.1 + (priceFactor * 0.3));
    
    const subwayInfo = type === '토지' ? '해당사항 없음' : `지하철역 도보 ${3 + (i%7)}분`;
    const schoolInfo = type === '아파트' ? `인근 초/중교 도보 5분` : (type === '상가' ? '주변 배후세대 풍부' : '해당사항 없음');

    const score = 65 + (i % 35);
    let verdict = '';
    
    // ... (verdict logic remains same as it was already mostly deterministic)
    if (score >= 95) {
      const sVerdicts = [
        '권리상 하자가 전혀 없으며, 인근 개발 호재로 인한 폭발적인 시세차익이 보장된 희귀 매물입니다.',
        '감정가 대비 유찰 횟수가 많아 가격 메리트가 극대화된 상태입니다. 무조건 입찰을 권장합니다.',
        `${type} 시장의 최근 트렌드에 완벽히 부합하는 최상급 우량 자산입니다. AI 확신도 99%입니다.`
      ];
      verdict = sVerdicts[i % sVerdicts.length];
    } else if (score >= 85) {
      const aVerdicts = [
        '입지와 수익성 밸런스가 뛰어나 즉각적인 투자를 강력히 추천하는 우량 매물입니다.',
        `${type} 특성상 환금성이 매우 뛰어나며, 단기 매도시에도 안정적인 마진을 기대할 수 있습니다.`,
        '명도 난이도가 낮고 주변 실거래가가 꾸준히 우상향 중이므로 긍정적인 접근이 필요합니다.'
      ];
      verdict = aVerdicts[i % aVerdicts.length];
    } else if (score >= 70) {
      const bVerdicts = [
        '무난한 수익률을 기대할 수 있으며, 큰 리스크가 없는 일반적인 투자 적합 매물입니다.',
        `전형적인 평년 수익을 내는 ${type}입니다. 적정 입찰가를 산정하여 보수적으로 접근하세요.`,
        '권리상 문제는 없으나 폭발적인 가치 상승을 기대하기는 어렵습니다. 실수요자에게 적합합니다.'
      ];
      verdict = bVerdicts[i % bVerdicts.length];
    } else {
      const cVerdicts = [
        '선순위 임차인 인수 위험이나 과도한 수리 비용 등 권리/물리적 하자가 예상되어 주의가 요망됩니다.',
        type === '상가' || type === '사무실' ? '해당 상권의 최근 공실률이 급증하고 있어 낙찰 후 임대 리스크가 매우 큽니다.' : 
        type === '토지' ? '진입로 확보가 불투명한 맹지일 확률이 높습니다. 지적도 및 현장 정밀 조사가 필수입니다.' :
        '건축물 대장상 위반건축물(불법 증축) 등재 이력이 감지되었습니다. 이행강제금 리스크를 고려해야 합니다.',
        '경매 진행 중 채권자의 매각 기일 연기나 취하 가능성이 높은 불안정한 물건입니다. 투자를 권장하지 않습니다.'
      ];
      verdict = cVerdicts[i % cVerdicts.length];
    }

    const risk: 'safe' | 'warning' | 'danger' = score >= 85 ? 'safe' : score >= 70 ? 'warning' : 'danger';

    return {
      id: i + 1,
      caseNo: `2024타경${100000 + i}`,
      name: `${coord.area} ${type}`,
      address: `서울특별시 ${coord.area} ${i + 123}-${i % 10}번지`,
      type: type as any,
      price: minPrice,
      minPrice,
      ratio: Math.round((minPrice / (marketPrice * 1.05)) * 100),
      date: '2024-05-15',
      status: '진행중',
      risk,
      image: `https://picsum.photos/seed/${i+200}/800/600`,
      marketPrice,
      area: 59 + (i % 50),
      appraisalPrice: marketPrice * 1.05,
      auctionDate: '2024-05-15',
      estimatedRent: Math.round(minPrice * 0.004),
      failCount: i % 4,
      images: [`https://picsum.photos/seed/${i+200}/800/600`],
      coords: [coord.lng, coord.lat] as [number, number],
      lat: coord.lat + (Math.cos(i * 1.1) * 0.003),
      lng: coord.lng + (Math.sin(i * 1.1) * 0.003),
      nearbySold: [
        { date: '2024-03-15', price: Math.round(marketPrice * 0.98), name: `${coord.area} 인근 실거래` },
        { date: '2024-01-20', price: Math.round(marketPrice * 0.95), name: `${coord.area} 인근 실거래` },
      ],
      analysis: {
        score,
        profitScore: 70 + (i % 25),
        safetyScore: score >= 85 ? 85 + (i % 10) : score >= 70 ? 70 + (i % 15) : 55 + (i % 15),
        marketScore: 65 + (i % 30),
        livingScore: 60 + (i % 35),
        verdict,
        isIllegal: i % 7 === 0,
        avgMaintenance: 150000 + (i % 5) * 30000,
        subwayInfo,
        schoolInfo,
        commerceGrade: ['S', 'A', 'B', 'C'][i % 4]
      }
    };
  });

  return NextResponse.json(properties);
}
