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

# 部署服务器代码（排除敏感文件和依赖）
cd /Users/aiden/Documents/app/kekeling
rsync -avz --delete --exclude='node_modules' --exclude='.env' --exclude='uploads' --exclude='dist' \
  -e "sshpass -p 'Kekeling.2581264' ssh -o StrictHostKeyChecking=no" \
  server/ root@8.130.23.38:/var/www/kekeling/server/

# 服务器上安装依赖并构建
ssh root@8.130.23.38 "cd /var/www/kekeling/server && CI=true pnpm install && pnpm build && pm2 restart kekeling-api"

# 一键部署脚本
sshpass -p 'Kekeling.2581264' ssh root@8.130.23.38 "cd /var/www/kekeling/server && CI=true pnpm install && pnpm build && pm2 restart kekeling-api"

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
└── web/             # 前端静态文件 (Nginx 托管)
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
- 关键配置:
  - `/uploads/` 使用 `^~` 修饰符优先匹配，代理到后端
  - `/api/` 代理到 `https://127.0.0.1:3000`
  - 其他路径走前端 SPA

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

## 今日修复记录 (2025-12-19)

1. **数据库端口**: .env 中 5434 → 5432
2. **数据库密码**: 重置 kekeling 用户密码
3. **微信 AppSecret**: 更新为真实值
4. **缺失依赖**: 添加 multer 包
5. **文件名双扩展名**: 修复 upload.controller.ts
6. **Nginx uploads 路径**: 使用 `^~` 优先匹配 + proxy_pass
7. **图片 URL**: 添加 getFullImageUrl 工具函数处理相对路径
