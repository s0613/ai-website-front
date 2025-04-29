#!/bin/bash
set -e

LOG_FILE="/home/ec2-user/deploy.log"
DEPLOY_DIR="/home/ec2-user/trynic-front"

# 1) 로그 파일이 없으면 생성 및 권한 설정
if [ ! -f "$LOG_FILE" ]; then
  touch "$LOG_FILE"
  chown ec2-user:ec2-user "$LOG_FILE"
  chmod 664 "$LOG_FILE"
fi

echo "> [AfterInstall] 시작" | tee -a "$LOG_FILE"

# 2) 배포 디렉터리로 이동
cd "$DEPLOY_DIR"

# 3) .env.production 로드 (export)
if [ -f ".env.production" ]; then
  echo "> .env.production 로드" | tee -a "$LOG_FILE"
  export $(grep -v '^#' .env.production | sed '/^$/d' | xargs)
else
  echo "> ⚠ .env.production 파일이 없습니다: $DEPLOY_DIR/.env.production" | tee -a "$LOG_FILE"
fi

# 4) PATH 보장
export PATH=/usr/bin:/usr/local/bin:$PATH

# 5) 의존성 설치
echo "> npm ci 실행" | tee -a "$LOG_FILE"
npm ci 2>&1 | tee -a "$LOG_FILE"
echo "> npm ci 완료" | tee -a "$LOG_FILE"

# 6) 프로덕션 빌드 (ESLint 비활성화)
echo "> npm run build 실행 (ESLint 무시)" | tee -a "$LOG_FILE"
npm run build -- --no-lint 2>&1 | tee -a "$LOG_FILE"
echo "> npm run build 완료" | tee -a "$LOG_FILE"

# 7) PM2 설치 (없으면)
if ! command -v pm2 &> /dev/null; then
  echo "> PM2 설치" | tee -a "$LOG_FILE"
  npm install -g pm2 2>&1 | tee -a "$LOG_FILE"
fi

# 8) PM2로 애플리케이션 시작 또는 reload
if pm2 info trynic-front > /dev/null 2>&1; then
  echo "> PM2 Zero Downtime Reload" | tee -a "$LOG_FILE"
  pm2 reload trynic-front --update-env 2>&1 | tee -a "$LOG_FILE"
else
  echo "> PM2 Start New Process" | tee -a "$LOG_FILE"
  pm2 start npm --name "trynic-front" -- start 2>&1 | tee -a "$LOG_FILE"
fi

# 9) PM2 프로세스 리스트 저장
pm2 save 2>&1 | tee -a "$LOG_FILE"
echo "> PM2 프로세스 리스트 저장 완료" | tee -a "$LOG_FILE"

# 10) nginx 재시작
echo "> nginx 재시작" | tee -a "$LOG_FILE"
sudo systemctl restart nginx 2>&1 | tee -a "$LOG_FILE"
echo "> nginx 재시작 완료" | tee -a "$LOG_FILE"

echo "> [AfterInstall] 완료" | tee -a "$LOG_FILE"
