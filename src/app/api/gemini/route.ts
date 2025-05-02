import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { NextRequest } from 'next/server';

if (!process.env.GOOGLE_API_KEY) {
    throw new Error('GOOGLE_API_KEY 환경 변수가 설정되지 않았습니다.');
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function fetchImageAsBase64(url: string): Promise<string> {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`이미지를 가져오는데 실패했습니다. Status: ${response.status}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        return buffer.toString('base64');
    } catch (error) {
        console.error('Image fetch error:', error);
        throw new Error('이미지를 base64로 변환하는 중 오류가 발생했습니다.');
    }
}

export async function POST(req: NextRequest) {
    try {
        const { imageUrl, existingPrompt } = await req.json();

        if (!imageUrl) {
            return new Response(
                JSON.stringify({ error: '이미지 URL이 필요합니다.' }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                }
            );
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        console.log('이미지 URL:', imageUrl);
        const imageBase64 = await fetchImageAsBase64(imageUrl);
        console.log('이미지 base64 변환 완료');

        const prompt = `당신은 영상 생성용 프롬프트를 보정하는 인공지능입니다.

당신의 목표는 다음과 같습니다:

1. 아래 제공된 이미지 내용을 분석하여, 시각적 요소(등장 인물, 배경, 색상, 스타일 등)를 간결하게 요약합니다.
2. 제공된 기존 프롬프트 중에서 이미지에 대한 설명이 포함된 문장을 찾아, 이미지 분석 결과에 맞춰 해당 부분만 자연스럽게 **수정**합니다.
3. 기존 프롬프트의 구조, 분위기, 문체는 최대한 **유지**하십시오.
4. 프롬프트 전체를 새로 작성하지 말고, 기존 문장을 바탕으로 **'이미지 관련 설명만 교체된 전체 문장'**을 반환하십시오.
5. 영상 생성 모델이 이해하기 쉬운 자연스러운 문장을 만들어야 합니다.

- 이미지 분석 결과는 응답에 포함하지 마십시오.
- 응답은 수정된 전체 프롬프트 1개 한글로 출력하십시오.

기존 프롬프트:
${existingPrompt || '없음'}
`;

        console.log('Gemini API 요청 시작');
        const result = await model.generateContent({
            contents: [
                {
                    role: 'user',
                    parts: [
                        { text: prompt },
                        {
                            inlineData: {
                                mimeType: 'image/jpeg',
                                data: imageBase64
                            }
                        }
                    ]
                }
            ],
            generationConfig: {
                temperature: 0.2,
                topP: 0.8,
                maxOutputTokens: 1024,
            },
            safetySettings: [
                {
                    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                    threshold: HarmBlockThreshold.BLOCK_NONE,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                    threshold: HarmBlockThreshold.BLOCK_NONE,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                    threshold: HarmBlockThreshold.BLOCK_NONE,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                    threshold: HarmBlockThreshold.BLOCK_NONE,
                },
            ],
        });

        console.log('Gemini API 응답 수신');
        const response = await result.response;
        const text = response.text();

        return new Response(JSON.stringify({ response: text }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Gemini API Error:', error);
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
        return new Response(
            JSON.stringify({
                error: errorMessage,
                details: error instanceof Error ? error.stack : undefined
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
}
