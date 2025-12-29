#!/bin/bash

# 科科灵网站前台启动脚本
cd "$(dirname "$0")/website"

echo "🌐 正在启动科科灵网站前台..."
echo "📍 地址: http://localhost:3000"
echo ""

pnpm dev

