<div align="center">

<img src="./demo.png" alt="FlowCRM Demo" width="100%" />

# 🚀 FlowCRM

**A Lightweight, Out-of-the-Box Modern CRM System**

[简体中文](README.md) | [English](README_EN.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue.svg)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11.x-red.svg)](https://nestjs.com/)
[![Vue.js](https://img.shields.io/badge/Vue.js-3.5-green.svg)](https://vuejs.org/)

[Live Demo](#) | [Quick Start](#quick-start) | [Documentation](#documentation) | [Report Issues](https://github.com/MrXujiang/FlowCRM/issues)

</div>

---

## 📖 Introduction

**FlowCRM** is a lightweight Customer Relationship Management (CRM) system designed for small teams and individual sales professionals. Built with a modern frontend-backend separation architecture and **zero database dependencies** (uses JSON file storage), allowing you to deploy and start using it in just a few minutes.

### ✨ Key Features

- 🎯 **Zero Configuration** - No database required, uses JSON file storage, ready to use
- 🚀 **Modern Tech Stack** - NestJS + Vue 3 + TypeScript, elegant and maintainable
- 🎨 **Beautiful UI** - Based on Tencent's TDesign component library
- 📊 **Data Visualization** - Real-time dashboards powered by ECharts
- 🔐 **Access Control** - JWT authentication with role-based permissions
- 📱 **Responsive Design** - Perfect for desktop and mobile devices
- 🛠️ **Easy to Extend** - Modular design for easy feature additions
- 🚢 **One-Click Deploy** - Automated deployment scripts, production-ready in 3 minutes

### 🎯 Use Cases

- 📈 Customer management for small startups
- 💼 Lead tracking for individual sales
- 🏢 Sales process management for SMBs
- 🎓 Learning project for modern full-stack development
- 🔧 Foundation template for custom CRM systems

---

## 🏗️ Tech Stack

### Backend
- **[NestJS](https://nestjs.com/)** - Enterprise-grade Node.js framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[JWT](https://jwt.io/)** - Secure authentication
- **[Passport](http://www.passportjs.org/)** - Flexible authentication middleware
- **[class-validator](https://github.com/typestack/class-validator)** - Data validation

### Frontend
- **[Vue 3](https://vuejs.org/)** - Progressive framework with Composition API
- **[Vite](https://vitejs.dev/)** - Lightning-fast build tool
- **[TDesign Vue Next](https://tdesign.tencent.com/)** - Enterprise UI components
- **[Pinia](https://pinia.vuejs.org/)** - Vue official state management
- **[Vue Router](https://router.vuejs.org/)** - Official routing
- **[Axios](https://axios-http.com/)** - HTTP client
- **[ECharts](https://echarts.apache.org/)** - Data visualization

### System Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Browser Client                      │
│                  (Vue 3 + TDesign)                  │
└──────────────────┬──────────────────────────────────┘
                   │ HTTP/REST API
                   │ JWT Token
┌──────────────────┴──────────────────────────────────┐
│              NestJS Backend Service                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐    │
│  │   Auth     │  │ Customers  │  │   Leads    │    │
│  └────────────┘  └────────────┘  └────────────┘    │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐    │
│  │ Activities │  │   Tasks    │  │ Statistics │    │
│  └────────────┘  └────────────┘  └────────────┘    │
│                      │                               │
│            JsonStorageService                        │
└──────────────────────┬──────────────────────────────┘
                       │ File I/O
┌──────────────────────┴──────────────────────────────┐
│              JSON File Storage                       │
│  users.json | customers.json | leads.json           │
│  activities.json | tasks.json                       │
└──────────────────────────────────────────────────────┘
```

---

## 💡 Core Features

### 1️⃣ User Authentication & Authorization
- ✅ User registration and login (JWT Token)
- ✅ Role-based access control (Admin/Sales)
- ✅ Protected routes and API endpoints

### 2️⃣ Customer Management
- ✅ Full CRUD operations for customers
- ✅ Search by name, company, phone
- ✅ Customer tags and categorization
- ✅ Source tracking
- ✅ Complete customer profiles

### 3️⃣ Sales Lead Management
- ✅ Lead creation and stage progression
- ✅ Visual lead pipeline (Uncontacted → In Progress → Closed/Invalid)
- ✅ Interest level assessment
- ✅ Lead-customer association
- ✅ Quick filters for follow-up leads

### 4️⃣ Activity Tracking
- ✅ Log customer interactions (Call/Email/Meeting/Other)
- ✅ Timeline view of interaction history
- ✅ Activity notes and attachments
- ✅ Next follow-up reminders

### 5️⃣ Task Management
- ✅ Create to-do tasks
- ✅ Priority levels (High/Medium/Low)
- ✅ Associate with customers or leads
- ✅ Task status (Todo/Completed)
- ✅ Due date reminders

### 6️⃣ Data Visualization Dashboard
- ✅ Real-time statistics for customers, leads, tasks
- ✅ 7-day data trend charts
- ✅ Lead stage distribution pie charts
- ✅ Task priority bar charts
- ✅ Activity type radar charts
- ✅ Task status donut charts

---

## 🚀 Quick Start

### Requirements

- **Node.js**: >= 16.0.0
- **npm**: >= 7.0.0 (or yarn/pnpm)

### Local Development

#### 1. Clone the repository

```bash
git clone https://github.com/MrXujiang/FlowCRM.git
cd FlowCRM/source
```

#### 2. Install and start backend

```bash
cd backend
npm install
npm run start:dev
```

Backend will run at `http://localhost:3000`

#### 3. Install and start frontend (new terminal)

```bash
cd ../frontend
npm install
npm run dev
```

Frontend will run at `http://localhost:5173`

#### 4. Access the system

Open `http://localhost:5173` in your browser

### First Time Use

1. Click the "Register" tab to create an account
2. Login and start using all features
3. Recommended to create an admin account first

---

## 📁 Project Structure

```
FlowCRM/
├── source/
│   ├── backend/                  # Backend service
│   │   ├── src/
│   │   │   ├── auth/            # Authentication module (JWT)
│   │   │   ├── customers/       # Customer management
│   │   │   ├── leads/           # Lead management
│   │   │   ├── activities/      # Activity tracking
│   │   │   ├── tasks/           # Task management
│   │   │   ├── statistics/      # Data statistics
│   │   │   ├── common/          # Common services (JSON storage)
│   │   │   ├── app.module.ts    # Application main module
│   │   │   └── main.ts          # Application entry
│   │   └── package.json
│   │
│   ├── frontend/                 # Frontend application
│   │   ├── src/
│   │   │   ├── api/             # API interface layer
│   │   │   ├── views/           # Page components
│   │   │   │   ├── Login.vue       # Login page
│   │   │   │   ├── Dashboard.vue   # Data dashboard
│   │   │   │   ├── Customers.vue   # Customer management
│   │   │   │   ├── Leads.vue       # Lead management
│   │   │   │   ├── Activities.vue  # Activity tracking
│   │   │   │   └── Tasks.vue       # Task management
│   │   │   ├── layouts/         # Layout components
│   │   │   ├── stores/          # Pinia state management
│   │   │   ├── router/          # Vue Router
│   │   │   └── main.ts          # Application entry
│   │   └── package.json
│   │
│   ├── data/                     # Data storage (auto-generated)
│   │   ├── users.json           # User data
│   │   ├── customers.json       # Customer data
│   │   ├── leads.json           # Lead data
│   │   ├── activities.json      # Activity records
│   │   └── tasks.json           # Task data
│   │
│   ├── docs/                     # Development documentation
│   │   ├── 01-项目概览.md
│   │   ├── 02-后端开发指南.md
│   │   ├── 03-前端开发指南.md
│   │   ├── 04-数据大屏开发.md
│   │   └── 05-常见问题FAQ.md
│   │
│   ├── deploy/                   # Deployment scripts and configs
│   │   ├── deploy.sh            # Automated deployment script
│   │   ├── check.sh             # Environment check script
│   │   ├── nginx.conf           # Nginx configuration
│   │   ├── DEPLOY.md            # Full deployment guide
│   │   └── QUICKSTART.md        # Quick deployment guide
│   │
│   └── prd.md                    # Product requirements
│
└── README.md                     # This file
```

---

## 🚢 Production Deployment

### Quick Deploy (3 minutes)

FlowCRM provides automated deployment scripts for easy Linux server deployment.

#### 1. Configure

Edit `source/deploy/nginx.conf` line 2:
```nginx
server_name your-domain.com;  # Change to your domain or IP
```

#### 2. Deploy

```bash
cd source/deploy
./check.sh                               # Check environment
./deploy.sh root@your-server-ip          # Start deployment
```

#### 3. Access

```
http://your-server-ip
```

Detailed deployment guide: [source/deploy/QUICKSTART.md](source/deploy/QUICKSTART.md)

---

## 🎯 Technical Highlights

### 1. Zero-Database JSON Storage

Custom `JsonStorageService` for data persistence with full CRUD operations:

```typescript
// Core Features
- Auto-creates data files and directories
- Generic type support
- Pagination support
- Thread-safe read/write operations
- Easy backup and migration
```

**Advantages:**
- ✅ No database installation or configuration needed
- ✅ Data files are directly readable and editable
- ✅ Native version control support
- ✅ Lightweight, suitable for small to medium data scale

### 2. Modular NestJS Architecture

Each business module is independently encapsulated following single responsibility principle:

```typescript
// Module Structure
Module (Module Definition)
  ├── Controller (Routing Layer)
  ├── Service (Business Logic)
  └── DTO (Data Transfer Object)
```

**Advantages:**
- ✅ High cohesion and low coupling
- ✅ Easy to unit test
- ✅ Convenient for feature extensions
- ✅ Team collaboration friendly

### 3. Vue 3 Composition API Best Practices

Fully utilizes Composition API for elegant and maintainable code:

```typescript
// Composable Functions
- Unified API interface layer
- Reactive state management (Pinia)
- Custom Hooks for logic reuse
- TypeScript type constraints
```

**Advantages:**
- ✅ Better logic reuse
- ✅ Clearer code organization
- ✅ Better TypeScript support
- ✅ Smaller bundle size

### 4. Enterprise-Grade UI Components

Built on Tencent's TDesign for out-of-the-box enterprise components:

```typescript
// Core Components
- Table component (pagination, search, sorting)
- Form component (complete validation)
- Dialog component (unified interaction)
- Message notification (friendly user feedback)
```

**Advantages:**
- ✅ Unified design standards
- ✅ Accessibility support
- ✅ Theme customization
- ✅ Rich component ecosystem

### 5. Real-time Data Visualization

Professional data dashboards using ECharts:

```typescript
// Chart Types
- Line charts: Data trend analysis
- Pie/Donut charts: Proportion analysis
- Bar charts: Comparison analysis
- Radar charts: Multi-dimensional evaluation
```

**Features:**
- ✅ Responsive chart adaptation
- ✅ Rich animation effects
- ✅ Data drill-down support
- ✅ Perfect mobile adaptation

### 6. JWT Authentication & Access Control

Complete user authentication and authorization system:

```typescript
// Security Mechanisms
- JWT Token stateless authentication
- Route-level permission guards
- Role-based access control (RBAC)
- Password encryption storage (bcrypt)
```

**Advantages:**
- ✅ No session storage needed
- ✅ Supports distributed deployment
- ✅ Fine-grained permission control
- ✅ High security

---

## 📚 Documentation

### Development Documentation

- [Project Overview](source/docs/01-项目概览.md)
- [Backend Development Guide](source/docs/02-后端开发指南.md)
- [Frontend Development Guide](source/docs/03-前端开发指南.md)
- [Dashboard Development](source/docs/04-数据大屏开发.md)
- [FAQ](source/docs/05-常见问题FAQ.md)

### Deployment Documentation

- [Quick Deployment Guide](source/deploy/QUICKSTART.md) - 3-minute quick deploy
- [Full Deployment Guide](source/deploy/DEPLOY.md) - Production environment setup

### API Documentation

Access after starting backend service: `http://localhost:3000/api`

---

## 🛠️ Development Guide

### Adding New Modules

1. Generate module using NestJS CLI:
```bash
cd source/backend/src
nest g module your-module
nest g controller your-module
nest g service your-module
```

2. Create DTO:
```bash
mkdir your-module/dto
touch your-module/dto/your-module.dto.ts
```

3. Register module in `app.module.ts`

### Code Standards

- Use ESLint and Prettier for code formatting
- Follow TypeScript strict mode
- Use meaningful variable and function names
- Add necessary comments

### Git Commit Standards

```
feat: New feature
fix: Bug fix
docs: Documentation update
style: Code formatting
refactor: Code refactoring
test: Testing related
chore: Build/tooling related
```

---

## 🤝 Contributing

Contributions are welcome! Whether reporting bugs, suggesting features, or submitting code.

### How to Contribute

1. Fork this project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Standards

- Ensure code passes ESLint checks
- Add test cases for new features
- Update related documentation
- Maintain consistent code style

---

## 📝 Changelog

### v1.0.0 (2025-12)

- ✨ Initial release
- ✅ Complete customer management
- ✅ Sales lead tracking
- ✅ Activity tracking
- ✅ Task management
- ✅ Data visualization dashboard
- ✅ User authentication & authorization
- ✅ Automated deployment scripts

---

## 📄 License

This project is licensed under the [MIT](LICENSE) License.

---

## 🙏 Acknowledgments

Thanks to these amazing open-source projects:

- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [Vue.js](https://vuejs.org/) - Progressive JavaScript framework
- [TDesign](https://tdesign.tencent.com/) - Tencent enterprise design system
- [ECharts](https://echarts.apache.org/) - Apache data visualization library
- [TypeScript](https://www.typescriptlang.org/) - JavaScript superset

---

## 📮 Contact

- Submit Issues: [GitHub Issues](https://github.com/MrXujiang/FlowCRM/issues)
- Email: xujiang156@qq.com
- Website: http://no-crm.flowmix.cn

---

## ⭐ Star History

If this project helps you, please give us a Star ⭐️

[![Star History Chart](https://api.star-history.com/svg?repos=MrXujiang/FlowCRM&type=Date)](https://star-history.com/#MrXujiang/FlowCRM&Date)

---

<div align="center">

Made with ❤️ by FlowCRM Team

**If this project helps you, please give it a ⭐️**

[⬆ Back to Top](#-flowcrm)

</div>
