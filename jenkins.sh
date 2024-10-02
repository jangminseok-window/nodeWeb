#!/bin/bash

# Node.js 애플리케이션 재시작
pkill -f "node promiseConn.js"
cd /home/ubuntu/nodeWeb/mySql
nohup /home/ubuntu/.nvm/versions/node/v22.9.0/bin/node promiseConn.js > promiseConn.log 2>&1 &


# 또는 Apache 재시작
sudo systemctl restart apache2

echo "Deployment completed and services restarted"