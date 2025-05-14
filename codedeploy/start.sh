#!/bin/bash
set -euo pipefail
APP_DIR="/home/ec2-user/trynic-front"
LOG="/home/ec2-user/deploy.log"
PORT=3000                # nginx upstream에서 참조

echo "=== [Start] $(date) ===" | tee -a "$LOG"
cd "$APP_DIR"

export NODE_ENV=production
export PORT

# 스탠드얼론 실행
if pm2 info trynic-front >/dev/null 2>&1; then
  pm2 reload trynic-front --update-env
else
  pm2 start "node server.js" \
       --name trynic-front \
       --log "$APP_DIR/pm2.log"
fi

pm2 save
sudo systemctl restart nginx
