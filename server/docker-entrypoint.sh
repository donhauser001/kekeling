#!/bin/sh
set -e

echo "🔄 等待数据库就绪..."
sleep 3

echo "🔄 运行数据库迁移..."
./node_modules/.bin/prisma db push --accept-data-loss

echo "🌱 检查是否需要初始化数据..."
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function check() {
  const count = await prisma.serviceCategory.count();
  if (count === 0) {
    console.log('📦 数据库为空，需要初始化数据');
    process.exit(1);
  } else {
    console.log('✅ 数据库已有数据，跳过初始化');
    process.exit(0);
  }
}
check().catch(() => process.exit(1));
" || ./node_modules/.bin/ts-node prisma/seed.ts 2>/dev/null || echo "⚠️ 种子数据脚本跳过"

echo "🚀 启动应用..."
exec node dist/src/main.js

