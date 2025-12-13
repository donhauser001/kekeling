#!/bin/bash

# ============================================
# 科科灵 - 一键启动脚本
# ============================================
# 启动内容：
# - PostgreSQL 数据库 (Docker)
# - 后端 API 服务 (Docker, 热重载)
# - 数据库迁移 (自动)
#
# 使用方法：
# ./start.sh              # 启动基础设施
# ./start.sh --with-admin # 同时启动管理后台前端
# ./start.sh --with-h5    # 同时启动小程序 H5
# ./start.sh --all        # 启动全部
# ============================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"

# 参数解析
WITH_ADMIN=false
WITH_H5=false

for arg in "$@"; do
    case $arg in
        --with-admin)
            WITH_ADMIN=true
            ;;
        --with-h5)
            WITH_H5=true
            ;;
        --all)
            WITH_ADMIN=true
            WITH_H5=true
            ;;
        --help|-h)
            echo "用法: ./start.sh [选项]"
            echo ""
            echo "选项:"
            echo "  --with-admin    同时启动管理后台前端"
            echo "  --with-h5       同时启动小程序 H5"
            echo "  --all           启动全部服务"
            echo "  --help, -h      显示帮助信息"
            exit 0
            ;;
    esac
done

echo -e "${CYAN}"
echo "╔════════════════════════════════════════════╗"
echo "║       🚀 科科灵 - 一键启动脚本              ║"
echo "╚════════════════════════════════════════════╝"
echo -e "${NC}"

# ==========================================
# 检查 Docker
# ==========================================
check_docker() {
    echo -e "${YELLOW}🐳 检查 Docker...${NC}"
    
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

    echo -e "${GREEN}   ✅ Docker 已就绪${NC}"
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
}

# ==========================================
# 启动 Docker 服务
# ==========================================
start_docker_services() {
    echo ""
    echo -e "${YELLOW}🐘 启动数据库 + 后端服务 (Docker)...${NC}"
    cd "$PROJECT_ROOT"
    
    # 构建并启动
    docker-compose -f docker-compose.dev.yml up -d --build
    
    echo -e "${GREEN}   ✅ Docker 服务已启动${NC}"
}

# ==========================================
# 等待后端就绪
# ==========================================
wait_for_backend() {
    echo ""
    echo -e "${YELLOW}⏳ 等待后端服务就绪...${NC}"
    
    local max_attempts=60
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -s http://localhost:3000/api/home/stats > /dev/null 2>&1; then
            echo -e "${GREEN}   ✅ 后端服务已就绪${NC}"
            return 0
        fi
        attempt=$((attempt + 1))
        echo -ne "\r   ⏳ 等待后端服务就绪... ($attempt/$max_attempts)"
        sleep 2
    done
    
    echo ""
    echo -e "${RED}❌ 后端服务启动超时，请检查日志:${NC}"
    echo -e "${YELLOW}   docker-compose -f docker-compose.dev.yml logs backend${NC}"
    exit 1
}

# ==========================================
# 运行数据库迁移
# ==========================================
run_migrations() {
    echo ""
    echo -e "${YELLOW}🔄 运行数据库迁移...${NC}"
    
    # 在容器内运行迁移
    docker exec kekeling-backend-dev sh -c "
        npx prisma migrate deploy 2>/dev/null || npx prisma db push
    " || {
        echo -e "${YELLOW}   ⚠️ 迁移可能需要手动处理${NC}"
    }
    
    # 确保管理员账号存在
    docker exec kekeling-backend-dev sh -c "
        npx ts-node prisma/create-admin.ts 2>/dev/null || true
    "
    
    echo -e "${GREEN}   ✅ 数据库已同步${NC}"
}

# ==========================================
# 启动管理后台前端
# ==========================================
start_admin() {
    echo ""
    echo -e "${YELLOW}🖥️  启动管理后台前端...${NC}"
    cd "$PROJECT_ROOT"
    
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}   安装依赖中...${NC}"
        $PKG_MANAGER install
    fi
    
    $PKG_MANAGER run dev &
    ADMIN_PID=$!
    echo -e "${GREEN}   ✅ 管理后台已启动 (PID: $ADMIN_PID)${NC}"
    echo -e "${GREEN}   📍 访问地址: http://localhost:5173${NC}"
}

# ==========================================
# 启动小程序 H5
# ==========================================
start_h5() {
    echo ""
    echo -e "${YELLOW}📱 启动小程序 H5...${NC}"
    cd "$PROJECT_ROOT/miniapp"
    
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}   安装依赖中...${NC}"
        $PKG_MANAGER install
    fi
    
    $PKG_MANAGER run dev:h5 &
    H5_PID=$!
    echo -e "${GREEN}   ✅ 小程序 H5 已启动 (PID: $H5_PID)${NC}"
    echo -e "${GREEN}   📍 访问地址: http://localhost:10086${NC}"
}

# ==========================================
# 清理函数
# ==========================================
cleanup() {
    echo ""
    echo -e "${YELLOW}⏹️  正在停止服务...${NC}"
    
    # 停止前端进程
    [ ! -z "$ADMIN_PID" ] && kill $ADMIN_PID 2>/dev/null && echo -e "${GREEN}   ✅ 管理后台已停止${NC}"
    [ ! -z "$H5_PID" ] && kill $H5_PID 2>/dev/null && echo -e "${GREEN}   ✅ 小程序 H5 已停止${NC}"
    
    # 询问是否停止 Docker 服务
    echo ""
    echo -ne "${YELLOW}是否同时停止 Docker 服务（数据库+后端）? (y/N): ${NC}"
    read -t 10 -n 1 stop_docker || stop_docker="n"
    echo ""
    
    if [[ "$stop_docker" =~ ^[Yy]$ ]]; then
        cd "$PROJECT_ROOT"
        docker-compose -f docker-compose.dev.yml down
        echo -e "${GREEN}   ✅ Docker 服务已停止${NC}"
    else
        echo -e "${BLUE}   ℹ️  Docker 服务保持运行${NC}"
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
    start_docker_services
    wait_for_backend
    run_migrations
    
    # 根据参数启动前端
    $WITH_ADMIN && start_admin
    $WITH_H5 && start_h5
    
    echo ""
    echo -e "${CYAN}════════════════════════════════════════════${NC}"
    echo -e "${GREEN}🎉 服务启动成功！${NC}"
    echo ""
    echo -e "   ${MAGENTA}🐘 数据库:${NC}      localhost:5432"
    echo -e "   ${MAGENTA}🔧 后端 API:${NC}    http://localhost:3000"
    echo -e "   ${MAGENTA}📖 API 文档:${NC}    http://localhost:3000/api-docs"
    echo -e "   ${MAGENTA}🗄️  Adminer:${NC}     http://localhost:8080"
    $WITH_ADMIN && echo -e "   ${MAGENTA}🖥️  管理后台:${NC}   http://localhost:5173"
    $WITH_H5 && echo -e "   ${MAGENTA}📱 小程序 H5:${NC}   http://localhost:10086"
    echo ""
    echo -e "${YELLOW}📋 常用命令:${NC}"
    echo -e "   查看日志:      docker-compose -f docker-compose.dev.yml logs -f backend"
    echo -e "   重启后端:      docker-compose -f docker-compose.dev.yml restart backend"
    echo -e "   进入容器:      docker exec -it kekeling-backend-dev sh"
    echo ""
    echo -e "${YELLOW}按 Ctrl+C 停止服务${NC}"
    echo -e "${CYAN}════════════════════════════════════════════${NC}"
    
    # 如果启动了前端，等待前端进程
    if $WITH_ADMIN || $WITH_H5; then
        wait
    else
        # 否则跟踪后端日志
        docker-compose -f docker-compose.dev.yml logs -f backend
    fi
}

main
