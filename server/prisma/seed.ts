import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始添加测试数据...');

  // 清理现有数据 (开发环境)
  await prisma.order.deleteMany();
  await prisma.escortHospital.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.department.deleteMany();
  await prisma.escort.deleteMany();
  await prisma.hospital.deleteMany();
  await prisma.service.deleteMany();
  await prisma.serviceCategory.deleteMany();
  await prisma.banner.deleteMany();
  console.log('✅ 清理旧数据完成');

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
  await Promise.all([
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
      },
    }),
  ]);
  console.log('✅ 医院创建完成');

  // 4. 创建科室 (医院1: 上海市第一人民医院)
  // 一级科室
  const h1_neike = await prisma.department.create({
    data: { name: '内科', hospitalId: hospitals[0].id, sort: 1 },
  });
  const h1_waike = await prisma.department.create({
    data: { name: '外科', hospitalId: hospitals[0].id, sort: 2 },
  });
  const h1_fuke = await prisma.department.create({
    data: { name: '妇产科', hospitalId: hospitals[0].id, sort: 3 },
  });

  // 二级科室 (内科下)
  const h1_xinxueguan = await prisma.department.create({
    data: { name: '心血管内科', hospitalId: hospitals[0].id, parentId: h1_neike.id, sort: 1 },
  });
  const h1_xiaohua = await prisma.department.create({
    data: { name: '消化内科', hospitalId: hospitals[0].id, parentId: h1_neike.id, sort: 2 },
  });
  const h1_shenjing = await prisma.department.create({
    data: { name: '神经内科', hospitalId: hospitals[0].id, parentId: h1_neike.id, sort: 3 },
  });

  // 二级科室 (外科下)
  const h1_guke = await prisma.department.create({
    data: { name: '骨科', hospitalId: hospitals[0].id, parentId: h1_waike.id, sort: 1 },
  });
  const h1_puwaike = await prisma.department.create({
    data: { name: '普外科', hospitalId: hospitals[0].id, parentId: h1_waike.id, sort: 2 },
  });

  // 科室 (医院2: 华山医院)
  const h2_shenjingwaike = await prisma.department.create({
    data: { name: '神经外科', hospitalId: hospitals[1].id, sort: 1, introduction: '华山医院神经外科是国家临床重点专科' },
  });
  const h2_pifu = await prisma.department.create({
    data: { name: '皮肤科', hospitalId: hospitals[1].id, sort: 2 },
  });
  const h2_ganran = await prisma.department.create({
    data: { name: '感染科', hospitalId: hospitals[1].id, sort: 3 },
  });

  // 科室 (医院3: 瑞金医院)
  const h3_neifenmi = await prisma.department.create({
    data: { name: '内分泌科', hospitalId: hospitals[2].id, sort: 1, introduction: '瑞金医院内分泌科是国内领先的专科' },
  });
  const h3_xueye = await prisma.department.create({
    data: { name: '血液科', hospitalId: hospitals[2].id, sort: 2 },
  });
  const h3_zhongliu = await prisma.department.create({
    data: { name: '肿瘤科', hospitalId: hospitals[2].id, sort: 3 },
  });

  console.log('✅ 科室创建完成');

  // 5. 创建医生
  await Promise.all([
    // 医院1 - 心血管内科
    prisma.doctor.create({
      data: {
        name: '张明华',
        gender: 'male',
        hospitalId: hospitals[0].id,
        departmentId: h1_xinxueguan.id,
        title: 'chief',
        level: 'expert',
        specialties: ['冠心病', '心律失常', '心力衰竭', '高血压'],
        introduction: '从事心血管内科临床工作30余年，在冠心病介入治疗、心律失常射频消融等方面有丰富经验。',
        education: '上海交通大学医学院博士',
        experience: '30年',
        rating: 4.9,
        consultCount: 1256,
        reviewCount: 328,
      },
    }),
    prisma.doctor.create({
      data: {
        name: '王丽娟',
        gender: 'female',
        hospitalId: hospitals[0].id,
        departmentId: h1_xinxueguan.id,
        title: 'associate_chief',
        level: 'senior',
        specialties: ['冠心病', '高血压', '心肌病'],
        introduction: '擅长心血管疾病的诊治，尤其在高血压、冠心病等常见病多发病的诊治方面经验丰富。',
        education: '复旦大学医学院硕士',
        experience: '18年',
        rating: 4.8,
        consultCount: 892,
        reviewCount: 156,
      },
    }),
    // 医院1 - 消化内科
    prisma.doctor.create({
      data: {
        name: '李秀英',
        gender: 'female',
        hospitalId: hospitals[0].id,
        departmentId: h1_xiaohua.id,
        title: 'chief',
        level: 'expert',
        specialties: ['胃炎', '消化性溃疡', '肝病', '胃肠镜'],
        introduction: '擅长消化系统疾病的诊治，尤其在胃肠镜检查与治疗方面经验丰富。',
        education: '同济大学医学院博士',
        experience: '25年',
        rating: 4.9,
        consultCount: 1089,
        reviewCount: 267,
      },
    }),
    // 医院1 - 骨科
    prisma.doctor.create({
      data: {
        name: '陈伟',
        gender: 'male',
        hospitalId: hospitals[0].id,
        departmentId: h1_guke.id,
        title: 'associate_chief',
        level: 'senior',
        specialties: ['骨折', '关节炎', '颈椎病', '腰椎间盘突出'],
        introduction: '擅长骨科常见病、多发病的诊治，在关节置换、脊柱疾病方面有丰富经验。',
        education: '第二军医大学硕士',
        experience: '15年',
        rating: 4.7,
        consultCount: 756,
        reviewCount: 134,
      },
    }),
    // 医院2 - 神经外科
    prisma.doctor.create({
      data: {
        name: '周建国',
        gender: 'male',
        hospitalId: hospitals[1].id,
        departmentId: h2_shenjingwaike.id,
        title: 'chief',
        level: 'expert',
        specialties: ['脑肿瘤', '脑血管病', '颅脑损伤', '功能神经外科'],
        introduction: '华山医院神经外科主任医师，在脑肿瘤微创手术、脑血管病介入治疗方面造诣深厚。',
        education: '上海医科大学博士',
        experience: '28年',
        rating: 5.0,
        consultCount: 2156,
        reviewCount: 512,
      },
    }),
    // 医院2 - 皮肤科
    prisma.doctor.create({
      data: {
        name: '林雅琴',
        gender: 'female',
        hospitalId: hospitals[1].id,
        departmentId: h2_pifu.id,
        title: 'associate_chief',
        specialties: ['皮炎', '湿疹', '银屑病', '皮肤美容'],
        introduction: '擅长各种皮肤病的诊治，尤其在皮炎、湿疹、银屑病等方面有独特见解。',
        experience: '12年',
        rating: 4.8,
        consultCount: 623,
        reviewCount: 89,
      },
    }),
    // 医院3 - 内分泌科
    prisma.doctor.create({
      data: {
        name: '赵国强',
        gender: 'male',
        hospitalId: hospitals[2].id,
        departmentId: h3_neifenmi.id,
        title: 'chief',
        level: 'expert',
        specialties: ['糖尿病', '甲状腺疾病', '肥胖症', '内分泌紊乱'],
        introduction: '瑞金医院内分泌科主任医师，在糖尿病、甲状腺疾病等方面有深入研究，发表论文100余篇。',
        education: '上海交通大学医学院博士后',
        experience: '32年',
        rating: 4.9,
        consultCount: 3256,
        reviewCount: 789,
      },
    }),
    prisma.doctor.create({
      data: {
        name: '孙敏',
        gender: 'female',
        hospitalId: hospitals[2].id,
        departmentId: h3_neifenmi.id,
        title: 'attending',
        specialties: ['糖尿病', '甲亢', '甲减'],
        introduction: '擅长糖尿病及甲状腺疾病的诊治。',
        experience: '8年',
        rating: 4.6,
        consultCount: 356,
        reviewCount: 45,
      },
    }),
    // 医院3 - 血液科
    prisma.doctor.create({
      data: {
        name: '吴志远',
        gender: 'male',
        hospitalId: hospitals[2].id,
        departmentId: h3_xueye.id,
        title: 'chief',
        level: 'expert',
        specialties: ['白血病', '淋巴瘤', '贫血', '血小板减少'],
        introduction: '瑞金医院血液科主任医师，在白血病诊治方面享有盛誉，主持多项国家级科研项目。',
        education: '中国科学院博士',
        experience: '26年',
        rating: 4.9,
        consultCount: 1567,
        reviewCount: 423,
      },
    }),
  ]);
  console.log('✅ 医生创建完成');

  // 6. 创建陪诊员
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

  // 7. 关联陪诊员和医院
  await Promise.all([
    prisma.escortHospital.create({
      data: {
        escortId: escorts[0].id,
        hospitalId: hospitals[0].id,
        familiarDepts: JSON.stringify(['心血管内科', '消化内科']),
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

  // 8. 创建轮播图
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

  // 统计
  const hospitalCount = await prisma.hospital.count();
  const departmentCount = await prisma.department.count();
  const doctorCount = await prisma.doctor.count();
  const escortCount = await prisma.escort.count();
  
  console.log('\n📊 数据统计:');
  console.log(`   医院: ${hospitalCount} 个`);
  console.log(`   科室: ${departmentCount} 个`);
  console.log(`   医生: ${doctorCount} 位`);
  console.log(`   陪诊员: ${escortCount} 位`);

  console.log('\n🎉 测试数据添加完成！');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
