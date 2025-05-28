import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import fetch from 'node-fetch';

async function fetchImageAsBase64(url: string): Promise<{ data: string; mimeType: string }> {
    try {
        // URL이 유효한지 확인
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            throw new Error('유효하지 않은 이미지 URL입니다.');
        }

        // CloudFront URL인 경우 특별 처리
        const isCloudFrontUrl = url.includes('cloudfront.net');

        const response = await fetch(url, {
            headers: {
                'Accept': 'image/*',
                // CloudFront URL인 경우 추가 헤더
                ...(isCloudFrontUrl && {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                })
            }
        });

        if (!response.ok) {
            throw new Error(`이미지 다운로드 실패: ${response.status} ${response.statusText}`);
        }

        // Content-Type 확인 및 처리
        const contentType = response.headers.get('content-type');
        if (!contentType) {
            // Content-Type이 없는 경우 URL 확장자로부터 추정
            const extension = url.split('.').pop()?.toLowerCase();
            const mimeTypes: { [key: string]: string } = {
                'jpg': 'image/jpeg',
                'jpeg': 'image/jpeg',
                'png': 'image/png',
                'gif': 'image/gif',
                'webp': 'image/webp'
            };
            const mimeType = mimeTypes[extension || ''] || 'image/jpeg';

            if (!mimeType.startsWith('image/')) {
                throw new Error('유효하지 않은 이미지 형식입니다.');
            }
        } else if (!contentType.startsWith('image/')) {
            throw new Error('유효하지 않은 이미지 형식입니다.');
        }

        const arrayBuffer = await response.arrayBuffer();
        const bufferData = Buffer.from(arrayBuffer);

        return {
            data: bufferData.toString('base64'),
            mimeType: contentType || 'image/jpeg',
        };
    } catch (error) {
        console.error('이미지 처리 중 오류:', error);
        throw new Error(`이미지 처리 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
}

export async function POST(req: NextRequest) {
    try {
        // 런타임에 환경 변수 확인
        if (!process.env.GOOGLE_API_KEY) {
            return NextResponse.json(
                {
                    error: 'GOOGLE_API_KEY 환경 변수가 설정되지 않았습니다.',
                },
                { status: 500 }
            );
        }

        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

        const { imageUrl, existingPrompt } = await req.json();

        if (!imageUrl) {
            return NextResponse.json(
                {
                    error: '이미지 URL이 필요합니다.',
                    details: '요청 본문에 imageUrl이 포함되어 있지 않습니다.',
                },
                { status: 400 }
            );
        }

        if (!existingPrompt) {
            return NextResponse.json(
                {
                    error: '기존 프롬프트가 필요합니다.',
                    details: '요청 본문에 existingPrompt가 포함되어 있지 않습니다.',
                },
                { status: 400 }
            );
        }

        // 이미지 URL을 base64로 변환
        const { data: imageBase64, mimeType } = await fetchImageAsBase64(imageUrl);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

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
${existingPrompt}
`;

        const result = await model.generateContent({
            contents: [
                {
                    role: 'user',
                    parts: [
                        { text: prompt },
                        {
                            inlineData: {
                                mimeType,
                                data: imageBase64,
                            },
                        },
                    ],
                },
            ],
            generationConfig: {
                temperature: 0.2,
                topP: 0.8,
                maxOutputTokens: 1024,
            },
            safetySettings: [
                {
                    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                },
            ],
        });

        const response = await result.response;
        const text = await response.text();

        return NextResponse.json({ response: text });
    } catch (error) {
        console.error('API 요청 처리 중 오류가 발생했습니다:', error);

        // 에러 응답을 항상 JSON 형식으로 반환
        return NextResponse.json(
            {
                error: 'API 요청 처리 중 오류가 발생했습니다.',
                details: error instanceof Error ? error.message : '알 수 없는 오류',
                timestamp: new Date().toISOString(),
                path: '/internal/gemini',
            },
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );
    }
}
