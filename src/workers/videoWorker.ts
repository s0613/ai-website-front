// src/workers/videoWorker.ts

import 'dotenv/config';
import { Worker, Job } from 'bullmq';
import { saveVideoFromUrl } from '@/app/internal/video/services/VideoStorageService';
import type { VideoJobData } from '@/app/internal/video/services/VideoQueueService';
import { NotificationUpdateService } from '@/app/internal/video/services/NotificationUpdateService';
import { fal } from '@fal-ai/client';

interface KlingVideoOutput {
    video: {
        url: string;
        content_type?: string;
        file_name?: string;
        file_size?: number;
    };
}

interface GenericVideoOutput {
    video: {
        url: string;
    };
}

interface VideoGenerationInput {
    prompt: string;
    image_url: string;
    duration?: number | string;
    aspect_ratio?: string;
    [key: string]: unknown;
}

const connection = {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379'),
    ...(process.env.REDIS_TLS === 'true' && { tls: {} }),
    enableReadyCheck: false,
    maxRetriesPerRequest: 3,
};
const QUEUE_NAME = 'video-generation';

const worker = new Worker<VideoJobData>(
    QUEUE_NAME,
    async (job: Job<VideoJobData>) => {
        const { type, prompt, imageUrl, duration, aspect_ratio, camera_control, userId, notificationId } = job.data;
        let generatedUrl: string;
        let modelName: string;

        try {
            switch (type) {
                case 'kling':
                    const klingRes = await fal.subscribe(
                        'fal-ai/kling-video/v1.6/pro/image-to-video',
                        {
                            input: {
                                prompt,
                                image_url: imageUrl,
                                duration: duration === '10' ? '10' : '5',
                                aspect_ratio:
                                    aspect_ratio === '1:1'
                                        ? '1:1'
                                        : aspect_ratio === '9:16'
                                            ? '9:16'
                                            : '16:9',
                            },
                            logs: true,
                        }
                    );
                    generatedUrl = (klingRes.data as KlingVideoOutput).video.url;
                    modelName = 'kling-video-v1.6';
                    break;

                case 'veo2':
                    const veo2Res = await fal.subscribe(
                        'fal-ai/veo2/image-to-video',
                        {
                            input: {
                                prompt,
                                image_url: imageUrl,
                                aspect_ratio: job.data.aspect_ratio || "auto",
                                duration: job.data.duration || "5s",
                            },
                            logs: true,
                        }
                    );
                    generatedUrl = (veo2Res.data as GenericVideoOutput).video.url;
                    modelName = 'veo2';
                    break;

                case 'hunyuan':
                    const hunyuanRes = await fal.subscribe(
                        'fal-ai/hunyuan-video-image-to-video',
                        {
                            input: {
                                prompt,
                                image_url: imageUrl,
                                aspect_ratio: job.data.aspect_ratio || "16:9",
                                resolution: job.data.resolution || "720p",
                                num_frames: job.data.num_frames || 129,
                                ...(job.data.seed && { seed: job.data.seed }),
                                ...(typeof job.data.i2v_stability === 'boolean' && { i2v_stability: job.data.i2v_stability }),
                            },
                            logs: true,
                        }
                    );
                    generatedUrl = (hunyuanRes.data as GenericVideoOutput).video.url;
                    modelName = 'hunyuan-video';
                    break;

                case 'wan':
                    const wanRes = await fal.subscribe(
                        'fal-ai/wan-pro/image-to-video',
                        {
                            input: {
                                prompt,
                                image_url: imageUrl,
                                enable_safety_checker: job.data.enableSafetyChecker ?? true,
                                ...(job.data.seed && { seed: job.data.seed }),
                            },
                            logs: true,
                        }
                    );
                    generatedUrl = (wanRes.data as GenericVideoOutput).video.url;
                    modelName = 'wan-pro';
                    break;

                case 'pixverse':
                    const pixverseRes = await fal.subscribe(
                        'fal-ai/pixverse/v4.5/image-to-video',
                        {
                            input: {
                                prompt,
                                image_url: imageUrl,
                                aspect_ratio: job.data.aspect_ratio || '16:9',
                                resolution: job.data.resolution || '720p',
                                duration: parseInt(job.data.duration || '5'),
                                ...(job.data.negative_prompt && { negative_prompt: job.data.negative_prompt }),
                                ...(job.data.style && { style: job.data.style }),
                                ...(job.data.seed && { seed: job.data.seed }),
                            },
                            logs: true,
                        }
                    );
                    generatedUrl = (pixverseRes.data as GenericVideoOutput).video.url;
                    modelName = 'pixverse-v4.5';
                    break;

                default:
                    throw new Error(`지원하지 않는 작업 타입: ${type}`);
            }

            console.log(`[VideoWorker] saveVideoFromUrl 호출 준비:`, {
                type,
                userId,
                notificationId,
                parsedNotificationId: notificationId ? parseInt(notificationId) : undefined,
                videoUrl: generatedUrl ? '있음' : '없음'
            });

            const saved = await saveVideoFromUrl({
                prompt,
                endpoint: type,
                model: modelName,
                videoName: `${type}-${Date.now()}.mp4`,
                videoUrl: generatedUrl,
                userId,
                notificationId: notificationId ? parseInt(notificationId) : undefined,
                activeTab: 'image',
            });

            console.log(`🎯 [VideoWorker] saveVideoFromUrl 완료:`, {
                type,
                userId,
                notificationId,
                savedVideoResult: {
                    id: saved.id,
                    name: saved.name,
                    creator: saved.creator,
                    url: saved.url,
                    thumbnailUrl: saved.thumbnailUrl
                }
            });

            return saved;
        } catch (error) {
            console.error(`[${type}] 비디오 생성 실패:`, error);

            // 실패 시 알림 상태 업데이트
            if (notificationId && userId) {
                try {
                    await NotificationUpdateService.updateNotification(parseInt(notificationId), {
                        status: 'FAILED',
                        errorMessage: error instanceof Error ? error.message : '비디오 생성 중 오류가 발생했습니다.',
                        userId: userId
                    });
                    console.log(`[${type}] 알림 상태 FAILED로 업데이트 완료`);
                } catch (updateError) {
                    console.error(`[${type}] 알림 상태 업데이트 실패:`, updateError);
                }
            }

            throw error;
        }
    },
    {
        connection,
        concurrency: 3,
        prefix: '{video-queue}',
    },
);

worker.on('completed', (job) => {
    console.log(`✅ 작업 완료: ${job.data.type} (jobId: ${job.id})`);
});

worker.on('failed', (job, err) => {
    console.error(`❌ 작업 실패: ${job?.data?.type || 'unknown'} (jobId: ${job?.id || 'unknown'})`, err.message);
});

console.log('✅ video-generation worker started');
