# 服务器信息

## 云服务器

| 项目 | 值 |
|------|-----|
| IP | 8.130.23.38 |
| 用户名 | root |
| 密码 | Kekeling.2581264 |
| 域名 | kkl.top |
| 系统 | Alibaba Cloud Linux 3 |

## 服务端口

| 服务 | 端口 |
|------|------|
| Nginx | 80, 443 |
| NestJS API | 3000 |
| PostgreSQL | 5432 |
| Redis | 6379 |

## 数据库

| 项目 | 值 |
|------|-----|
| 数据库名 | kekeling |
| 用户名 | kekeling |
| 密码 | kekeling_dev_123 |
| 端口 | 5432 |

## 常用命令

```bash
# SSH 连接
sshpass -p 'Kekeling.2581264' ssh -o StrictHostKeyChecking=no root@8.130.23.38

# 查看服务状态
pm2 list
pm2 logs kekeling-api --lines 50

# 重启服务
pm2 restart kekeling-api

# 查看 Nginx 状态
systemctl status nginx

# 查看数据库状态
systemctl status postgresql-13

# 查看 Redis 状态
systemctl status redis

# 部署后端代码（排除敏感文件和依赖）
cd /Users/aiden/Documents/app/kekeling
rsync -avz --delete --exclude='node_modules' --exclude='.env' --exclude='uploads' --exclude='dist' \
  -e "sshpass -p 'Kekeling.2581264' ssh -o StrictHostKeyChecking=no" \
  server/ root@8.130.23.38:/var/www/kekeling/server/

# 服务器上安装依赖并构建后端
sshpass -p 'Kekeling.2581264' ssh root@8.130.23.38 "cd /var/www/kekeling/server && CI=true pnpm install && pnpm build && pm2 restart kekeling-api"

# 部署前端（先本地构建，再上传到服务器）
cd /Users/aiden/Documents/app/kekeling
pnpm vite build
rsync -avz --delete -e "sshpass -p 'Kekeling.2581264' ssh -o StrictHostKeyChecking=no" \
  dist/ root@8.130.23.38:/var/www/kekeling/dist/

# 服务器上查看 Git 状态
ssh root@8.130.23.38 "cd /var/www/kekeling/server && git status"

# 服务器上查看提交历史
ssh root@8.130.23.38 "cd /var/www/kekeling/server && git log --oneline -10"

# 服务器上回滚到上一个版本
ssh root@8.130.23.38 "cd /var/www/kekeling/server && git checkout HEAD~1 . && pnpm build && pm2 restart kekeling-api"
```

## 目录结构

```
/var/www/kekeling/
├── server/          # NestJS 后端
│   ├── src/         # 源代码
│   ├── dist/        # 编译输出
│   ├── uploads/     # 上传文件
│   └── .env         # 环境变量
└── dist/            # 前端静态文件 (Nginx 托管，root 指向此目录)
```

## SSL 证书

- 证书路径: `/etc/nginx/cert/kkl.top.pem`
- 私钥路径: `/etc/nginx/cert/kkl.top.key`

## 微信小程序配置

| 项目 | 值 |
|------|-----|
| AppID | wx6e10ab2c3b2c8c73 |
| AppSecret | 7db1a3479e51b9d73cf12ae05b16b1db |

## Nginx 配置

- 配置文件: `/etc/nginx/conf.d/kekeling.conf`
- 前端根目录: `root /var/www/kekeling/dist;`
- 关键配置:
  - `/uploads/` 使用 `^~` 修饰符优先匹配，代理到后端
  - `/api/` 代理到 `http://127.0.0.1:3000`（后端以 HTTP 模式运行，Nginx 处理 HTTPS 终结）
  - 其他路径走前端 SPA (`try_files $uri $uri/ /index.html`)

## Git 版本管理

服务器已配置本地 Git 仓库，用于追踪代码变更。

```bash
# 部署后自动提交（推荐）
sshpass -p 'Kekeling.2581264' ssh root@8.130.23.38 "cd /var/www/kekeling/server && git add -A && git commit -m 'Deploy: $(date +%Y%m%d_%H%M%S)' || true"
```

**.gitignore 配置**:
- `node_modules/` - 依赖包
- `dist/` - 编译输出
- `uploads/` - 用户上传文件
- `.env` - 环境变量
- `*.log` - 日志文件

---

## 修复记录

### 2025-12-19

1. **数据库端口**: .env 中 5434 → 5432
2. **数据库密码**: 重置 kekeling 用户密码
3. **微信 AppSecret**: 更新为真实值
4. **缺失依赖**: 添加 multer 包
5. **文件名双扩展名**: 修复 upload.controller.ts
6. **Nginx uploads 路径**: 使用 `^~` 优先匹配 + proxy_pass
7. **图片 URL**: 添加 getFullImageUrl 工具函数处理相对路径

### 2025-12-20 生产事故复盘

#### 事故概述

| 项目 | 内容 |
|------|------|
| **时间** | 23:26 - 23:41 (约15分钟) |
| **影响** | 后端 API 完全不可用，所有请求返回 502 |
| **PM2 重启次数** | 275+ 次 |
| **根因** | 错误的 rsync `--delete` 命令删除了关键文件 |

#### 错误命令

```bash
# ❌ 错误：--delete 会删除目标目录中不在源列表的所有文件
rsync -avz --delete -e "..." dist/ prisma/ package.json pnpm-lock.yaml root@server:/var/www/kekeling/server/
```

#### 被删除的关键文件

| 文件 | 后果 |
|------|------|
| `.env` | JWT_SECRET 丢失，NestJS 启动失败 |
| `node_modules/` | 模块加载失败 |
| `dist/` 目录结构 | 主入口文件找不到 |
| `uploads/fonts/` | 小程序图标全部丢失（iconfont 字体文件）|

#### 修复过程

1. 重新上传 `dist/` 目录
2. 服务器执行 `pnpm install` 安装依赖
3. 执行 `npx prisma generate` 生成 Prisma 客户端
4. 恢复 `.env` 文件（注意数据库端口是 5432）
5. **修改 Nginx 配置**：`proxy_pass https://` → `proxy_pass http://`（后端恢复后以 HTTP 模式运行）
6. **修复 WECHAT_SECRET**：恢复的 `.env` 中 `WECHAT_SECRET` 还是占位符，导致小程序登录失败（`invalid appsecret`）
7. **恢复 uploads/fonts/**：重新上传 `iconfont.ttf` 和 `iconfont.woff2`，修复小程序图标丢失问题

#### .env 关键配置项（恢复时必须检查）

| 配置项 | 正确值 | 说明 |
|--------|--------|------|
| `DATABASE_URL` | `postgresql://kekeling:kekeling_dev_123@localhost:5432/kekeling` | 端口是 5432 |
| `WECHAT_SECRET` | `7db1a3479e51b9d73cf12ae05b16b1db` | 微信小程序密钥 |
| `JWT_SECRET` | (32位以上随机字符串) | JWT 签名密钥 |

#### 经验教训

1. **🚫 永远不要对生产环境使用 `rsync --delete`**，除非 100% 确定源文件列表完整
2. **📁 关键文件保护**：`.env` 仅在服务器手动管理，永不同步
3. **🔍 部署前检查**：使用 `rsync --dry-run` 预览操作
4. **🔄 协议一致性**：Nginx 代理协议必须与后端实际运行协议匹配

---

### 2025-12-22 部署导致服务崩溃

#### 事故概述

| 项目 | 内容 |
|------|------|
| **时间** | 10:28 - 10:32 (约4分钟) |
| **影响** | 后端 API 完全不可用，所有请求返回 502 |
| **PM2 重启次数** | 25+ 次 |
| **根因** | 使用 `--prod` 安装依赖 + `.env` 端口配置被覆盖 |

#### 错误命令

```bash
# ❌ 错误：--prod 跳过了 devDependencies，导致 prisma CLI 缺失
sshpass -p '...' ssh root@server "cd /var/www/kekeling/server && CI=true pnpm install --prod && pm2 restart kekeling-api"
```

#### 问题链条

```
1. pnpm install --prod
   ↓ 跳过 devDependencies
2. prisma CLI 未安装
   ↓ 无法运行 prisma generate
3. .prisma/client 目录缺失
   ↓ 模块加载失败
4. 服务启动失败，PM2 疯狂重启
   ↓
5. 进入 errored 状态，返回 502
```

同时：

```
1. 本地 .env 同步到服务器
   ↓
2. DATABASE_URL 端口从 5432 变成 5434
   ↓ 本地用 Docker (5434)，服务器用原生 PostgreSQL (5432)
3. 数据库连接失败
```

#### 修复步骤

```bash
# 1. 重新同步 dist/ 目录（本地已编译）
rsync -avz --delete -e "sshpass -p '...' ssh -o StrictHostKeyChecking=no" \
  server/dist/ root@8.130.23.38:/var/www/kekeling/server/dist/

# 2. 安装完整依赖（不要用 --prod）
sshpass -p '...' ssh root@8.130.23.38 \
  "cd /var/www/kekeling/server && pnpm install"

# 3. 生成 Prisma Client
sshpass -p '...' ssh root@8.130.23.38 \
  "cd /var/www/kekeling/server && npx prisma generate"

# 4. 修复 .env 端口配置
sshpass -p '...' ssh root@8.130.23.38 \
  "cd /var/www/kekeling/server && sed -i 's/localhost:5434/localhost:5432/g' .env"

# 5. 重启服务
sshpass -p '...' ssh root@8.130.23.38 "pm2 restart kekeling-api"
```

#### 根本原因分析

| 原因 | 说明 | 正确做法 |
|------|------|----------|
| `--prod` 参数 | 跳过 `devDependencies`，`prisma` CLI 未安装 | 不要用 `--prod`，或确保 `prisma generate` 在本地完成 |
| `.env` 被同步 | 本地端口 5434 覆盖服务器端口 5432 | 排除 `.env`：`--exclude='.env'` |
| 本地/服务器环境差异 | 本地用 Docker 容器，服务器用原生安装 | 保持 `.env` 服务器独立管理 |

#### 经验教训

1. **🚫 不要在服务器使用 `pnpm install --prod`**：Prisma 需要在安装时生成客户端，`prisma` 在 `devDependencies` 中
2. **📁 永远排除 `.env`**：本地和服务器环境配置不同，同步会导致配置错乱
3. **✅ 正确的部署流程**：
   ```bash
   # 排除敏感文件同步源码
   rsync -avz --delete --exclude='node_modules' --exclude='.env' --exclude='uploads' --exclude='dist' ...
   
   # 服务器安装完整依赖并构建
   pnpm install && pnpm build && pm2 restart kekeling-api
   ```

---

## 🚨 部署安全规范（重要！）

### 服务器关键文件（不可删除）

| 文件/目录 | 重要性 | 说明 | 删除后果 |
|-----------|--------|------|----------|
| `.env` | 🔴 极高 | 环境变量配置 | 服务完全无法启动 |
| `node_modules/` | 🔴 极高 | NPM 依赖 | 模块加载失败 |
| `uploads/` | 🔴 极高 | 用户上传+字体文件 | 图片丢失、图标消失 |
| `dist/` | 🟡 中 | 编译产物 | 可重新构建恢复 |

---

### ✅ 正确的部署方式

#### 后端部署（推荐）

```bash
# 步骤1: 同步源码（必须排除敏感文件和依赖）
cd /Users/aiden/Documents/app/kekeling
rsync -avz --delete \
  --exclude='node_modules' \
  --exclude='.env' \
  --exclude='uploads' \
  --exclude='dist' \
  --exclude='ssl' \
  --exclude='coverage' \
  -e "sshpass -p 'Kekeling.2581264' ssh -o StrictHostKeyChecking=no" \
  server/ root@8.130.23.38:/var/www/kekeling/server/

# 步骤2: 服务器上安装依赖、构建、重启
sshpass -p 'Kekeling.2581264' ssh root@8.130.23.38 \
  "cd /var/www/kekeling/server && CI=true pnpm install && pnpm build && pm2 restart kekeling-api"
```

#### 前端部署

```bash
# 步骤1: 本地构建
cd /Users/aiden/Documents/app/kekeling
pnpm vite build

# 步骤2: 上传到服务器（前端 dist 可以用 --delete，因为是完整替换）
rsync -avz --delete \
  -e "sshpass -p 'Kekeling.2581264' ssh -o StrictHostKeyChecking=no" \
  dist/ root@8.130.23.38:/var/www/kekeling/dist/
```

#### 部署前预览（强烈推荐）

```bash
# 使用 --dry-run 预览 rsync 会做什么（不实际执行）
rsync -avz --delete --dry-run \
  --exclude='node_modules' \
  --exclude='.env' \
  --exclude='uploads' \
  --exclude='dist' \
  -e "sshpass -p 'Kekeling.2581264' ssh -o StrictHostKeyChecking=no" \
  server/ root@8.130.23.38:/var/www/kekeling/server/
```

---

### ❌ 错误的部署方式（绝对禁止）

#### 错误示例1：不排除关键文件

```bash
# ❌ 错误：没有 --exclude，会删除服务器上的 .env、node_modules、uploads
rsync -avz --delete -e "..." server/ root@server:/var/www/kekeling/server/
```

#### 错误示例2：只同步部分文件但使用 --delete

```bash
# ❌ 错误：只上传 dist/ prisma/ 等，但 --delete 会删除其他所有文件
rsync -avz --delete -e "..." dist/ prisma/ package.json root@server:/var/www/kekeling/server/
```

#### 错误示例3：路径尾部斜杠理解错误

```bash
# ❌ 错误：dist/ 带斜杠表示上传 dist 目录的【内容】，不是目录本身
rsync -avz dist/ root@server:/var/www/kekeling/server/
# 结果：dist 内的文件直接放到 /var/www/kekeling/server/ 下，目录结构错乱

# ✅ 正确：不带斜杠表示上传整个 dist 目录
rsync -avz dist root@server:/var/www/kekeling/server/
# 结果：创建 /var/www/kekeling/server/dist/ 目录
```

---

### ⚠️ 部署前检查清单

在执行任何部署命令前，**必须**确认：

- [ ] 是否使用了 `--delete`？
- [ ] 如果使用了 `--delete`，是否排除了 `.env`、`node_modules`、`uploads`？
- [ ] 目标路径是否正确？（注意尾部斜杠的含义）
- [ ] 是否先用 `--dry-run` 预览过？
- [ ] 关键配置文件是否有备份？

---

### 🔧 服务器关键文件备份与恢复

#### 定期备份（建议每次部署前执行）

```bash
# 备份 .env
sshpass -p 'Kekeling.2581264' scp root@8.130.23.38:/var/www/kekeling/server/.env ~/.kekeling-env-backup

# 备份 uploads 目录
sshpass -p 'Kekeling.2581264' rsync -avz root@8.130.23.38:/var/www/kekeling/server/uploads/ ~/.kekeling-uploads-backup/
```

#### 从备份恢复

```bash
# 恢复 .env
sshpass -p 'Kekeling.2581264' scp ~/.kekeling-env-backup root@8.130.23.38:/var/www/kekeling/server/.env

# 恢复 uploads 目录
sshpass -p 'Kekeling.2581264' rsync -avz ~/.kekeling-uploads-backup/ root@8.130.23.38:/var/www/kekeling/server/uploads/
```

#### 从本地恢复（如果本地有完整副本）

```bash
# 恢复 uploads/fonts（字体文件）
sshpass -p 'Kekeling.2581264' ssh root@8.130.23.38 "mkdir -p /var/www/kekeling/server/uploads/fonts"
sshpass -p 'Kekeling.2581264' scp /Users/aiden/Documents/app/kekeling/server/uploads/fonts/* root@8.130.23.38:/var/www/kekeling/server/uploads/fonts/
```

---

### 📁 uploads 目录结构

```
/var/www/kekeling/server/uploads/
├── fonts/           # ⚠️ iconfont 字体文件（小程序图标，删除后图标全部消失）
│   ├── iconfont.ttf
│   └── iconfont.woff2
├── service/         # 服务封面图片
├── hospital/        # 医院图片
├── cases/           # 案例图片
├── escort/          # 陪诊员头像等
└── ...              # 其他用户上传内容
```

---

### 🔥 事故快速恢复流程

如果服务器出现问题，按以下顺序检查和修复：

```bash
# 1. 检查服务状态
sshpass -p 'Kekeling.2581264' ssh root@8.130.23.38 "pm2 list && pm2 logs kekeling-api --lines 30 --nostream"

# 2. 检查 .env 是否存在且配置正确
sshpass -p 'Kekeling.2581264' ssh root@8.130.23.38 "cat /var/www/kekeling/server/.env | grep -E 'DATABASE_URL|JWT_SECRET|WECHAT'"

# 3. 检查 node_modules 是否存在
sshpass -p 'Kekeling.2581264' ssh root@8.130.23.38 "ls -la /var/www/kekeling/server/node_modules | head -5"

# 4. 检查 dist 是否存在
sshpass -p 'Kekeling.2581264' ssh root@8.130.23.38 "ls -la /var/www/kekeling/server/dist/src/"

# 5. 检查 uploads/fonts 是否存在
sshpass -p 'Kekeling.2581264' ssh root@8.130.23.38 "ls -la /var/www/kekeling/server/uploads/fonts/"

# 6. 检查 Nginx 配置
sshpass -p 'Kekeling.2581264' ssh root@8.130.23.38 "nginx -t && cat /etc/nginx/conf.d/kekeling.conf | grep proxy_pass"
```

### .env 完整配置模板

```env
# 数据库（端口是 5432，不是 5434）
DATABASE_URL="postgresql://kekeling:kekeling_dev_123@localhost:5432/kekeling"

# JWT（必须是 32 位以上随机字符串）
JWT_SECRET="your-jwt-secret-at-least-32-characters"

# 微信小程序
WECHAT_APPID="wx6e10ab2c3b2c8c73"
WECHAT_SECRET="7db1a3479e51b9d73cf12ae05b16b1db"

# 微信支付（如已配置）
WECHAT_MCH_ID="your-merchant-id"
WECHAT_PAY_API_KEY="your-api-key"
WECHAT_PAY_NOTIFY_URL="https://kkl.top/api/payment/notify"

# Redis
REDIS_HOST="localhost"
REDIS_PORT="6379"

# 其他
NODE_ENV="production"
PORT="3000"
```
