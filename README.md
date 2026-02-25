# 科科灵 (Kekeling) 陪诊服务管理平台

> 专业的陪诊服务运营管理系统，为医疗陪诊行业提供一站式后台解决方案。

---

## 📋 项目简介

科科灵是一个面向陪诊服务行业的管理后台系统，帮助运营团队高效管理陪诊员、订单、用户和医疗资源。本项目是整个陪诊服务产品矩阵的核心管理端。

### 产品矩阵

```
┌─────────────────────────────────────────────────────────────┐
│                    科科灵 陪诊服务平台                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────────┐     ┌─────────────┐                      │
│   │  管理后台   │     │  后端 API   │                       │
│   │   (React)  │ ←── │  (NestJS)   │                       │
│   └─────────────┘     └─────────────┘                      │
│          │                   │                              │
│          └───────────────────┘                              │
│                    │                                        │
│          ┌─────────┴─────────┐                              │
│          ▼                   ▼                              │
│   ┌─────────────┐     ┌─────────────┐                      │
│   │ 微信小程序  │     │  App (规划) │                       │
│   │  (Taro)    │     │             │                       │
│   └─────────────┘     └─────────────┘                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 📊 当前数据规模

| 类别 | 数量 | 说明 |
|------|------|------|
| 医院 | 50 家 | 北京国家级 32 家 + 三级医院 18 家 |
| 科室 | 858 个 | 关联到各医院 |
| 医生 | 723 位 | 分布在各科室 |
| 科室库模板 | 120+ 个 | 标准科室字典 |
| 陪诊员 | 10 名 | 不同等级和服务区域 |
| 服务分类 | 5 类 | 挂号/陪诊/代办/咨询/体检 |
| 服务项目 | 10+ 项 | 完整定价和配置 |

---

## ✨ 功能特性

### 核心业务模块开发进度

| 模块 | 功能描述 | 后端 | 前端 | 状态 |
|------|---------|------|------|------|
| 🏥 **医疗资源管理** | 医院库、科室库、医生库管理 | ✅ | ✅ | 已完成 |
| 👨‍⚕️ **陪诊员管理** | 陪诊员档案、状态管理、医院关联 | ✅ | ✅ | 已完成 |
| 📦 **订单管理** | 订单全流程、派单、状态流转 | ✅ | ✅ | 已完成 |
| 👥 **用户管理** | 用户信息、就诊人、订单历史 | ✅ | ✅ | 已完成 |
| 💰 **业务配置** | 服务分类、服务管理、接单设置 | ✅ | ✅ | 已完成 |
| 📊 **数据看板** | 运营数据统计、报表分析 | ✅ | ✅ | 已完成 |

### 订单状态流转

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  待支付  │ →  │  待接单  │ →  │  已确认  │ →  │  已派单  │ →  │  服务中  │ →  │  已完成  │
│ pending  │    │   paid   │    │confirmed │    │ assigned │    │in_progress│   │completed │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
                     │               │               │
                     ▼               ▼               ▼
               ┌──────────┐    ┌──────────┐    ┌──────────┐
               │  已取消  │    │  退款中  │ →  │  已退款  │
               │cancelled │    │refunding │    │ refunded │
               └──────────┘    └──────────┘    └──────────┘
```

### 系统特性

- 🎨 **统一主题色** - 后台设置主题色，自动同步到所有终端（管理后台、小程序）
- 🌓 亮色/暗色模式切换
- 📱 响应式设计，支持多端访问
- ♿ 无障碍访问支持
- 📁 可折叠侧边栏导航
- 🔍 全局搜索命令
- 🔄 RTL（从右到左）语言支持

### 小程序特性

- 📱 **H5 优先开发** - 浏览器中完成 90% 开发，最后适配微信
- 🎨 **动态主题色** - 主色调从后台配置读取，全局生效
- 🔧 **自定义 TabBar** - 使用 Lucide 图标，支持主题色
- 🔐 **环境适配层** - H5/小程序双端兼容（登录、支付、定位）
- 📦 **跨端组件** - PhoneAuth、MapView 等自适应组件

---

## 🛠️ 技术栈

### 管理后台 (Admin)

| 类别 | 技术 |
|------|------|
| **前端框架** | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **UI 框架** | [ShadcnUI](https://ui.shadcn.com)（TailwindCSS + RadixUI） |
| **构建工具** | [Vite](https://vitejs.dev/) |
| **路由** | [TanStack Router](https://tanstack.com/router/latest) |
| **状态管理** | [Zustand](https://zustand-demo.pmnd.rs/) |
| **数据请求** | [TanStack Query](https://tanstack.com/query/latest) |
| **表格处理** | [TanStack Table](https://tanstack.com/table/latest) |
| **表单验证** | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| **图标库** | [Lucide Icons](https://lucide.dev/icons/) |

### 后端 API (Server)

| 类别 | 技术 |
|------|------|
| **框架** | [NestJS](https://nestjs.com/) |
| **ORM** | [Prisma](https://www.prisma.io/) |
| **数据库** | [PostgreSQL](https://www.postgresql.org/) |
| **认证** | JWT |
| **容器化** | Docker + Docker Compose |

### 小程序 (Miniapp)

| 类别 | 技术 |
|------|------|
| **跨端框架** | [Taro 3.x](https://taro.zone/) + React |
| **UI 组件** | 自定义组件 + NutUI |
| **图标库** | [Lucide Icons](https://lucide.dev/icons/) |
| **开发模式** | H5 优先（Browser → Simulator → Real Device） |
| **状态管理** | React Hooks |

---

## 📁 项目结构

```
kekeling/
├── src/                  # 管理后台前端 (React)
│   ├── components/       # 通用组件
│   │   ├── ui/          # ShadcnUI 基础组件
│   │   ├── layout/      # 布局组件
│   │   └── data-table/  # 数据表格组件
│   ├── features/        # 业务功能模块
│   │   ├── medical/     # 医疗资源 (医院/科室/医生)
│   │   ├── escorts/     # 陪诊员管理
│   │   ├── business/    # 业务中心 (订单/服务/设置)
│   │   ├── users/       # 用户管理
│   │   ├── dashboard/   # 数据看板
│   │   └── settings/    # 系统设置
│   ├── hooks/           # 自定义 Hooks (API 调用)
│   ├── lib/             # 工具函数 + API 封装
│   └── routes/          # 路由配置
│
├── server/               # 后端 API (NestJS)
│   ├── src/
│   │   ├── modules/     # 业务模块
│   │   │   ├── admin/        # 管理端 API
│   │   │   ├── hospitals/    # 医院
│   │   │   ├── departments/  # 科室
│   │   │   ├── doctors/      # 医生
│   │   │   ├── orders/       # 订单
│   │   │   ├── services/     # 服务
│   │   │   ├── service-categories/ # 服务分类
│   │   │   ├── config/       # 系统配置
│   │   │   └── users/        # 用户
│   │   └── prisma/      # 数据库服务
│   └── prisma/
│       ├── schema.prisma # 数据库模型
│       └── seed.ts       # 种子数据
│
├── miniapp-shell/        # 微信小程序宿主壳 (Taro)
│   ├── src/
│   │   ├── components/   # 公共组件
│   │   │   ├── Icon/           # Lucide 图标封装
│   │   │   ├── CustomTabBar/   # 自定义底部导航
│   │   │   ├── PhoneAuth/      # 手机号授权（H5/小程序）
│   │   │   └── MapView/        # 地图组件（H5/小程序）
│   │   ├── pages/        # 页面
│   │   │   ├── index/          # 首页
│   │   │   ├── services/       # 服务列表/详情
│   │   │   ├── orders/         # 订单列表/详情
│   │   │   ├── user/           # 个人中心
│   │   │   ├── booking/        # 预约下单
│   │   │   └── workbench/      # 陪诊员工作台
│   │   ├── services/     # API 接口
│   │   └── utils/        # 工具函数
│   │       ├── env-adapter.ts  # H5/小程序环境适配
│   │       └── theme.ts        # 主题色管理
│   └── config/           # Taro 配置
│
├── packages/             # 共享代码包
│   └── shared-types/    # 共享类型定义
│
├── docs/                 # 项目文档
│
├── docker-compose.yml    # Docker 生产环境配置
└── docker-compose.dev.yml # Docker 开发环境配置
```

---

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- pnpm >= 8
- Docker (推荐)

### 方式一：Docker 一键启动（推荐）

```bash
# 克隆项目
git clone https://github.com/donhauser001/kekeling.git
cd kekeling

# 启动所有服务 (PostgreSQL + API + Admin)
docker-compose up -d

# 访问
# - 管理后台: http://localhost
# - API 接口: http://localhost:3000/api
# - 数据库管理: http://localhost:8080 (Adminer)
```

### 方式二：本地开发

```bash
# 1. 启动数据库
docker-compose -f docker-compose.dev.yml up -d

# 2. 启动后端
cd server
pnpm install
pnpm dev

# 3. 启动前端 (新终端)
cd ..
pnpm install
pnpm dev
```

### 方式三：小程序开发

```bash
# 1. 启动数据库 + 后端
docker-compose -f docker-compose.dev.yml up -d
cd server && pnpm dev

# 2. 启动小程序 H5 模式 (新终端)
cd miniapp-shell
pnpm install
pnpm dev:h5

# 3. 浏览器访问 http://localhost:10086
```

### 常用命令

```bash
# 管理后台
pnpm dev          # 启动开发服务器
pnpm build        # 构建生产版本

# 后端
cd server
pnpm dev          # 启动后端开发服务器
pnpm db:seed      # 初始化种子数据
pnpm db:studio    # 打开 Prisma Studio

# 小程序
cd miniapp-shell
pnpm dev:h5       # H5 开发模式 (推荐)
pnpm dev:weapp    # 微信小程序模式
pnpm build:weapp  # 构建小程序

# Docker
docker-compose up -d --build    # 重新构建并启动
docker-compose logs -f api      # 查看后端日志
```

---

## 📡 API 端点概览

### 医疗资源

| 端点 | 说明 |
|------|------|
| `GET /hospitals` | 医院列表（分页、筛选） |
| `GET /departments` | 科室列表 |
| `GET /doctors` | 医生列表 |
| `GET /department-templates` | 科室库模板 |

### 业务中心

| 端点 | 说明 |
|------|------|
| `GET /service-categories` | 服务分类 |
| `GET /services` | 服务列表 |
| `GET /config` | 系统配置 |

### 管理端

| 端点 | 说明 |
|------|------|
| `GET /admin/orders` | 订单管理 |
| `GET /admin/escorts` | 陪诊员管理 |
| `GET /admin/users` | 用户管理 |
| `GET /admin/dashboard` | 数据看板 |

### 配置接口

| 端点 | 说明 |
|------|------|
| `GET /config/theme/settings` | 获取主题设置（主色调、品牌名） |
| `PUT /config/theme/settings` | 更新主题设置 |
| `GET /config/:key` | 获取单个配置 |
| `PUT /config/:key` | 更新单个配置 |

---

## 📖 相关文档

- [小程序 H5 优先开发计划](./docs/小程序H5优先开发计划.md) ⭐ **推荐阅读**
- [用户端产品规划文档](./docs/用户端产品规划文档.md)
- [医疗资源板块规划文档](./docs/医疗资源板块规划文档.md)
- [业务中心开发规划文档](./docs/业务中心开发规划文档.md)
- [陪诊员模块开发规划文档](./docs/陪诊员模块开发规划文档.md)
- [API 接口规范文档](./docs/API接口规范文档.md)
- [Docker 部署指南](./docs/Docker部署指南.md)
- [MVP 紧急上线执行计划](./docs/MVP紧急上线执行计划.md)

---

## 📄 许可证

基于 [MIT 许可证](https://choosealicense.com/licenses/mit/) 开源
