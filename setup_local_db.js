const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./woori_auction.db');

db.serialize(() => {
  // 1. 테이블 생성
  db.run(`CREATE TABLE IF NOT EXISTS auctions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_no TEXT,
    name TEXT,
    address TEXT,
    price_appraised TEXT,
    price_minimum TEXT,
    roi TEXT,
    risk_level TEXT,
    risk_text TEXT,
    description TEXT,
    category TEXT,
    image_id INTEGER
  )`);

  // 2. 실전 데이터 준비 (사령관님이 보셨던 실전 데이터 위주)
  const stmt = db.prepare(`INSERT INTO auctions (case_no, name, address, price_appraised, price_minimum, roi, risk_level, risk_text, description, category, image_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  
  const realData = [
    ['2024타경108242', '강남구 역삼동 푸르지오', '서울 강남구 역삼동 754-1', '18.4억', '14.7억', '29.1%', 'Safe', '등기부 깨끗함 (안전)', 'GTX-C 노선 수혜 지역이며 학군 수요가 탄탄한 매물입니다.', '아파트', 101],
    ['2023타경99821', '서초구 반포동 반포자이', '서울 서초구 반포동 2-1', '35.2억', '28.1억', '15.2%', 'Warning', '유치권 신고 주의', '재건축 예정지이나 공사대금 관련 유치권 확인이 필요합니다.', '아파트', 102],
    ['2024타경11234', '관악구 신림동 근린상가', '서울 관악구 신림동 1422-5', '31.2억', '21.8억', '6.5%', 'Danger', '대항력 임차인 발견', '고수익 상가이나 임차인 보증금 인수 리스크가 매우 큽니다.', '상가', 103],
    ['2024타경55667', '포천시 신북면 아파트', '경기도 포천시 신북면 가채리', '3.5억', '2.8억', '42.8%', 'Safe', '권리관계 깨끗함', '포천 신도시 개발 호재 및 저평가된 매력적인 투자 물건입니다.', '아파트', 104],
    ['2023타경44556', '평택시 고덕동 오피스텔', '경기도 평택시 고덕동 112', '4.8억', '3.8억', '22.5%', 'Safe', '임차인 명도 완료', '삼성전자 평택캠퍼스 인근으로 풍부한 임대 수요가 기대됩니다.', '오피스텔', 105],
    ['2024타경77889', '용인시 수지구 단독주택', '경기도 용인시 수지구 상현동', '12.4억', '9.9억', '18.6%', 'Warning', '관리비 미납 확인 요망', '수지 플랫폼시티 개발 수혜지로 향후 가치 상승이 뚜렷합니다.', '주택', 106],
    ['2024타경12345', '송파구 문정동 지식산업센터', '서울 송파구 문정동 644', '8.9억', '7.12억', '11.2%', 'Safe', '우량 임차인 점유 중', '문정 법조타운 중심부에 위치하여 안정적인 수익이 보장됩니다.', '지산', 107],
    ['2023타경22334', '남양주시 다산동 빌라', '경기도 남양주시 다산동 605', '5.2억', '4.16억', '25.4%', 'Danger', '공유물분할 경매 주의', '공유자 간의 분쟁이 있으므로 소유권 이전 시 법적 검토가 필요합니다.', '빌라', 108],
  ];

  for (const row of realData) {
    stmt.run(row);
  }
  stmt.finalize();
});

db.close((err) => {
  if (err) console.error(err.message);
  console.log('--- 로컬 실전 DB(woori_auction.db) 구축 완료! ---');
});
