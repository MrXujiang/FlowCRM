#!/bin/bash

# NO-CRM 一键部署脚本
# 使用方法: ./deploy.sh [服务器IP或域名]

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}NO-CRM 项目部署脚本${NC}"
echo -e "${GREEN}================================${NC}"

# 检查参数
if [ -z "$1" ]; then
    echo -e "${RED}错误: 请提供服务器地址${NC}"
    echo "使用方法: ./deploy.sh user@server-ip"
    echo "示例: ./deploy.sh root@192.168.1.100"
    exit 1
fi

SERVER=$1
PROJECT_NAME="no-crm"
REMOTE_DIR="/var/www/${PROJECT_NAME}"

echo -e "${YELLOW}目标服务器: ${SERVER}${NC}"
echo ""

# 1. 构建前端
echo -e "${YELLOW}[1/6] 构建前端项目...${NC}"
cd frontend
npm run build
cd ..
echo -e "${GREEN}✓ 前端构建完成${NC}"
echo ""

# 2. 构建后端
echo -e "${YELLOW}[2/6] 构建后端项目...${NC}"
cd backend
npm run build
cd ..
echo -e "${GREEN}✓ 后端构建完成${NC}"
echo ""

# 3. 在服务器上创建目录结构
echo -e "${YELLOW}[3/6] 在服务器上创建目录...${NC}"
ssh ${SERVER} "mkdir -p ${REMOTE_DIR}/{frontend,backend,uploads,logs,data}"
echo -e "${GREEN}✓ 目录创建完成${NC}"
echo ""

# 4. 上传文件
echo -e "${YELLOW}[4/6] 上传文件到服务器...${NC}"

# 上传前端构建文件
echo "  - 上传前端文件..."
rsync -avz --delete frontend/dist/ ${SERVER}:${REMOTE_DIR}/frontend/

# 上传后端文件
echo "  - 上传后端文件..."
rsync -avz --delete backend/dist/ ${SERVER}:${REMOTE_DIR}/backend/dist/
rsync -avz backend/package*.json ${SERVER}:${REMOTE_DIR}/backend/
rsync -avz backend/ecosystem.config.js ${SERVER}:${REMOTE_DIR}/backend/

# 上传Nginx配置
echo "  - 上传Nginx配置..."
rsync -avz deploy/nginx.conf ${SERVER}:${REMOTE_DIR}/

echo -e "${GREEN}✓ 文件上传完成${NC}"
echo ""

# 5. 在服务器上安装依赖并配置
echo -e "${YELLOW}[5/6] 在服务器上安装依赖...${NC}"
ssh ${SERVER} << 'ENDSSH'
cd /var/www/no-crm/backend

# 安装生产依赖
echo "  - 安装Node.js依赖..."
npm install --production

# 创建logs目录
mkdir -p logs

# 检查PM2是否已安装
if ! command -v pm2 &> /dev/null; then
    echo "  - 安装PM2..."
    npm install -g pm2
fi

# 停止旧进程(如果存在)
pm2 delete no-crm-backend 2>/dev/null || true

# 启动新进程
echo "  - 启动后端服务..."
pm2 start ecosystem.config.js

# 保存PM2配置
pm2 save

# 设置PM2开机自启
pm2 startup systemd -u $(whoami) --hp $(eval echo ~$(whoami)) 2>/dev/null || true

ENDSSH
echo -e "${GREEN}✓ 后端服务启动完成${NC}"
echo ""

# 6. 配置Nginx
echo -e "${YELLOW}[6/6] 配置Nginx...${NC}"
ssh ${SERVER} << 'ENDSSH'
# 检查Nginx是否已安装
if ! command -v nginx &> /dev/null; then
    echo "  - Nginx未安装，正在安装..."
    if command -v apt-get &> /dev/null; then
        sudo apt-get update
        sudo apt-get install -y nginx
    elif command -v yum &> /dev/null; then
        sudo yum install -y nginx
    else
        echo "无法自动安装Nginx，请手动安装"
        exit 1
    fi
fi

# 复制Nginx配置
echo "  - 配置Nginx..."
sudo cp /var/www/no-crm/nginx.conf /etc/nginx/sites-available/no-crm
sudo ln -sf /etc/nginx/sites-available/no-crm /etc/nginx/sites-enabled/no-crm

# 删除默认配置(如果存在)
sudo rm -f /etc/nginx/sites-enabled/default

# 测试Nginx配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx

ENDSSH
echo -e "${GREEN}✓ Nginx配置完成${NC}"
echo ""

# 完成
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}部署完成！${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo -e "访问地址: http://你的服务器IP"
echo -e "后端API: http://你的服务器IP/api"
echo ""
echo -e "${YELLOW}重要提示：${NC}"
echo "1. 请修改 deploy/nginx.conf 中的 server_name 为你的域名"
echo "2. 建议配置SSL证书以启用HTTPS"
echo "3. 查看后端日志: ssh ${SERVER} 'pm2 logs no-crm-backend'"
echo "4. 查看PM2状态: ssh ${SERVER} 'pm2 status'"
echo ""
