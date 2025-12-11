/**
 * 创建默认管理员账号脚本
 * 运行方式: npx ts-node prisma/create-admin.ts
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const username = 'admin';
  const password = 'admin123'; // 默认密码
  const name = '超级管理员';

  // 检查是否已存在
  const existing = await prisma.admin.findUnique({
    where: { username },
  });

  if (existing) {
    console.log('✅ 管理员账号已存在:');
    console.log(`   用户名: ${existing.username}`);
    console.log(`   姓名: ${existing.name}`);
    console.log(`   角色: ${existing.role}`);
    console.log('\n💡 如需重置密码，请删除现有账号后重新运行此脚本');
    return;
  }

  // 加密密码
  const hashedPassword = await bcrypt.hash(password, 10);

  // 创建管理员
  const admin = await prisma.admin.create({
    data: {
      username,
      password: hashedPassword,
      name,
      role: 'superadmin',
      status: 'active',
    },
  });

  console.log('🎉 管理员账号创建成功！');
  console.log('');
  console.log('   用户名: admin');
  console.log('   密码: admin123');
  console.log('');
  console.log('⚠️  请登录后立即修改密码！');
}

main()
  .catch((e) => {
    console.error('创建管理员失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
