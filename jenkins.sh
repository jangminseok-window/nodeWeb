#!/bin/bash

# Node.js 애플리케이션 재시작
pkill -f "node app.js"
cd /path/to/your/app
nohup node app.js > app.log 2>&1 &

# 또는 Apache 재시작
sudo systemctl restart apache2

echo "Deployment completed and services restarted"