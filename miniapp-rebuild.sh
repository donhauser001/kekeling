#!/bin/bash

# 小程序重新构建并启动脚本
# 用法: ./scripts/miniapp-rebuild.sh [--watch] [--build-only]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# 脚本在项目根目录，直接使用 SCRIPT_DIR 作为项目根目录
PROJECT_ROOT="$SCRIPT_DIR"
MINIAPP_DIR="$PROJECT_ROOT/miniapp-shell"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 参数解析
WATCH_MODE=true
BUILD_ONLY=false

for arg in "$@"; do
  case $arg in
    --build-only)
      BUILD_ONLY=true
      WATCH_MODE=false
      shift
      ;;
    --watch)
      WATCH_MODE=true
      shift
      ;;
    *)
      ;;
  esac
done

echo -e "${BLUE}🔄 小程序重新构建脚本${NC}"
echo "=================================="

# 步骤 1: 停止旧进程
echo -e "${YELLOW}[1/3] 停止旧的 Taro 进程...${NC}"
pkill -f "taro build --type weapp" 2>/dev/null || true
sleep 1
echo -e "${GREEN}✓ 旧进程已清理${NC}"

# 步骤 2: 清理构建缓存（可选）
if [ "$1" == "--clean" ]; then
  echo -e "${YELLOW}[2/3] 清理构建缓存...${NC}"
  rm -rf "$MINIAPP_DIR/dist" 2>/dev/null || true
  rm -rf "$MINIAPP_DIR/.taro" 2>/dev/null || true
  echo -e "${GREEN}✓ 缓存已清理${NC}"
else
  echo -e "${YELLOW}[2/3] 跳过缓存清理（使用 --clean 强制清理）${NC}"
fi

# 步骤 3: 构建并启动
cd "$MINIAPP_DIR"

if [ "$BUILD_ONLY" = true ]; then
  echo -e "${YELLOW}[3/3] 仅构建模式...${NC}"
  pnpm build:weapp
  echo ""
  echo -e "${GREEN}✅ 构建完成！${NC}"
  echo -e "输出目录: ${BLUE}$MINIAPP_DIR/dist${NC}"
else
  echo -e "${YELLOW}[3/3] 启动开发服务器（监听模式）...${NC}"
  echo ""
  pnpm dev:weapp
fi
