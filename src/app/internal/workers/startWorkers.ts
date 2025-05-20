// 워커 프로세스 시작 스크립트
// 이 파일은 Node.js에서만 실행됩니다 (Next.js 외부)
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// 환경 변수 로드
const NODE_ENV = process.env.NODE_ENV || 'development';
let envFile = '.env.local';

// production 환경이면 .env.production 사용
if (NODE_ENV === 'production') {
    envFile = '.env.production';
}

// 프로젝트 루트 디렉토리 찾기
const rootDir = process.cwd();
const envPath = path.resolve(rootDir, envFile);

// 환경 변수 파일 존재 여부 확인
if (fs.existsSync(envPath)) {
    console.log(`🔧 환경 변수 로드 중: ${envPath}`);
    dotenv.config({ path: envPath });
} else {
    console.warn(`⚠️ 환경 변수 파일을 찾을 수 없습니다: ${envPath}`);
    // 기본 .env 파일 시도
    const defaultEnvPath = path.resolve(rootDir, '.env');
    if (fs.existsSync(defaultEnvPath)) {
        console.log(`🔧 기본 환경 변수 로드 중: ${defaultEnvPath}`);
        dotenv.config({ path: defaultEnvPath });
    }
}

// 환경 변수 로드 후 나머지 모듈 임포트
import './videoWorker';
import { getRedisClient } from '../utils/redis';
import { videoProcessQueue, videoStatusQueue } from '../utils/videoQueue';

// 시작 시간 기록
const startTime = new Date();
console.log(`\n========================================`);
console.log(`🚀 비디오 처리 워커 시작 [${startTime.toISOString()}]`);
console.log(`========================================`);
console.log(`🔄 비동기 아키텍처: Redis + Bull Queue`);
console.log(`⏱️ 폴링 간격: 10초마다 상태 확인`);
console.log(`💾 결과 저장소: Redis (TTL: 24시간)`);
console.log(`----------------------------------------`);

// 시스템 정보 출력
console.log(`💻 시스템 정보:`);
console.log(`   - 노드 버전: ${process.version}`);
console.log(`   - 플랫폼: ${process.platform}`);
console.log(`   - 아키텍처: ${process.arch}`);
console.log(`   - 메모리 사용량: ${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`);
console.log(`   - 환경: ${process.env.NODE_ENV || 'development'}`);
console.log(`----------------------------------------`);

// 큐 상태 모니터링 함수
async function monitorQueueStatus() {
    try {
        const processCount = await videoProcessQueue.getJobCounts();
        const statusCount = await videoStatusQueue.getJobCounts();

        console.log(`\n📊 큐 상태 [${new Date().toISOString()}]`);
        console.log(`   [비디오 처리 큐] 활성: ${processCount.active}, 대기: ${processCount.waiting}, 지연: ${processCount.delayed}, 완료: ${processCount.completed}, 실패: ${processCount.failed}`);
        console.log(`   [상태 확인 큐] 활성: ${statusCount.active}, 대기: ${statusCount.waiting}, 지연: ${statusCount.delayed}, 완료: ${statusCount.completed}, 실패: ${statusCount.failed}`);
    } catch (error) {
        console.error('큐 상태 모니터링 오류:', error);
    }
}

// 주기적으로 큐 상태 확인 (1분마다)
const monitorInterval = setInterval(monitorQueueStatus, 60 * 1000);

// 시작 시 한번 큐 상태 출력
setTimeout(monitorQueueStatus, 2000);

// 건강 확인
async function checkHealth() {
    try {
        // Redis 연결 확인
        const redis = await getRedisClient();
        await redis.ping();
        console.log(`✅ Redis 연결 상태: 정상`);

        // 큐 상태 확인
        const isProcessQueueHealthy = await videoProcessQueue.isReady();
        const isStatusQueueHealthy = await videoStatusQueue.isReady();

        console.log(`✅ 비디오 처리 큐 상태: ${isProcessQueueHealthy ? '정상' : '비정상'}`);
        console.log(`✅ 상태 확인 큐 상태: ${isStatusQueueHealthy ? '정상' : '비정상'}`);

        console.log(`✨ 워커 시스템 건강 상태: 정상`);
    } catch (error) {
        console.error(`❌ 워커 시스템 건강 확인 실패:`, error);
    }
}

// 시작 시 건강 상태 확인
setTimeout(checkHealth, 3000);

// Graceful shutdown 처리
process.on('SIGTERM', async () => {
    console.log(`\n🛑 워커 종료 시작 [${new Date().toISOString()}]...`);
    clearInterval(monitorInterval);

    try {
        // 진행 중인 작업 마무리를 위한 대기
        console.log('📤 활성 작업 정리 중...');
        await videoProcessQueue.close();
        await videoStatusQueue.close();

        // Redis 연결 닫기
        const redis = await getRedisClient();
        await redis.quit();
        console.log('🔌 Redis 연결 종료됨');
    } catch (error) {
        console.error('종료 중 오류 발생:', error);
    }

    const runTime = (new Date().getTime() - startTime.getTime()) / 1000;
    console.log(`⏱️ 총 실행 시간: ${Math.floor(runTime / 60)}분 ${Math.floor(runTime % 60)}초`);
    console.log(`👋 워커 종료 완료`);
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('\n👤 사용자에 의한 종료 요청');
    // SIGTERM 핸들러와 동일한 로직 실행
    process.emit('SIGTERM');
}); 