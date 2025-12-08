# 科科灵陪诊后端 API

基于 NestJS + Prisma + MySQL 的后端服务。

## 🚀 快速开始

### 1. 安装依赖

```bash
cd server
pnpm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env`，并填写配置：

```bash
# 数据库配置
DATABASE_URL="mysql://root:password@localhost:3306/kekeling"

# JWT 配置
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# 微信小程序配置
WECHAT_APPID="wx6e10ab2c3b2c8c73"
WECHAT_SECRET="your-wechat-secret"

# 微信支付配置 (可选，后续配置)
WECHAT_PAY_MCHID="your-merchant-id"
WECHAT_PAY_SERIAL_NO="your-serial-no"
WECHAT_PAY_PRIVATE_KEY_PATH="./certs/apiclient_key.pem"
WECHAT_PAY_API_V3_KEY="your-api-v3-key"

# 服务配置
PORT=3000
NODE_ENV=development
```

### 3. 初始化数据库

```bash
# 生成 Prisma Client
pnpm db:generate

# 同步数据库结构
pnpm db:push

# 或使用迁移（生产环境推荐）
pnpm db:migrate
```

### 4. 启动服务

```bash
# 开发模式（热重载）
pnpm dev

# 生产模式
pnpm build
pnpm start:prod
```

服务启动后：
- API 地址：http://localhost:3000/api
- Swagger 文档：http://localhost:3000/api/docs

## 📋 API 接口

### 用户端接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/auth/weixin` | POST | 微信登录 |
| `/api/auth/bind-phone` | POST | 绑定手机号 |
| `/api/home/config` | GET | 首页配置 |
| `/api/services` | GET | 服务列表 |
| `/api/services/:id` | GET | 服务详情 |
| `/api/hospitals` | GET | 医院列表 |
| `/api/hospitals/:id` | GET | 医院详情 |
| `/api/escorts` | GET | 陪诊员列表 |
| `/api/escorts/:id` | GET | 陪诊员详情 |
| `/api/patients` | GET/POST | 就诊人管理 |
| `/api/orders` | GET/POST | 订单管理 |

### 管理端接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/admin/dashboard/statistics` | GET | 仪表盘统计 |
| `/api/admin/orders` | GET | 订单列表 |
| `/api/admin/orders/:id/assign` | POST | 订单派单 |
| `/api/admin/escorts` | GET | 陪诊员列表 |
| `/api/admin/escorts/available` | GET | 可派单陪诊员 |

## 🗄️ 数据库结构

- `users` - 用户表
- `patients` - 就诊人表
- `service_categories` - 服务分类表
- `services` - 服务表
- `hospitals` - 医院表
- `escorts` - 陪诊员表
- `escort_hospitals` - 陪诊员-医院关联表
- `orders` - 订单表
- `banners` - 轮播图表
- `configs` - 系统配置表
- `admins` - 管理员表

## 🔧 开发说明

### 目录结构

```
server/
├── prisma/
│   └── schema.prisma    # 数据库模型定义
├── src/
│   ├── common/          # 公共模块
│   ├── modules/         # 业务模块
│   │   ├── auth/        # 认证模块
│   │   ├── users/       # 用户模块
│   │   ├── services/    # 服务模块
│   │   ├── hospitals/   # 医院模块
│   │   ├── escorts/     # 陪诊员模块
│   │   ├── orders/      # 订单模块
│   │   ├── patients/    # 就诊人模块
│   │   ├── home/        # 首页模块
│   │   ├── upload/      # 上传模块
│   │   └── admin/       # 管理端模块
│   ├── prisma/          # Prisma 服务
│   ├── app.module.ts    # 主模块
│   └── main.ts          # 入口文件
└── package.json
```

### 添加测试数据

可以通过 Prisma Studio 添加测试数据：

```bash
pnpm db:studio
```

## 📝 待办事项

- [ ] 微信支付对接
- [ ] 管理员认证
- [ ] 文件上传到 OSS
- [ ] 短信验证码
- [ ] 订单通知推送

