import { fal } from '@fal-ai/client';
import {
    videoProcessQueue,
    videoStatusQueue,
    VideoStatusCheckData,
} from '../utils/videoQueue';
import {
    saveVideoStatus,
    getVideoStatus,
    getInternalRequestId,
    VideoStatus
} from '../utils/redis';
import {
    FalQueueStatusResponse,
    FalQueueSubmitResponse,
    FalQueueResultResponse
} from '../utils/falTypes';
// 백엔드 알림 서비스 추가
import { GenerationNotificationService } from '@/features/admin/services/GenerationNotificationService';
// 비디오 저장 서비스 추가
import { VideoStorageService } from '../video/services/VideoStorageService';
import type { VideoSaveRequest } from '../video/types/VideoSaveRequest';

// FAL.ai API 키 설정
if (process.env.FAL_KEY) {
    console.log(`[FAL API] ✅ API 키 설정 완료 (${process.env.FAL_KEY.substring(0, 3)}...${process.env.FAL_KEY.substring(process.env.FAL_KEY.length - 3)})`);
    fal.config({
        credentials: process.env.FAL_KEY
    });
} else {
    console.error(`[FAL API] ❌ FAL_KEY 환경 변수가 설정되지 않았습니다!`);
    console.error(`[FAL API] 💡 .env.local 또는 .env.production 파일에 FAL_KEY를 추가하세요.`);
    console.error(`[FAL API] 📋 현재 로드된 환경 변수 목록:`, Object.keys(process.env).filter(key => !key.includes('SECRET') && !key.includes('KEY')).join(', '));
}

// 상태 확인 워커에서 오류 발생 시 알림 업데이트 함수
async function updateNotificationOnError(requestId: string, errorMessage: string) {
    try {
        // 현재 저장된 처리 결과에서 notificationId 조회
        const currentStatus = await getVideoStatus(requestId);
        const notificationId = currentStatus?.notificationId;

        if (notificationId) {
            console.log(`[알림 서비스] ❌ 알림 상태 업데이트 중: ${notificationId}, 상태: FAILED`);
            await GenerationNotificationService.updateNotification(notificationId, {
                status: 'FAILED',
                errorMessage: errorMessage
            });
            console.log(`[알림 서비스] ✅ 알림 상태 업데이트 완료: ${notificationId}`);
        } else {
            console.log(`[알림 서비스] ⚠️ 알림 ID를 찾을 수 없음: ${requestId}`);
        }
    } catch (notifError) {
        console.error(`[알림 서비스] 🔴 알림 업데이트 실패:`, notifError);
    }
}

// 비디오 저장 함수
async function saveVideoToDatabase(videoData: {
    requestId: string;
    falRequestId: string;
    videoUrl: string;
    apiProvider: string;
    notificationId?: number;
    prompt?: string;
    referenceUrl?: string;
}) {
    try {
        console.log(`[비디오 저장] 📼 저장 시작 - ID: ${videoData.requestId}`);

        // 비디오 저장 요청 데이터 구성
        const saveRequest: VideoSaveRequest = {
            prompt: videoData.prompt || '',
            endpoint: videoData.apiProvider,
            model: videoData.apiProvider.split('/').pop() || videoData.apiProvider,
            videoName: `AI 생성 영상 - ${new Date().toLocaleTimeString()}`,
            videoUrl: videoData.videoUrl,
            referenceUrl: videoData.referenceUrl,
            activeTab: 'image', // 기본값으로 image 사용
            falRequestId: videoData.falRequestId,
            requestId: videoData.requestId,
            notificationId: videoData.notificationId
        };

        // 비디오 저장 서비스 호출
        const savedVideo = await VideoStorageService.saveVideo(saveRequest);
        console.log(`[비디오 저장] ✅ 저장 완료 - ID: ${videoData.requestId}, 저장된 ID: ${savedVideo.id}`);

        return savedVideo;
    } catch (error) {
        console.error(`[비디오 저장] 🔴 저장 오류 - ID: ${videoData.requestId}`, error);
        throw error;
    }
}

// 비디오 처리 워커
// 비디오 생성 요청을 처리하고 상태 확인 큐에 추가
videoProcessQueue.process(async (job) => {
    const startTime = new Date();
    const { requestId, apiProvider, params, notificationId } = job.data;

    try {
        console.log(`[비디오 워커] 📹 처리 시작 - ID: ${requestId}`);
        console.log(`[비디오 워커] 📋 요청 정보: API=${apiProvider}, 파라미터:`, JSON.stringify(params, null, 2));

        // 작업 진행률 업데이트
        await job.progress(10);
        console.log(`[비디오 워커] ⏳ 상태 업데이트 중 (10%) - ID: ${requestId}`);

        // 처리 상태 저장 (Hash 사용)
        await saveVideoStatus({
            requestId,
            status: 'processing',
            updatedAt: new Date().toISOString(),
            notificationId
        });

        // 작업 진행률 업데이트
        await job.progress(30);
        console.log(`[비디오 워커] ⏳ API 호출 준비 완료 (30%) - ID: ${requestId}`);

        // 비디오 생성 API 호출 - 문서에 맞게 fal.queue.submit으로 변경
        console.log(`[비디오 워커] 🔄 API 호출 시작 - ID: ${requestId}, API: ${apiProvider}`);

        const queueResult = await fal.queue.submit(apiProvider, {
            input: params,
        }) as FalQueueSubmitResponse;

        // FAL API 응답에서 requestId 추출
        const falRequestId = queueResult.request_id;
        console.log(`[비디오 워커] ✅ API 호출 성공 - ID: ${requestId}, FAL ID: ${falRequestId}`);

        // 작업 진행률 업데이트
        await job.progress(70);

        // API 응답 로깅
        console.log(`[비디오 워커] 📊 응답 데이터:`, JSON.stringify(queueResult, null, 2));

        // FAL requestId와 함께 상태 업데이트
        await saveVideoStatus({
            requestId,
            falRequestId,
            status: 'processing',
            updatedAt: new Date().toISOString(),
            notificationId
        });

        // 상태 확인 큐에 작업 추가
        console.log(`[비디오 워커] 🔄 상태 확인 큐에 작업 추가 중 - ID: ${requestId}`);
        await videoStatusQueue.add({
            requestId,
            apiProvider,
            falRequestId
        }, {
            jobId: requestId,
            removeOnComplete: false
        });

        // 작업 진행률 업데이트
        await job.progress(100);

        const endTime = new Date();
        const processingTime = (endTime.getTime() - startTime.getTime()) / 1000;
        console.log(`[비디오 워커] ✨ 처리 완료 - ID: ${requestId}, 소요 시간: ${processingTime}초`);

        return { requestId, status: 'pending', createdAt: new Date() };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
        const errorDetails = error instanceof Error ? (error.stack || '') : '';

        console.error(`[비디오 워커] ❌ 처리 오류 - ID: ${requestId}`);
        console.error(`[비디오 워커] 🔴 오류 메시지: ${errorMessage}`);
        if (errorDetails) {
            console.error(`[비디오 워커] 🔴 오류 상세: ${errorDetails}`);
        }

        // 실패 상태 저장 (Hash 사용)
        await saveVideoStatus({
            requestId,
            status: 'failed',
            error: errorMessage,
            updatedAt: new Date().toISOString(),
            notificationId
        });

        // 알림 서비스에 오류 상태 업데이트
        await updateNotificationOnError(requestId, errorMessage);

        throw error;
    }
});

// 비디오 상태 확인 워커
// 10초마다 비디오 생성 상태를 확인
videoStatusQueue.process(async (job) => {
    const pollStart = new Date();
    const { requestId, apiProvider, falRequestId } = job.data;
    let pollCount = job.data.pollCount || 0;
    pollCount++;

    try {
        console.log(`[상태 확인] 🔍 폴링 #${pollCount} 시작 - ID: ${requestId}, 시간: ${pollStart.toISOString()}`);

        // 현재 저장된 처리 결과 가져오기
        const currentStatus = await getVideoStatus(requestId);
        console.log(`[상태 확인] 📑 현재 상태 - ID: ${requestId}, 상태: ${currentStatus?.status || 'unknown'}`);

        // 이미 완료되었거나 실패한 경우 처리 중단
        if (currentStatus?.status === 'completed' || currentStatus?.status === 'failed') {
            console.log(`[상태 확인] ✋ 폴링 종료 (이미 최종 상태) - ID: ${requestId}, 상태: ${currentStatus.status}`);

            // 상태 확인 작업 삭제
            await videoStatusQueue.removeRepeatable({
                jobId: requestId,
                every: 10000
            });
            console.log(`[상태 확인] 🧹 반복 작업 제거 완료 - ID: ${requestId}`);

            return {
                ...currentStatus,
                pollCount,
                message: `폴링 종료: 이미 ${currentStatus.status} 상태입니다.`
            };
        }

        // falRequestId가 없으면 확인할 수 없음
        if (!falRequestId) {
            console.error(`[상태 확인] ❌ falRequestId 없음 - ID: ${requestId}`);
            throw new Error('FAL 요청 ID가 누락되었습니다');
        }

        // 진행 중인 경우 외부 API 상태 확인
        console.log(`[상태 확인] 🔄 API 상태 요청 중 - ID: ${requestId}, FAL ID: ${falRequestId}`);

        try {
            // FAL API 상태 확인
            const status = await fal.queue.status(apiProvider, {
                requestId: falRequestId,
            }) as FalQueueStatusResponse;

            const statusName = status.status;
            console.log(`[상태 확인] 📊 API 응답 - ID: ${requestId}, 상태: ${statusName}, 원본 응답:`, JSON.stringify(status, null, 2));

            // 상태에 따라 결과 처리
            if (statusName === 'COMPLETED') {
                console.log(`[상태 확인] ✅ 비디오 생성 완료 - ID: ${requestId}`);

                // 결과 데이터 가져오기
                const resultData = await fal.queue.result(apiProvider, {
                    requestId: falRequestId
                }) as FalQueueResultResponse;

                console.log(`[상태 확인] 📊 결과 데이터 - ID: ${requestId}:`, JSON.stringify(resultData.data, null, 2));

                // 비디오 URL 추출
                let videoUrl = '';
                if (resultData.data?.video?.url) {
                    videoUrl = resultData.data.video.url;
                } else if (typeof resultData.data === 'object' && resultData.data !== null) {
                    // 다른 형식의 응답일 경우도 처리
                    videoUrl = resultData.data.videoUrl || resultData.data.video_url || '';
                }

                if (!videoUrl) {
                    throw new Error('생성된 비디오 URL을 찾을 수 없습니다');
                }

                // 완료된 경우
                await saveVideoStatus({
                    requestId,
                    falRequestId,
                    status: 'completed',
                    result: resultData.data,
                    updatedAt: new Date().toISOString(),
                    notificationId: currentStatus?.notificationId
                });

                // 비디오 저장
                try {
                    // 프롬프트 정보 추출
                    const prompt = currentStatus?.result?.prompt
                        || (typeof resultData.data === 'object' && resultData.data !== null ? resultData.data.prompt : '')
                        || '';

                    // 참조 이미지 URL 추출
                    const referenceUrl = currentStatus?.result?.image_url
                        || currentStatus?.result?.imageUrl
                        || '';

                    // 비디오 저장 시작
                    const savedVideo = await saveVideoToDatabase({
                        requestId,
                        falRequestId,
                        videoUrl,
                        apiProvider,
                        notificationId: currentStatus?.notificationId,
                        prompt: prompt as string,
                        referenceUrl: referenceUrl as string
                    });
                    console.log(`[상태 확인] 💾 비디오 저장 완료 - ID: ${requestId}, 저장 ID: ${savedVideo.id}`);
                } catch (saveError) {
                    console.error(`[상태 확인] 🔴 비디오 저장 실패 - ID: ${requestId}`, saveError);
                    // 저장 실패해도 나머지 처리는 계속 진행
                }

                // 상태 확인 작업 삭제
                await videoStatusQueue.removeRepeatable({
                    jobId: requestId,
                    every: 10000
                });
                console.log(`[상태 확인] 🧹 반복 작업 제거 완료 - ID: ${requestId}`);

                // 알림 서비스에 완료 상태 업데이트 (비디오 URL 포함)
                if (currentStatus?.notificationId && videoUrl) {
                    try {
                        await GenerationNotificationService.updateNotification(currentStatus.notificationId, {
                            status: 'COMPLETED',
                            thumbnailUrl: videoUrl,
                        });
                        console.log(`[알림 서비스] ✅ 완료 상태 업데이트 성공 - ID: ${currentStatus.notificationId}`);
                    } catch (notifError) {
                        console.error(`[알림 서비스] 🔴 완료 상태 업데이트 실패 - ID: ${currentStatus.notificationId}`, notifError);
                    }
                }
            } else if (statusName === 'FAILED') {
                console.log(`[상태 확인] ❌ 비디오 생성 실패 - ID: ${requestId}`);

                // 실패 이유 추출
                const errorMessage = status.error || '비디오 처리 실패';

                // 실패한 경우
                await saveVideoStatus({
                    requestId,
                    falRequestId,
                    status: 'failed',
                    error: errorMessage,
                    updatedAt: new Date().toISOString(),
                    notificationId: currentStatus?.notificationId
                });

                // 상태 확인 작업 삭제
                await videoStatusQueue.removeRepeatable({
                    jobId: requestId,
                    every: 10000
                });
                console.log(`[상태 확인] 🧹 반복 작업 제거 완료 - ID: ${requestId}`);

                // 알림 서비스에 오류 상태 업데이트
                await updateNotificationOnError(requestId, errorMessage);
            } else if (statusName === 'IN_PROGRESS') {
                console.log(`[상태 확인] ⏳ 비디오 생성 진행 중 - ID: ${requestId}`);

                // 진행 중인 경우 - 현재 상태 업데이트
                await saveVideoStatus({
                    ...(currentStatus || {}),
                    requestId, // 명시적으로 requestId 추가
                    status: 'processing',
                    updatedAt: new Date().toISOString()
                });
            } else if (statusName === 'IN_QUEUE') {
                console.log(`[상태 확인] ⏳ 비디오 생성 대기 중 - ID: ${requestId}`);

                // 대기 중인 경우 - 현재 상태 업데이트
                await saveVideoStatus({
                    ...(currentStatus || {}),
                    requestId, // 명시적으로 requestId 추가
                    status: 'pending',
                    updatedAt: new Date().toISOString()
                });
            }
        } catch (apiError) {
            console.error(`[상태 확인] 🔴 API 조회 오류 - ID: ${requestId}`, apiError);

            // 오류가 지속적으로 발생하면 (401, 403 또는 404 오류)
            const errorObj = apiError as { status?: number, body?: Record<string, unknown> };

            // 404 Not Found 또는 인증 오류의 경우 즉시 실패 처리
            if (errorObj.status === 404 || errorObj.status === 401 || errorObj.status === 403) {
                const errorMessage = `API 오류: ${errorObj.status} - ${JSON.stringify(errorObj.body || {})}`;

                // 실패 상태 저장
                await saveVideoStatus({
                    requestId,
                    falRequestId,
                    status: 'failed',
                    error: errorMessage,
                    updatedAt: new Date().toISOString(),
                    notificationId: currentStatus?.notificationId
                });

                // 상태 확인 작업 종료
                await videoStatusQueue.removeRepeatable({
                    jobId: requestId,
                    every: 10000
                });
                console.log(`[상태 확인] 🧹 API 오류로 인한 반복 작업 제거 - ID: ${requestId}`);

                // 알림 서비스에 오류 상태 업데이트
                await updateNotificationOnError(requestId, errorMessage);

                return {
                    requestId,
                    status: 'ERROR',
                    error: errorMessage
                };
            }

            // 일시적인 오류는 계속 폴링 (5회 이상 실패 시 오류로 처리)
            if (pollCount >= 5) {
                const errorMessage = `API 응답 오류가 지속됩니다: ${apiError instanceof Error ? apiError.message : '알 수 없는 오류'}`;

                // 실패 상태 저장
                await saveVideoStatus({
                    requestId,
                    falRequestId,
                    status: 'failed',
                    error: errorMessage,
                    updatedAt: new Date().toISOString(),
                    notificationId: currentStatus?.notificationId
                });

                // 상태 확인 작업 종료
                await videoStatusQueue.removeRepeatable({
                    jobId: requestId,
                    every: 10000
                });

                // 알림 서비스에 오류 상태 업데이트
                await updateNotificationOnError(requestId, errorMessage);

                return {
                    requestId,
                    status: 'ERROR',
                    error: errorMessage
                };
            }

            // 일시적인 오류는 다음 폴링에서 다시 시도
            console.log(`[상태 확인] ⚠️ API 응답 오류, 다음 폴링에서 재시도 - ID: ${requestId}, 폴링 #${pollCount}`);
            throw apiError;
        }

        const pollEnd = new Date();
        const pollDuration = (pollEnd.getTime() - pollStart.getTime()) / 1000;
        console.log(`[상태 확인] ⏱️ 폴링 #${pollCount} 완료 - ID: ${requestId}, 소요 시간: ${pollDuration}초`);

        return {
            requestId,
            status: 'success',
            pollCount,
            pollDuration
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
        const errorStack = error instanceof Error ? error.stack : '';

        console.error(`[상태 확인] 🔴 폴링 오류 - ID: ${requestId}, 폴링 #${pollCount}`);
        console.error(`[상태 확인] 🔴 오류 메시지: ${errorMessage}`);
        if (errorStack) {
            console.error(`[상태 확인] 🔴 오류 상세: ${errorStack}`);
        }

        // 폴링 오류가 지속되는 경우 (10회 이상)
        if (pollCount >= 10) {
            console.log(`[상태 확인] ⚠️ 최대 폴링 횟수 초과 - ID: ${requestId}, 폴링 #${pollCount}`);

            // 마지막 상태 확인
            const currentStatus = await getVideoStatus(requestId);

            // 아직 실패 상태가 아니면 실패로 변경
            if (currentStatus?.status !== 'failed') {
                // 실패 상태 저장
                await saveVideoStatus({
                    ...(currentStatus || {}),
                    requestId, // 명시적으로 requestId 추가
                    status: 'failed',
                    error: `오류: ${errorMessage}`,
                    updatedAt: new Date().toISOString()
                });

                // 상태 확인 작업 삭제
                await videoStatusQueue.removeRepeatable({
                    jobId: requestId,
                    every: 10000
                });
                console.log(`[상태 확인] 🧹 오류로 인한 반복 작업 제거 - ID: ${requestId}`);

                // 알림 서비스에 오류 상태 업데이트
                await updateNotificationOnError(requestId, errorMessage);
            }
        }

        return {
            requestId,
            status: 'ERROR',
            error: errorMessage,
            pollCount
        };
    }
});

// 큐 이벤트 핸들러 등록
videoProcessQueue.on('completed', (job) => {
    console.log(`비디오 처리 작업 완료: ${job.data.requestId}`);
});

videoProcessQueue.on('failed', (job, error) => {
    console.error(`비디오 처리 작업 실패: ${job.data.requestId}`, error);
});

videoStatusQueue.on('completed', (job, result) => {
    console.log(`비디오 상태 확인 완료: ${job.data.requestId}, 상태: ${result?.status}`);
});

videoStatusQueue.on('failed', (job, error) => {
    console.error(`비디오 상태 확인 실패: ${job.data.requestId}`, error);
}); 