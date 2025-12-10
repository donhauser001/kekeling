#!/bin/bash

# 科科灵 - 管理后台快速启动脚本
# 同时启动：后端服务 + 前端管理后台

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"

echo -e "${BLUE}🚀 科科灵 - 管理后台启动脚本${NC}"
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

# 函数：清理后台进程
cleanup() {
    echo ""
    echo -e "${YELLOW}⏹️  正在停止所有服务...${NC}"
    kill $SERVER_PID 2>/dev/null || true
    kill $ADMIN_PID 2>/dev/null || true
    echo -e "${GREEN}✅ 服务已停止${NC}"
    exit 0
}

# 捕获 Ctrl+C 信号
trap cleanup SIGINT SIGTERM

# 启动后端服务
echo -e "${YELLOW}📦 启动后端服务 (server)...${NC}"
cd "$PROJECT_ROOT/server"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}   安装依赖中...${NC}"
    $PKG_MANAGER install
fi
$PKG_MANAGER run dev &
SERVER_PID=$!
echo -e "${GREEN}   ✅ 后端服务已启动 (PID: $SERVER_PID)${NC}"
echo -e "${GREEN}   📍 API 地址: http://localhost:3000${NC}"

# 等待后端服务启动
sleep 3

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
echo -e "${GREEN}   ✅ 前端管理后台已启动 (PID: $ADMIN_PID)${NC}"
echo -e "${GREEN}   📍 访问地址: http://localhost:5173${NC}"

echo ""
echo -e "${BLUE}================================${NC}"
echo -e "${GREEN}🎉 所有服务已启动！${NC}"
echo ""
echo -e "   ${BLUE}后端 API:${NC}      http://localhost:3000"
echo -e "   ${BLUE}管理后台:${NC}      http://localhost:5173"
echo -e "   ${BLUE}API 文档:${NC}      http://localhost:3000/api-docs"
echo ""
echo -e "${YELLOW}按 Ctrl+C 停止所有服务${NC}"
echo -e "${BLUE}================================${NC}"

# 等待子进程
wait
