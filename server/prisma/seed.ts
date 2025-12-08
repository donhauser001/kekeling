import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始添加测试数据...');

  // 1. 创建服务分类
  const categories = await Promise.all([
    prisma.serviceCategory.create({
      data: { name: '陪诊服务', icon: 'stethoscope', sort: 1 },
    }),
    prisma.serviceCategory.create({
      data: { name: '代办服务', icon: 'clipboard-list', sort: 2 },
    }),
    prisma.serviceCategory.create({
      data: { name: '陪护服务', icon: 'bed', sort: 3 },
    }),
  ]);
  console.log('✅ 服务分类创建完成');

  // 2. 创建服务
  const services = await Promise.all([
    prisma.service.create({
      data: {
        categoryId: categories[0].id,
        name: '全程陪诊',
        description: '专业陪诊员全程陪同就医，挂号、问诊、检查、取药一站式服务',
        price: 299,
        originalPrice: 399,
        duration: '4-6小时',
        orderCount: 12580,
        rating: 98.5,
        tags: JSON.stringify(['热门', '专业']),
        serviceIncludes: JSON.stringify(['代挂号预约', '全程陪同就诊', '协助问诊沟通', '陪同各项检查', '代取报告单', '代取药']),
      },
    }),
    prisma.service.create({
      data: {
        categoryId: categories[1].id,
        name: '代办挂号',
        description: '专家号、普通号代挂服务，省去排队烦恼',
        price: 99,
        duration: '当天',
        orderCount: 8920,
        rating: 99,
        tags: JSON.stringify(['便捷', '热门']),
      },
    }),
    prisma.service.create({
      data: {
        categoryId: categories[0].id,
        name: '检查陪同',
        description: '陪同完成各项检查，协助排队、取报告',
        price: 199,
        originalPrice: 249,
        duration: '2-4小时',
        orderCount: 6580,
        rating: 97,
      },
    }),
    prisma.service.create({
      data: {
        categoryId: categories[2].id,
        name: '住院陪护',
        description: '住院期间全程陪护，协助日常护理',
        price: 399,
        originalPrice: 499,
        duration: '24小时',
        orderCount: 3250,
        rating: 99,
        tags: JSON.stringify(['专业', '24小时']),
      },
    }),
    prisma.service.create({
      data: {
        categoryId: categories[1].id,
        name: '代取报告',
        description: '检查报告代取代寄，省时省力',
        price: 49,
        duration: '当天',
        orderCount: 5680,
        rating: 98,
      },
    }),
  ]);
  console.log('✅ 服务创建完成');

  // 3. 创建医院
  const hospitals = await Promise.all([
    prisma.hospital.create({
      data: {
        name: '上海市第一人民医院',
        level: '三甲',
        type: '综合',
        address: '上海市松江区新松江路650号',
        phone: '021-12345678',
        introduction: '上海市第一人民医院创建于1864年，是全国建院最早的综合性百年老院之一。',
        departments: JSON.stringify(['心内科', '神经内科', '消化内科', '骨科', '普外科', '妇产科']),
        trafficGuide: '地铁9号线松江新城站步行800米',
        parkingInfo: '医院设有地下停车场',
      },
    }),
    prisma.hospital.create({
      data: {
        name: '复旦大学附属华山医院',
        level: '三甲',
        type: '综合',
        address: '上海市静安区乌鲁木齐中路12号',
        phone: '021-23456789',
        introduction: '华山医院是复旦大学附属医院，国家卫生健康委员会委管医院。',
        departments: JSON.stringify(['神经外科', '皮肤科', '感染科', '康复医学科']),
      },
    }),
    prisma.hospital.create({
      data: {
        name: '上海交通大学医学院附属瑞金医院',
        level: '三甲',
        type: '综合',
        address: '上海市黄浦区瑞金二路197号',
        phone: '021-34567890',
        introduction: '瑞金医院建于1907年，是一所集医疗、教学、科研于一体的三级甲等综合性医院。',
        departments: JSON.stringify(['内分泌科', '血液科', '肿瘤科', '心脏外科']),
      },
    }),
  ]);
  console.log('✅ 医院创建完成');

  // 4. 创建陪诊员
  const escorts = await Promise.all([
    prisma.escort.create({
      data: {
        name: '张护士',
        gender: 'female',
        phone: '13800000001',
        level: 'senior',
        experience: '5年',
        introduction: '三甲医院护士出身，熟悉各大医院就诊流程，擅长与医生沟通。',
        tags: JSON.stringify(['专业沟通', '耐心细致', '准时守约']),
        certificates: JSON.stringify(['护士执业资格证', '健康管理师证']),
        rating: 98.5,
        orderCount: 568,
      },
    }),
    prisma.escort.create({
      data: {
        name: '李护士',
        gender: 'female',
        phone: '13800000002',
        level: 'intermediate',
        experience: '3年',
        introduction: '护理专业毕业，熟悉常见检查流程，服务态度好。',
        tags: JSON.stringify(['服务热情', '沟通顺畅']),
        certificates: JSON.stringify(['护士执业资格证']),
        rating: 97.2,
        orderCount: 423,
      },
    }),
    prisma.escort.create({
      data: {
        name: '王师傅',
        gender: 'male',
        phone: '13800000003',
        level: 'intermediate',
        experience: '4年',
        introduction: '从事陪诊工作4年，经验丰富，熟悉医保报销流程。',
        tags: JSON.stringify(['经验丰富', '医保熟悉']),
        rating: 96.8,
        orderCount: 312,
      },
    }),
  ]);
  console.log('✅ 陪诊员创建完成');

  // 5. 关联陪诊员和医院
  await Promise.all([
    prisma.escortHospital.create({
      data: {
        escortId: escorts[0].id,
        hospitalId: hospitals[0].id,
        familiarDepts: JSON.stringify(['心内科', '神经内科']),
      },
    }),
    prisma.escortHospital.create({
      data: {
        escortId: escorts[0].id,
        hospitalId: hospitals[1].id,
        familiarDepts: JSON.stringify(['神经外科', '皮肤科']),
      },
    }),
    prisma.escortHospital.create({
      data: {
        escortId: escorts[1].id,
        hospitalId: hospitals[2].id,
        familiarDepts: JSON.stringify(['内分泌科']),
      },
    }),
    prisma.escortHospital.create({
      data: {
        escortId: escorts[2].id,
        hospitalId: hospitals[1].id,
        familiarDepts: JSON.stringify(['感染科']),
      },
    }),
  ]);
  console.log('✅ 陪诊员-医院关联创建完成');

  // 6. 创建轮播图
  await Promise.all([
    prisma.banner.create({
      data: {
        title: '专业陪诊服务',
        image: '/images/banner1.png',
        sort: 1,
      },
    }),
    prisma.banner.create({
      data: {
        title: '新用户专享优惠',
        image: '/images/banner2.png',
        sort: 2,
      },
    }),
  ]);
  console.log('✅ 轮播图创建完成');

  console.log('🎉 测试数据添加完成！');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

