#!/bin/bash
set -e

LOG_FILE="/home/ec2-user/deploy.log"
DEPLOY_DIR="/home/ec2-user/trynic-front"

echo "> [AfterInstall] 시작" | tee -a "$LOG_FILE"

if [ ! -d "$DEPLOY_DIR" ]; then
  echo "🚨 배포 폴더가 존재하지 않습니다: $DEPLOY_DIR" | tee -a "$LOG_FILE"
  exit 1
fi

cd "$DEPLOY_DIR"

# 의존성 설치
echo "> npm ci 실행" | tee -a "$LOG_FILE"
npm ci
echo "> npm ci 완료" | tee -a "$LOG_FILE"

# Next.js 애플리케이션 빌드 (ESLint 비활성화)
echo "> npm run build 실행 (ESLint 무시)" | tee -a "$LOG_FILE"
npm run build -- --no-lint
echo "> npm run build 완료" | tee -a "$LOG_FILE"

# PM2 설치 (필요 시)
if ! command -v pm2 &> /dev/null; then
  echo "> PM2 설치" | tee -a "$LOG_FILE"
  npm install -g pm2
fi

# PM2를 사용한 애플리케이션 실행 (이미 실행 중이면 reload)
if pm2 info trynic-front > /dev/null 2>&1; then
  echo "> PM2 Zero Downtime Reload" | tee -a "$LOG_FILE"
  pm2 reload trynic-front --update-env
else
  echo "> PM2 Start New Process" | tee -a "$LOG_FILE"
  pm2 start npm --name "trynic-front" -- start
fi

# PM2 프로세스 리스트 저장 (재부팅 시 자동 복원용)
pm2 save
echo "> PM2 프로세스 리스트 저장 완료" | tee -a "$LOG_FILE"

# nginx 재시작 (필요 시, 환경에 따라 명령어 변경)
echo "> nginx 재시작" | tee -a "$LOG_FILE"
sudo systemctl restart nginx
echo "> nginx 재시작 완료" | tee -a "$LOG_FILE"

echo "> [AfterInstall] 완료" | tee -a "$LOG_FILE"
