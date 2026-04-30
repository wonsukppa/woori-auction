import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';

export async function POST(req: NextRequest) {
  try {
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'GEMINI_API_KEY is missing.',
        summary: "API 키가 등록되지 않았습니다. .env.local 파일을 확인해주세요.",
        totalCost: "계산 불가",
        items: []
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const { image, prompt, propertyType } = await req.json();

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const base64Data = image.split(',')[1] || image;
    
    // gemini-1.5-flash is best for fast multimodal tasks
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const systemPrompt = `당신은 대한민국 최고의 부동산 경매 및 건축/리모델링 전문가 '안티그래비티 AI'입니다. 
주어진 현장 사진과 물건 종목(${propertyType || '상가/주택'})을 분석하여 다음 정보를 JSON 형식으로 제공해주세요.
단, 응답은 반드시 순수한 JSON 문자열로만 반환해야 하며, 백틱(\`\`\`)이나 마크다운 문법을 포함하지 마세요.

JSON 구조:
{
  "summary": "사진에 대한 종합 분석 (1-2줄, 예: 바닥 마감 철거가 필요하고 간판 교체가 예상됨)",
  "totalCost": "총 예상 비용 (숫자와 한글 조합, 예: '3,500만원')",
  "items": [
    { "name": "항목명 (예: 간판 철거, 바닥 공사 등)", "cost": "예상 비용 (예: '500만원')" }
  ]
}

사용자 요청 프롬프트: ${prompt || '이 부동산 사진의 명도, 수리, 리모델링 견적을 직관적으로 산출해줘.'}
`;

    const result = await model.generateContent([
      systemPrompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: 'image/jpeg',
        },
      },
    ]);

    const responseText = result.response.text();
    
    try {
      const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedData = JSON.parse(cleanedText);
      return NextResponse.json(parsedData);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', responseText);
      return NextResponse.json({
        summary: responseText,
        totalCost: "산출 오류",
        items: []
      });
    }
  } catch (error: any) {
    console.error('Vision API Error:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal Server Error',
      summary: "AI 모델 분석 중 오류가 발생했습니다.",
      totalCost: "오류",
      items: []
    });
  }
}
