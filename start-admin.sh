#!/bin/bash

# ============================================
# 科科灵 - 管理后台前端启动脚本
# ============================================
# 仅启动前端管理后台
# 后端服务需要先通过 ./start.sh 启动
#
# 使用方法：
# ./start.sh           # 先启动后端（如果未运行）
# ./start-admin.sh     # 启动管理后台前端
# ============================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"

echo -e "${BLUE}🖥️  科科灵 - 管理后台启动脚本${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# 检测包管理器
if command -v pnpm &> /dev/null; then
    PKG_MANAGER="pnpm"
elif command -v npm &> /dev/null; then
    PKG_MANAGER="npm"
else
    echo -e "${RED}❌ 错误: 未找到 npm 或 pnpm${NC}"
    exit 1
fi

echo -e "${GREEN}📦 使用包管理器: $PKG_MANAGER${NC}"
echo ""

# 检查后端是否运行
check_backend() {
    echo -e "${YELLOW}🔍 检查后端服务...${NC}"
    
    if curl -s http://localhost:3000/api/home/stats > /dev/null 2>&1; then
        echo -e "${GREEN}   ✅ 后端服务已运行${NC}"
        return 0
    fi
    
    echo -e "${YELLOW}   ⚠️ 后端服务未运行${NC}"
    echo ""
    echo -ne "${YELLOW}是否启动后端服务? (Y/n): ${NC}"
    read -t 10 -n 1 start_backend || start_backend="y"
    echo ""
    
    if [[ ! "$start_backend" =~ ^[Nn]$ ]]; then
        echo -e "${YELLOW}🐳 启动 Docker 后端服务...${NC}"
        cd "$PROJECT_ROOT"
        docker-compose -f docker-compose.dev.yml up -d
        
        # 等待后端就绪
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
        echo -e "${RED}❌ 后端服务启动超时${NC}"
        echo -e "${YELLOW}   请检查日志: docker-compose -f docker-compose.dev.yml logs backend${NC}"
        exit 1
    else
        echo -e "${YELLOW}💡 提示: 先运行 ./start.sh 启动后端服务${NC}"
        exit 1
    fi
}

# 清理函数
cleanup() {
    echo ""
    echo -e "${YELLOW}⏹️  正在停止管理后台...${NC}"
    kill $ADMIN_PID 2>/dev/null || true
    echo -e "${GREEN}✅ 管理后台已停止${NC}"
    exit 0
}

# 捕获 Ctrl+C 信号
trap cleanup SIGINT SIGTERM

# 检查后端
check_backend

# 启动前端管理后台
echo ""
echo -e "${YELLOW}🖥️  启动前端管理后台...${NC}"
cd "$PROJECT_ROOT"

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}   安装依赖中...${NC}"
    $PKG_MANAGER install
fi

$PKG_MANAGER run dev &
ADMIN_PID=$!
echo -e "${GREEN}   ✅ 管理后台已启动 (PID: $ADMIN_PID)${NC}"

echo ""
echo -e "${BLUE}================================${NC}"
echo -e "${GREEN}🎉 管理后台启动成功！${NC}"
echo ""
echo -e "   ${BLUE}后端 API:${NC}      http://localhost:3000"
echo -e "   ${BLUE}管理后台:${NC}      http://localhost:5173"
echo -e "   ${BLUE}API 文档:${NC}      http://localhost:3000/api-docs"
echo ""
echo -e "${YELLOW}按 Ctrl+C 停止管理后台${NC}"
echo -e "${BLUE}================================${NC}"

# 等待子进程
wait $ADMIN_PID
