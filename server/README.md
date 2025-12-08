# 科科灵陪诊后端 API

基于 NestJS + Prisma + PostgreSQL 的后端服务。

## 🐳 Docker 部署（推荐）

### 一键启动全部服务

```bash
# 在项目根目录执行
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f api
```

服务启动后：
- **API 服务**: http://localhost:3000/api
- **API 文档**: http://localhost:3000/api/docs
- **数据库管理**: http://localhost:8080 (Adminer)
  - 服务器: `postgres`
  - 用户名: `kekeling`
  - 密码: `kekeling123`
  - 数据库: `kekeling`

### 停止服务

```bash
docker-compose down

# 删除数据卷（清空数据库）
docker-compose down -v
```

---

## 💻 本地开发

### 1. 启动数据库（Docker）

```bash
# 仅启动 PostgreSQL
docker-compose -f docker-compose.dev.yml up -d
```

### 2. 配置环境变量

```bash
cd server

# 创建 .env 文件
cat > .env << 'EOF'
DATABASE_URL="postgresql://kekeling:kekeling123@localhost:5432/kekeling?schema=public"
JWT_SECRET="kekeling-jwt-secret-key-dev"
JWT_EXPIRES_IN="7d"
WECHAT_APPID="wx6e10ab2c3b2c8c73"
WECHAT_SECRET="your-wechat-secret"
PORT=3000
NODE_ENV=development
EOF
```

### 3. 安装依赖 & 初始化

```bash
# 安装依赖
pnpm install

# 生成 Prisma Client
npx prisma generate

# 同步数据库结构
npx prisma db push

# 添加测试数据
npx ts-node prisma/seed.ts
```

### 4. 启动开发服务

```bash
pnpm dev
```

---

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

---

## 🗄️ 数据库

### 连接信息

| 项目 | 值 |
|------|------|
| 类型 | PostgreSQL 15 |
| 主机 | localhost (开发) / postgres (Docker) |
| 端口 | 5432 |
| 用户名 | kekeling |
| 密码 | kekeling123 |
| 数据库 | kekeling |

### 数据库管理

```bash
# Prisma Studio (GUI)
npx prisma studio

# 或使用 Adminer
# http://localhost:8080
```

### 数据库迁移

```bash
# 同步 schema 到数据库
npx prisma db push

# 创建迁移文件（生产环境推荐）
npx prisma migrate dev --name init

# 应用迁移
npx prisma migrate deploy
```

---

## 🔮 未来规划：AI 向量索引

PostgreSQL + pgvector 支持向量搜索，可用于：

1. **智能搜索** - 语义匹配服务
2. **推荐系统** - 医院/医生推荐
3. **智能客服** - RAG 问答

```sql
-- 启用 pgvector 扩展
CREATE EXTENSION vector;

-- 添加向量列
ALTER TABLE services ADD COLUMN embedding vector(1536);
```

---

## 📝 常用命令

```bash
# 开发
pnpm dev          # 启动开发服务器
pnpm build        # 构建生产版本
pnpm start:prod   # 启动生产服务器

# 数据库
pnpm db:generate  # 生成 Prisma Client
pnpm db:push      # 同步数据库
pnpm db:studio    # 打开数据库管理界面

# Docker
docker-compose up -d              # 启动全部服务
docker-compose -f docker-compose.dev.yml up -d  # 仅启动数据库
docker-compose logs -f api        # 查看日志
docker-compose down               # 停止服务
```
