const KAKAO_API_KEY = '339c13881c7740d03280f0a1006c8677';
const testAddress = '서울특별시 관악구 남현3길 39';

async function testKakao() {
  console.log(`--- Kakao API Test Start ---`);
  console.log(`Address: ${testAddress}`);
  
  try {
    const response = await fetch(`https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(testAddress)}`, {
      headers: { 'Authorization': `KakaoAK ${KAKAO_API_KEY}` }
    });
    
    const data = await response.json();
    console.log(`Response Status: ${response.status}`);
    console.log(`Response Body:`, JSON.stringify(data, null, 2));
    
    if (data.documents && data.documents.length > 0) {
      console.log(`✅ Success! Coords: [${data.documents[0].y}, ${data.documents[0].x}]`);
    } else {
      console.log(`❌ Failed: No documents found.`);
    }
  } catch (err) {
    console.log(`❌ Error: ${err.message}`);
  }
}

testKakao();
