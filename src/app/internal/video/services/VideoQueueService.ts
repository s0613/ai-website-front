// src/app/internal/video/services/VideoQueueService.ts

import { Queue } from 'bullmq';

//
// VideoJobData: 큐에 넣을 작업 데이터 타입
//
export interface VideoJobData {
    type: 'kling' | 'wan' | 'hunyuan' | 'veo2' | 'pixverse';
    prompt: string;
    imageUrl: string;
    userId: string;
    notificationId?: string;
    duration?: string;
    aspect_ratio?: string;
    seed?: number;
    enableSafetyChecker?: boolean;
    camera_control?: string;
    negative_prompt?: string;
    style?: string;
    resolution?: string;
    [key: string]: unknown;
}

const redisConnection = {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379'),
    ...(process.env.REDIS_TLS === 'true' && { tls: {} }),
    enableReadyCheck: false,
    maxRetriesPerRequest: 3,
};

export const videoQueue = new Queue<VideoJobData>(
    'video-generation',
    {
        connection: redisConnection,
        prefix: '{video-queue}'
    }
);

export type JobStatusResponse =
    | { status: 'not_found' }
    | { status: string; result?: unknown };

export async function addVideoJob(
    type: VideoJobData['type'],
    data: VideoJobData
): Promise<string> {
    const job = await videoQueue.add(
        type,
        data,
        {
            attempts: 3,
            backoff: { type: 'exponential', delay: 1000 },
        }
    );
    return job.id ?? '';
}

export async function getJobStatus(jobId: string): Promise<JobStatusResponse> {
    const job = await videoQueue.getJob(jobId);
    if (!job) {
        return { status: 'not_found' };
    }
    const state = await job.getState();
    const result = job.returnvalue;
    return { status: state, result };
}
