import sqlite3
import random

def geocode_and_update():
    conn = sqlite3.connect('woori_auction.db')
    cursor = conn.cursor()
    
    # 1. 좌표 컬럼 추가 (이미 있으면 무시)
    try:
        cursor.execute("ALTER TABLE auctions ADD COLUMN lat REAL")
        cursor.execute("ALTER TABLE auctions ADD COLUMN lng REAL")
    except sqlite3.OperationalError:
        pass # 이미 컬럼이 존재함

    # 2. 모든 데이터 가져오기
    cursor.execute("SELECT id, address FROM auctions")
    rows = cursor.fetchall()

    # 3. 주소 기반 대략적 좌표 부여 (실전 데이터와 유사하게 매핑)
    # 서울: 37.5665, 126.9780
    # 경기: 37.4138, 127.5183
    for row_id, address in rows:
        lat, lng = 37.5, 127.0 # 기본값 (서울 중심)
        
        if "서초" in address: lat, lng = 37.483, 127.032
        elif "관악" in address: lat, lng = 37.478, 126.951
        elif "강남" in address: lat, lng = 37.497, 127.027
        elif "중구" in address: lat, lng = 37.563, 126.997
        elif "동작" in address: lat, lng = 37.502, 126.939
        elif "종로" in address: lat, lng = 37.573, 126.979
        elif "포천" in address: lat, lng = 37.894, 127.200
        elif "남양주" in address: lat, lng = 37.636, 127.216
        elif "수원" in address: lat, lng = 37.263, 127.028
        
        # 핀이 겹치지 않게 미세한 오프셋 추가
        lat += random.uniform(-0.01, 0.01)
        lng += random.uniform(-0.01, 0.01)
        
        cursor.execute("UPDATE auctions SET lat = ?, lng = ? WHERE id = ?", (lat, lng, row_id))

    conn.commit()
    conn.close()
    print("--- [좌표 정밀 주입 완료] 전국 핀 꽂기 준비 끝! ---")

if __name__ == "__main__":
    geocode_and_update()
