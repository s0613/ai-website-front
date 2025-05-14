#!/bin/bash
set -euo pipefail
APP_DIR="/home/ec2-user/trynic-front"
LOG="/home/ec2-user/deploy.log"

echo "=== [AfterInstall] $(date) ===" | tee -a "$LOG"

cd "$APP_DIR"

# .env.production 권한
chmod 600 .env.production

# Node / PM2 보증
if ! command -v node >/dev/null 2>&1; then
  sudo yum -y install nodejs
fi

if ! command -v pm2 >/dev/null 2>&1; then
  npm install -g pm2
fi

# (node_modules을 zip에 포함하지 않았다면)
# npm ci --omit=dev
