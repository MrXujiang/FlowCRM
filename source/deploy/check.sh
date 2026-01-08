#!/bin/bash

# 部署前检查清单

echo "================================"
echo "NO-CRM 部署前检查"
echo "================================"
echo ""

# 颜色
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

check_pass=0
check_fail=0

# 检查 Node.js
echo -n "检查 Node.js 版本... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓${NC} $NODE_VERSION"
    ((check_pass++))
else
    echo -e "${RED}✗ 未安装${NC}"
    ((check_fail++))
fi

# 检查 npm
echo -n "检查 npm 版本... "
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✓${NC} $NPM_VERSION"
    ((check_pass++))
else
    echo -e "${RED}✗ 未安装${NC}"
    ((check_fail++))
fi

# 检查后端依赖
echo -n "检查后端依赖... "
if [ -d "backend/node_modules" ]; then
    echo -e "${GREEN}✓${NC} 已安装"
    ((check_pass++))
else
    echo -e "${YELLOW}⚠${NC} 未安装，请运行: cd backend && npm install"
    ((check_fail++))
fi

# 检查前端依赖
echo -n "检查前端依赖... "
if [ -d "frontend/node_modules" ]; then
    echo -e "${GREEN}✓${NC} 已安装"
    ((check_pass++))
else
    echo -e "${YELLOW}⚠${NC} 未安装，请运行: cd frontend && npm install"
    ((check_fail++))
fi

# 检查 deploy.sh 执行权限
echo -n "检查部署脚本权限... "
if [ -x "deploy/deploy.sh" ]; then
    echo -e "${GREEN}✓${NC} 有执行权限"
    ((check_pass++))
else
    echo -e "${YELLOW}⚠${NC} 无执行权限，请运行: chmod +x deploy/deploy.sh"
    ((check_fail++))
fi

# 检查 Nginx 配置
echo -n "检查 Nginx 配置... "
if grep -q "your-domain.com" deploy/nginx.conf; then
    echo -e "${YELLOW}⚠${NC} 请修改 deploy/nginx.conf 中的 server_name"
    ((check_fail++))
else
    echo -e "${GREEN}✓${NC} 已配置"
    ((check_pass++))
fi

# 检查 uploads 目录
echo -n "检查 uploads 目录... "
if [ -d "uploads" ]; then
    echo -e "${GREEN}✓${NC} 已存在"
    ((check_pass++))
else
    echo -e "${YELLOW}⚠${NC} 不存在，正在创建..."
    mkdir -p uploads
    echo -e "${GREEN}✓${NC} 已创建"
    ((check_pass++))
fi

echo ""
echo "================================"
echo -e "检查完成: ${GREEN}$check_pass${NC} 通过, ${RED}$check_fail${NC} 失败"
echo "================================"

if [ $check_fail -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ 所有检查通过，可以开始部署！${NC}"
    echo ""
    echo "部署命令:"
    echo "  ./deploy/deploy.sh root@your-server-ip"
    echo ""
    exit 0
else
    echo ""
    echo -e "${YELLOW}⚠ 请先解决上述问题再进行部署${NC}"
    echo ""
    exit 1
fi
