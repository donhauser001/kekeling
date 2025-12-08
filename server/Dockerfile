# ============================================
# 科科灵后端 API Dockerfile
# ============================================

# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# 安装依赖
RUN pnpm install --frozen-lockfile

# 生成 Prisma Client (使用本地安装的 prisma 版本)
RUN pnpm prisma generate

# 复制源代码
COPY . .

# 构建
RUN pnpm build

# ============================================
# 生产阶段
FROM node:20-alpine AS production

WORKDIR /app

# 安装必要工具 (wget 用于健康检查, openssl 用于 Prisma)
RUN apk add --no-cache wget openssl

# 安装 pnpm
RUN npm install -g pnpm

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# 安装所有依赖 (prisma 在 devDependencies 中)
RUN pnpm install --frozen-lockfile

# 生成 Prisma Client (使用本地安装的 prisma 版本)
RUN pnpm prisma generate

# 从构建阶段复制编译后的代码
COPY --from=builder /app/dist ./dist

# 复制启动脚本
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# 暴露端口
EXPOSE 3000

# 健康检查 (增加启动时间)
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=5 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/home/stats || exit 1

# 启动
ENTRYPOINT ["./docker-entrypoint.sh"]
