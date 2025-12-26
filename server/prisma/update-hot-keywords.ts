import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Updating hot keywords to match actual services...');

  // 删除旧的关键词
  await prisma.hotKeyword.deleteMany({});
  console.log('Deleted old keywords');

  // 插入与实际服务匹配的关键词
  const hotKeywords = [
    { keyword: '门诊陪诊', isHot: true, sort: 10, status: 'active' },
    { keyword: '代办病历打印', isHot: true, sort: 20, status: 'active' },
    { keyword: '代取报告', isHot: false, sort: 30, status: 'active' },
    { keyword: '代开检查单', isHot: false, sort: 40, status: 'active' },
    { keyword: '代办病理会诊', isHot: false, sort: 50, status: 'active' },
    { keyword: '肿瘤', isHot: false, sort: 60, status: 'active' },
    { keyword: '陪诊', isHot: false, sort: 70, status: 'active' },
    { keyword: '病历', isHot: false, sort: 80, status: 'active' },
  ];

  for (const data of hotKeywords) {
    await prisma.hotKeyword.create({ data });
  }

  console.log('Hot keywords updated successfully!');
  
  // 验证结果
  const keywords = await prisma.hotKeyword.findMany({
    orderBy: { sort: 'asc' },
  });
  console.log('New keywords:', keywords.map(k => k.keyword));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
