#!/bin/bash
set -e

LOG_FILE="/home/ec2-user/deploy.log"
DEPLOY_DIR="/home/ec2-user/trynic-front"

# 1) 로그 파일이 없으면 생성
if [ ! -f "$LOG_FILE" ]; then
  touch "$LOG_FILE"
  chown ec2-user:ec2-user "$LOG_FILE"
  chmod 664 "$LOG_FILE"
fi

echo "> [BeforeInstall] 시작" | tee -a "$LOG_FILE"

# 2) 기존 PM2 프로세스 종료
if pm2 list | grep -q "trynic-front"; then
  echo "> 기존 PM2 프로세스 중지" | tee -a "$LOG_FILE"
  pm2 delete trynic-front || true
fi

# 3) 기존 배포 폴더 삭제 (백업하지 않음)
if [ -d "$DEPLOY_DIR" ]; then
  echo "> 기존 배포 폴더 삭제 진행" | tee -a "$LOG_FILE"
  rm -rf "$DEPLOY_DIR"
fi

# 4) 새 배포 폴더 생성 및 권한 설정
echo "> 배포 폴더 생성" | tee -a "$LOG_FILE"
mkdir -p "$DEPLOY_DIR"
chown -R ec2-user:ec2-user "$DEPLOY_DIR"
chmod -R 755 "$DEPLOY_DIR"

# 5) .env.production 파일이 있으면 소유권·권한 고정
if [ -f "$DEPLOY_DIR/.env.production" ]; then
  echo "> .env.production 소유권 및 권한 설정" | tee -a "$LOG_FILE"
  chown ec2-user:ec2-user "$DEPLOY_DIR/.env.production"
  chmod 600 "$DEPLOY_DIR/.env.production"
else
  echo "> ⚠ .env.production 파일이 없습니다: $DEPLOY_DIR/.env.production" | tee -a "$LOG_FILE"
fi

echo "> [BeforeInstall] 완료" | tee -a "$LOG_FILE"
