// src/app/internal/video/services/VideoStorageService.ts

import apiClient from '@/lib/api/apiClient'
import FormData from 'form-data'
import type { ReadStream } from 'fs'
import { NotificationUpdateService } from './NotificationUpdateService'

/**
 * 비디오 저장 요청 타입
 */
export interface VideoSaveRequest {
    prompt: string
    endpoint: string
    model: string
    videoName: string
    imageFile?: File | ReadStream | null
    videoUrl: string
    referenceUrl?: string
    activeTab?: 'image' | 'text' | 'video'
    userId: string
    notificationId?: number
}

/**
 * 비디오 저장 응답 타입 (스프링 AIVideoResponse와 일치)
 */
export interface VideoSaveResponse {
    id: number // 스프링의 Long 타입이지만 JavaScript에서는 number로 처리
    name: string
    prompt: string
    url: string
    model: string
    mode: string
    referenceFile?: string
    share: boolean
    creator: string
    thumbnailUrl: string
    durationInSeconds?: number
    createdAt: string
    likeCount: number
    clickCount: number
    liked: boolean
}

/**
 * URL을 통해 비디오를 서버에 저장하는 함수 (multipart/form-data)
 */
export async function saveVideoFromUrl(
    request: VideoSaveRequest
): Promise<VideoSaveResponse> {
    const maxRetries = 3
    let retryCount = 0
    const internalToken = process.env.INTERNAL_API_TOKEN!

    while (retryCount < maxRetries) {
        try {
            // FormData 구성
            const form = new FormData()
            form.append(
                'data',
                JSON.stringify({
                    prompt: request.prompt,
                    endpoint: request.endpoint,
                    model: request.model,
                    videoName: request.videoName,
                    videoUrl: request.videoUrl,
                    mode: request.activeTab === 'text' ? 'TEXT' : 'IMAGE',
                    referenceUrl: request.referenceUrl,
                    userId: request.userId,
                    creator: request.userId,
                    notificationId: request.notificationId !== undefined ? request.notificationId.toString() : undefined,
                }),
                { contentType: 'application/json' }
            )

            if (request.imageFile) {
                form.append('referenceFile', request.imageFile)
            }

            const headers = {
                ...form.getHeaders(),
                'X-API-TOKEN': internalToken,
            }

            // multipart/form-data 요청
            const response = await apiClient.post<VideoSaveResponse>(
                '/my/videos/url',
                form,
                { headers }
            )

            console.log(`🎬 비디오 저장 성공 응답:`, {
                notificationId: request.notificationId,
                responseData: {
                    id: response.data.id,
                    name: response.data.name,
                    url: response.data.url,
                    creator: response.data.creator,
                    thumbnailUrl: response.data.thumbnailUrl
                }
            });

            // 비디오 저장 성공 시 알림 상태 업데이트
            if (request.notificationId) {
                try {
                    console.log(`🔄 알림 상태 업데이트 시작: notificationId=${request.notificationId}, videoId=${response.data.id}`);

                    const updateResult = await NotificationUpdateService.updateNotification(request.notificationId, {
                        status: 'COMPLETED',
                        videoId: response.data.id, // 스프링에서 받은 비디오 ID
                        thumbnailUrl: response.data.thumbnailUrl || response.data.url, // 썸네일 URL 우선, 없으면 비디오 URL
                        userId: request.userId
                    });

                    console.log(`✅ 알림 상태 업데이트 성공:`, {
                        notificationId: request.notificationId,
                        videoId: response.data.id,
                        updateResult: updateResult
                    });
                } catch (error) {
                    console.error(`❌ 알림 상태 업데이트 실패: notificationId=${request.notificationId}`, {
                        videoId: response.data.id,
                        error: error,
                        errorMessage: error instanceof Error ? error.message : '알 수 없는 오류',
                        requestData: {
                            notificationId: request.notificationId,
                            userId: request.userId,
                            videoId: response.data.id,
                            thumbnailUrl: response.data.thumbnailUrl || response.data.url
                        },
                        internalToken: internalToken ? '토큰 있음' : '토큰 없음'
                    });
                    // 알림 업데이트 실패해도 비디오 저장은 성공이므로 진행
                }
            }

            return response.data
        } catch (error: unknown) {
            retryCount++

            const err = error as { response?: { status?: number } }
            if (err.response?.status === 401) {
                // 실패 시 알림 상태 업데이트
                if (request.notificationId && retryCount === maxRetries) {
                    try {
                        await NotificationUpdateService.updateNotification(request.notificationId, {
                            status: 'FAILED',
                            errorMessage: '인증이 필요합니다. 내부 토큰을 확인해주세요.',
                            userId: request.userId
                        });
                        console.log(`🔄 실패 알림 상태 업데이트 완료: notificationId=${request.notificationId}`);
                    } catch (updateError) {
                        console.error(`❌ 실패 알림 상태 업데이트 실패:`, updateError);
                    }
                }
                throw new Error('인증이 필요합니다. 내부 토큰을 확인해주세요.')
            }

            if (retryCount === maxRetries) {
                // 실패 시 알림 상태 업데이트
                if (request.notificationId) {
                    try {
                        await NotificationUpdateService.updateNotification(request.notificationId, {
                            status: 'FAILED',
                            errorMessage: '비디오 저장에 실패했습니다. 잠시 후 다시 시도해주세요.',
                            userId: request.userId
                        });
                        console.log(`🔄 실패 알림 상태 업데이트 완료: notificationId=${request.notificationId}`);
                    } catch (updateError) {
                        console.error(`❌ 실패 알림 상태 업데이트 실패:`, updateError);
                    }
                }
                throw new Error(
                    '비디오 저장에 실패했습니다. 잠시 후 다시 시도해주세요.'
                )
            }

            // 점진적 백오프
            await new Promise((resolve) => setTimeout(resolve, 1000 * retryCount))
        }
    }

    // 최종 실패 시 알림 상태 업데이트
    if (request.notificationId) {
        try {
            await NotificationUpdateService.updateNotification(request.notificationId, {
                status: 'FAILED',
                errorMessage: '비디오 저장에 실패했습니다.',
                userId: request.userId
            });
            console.log(`🔄 최종 실패 알림 상태 업데이트 완료: notificationId=${request.notificationId}`);
        } catch (updateError) {
            console.error(`❌ 최종 실패 알림 상태 업데이트 실패:`, updateError);
        }
    }

    throw new Error('비디오 저장에 실패했습니다.')
}
