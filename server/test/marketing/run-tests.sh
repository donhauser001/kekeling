#!/bin/bash

# 营销中心测试执行脚本

set -e

echo "🚀 营销中心测试执行器"
echo "===================="
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 未找到 Node.js，请先安装 Node.js"
    exit 1
fi

# 检查 ts-node
if ! command -v ts-node &> /dev/null; then
    echo "📦 安装 ts-node..."
    npm install -g ts-node typescript
fi

# 检查 API 服务
echo "🔍 检查后端服务..."
if curl -s http://localhost:3456/api/services?pageSize=1 > /dev/null 2>&1; then
    echo "✅ 后端服务运行正常"
else
    echo "⚠️  无法连接到后端服务 (http://localhost:3456/api)"
    echo "   请确保后端服务已启动"
    read -p "是否继续? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 准备测试数据
echo ""
echo "📦 准备测试数据..."
ts-node test/marketing/test-data-setup.ts

# 执行测试
echo ""
echo "🧪 执行测试..."
echo ""

API_URL="${API_URL:-http://localhost:3456/api}"
TEST_USER_TOKEN="${TEST_USER_TOKEN:-}"

if [ -n "$TEST_USER_TOKEN" ]; then
    echo "使用提供的 Token"
    API_URL="$API_URL" TEST_USER_TOKEN="$TEST_USER_TOKEN" ts-node test/marketing/test-runner.ts
else
    echo "未提供 Token，部分需要认证的测试可能会失败"
    API_URL="$API_URL" ts-node test/marketing/test-runner.ts
fi

echo ""
echo "✅ 测试完成！"
echo "📊 查看测试报告: server/test-reports/"

