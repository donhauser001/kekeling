#!/bin/bash
# 快速编译并构建小程序
# 用法: ./scripts/miniapp-build.sh [--clean]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
MINIAPP_DIR="$PROJECT_ROOT/miniapp-shell"

cd "$MINIAPP_DIR"

# 每次构建前同步依赖（确保 package.json 新增依赖被安装）
echo "📦 同步依赖..."
pnpm install

if [ "$1" = "--clean" ]; then
  echo "🧹 清理构建缓存..."
  rm -rf dist .taro 2>/dev/null || true
fi

echo "🔨 编译小程序..."
pnpm build:weapp

echo ""
echo "✅ 构建完成！输出目录: miniapp-shell/dist"
