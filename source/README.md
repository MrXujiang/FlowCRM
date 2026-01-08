# NO-CRM 轻量级客户管理系统

一个基于 Vue3 + NestJS 的轻量级 CRM 系统，帮助小团队或个体销售快速管理客户和销售机会。

## 功能特性

### ✅ 已实现功能

- **用户认证**
  - 用户注册与登录
  - JWT token 认证
  - 角色权限控制（管理员/销售）

- **客户管理**
  - 客户列表查看与搜索
  - 新建、编辑、删除客户
  - 客户详情查看
  - 标签管理
  
- **线索管理**
  - 线索状态流转（未跟进→跟进中→已合格→已成交/无效）
  - 意向等级管理
  - 线索筛选

- **跟进记录**
  - 多种跟进方式（电话、邮件、会议等）
  - 时间线展示
  - 下次跟进提醒

- **任务管理**
  - 待办事项管理
  - 优先级设置
  - 到期提醒
  - 任务状态切换

- **文件上传**
  - 支持图片、PDF、Word、Excel 文件上传
  - 客户附件管理
  - 文件在线预览和下载

- **数据大屏**
  - 实时统计数据展示
  - Echarts 图表可视化
  - 多维度数据分析

- **其他功能**
  - 分页支持（所有列表）
  - Mock 数据生成
  - 数据搜索和筛选

## 技术栈

### 后端
- NestJS 10.x
- TypeScript
- JWT 认证
- JSON 文件存储

### 前端
- Vue 3.5
- TypeScript
- TDesign Vue Next
- Pinia 状态管理
- Vue Router
- Axios
- Echarts 5.x

## 快速开始

### 环境要求
- Node.js >= 16.x
- npm >= 8.x

### 1. 安装依赖

#### 后端
```bash
cd backend
npm install
```

#### 前端
```bash
cd frontend
npm install
```

### 2. 启动项目

#### 启动后端服务
```bash
cd backend
npm run start:dev
```
后端服务将在 http://localhost:3000 启动

#### 启动前端服务
```bash
cd frontend
npm run dev
```
前端服务将在 http://localhost:5173 启动

### 3. 访问系统

打开浏览器访问 http://localhost:5173

## 🚀 生产部署

### 一键部署到服务器

```bash
# 1. 修改 Nginx 配置
# 编辑 deploy/nginx.conf，修改 server_name 为你的域名或IP

# 2. 执行部署脚本
./deploy/deploy.sh root@your-server-ip
```

详细部署文档请查看：[deploy/DEPLOY.md](deploy/DEPLOY.md)

### 部署特性

- ✅ Nginx 反向代理
- ✅ PM2 进程守护
- ✅ 静态资源服务
- ✅ Gzip 压缩
- ✅ 日志管理
- ✅ 开机自启

### 3. 访问系统

打开浏览器访问 http://localhost:5173

## 使用说明

### 首次使用

1. 点击"注册"标签页
2. 填写注册信息（姓名、邮箱、密码、角色）
3. 注册成功后自动登录进入系统

### 功能操作

#### 客户管理
- 新建客户：点击"新建客户"按钮，填写客户信息
- 搜索客户：在搜索框输入关键词（姓名、电话、公司）
- 查看详情：点击列表中的"查看"链接
- 编辑客户：点击"编辑"修改客户信息
- 删除客户：点击"删除"并确认

#### 线索管理
- 新建线索：点击"新建线索"，填写线索信息
- 状态筛选：使用下拉框筛选不同状态的线索
- 更新状态：编辑线索可更新状态和意向等级

#### 跟进记录
- 新建记录：点击"新建跟进记录"，选择跟进方式并填写内容
- 设置提醒：可设置下次跟进提醒时间
- 查看提醒：点击"即将提醒"查看所有待提醒的跟进

#### 任务管理
- 新建任务：点击"新建任务"，设置标题、截止时间和优先级
- 状态筛选：切换"全部/待办/已完成"查看不同状态的任务
- 完成任务：点击"完成"标记任务为已完成
- 到期提醒：点击"即将到期"查看3天内到期的任务

## 数据存储

数据以 JSON 文件形式存储在 `/data` 目录下：
- `users.json` - 用户数据
- `customers.json` - 客户数据
- `leads.json` - 线索数据
- `activities.json` - 跟进记录
- `tasks.json` - 任务数据

## 权限说明

- **管理员（admin）**：可查看和管理所有数据
- **销售（sales）**：仅可查看和管理自己的数据

## 目录结构

```
NO-CRM/
├── backend/              # 后端服务
│   ├── src/
│   │   ├── auth/        # 认证模块
│   │   ├── customers/   # 客户管理
│   │   ├── leads/       # 线索管理
│   │   ├── activities/  # 跟进记录
│   │   ├── tasks/       # 任务管理
│   │   ├── upload/      # 文件上传
│   │   ├── statistics/  # 统计分析
│   │   └── common/      # 公共服务
│   ├── ecosystem.config.js  # PM2 配置
│   └── package.json
├── frontend/            # 前端应用
│   ├── src/
│   │   ├── api/        # API 接口
│   │   ├── views/      # 页面组件
│   │   ├── layouts/    # 布局组件
│   │   ├── stores/     # 状态管理
│   │   └── router/     # 路由配置
│   ├── .env.production  # 生产环境配置
│   └── package.json
├── deploy/              # 部署相关
│   ├── deploy.sh    # 一键部署脚本
│   ├── nginx.conf   # Nginx 配置
│   └── DEPLOY.md    # 部署文档
├── uploads/             # 上传文件目录
├── data/                # 数据存储目录
└── prd.md              # 产品需求文档
```

## 注意事项

1. 首次启动时 data 目录会自动创建
2. 密码长度至少 6 位
3. 所有时间均为本地时间
4. 删除操作不可恢复，请谨慎操作

## 后续扩展

根据 PRD 文档，系统预留了以下扩展方向：
- 报表与数据分析
- 自动化提醒与邮件推送
- 集成外部渠道（微信、短信）
- 高级权限与团队绩效管理

## 开发命令

### 后端
```bash
npm run start          # 生产模式启动
npm run start:dev      # 开发模式启动（热重载）
npm run build          # 构建生产版本
```

### 前端
```bash
npm run dev            # 开发模式启动
npm run build          # 构建生产版本
npm run preview        # 预览构建结果
```
