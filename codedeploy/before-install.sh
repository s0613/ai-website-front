#!/bin/bash
set -euo pipefail

APP_DIR="/home/ec2-user/trynic-front"
LOG="/home/ec2-user/deploy.log"

echo "=== [BeforeInstall] $(date) ===" | tee -a "$LOG"

# 1) pm2 종료
if command -v pm2 >/dev/null 2>&1; then
  pm2 delete trynic-front || true
fi

# 2) 이전 코드 삭제
rm -rf "$APP_DIR"
mkdir -p "$APP_DIR"
chown ec2-user:ec2-user "$APP_DIR"
