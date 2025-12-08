# 科科灵陪诊平台 Docker 部署指南

> 版本: v1.0  
> 更新日期: 2024-12-08

---

## 一、服务架构

```
┌─────────────────────────────────────────────────────────────┐
│                      Docker 容器服务                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │
│   │    admin    │────│     api     │────│  postgres   │    │
│   │   (Nginx)   │    │  (NestJS)   │    │ (Database)  │    │
│   │   :80/443   │    │   :3000     │    │   :5432     │    │
│   └─────────────┘    └─────────────┘    └─────────────┘    │
│          │                                     │            │
│          └─────────────────────────────────────┘            │
│                      kekeling-network                       │
│                                                             │
│   ┌─────────────┐                                          │
│   │   adminer   │  (可选) 数据库管理工具                     │
│   │   :8080     │                                          │
│   └─────────────┘                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 二、快速开始

### 2.1 前置要求

- Docker >= 20.0
- Docker Compose >= 2.0
- 服务器内存 >= 2GB
- 磁盘空间 >= 10GB

### 2.2 一键部署

```bash
# 1. 克隆代码
git clone https://github.com/your-repo/kekeling.git
cd kekeling

# 2. 配置环境变量
cp env.example .env
# 编辑 .env 文件，修改必要配置

# 3. 一键启动所有服务
docker-compose up -d --build

# 4. 查看服务状态
docker-compose ps

# 5. 查看日志
docker-compose logs -f
```

### 2.3 访问服务

| 服务 | 地址 | 说明 |
|------|------|------|
| 管理后台 | http://localhost | 管理后台前端 |
| API 接口 | http://localhost/api | 后端 API |
| Adminer | http://localhost:8080 | 数据库管理 (可选) |

---

## 三、环境配置

### 3.1 环境变量说明

| 变量 | 默认值 | 说明 |
|------|-------|------|
| `POSTGRES_USER` | kekeling | 数据库用户名 |
| `POSTGRES_PASSWORD` | kekeling123 | 数据库密码 (生产环境必改) |
| `POSTGRES_DB` | kekeling | 数据库名 |
| `JWT_SECRET` | - | JWT 密钥 (生产环境必改) |
| `WECHAT_APP_ID` | - | 微信小程序 AppID |
| `WECHAT_MCH_ID` | - | 微信支付商户号 |

### 3.2 生产环境配置示例

```bash
# .env (生产环境)
POSTGRES_USER=kekeling_prod
POSTGRES_PASSWORD=StrongPassword123!
JWT_SECRET=your-very-long-random-jwt-secret-key
WECHAT_APP_ID=wx1234567890abcdef
WECHAT_APP_SECRET=your-wechat-secret
WECHAT_MCH_ID=1234567890
WECHAT_PAY_API_KEY=your-pay-api-key
WECHAT_PAY_NOTIFY_URL=https://api.kekeling.com/api/payment/notify
```

---

## 四、服务管理

### 4.1 常用命令

```bash
# 启动所有服务
docker-compose up -d

# 停止所有服务
docker-compose down

# 重启所有服务
docker-compose restart

# 重建并启动 (代码更新后)
docker-compose up -d --build

# 查看服务状态
docker-compose ps

# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f api
docker-compose logs -f admin
docker-compose logs -f postgres

# 进入容器
docker exec -it kekeling-api sh
docker exec -it kekeling-postgres psql -U kekeling -d kekeling
```

### 4.2 数据库操作

```bash
# 备份数据库
docker exec kekeling-postgres pg_dump -U kekeling kekeling > backup.sql

# 恢复数据库
docker exec -i kekeling-postgres psql -U kekeling kekeling < backup.sql

# 重新初始化数据 (清空并重新 seed)
docker exec kekeling-api npx prisma db push --force-reset
docker exec kekeling-api npx ts-node prisma/seed.ts
```

### 4.3 单独重建服务

```bash
# 只重建后端
docker-compose up -d --build api

# 只重建前端
docker-compose up -d --build admin

# 只重建数据库 (注意: 会丢失数据)
docker-compose up -d --build postgres
```

---

## 五、开发环境

开发环境只启动数据库，前后端本地运行：

```bash
# 启动开发数据库
docker-compose -f docker-compose.dev.yml up -d

# 本地启动后端 (连接 Docker 数据库)
cd server
pnpm dev

# 本地启动前端
cd ..
pnpm dev
```

开发环境连接信息：
- 数据库端口: `5434` (避免与生产环境 5432 冲突)
- Adminer: http://localhost:8080

---

## 六、HTTPS 配置

### 6.1 使用 Nginx 反向代理

```nginx
# /etc/nginx/sites-available/kekeling
server {
    listen 80;
    server_name kekeling.com www.kekeling.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name kekeling.com www.kekeling.com;

    ssl_certificate /etc/letsencrypt/live/kekeling.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/kekeling.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 6.2 使用 Traefik (推荐)

```yaml
# docker-compose.override.yml
services:
  admin:
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.kekeling.rule=Host(`kekeling.com`)"
      - "traefik.http.routers.kekeling.tls.certresolver=letsencrypt"
```

---

## 七、监控与日志

### 7.1 健康检查

所有服务都配置了健康检查：

```bash
# 查看健康状态
docker-compose ps

# 检查 API 健康
curl http://localhost:3000/api/home/stats

# 检查前端健康
curl http://localhost/health
```

### 7.2 日志管理

```bash
# 查看最近 100 行日志
docker-compose logs --tail=100 api

# 实时跟踪日志
docker-compose logs -f api

# 输出日志到文件
docker-compose logs api > api.log 2>&1
```

---

## 八、故障排除

### 8.1 常见问题

**Q: 启动失败，提示端口被占用**

```bash
# 查看占用端口的进程
lsof -i :80
lsof -i :3000

# 修改 .env 中的端口配置
ADMIN_PORT=8081
API_PORT=3001
```

**Q: 数据库连接失败**

```bash
# 检查数据库容器状态
docker-compose logs postgres

# 确认数据库已就绪
docker exec kekeling-postgres pg_isready -U kekeling -d kekeling
```

**Q: 前端访问 API 返回 502**

```bash
# 检查 API 容器状态
docker-compose ps api
docker-compose logs api

# 确认 API 健康
curl http://localhost:3000/api/home/stats
```

### 8.2 重置环境

```bash
# 完全重置 (删除所有容器、卷、镜像)
docker-compose down -v --rmi all

# 重新构建
docker-compose up -d --build
```

---

## 九、性能优化

### 9.1 资源限制

```yaml
# docker-compose.override.yml
services:
  api:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### 9.2 多实例部署

```bash
# 启动 3 个 API 实例
docker-compose up -d --scale api=3
```

---

## 附录

### A. 文件结构

```
kekeling/
├── docker-compose.yml      # 生产环境 Docker Compose
├── docker-compose.dev.yml  # 开发环境 Docker Compose
├── Dockerfile              # 前端 Dockerfile
├── nginx.conf              # Nginx 配置
├── env.example             # 环境变量示例
├── server/
│   ├── Dockerfile          # 后端 Dockerfile
│   └── docker-entrypoint.sh
└── docs/
    └── Docker部署指南.md
```

### B. 端口映射表

| 服务 | 容器端口 | 默认主机端口 | 环境变量 |
|------|---------|-------------|---------|
| admin | 80 | 80 | `ADMIN_PORT` |
| api | 3000 | 3000 | `API_PORT` |
| postgres | 5432 | 5432 | `POSTGRES_PORT` |
| adminer | 8080 | 8080 | `ADMINER_PORT` |

