#!/bin/bash

# 测试执行脚本
# 用法: ./scripts/run-tests.sh [test-type]
# test-type: unit, integration, performance, all

set -e

TEST_TYPE=${1:-all}

echo "=========================================="
echo "开始执行测试: $TEST_TYPE"
echo "=========================================="

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查 Node.js 版本
NODE_VERSION=$(node -v)
echo -e "${YELLOW}Node.js 版本: $NODE_VERSION${NC}"

# 检查依赖
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}安装依赖...${NC}"
  npm install
fi

# 运行单元测试
if [ "$TEST_TYPE" = "unit" ] || [ "$TEST_TYPE" = "all" ]; then
  echo ""
  echo -e "${GREEN}=========================================="
  echo "执行单元测试"
  echo "==========================================${NC}"
  
  npm run test -- --testPathPattern="test/(escort|marketing)" --coverage
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 单元测试通过${NC}"
  else
    echo -e "${RED}✗ 单元测试失败${NC}"
    exit 1
  fi
fi

# 运行集成测试
if [ "$TEST_TYPE" = "integration" ] || [ "$TEST_TYPE" = "all" ]; then
  echo ""
  echo -e "${GREEN}=========================================="
  echo "执行集成测试"
  echo "==========================================${NC}"
  
  # 需要启动测试数据库
  echo -e "${YELLOW}提示: 集成测试需要测试数据库环境${NC}"
  echo -e "${YELLOW}请确保已配置测试数据库连接${NC}"
  
  # npm run test:e2e
fi

# 运行性能测试
if [ "$TEST_TYPE" = "performance" ] || [ "$TEST_TYPE" = "all" ]; then
  echo ""
  echo -e "${GREEN}=========================================="
  echo "执行性能测试"
  echo "==========================================${NC}"
  
  # 检查 k6 是否安装
  if command -v k6 &> /dev/null; then
    echo -e "${YELLOW}运行 k6 压力测试...${NC}"
    # k6 run test/performance/k6-tests.js
    echo -e "${YELLOW}提示: 请手动运行 k6 测试${NC}"
  else
    echo -e "${YELLOW}k6 未安装，跳过性能测试${NC}"
    echo -e "${YELLOW}安装命令: brew install k6 (macOS)${NC}"
  fi
fi

echo ""
echo -e "${GREEN}=========================================="
echo "测试完成"
echo "==========================================${NC}"
