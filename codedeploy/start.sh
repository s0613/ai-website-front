#!/bin/bash
set -euo pipefail
APP_DIR="/home/ec2-user/trynic-front"
LOG="/home/ec2-user/deploy.log"

echo "=== [Start] $(date) ===" | tee -a "$LOG"
cd "$APP_DIR"

# PORT=3000 으로 next start
if pm2 info trynic-front >/dev/null 2>&1; then
  pm2 reload trynic-front --update-env
else
  pm2 start npm --name "trynic-front" -- start
fi

pm2 save
sudo systemctl restart nginx
