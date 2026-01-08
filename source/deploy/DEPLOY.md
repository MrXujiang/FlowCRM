# NO-CRM 项目部署指南

## 🚀 一键部署

### 前置要求

**本地环境：**
- Node.js 18+
- npm 或 yarn
- SSH 访问目标服务器的权限

**服务器环境：**
- Ubuntu 20.04+ / CentOS 7+
- Node.js 18+ (脚本会自动检查)
- 至少 1GB 可用内存
- 至少 5GB 可用磁盘空间

### 快速部署

1. **修改 Nginx 配置**
   
   编辑 `deploy/nginx.conf`，修改第 2 行：
   ```nginx
   server_name your-domain.com;  # 改为你的域名或服务器IP
   ```

2. **执行部署脚本**
   
   ```bash
   cd /Users/xuxiaoxi/Desktop/pay-wx/github/NO-CRM
   ./deploy/deploy.sh root@your-server-ip
   ```
   
   示例：
   ```bash
   ./deploy/deploy.sh root@192.168.1.100
   # 或使用域名
   ./deploy/deploy.sh root@example.com
   ```

3. **等待部署完成**
   
   脚本会自动完成以下步骤：
   - ✅ 构建前端项目
   - ✅ 构建后端项目
   - ✅ 创建服务器目录结构
   - ✅ 上传所有文件
   - ✅ 安装依赖
   - ✅ 配置并启动 PM2
   - ✅ 配置并启动 Nginx

4. **访问应用**
   
   部署完成后，访问：
   ```
   http://your-server-ip
   ```

## 📁 服务器目录结构

```
/var/www/no-crm/
├── frontend/           # 前端静态文件
│   ├── index.html
│   └── assets/
├── backend/           # 后端应用
│   ├── dist/         # 编译后的代码
│   ├── node_modules/
│   ├── package.json
│   ├── ecosystem.config.js
│   └── logs/         # 应用日志
│       ├── out.log   # 标准输出
│       └── err.log   # 错误日志
├── uploads/          # 用户上传的文件
├── data/            # JSON 数据文件
└── nginx.conf       # Nginx 配置
```

## 🔧 手动部署

如果一键部署脚本不适用，可以按以下步骤手动部署：

### 1. 构建项目

```bash
# 构建前端
cd frontend
npm install
npm run build

# 构建后端
cd ../backend
npm install
npm run build
```

### 2. 上传文件到服务器

```bash
# 上传前端
scp -r frontend/dist/* root@your-server:/var/www/no-crm/frontend/

# 上传后端
scp -r backend/dist root@your-server:/var/www/no-crm/backend/
scp backend/package*.json root@your-server:/var/www/no-crm/backend/
scp backend/ecosystem.config.js root@your-server:/var/www/no-crm/backend/

# 上传配置
scp deploy/nginx.conf root@your-server:/var/www/no-crm/
```

### 3. 服务器端配置

SSH 登录到服务器：

```bash
ssh root@your-server
```

安装依赖并启动服务：

```bash
# 进入后端目录
cd /var/www/no-crm/backend

# 安装生产依赖
npm install --production

# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start ecosystem.config.js

# 保存 PM2 配置
pm2 save

# 设置开机自启
pm2 startup
```

配置 Nginx：

```bash
# 安装 Nginx (Ubuntu)
apt-get update
apt-get install -y nginx

# 或 CentOS
yum install -y nginx

# 复制配置文件
cp /var/www/no-crm/nginx.conf /etc/nginx/sites-available/no-crm
ln -s /etc/nginx/sites-available/no-crm /etc/nginx/sites-enabled/no-crm

# 删除默认配置
rm /etc/nginx/sites-enabled/default

# 测试配置
nginx -t

# 启动 Nginx
systemctl start nginx
systemctl enable nginx
```

## 🛠️ 常用运维命令

### PM2 命令

```bash
# 查看应用状态
pm2 status

# 查看日志
pm2 logs no-crm-backend

# 重启应用
pm2 restart no-crm-backend

# 停止应用
pm2 stop no-crm-backend

# 删除应用
pm2 delete no-crm-backend

# 监控应用
pm2 monit
```

### Nginx 命令

```bash
# 测试配置
nginx -t

# 重启 Nginx
systemctl restart nginx

# 查看状态
systemctl status nginx

# 查看日志
tail -f /var/log/nginx/no-crm-access.log
tail -f /var/log/nginx/no-crm-error.log
```

### 系统维护

```bash
# 查看磁盘使用
df -h

# 查看内存使用
free -h

# 查看端口占用
netstat -tlnp | grep 3000
netstat -tlnp | grep 80

# 清理日志
pm2 flush
```

## 🔒 安全建议

1. **配置防火墙**
   ```bash
   # 开放 HTTP/HTTPS 端口
   ufw allow 80/tcp
   ufw allow 443/tcp
   ufw enable
   ```

2. **配置 HTTPS**
   
   使用 Let's Encrypt 免费 SSL 证书：
   ```bash
   # 安装 Certbot
   apt-get install certbot python3-certbot-nginx
   
   # 获取证书
   certbot --nginx -d your-domain.com
   
   # 自动续期
   certbot renew --dry-run
   ```

3. **修改默认端口**
   
   如果需要，可以修改后端端口（在 `backend/ecosystem.config.js` 中）

4. **配置数据库备份**
   
   创建定时任务备份 `data` 目录：
   ```bash
   # 编辑 crontab
   crontab -e
   
   # 添加每天凌晨 2 点备份
   0 2 * * * tar -czf /backup/no-crm-data-$(date +\%Y\%m\%d).tar.gz /var/www/no-crm/data/
   ```

## 🔄 更新部署

当代码有更新时，重新执行部署脚本即可：

```bash
cd /Users/xuxiaoxi/Desktop/pay-wx/github/NO-CRM
git pull  # 如果使用 Git
./deploy/deploy.sh root@your-server-ip
```

或者手动更新：

```bash
# 本地构建
cd frontend && npm run build && cd ..
cd backend && npm run build && cd ..

# 上传到服务器
rsync -avz --delete frontend/dist/ root@your-server:/var/www/no-crm/frontend/
rsync -avz --delete backend/dist/ root@your-server:/var/www/no-crm/backend/dist/

# 服务器端重启
ssh root@your-server "cd /var/www/no-crm/backend && pm2 restart no-crm-backend"
```

## 📊 监控和日志

### 应用日志

```bash
# 实时查看应用日志
pm2 logs no-crm-backend --lines 100

# 查看错误日志
tail -f /var/www/no-crm/backend/logs/err.log

# 查看输出日志
tail -f /var/www/no-crm/backend/logs/out.log
```

### Nginx 日志

```bash
# 访问日志
tail -f /var/log/nginx/no-crm-access.log

# 错误日志
tail -f /var/log/nginx/no-crm-error.log
```

### 性能监控

```bash
# PM2 监控
pm2 monit

# 查看系统资源
htop
```

## ❓ 常见问题

### 1. 部署失败：无法连接服务器

**解决方案：**
- 检查 SSH 密钥配置
- 确认服务器 IP 地址正确
- 检查防火墙设置

### 2. Nginx 启动失败

**解决方案：**
```bash
# 检查配置文件
nginx -t

# 查看错误日志
tail -f /var/log/nginx/error.log

# 检查端口占用
netstat -tlnp | grep 80
```

### 3. 后端服务无法启动

**解决方案：**
```bash
# 查看 PM2 日志
pm2 logs no-crm-backend

# 检查 Node.js 版本
node -v  # 需要 18+

# 检查端口占用
netstat -tlnp | grep 3000
```

### 4. 文件上传失败

**解决方案：**
```bash
# 检查 uploads 目录权限
chmod 755 /var/www/no-crm/uploads
chown -R www-data:www-data /var/www/no-crm/uploads

# 检查 Nginx 配置中的 client_max_body_size
```

### 5. 跨域问题

**解决方案：**
- 确认 Nginx 配置正确
- 检查前端 API 地址配置
- 查看浏览器控制台错误信息

## 📞 技术支持

如遇到其他问题，请检查：
1. 服务器系统日志：`journalctl -xe`
2. Nginx 错误日志：`/var/log/nginx/error.log`
3. PM2 应用日志：`pm2 logs`

---
