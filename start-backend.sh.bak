#!/bin/bash

# 科科灵 - 后端 + 数据库快速启动脚本
# 自动启动：PostgreSQL 数据库 + 后端 API 服务

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"

echo -e "${CYAN}🚀 科科灵 - 后端 + 数据库启动脚本${NC}"
echo -e "${CYAN}================================${NC}"
echo ""

# ==========================================
# 检查 Docker 是否安装和运行
# ==========================================
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ 错误: Docker 未安装${NC}"
        echo -e "${YELLOW}   请先安装 Docker: https://docs.docker.com/get-docker/${NC}"
        exit 1
    fi

    if ! docker info &> /dev/null; then
        echo -e "${RED}❌ 错误: Docker 未运行${NC}"
        echo -e "${YELLOW}   请启动 Docker Desktop 或 Docker 服务${NC}"
        exit 1
    fi

    echo -e "${GREEN}✅ Docker 已就绪${NC}"
}

# ==========================================
# 启动 PostgreSQL 数据库
# ==========================================
start_database() {
    echo ""
    echo -e "${YELLOW}🐘 启动 PostgreSQL 数据库...${NC}"
    
    # 检查容器是否已存在
    if docker ps -a --format '{{.Names}}' | grep -q '^kekeling-postgres-dev$'; then
        # 检查容器是否正在运行
        if docker ps --format '{{.Names}}' | grep -q '^kekeling-postgres-dev$'; then
            echo -e "${GREEN}   ✅ 数据库容器已在运行${NC}"
        else
            echo -e "${YELLOW}   📦 启动已存在的数据库容器...${NC}"
            docker start kekeling-postgres-dev
            echo -e "${GREEN}   ✅ 数据库容器已启动${NC}"
        fi
    else
        # 使用 docker-compose 创建并启动
        echo -e "${YELLOW}   📦 创建并启动数据库容器...${NC}"
        cd "$PROJECT_ROOT"
        docker-compose -f docker-compose.dev.yml up -d postgres
        echo -e "${GREEN}   ✅ 数据库容器已创建并启动${NC}"
    fi
    
    # 等待数据库就绪
    echo -e "${YELLOW}   ⏳ 等待数据库就绪...${NC}"
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if docker exec kekeling-postgres-dev pg_isready -U kekeling -d kekeling &> /dev/null; then
            echo -e "${GREEN}   ✅ 数据库已就绪${NC}"
            echo -e "${GREEN}   📍 连接地址: localhost:5434${NC}"
            return 0
        fi
        attempt=$((attempt + 1))
        sleep 1
        echo -ne "\r   ⏳ 等待数据库就绪... ($attempt/$max_attempts)"
    done
    
    echo ""
    echo -e "${RED}❌ 数据库启动超时${NC}"
    exit 1
}

# ==========================================
# 检测包管理器
# ==========================================
detect_package_manager() {
    if command -v pnpm &> /dev/null; then
        PKG_MANAGER="pnpm"
    elif command -v npm &> /dev/null; then
        PKG_MANAGER="npm"
    else
        echo -e "${RED}❌ 错误: 未找到 npm 或 pnpm${NC}"
        exit 1
    fi
    echo -e "${GREEN}📦 使用包管理器: $PKG_MANAGER${NC}"
}

# ==========================================
# 运行数据库迁移
# ==========================================
run_migrations() {
    echo ""
    echo -e "${YELLOW}🔄 检查数据库迁移...${NC}"
    cd "$PROJECT_ROOT/server"
    
    # 检查依赖
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}   安装依赖中...${NC}"
        $PKG_MANAGER install
    fi
    
    # 运行 Prisma 迁移（不使用 --accept-data-loss 以保护数据）
    echo -e "${YELLOW}   运行 Prisma 迁移...${NC}"
    if ! npx prisma migrate deploy 2>/dev/null; then
        echo -e "${YELLOW}   ⚠️  migrate deploy 失败，尝试 db push（保留数据）...${NC}"
        # 不使用 --accept-data-loss，避免数据丢失
        npx prisma db push || {
            echo -e "${RED}   ❌ 数据库同步失败，可能需要手动处理迁移${NC}"
            echo -e "${YELLOW}   💡 提示: 运行 'cd server && npx prisma migrate dev' 创建新迁移${NC}"
            exit 1
        }
    fi
    echo -e "${GREEN}   ✅ 数据库结构已同步${NC}"
    
    # 确保管理员账号存在
    echo -e "${YELLOW}   检查管理员账号...${NC}"
    npx ts-node prisma/create-admin.ts 2>/dev/null || true
}

# ==========================================
# 启动后端服务
# ==========================================
start_backend() {
    echo ""
    echo -e "${YELLOW}🖥️  启动后端 API 服务...${NC}"
    cd "$PROJECT_ROOT/server"
    
    $PKG_MANAGER run dev &
    SERVER_PID=$!
    echo -e "${GREEN}   ✅ 后端服务已启动 (PID: $SERVER_PID)${NC}"
    echo -e "${GREEN}   📍 API 地址: http://localhost:3000${NC}"
}

# ==========================================
# 清理函数
# ==========================================
cleanup() {
    echo ""
    echo -e "${YELLOW}⏹️  正在停止服务...${NC}"
    
    # 停止后端服务
    if [ ! -z "$SERVER_PID" ]; then
        kill $SERVER_PID 2>/dev/null || true
        echo -e "${GREEN}   ✅ 后端服务已停止${NC}"
    fi
    
    # 询问是否停止数据库
    echo ""
    echo -e "${YELLOW}是否同时停止数据库容器? (y/N): ${NC}"
    read -t 5 -n 1 stop_db || stop_db="n"
    echo ""
    
    if [[ "$stop_db" =~ ^[Yy]$ ]]; then
        docker stop kekeling-postgres-dev 2>/dev/null || true
        echo -e "${GREEN}   ✅ 数据库容器已停止${NC}"
    else
        echo -e "${BLUE}   ℹ️  数据库容器保持运行${NC}"
    fi
    
    echo -e "${GREEN}✅ 清理完成${NC}"
    exit 0
}

# 捕获 Ctrl+C 信号
trap cleanup SIGINT SIGTERM

# ==========================================
# 主流程
# ==========================================
main() {
    check_docker
    detect_package_manager
    start_database
    run_migrations
    start_backend
    
    echo ""
    echo -e "${CYAN}================================${NC}"
    echo -e "${GREEN}🎉 后端服务启动成功！${NC}"
    echo ""
    echo -e "   ${BLUE}数据库:${NC}        localhost:5434"
    echo -e "   ${BLUE}后端 API:${NC}      http://localhost:3000"
    echo -e "   ${BLUE}数据库管理:${NC}    运行 'docker-compose -f docker-compose.dev.yml up -d adminer' 后访问 http://localhost:8080"
    echo ""
    echo -e "${YELLOW}按 Ctrl+C 停止服务${NC}"
    echo -e "${CYAN}================================${NC}"
    
    # 等待后端进程
    wait $SERVER_PID
}

main
