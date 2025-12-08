import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始添加真实数据...');

  // 清理现有数据
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
        orderCount: 0,
        rating: 100,
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
        orderCount: 0,
        rating: 100,
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
        orderCount: 0,
        rating: 100,
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
        orderCount: 0,
        rating: 100,
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
        orderCount: 0,
        rating: 100,
      },
    }),
  ]);
  console.log('✅ 服务创建完成');

  // ========== 北京主要三甲医院 ==========

  // 3.1 北京协和医院
  const xiehe = await prisma.hospital.create({
    data: {
      name: '北京协和医院',
      level: '三甲',
      type: '综合',
      address: '北京市东城区帅府园1号',
      phone: '010-69156114',
      latitude: 39.9136,
      longitude: 116.4169,
      introduction: '北京协和医院是一所位于北京市东城区，集医疗、科研、教学为一体的大型综合医院。是国家卫生健康委指定的全国疑难重症诊治指导中心，连续多年位居中国医院排行榜榜首。',
      trafficGuide: '地铁1号线王府井站C口出，步行约800米；或乘坐公交1路、52路、82路等至东单站下车',
      parkingInfo: '医院设有地下停车场，车位有限，建议乘坐公共交通',
    },
  });

  // 协和医院科室
  const xiehe_neike = await prisma.department.create({
    data: { name: '内科', hospitalId: xiehe.id, sort: 1 },
  });
  const xiehe_waike = await prisma.department.create({
    data: { name: '外科', hospitalId: xiehe.id, sort: 2 },
  });
  const xiehe_fuke = await prisma.department.create({
    data: { name: '妇产科', hospitalId: xiehe.id, sort: 3 },
  });
  const xiehe_erke = await prisma.department.create({
    data: { name: '儿科', hospitalId: xiehe.id, sort: 4 },
  });
  const xiehe_yanke = await prisma.department.create({
    data: { name: '眼科', hospitalId: xiehe.id, sort: 5 },
  });

  // 内科子科室
  await Promise.all([
    prisma.department.create({ data: { name: '心内科', hospitalId: xiehe.id, parentId: xiehe_neike.id, sort: 1, introduction: '心血管疾病诊治中心，国内领先' } }),
    prisma.department.create({ data: { name: '消化内科', hospitalId: xiehe.id, parentId: xiehe_neike.id, sort: 2, introduction: '消化系统疾病诊疗，胃肠镜检查' } }),
    prisma.department.create({ data: { name: '呼吸内科', hospitalId: xiehe.id, parentId: xiehe_neike.id, sort: 3 } }),
    prisma.department.create({ data: { name: '内分泌科', hospitalId: xiehe.id, parentId: xiehe_neike.id, sort: 4, introduction: '糖尿病、甲状腺疾病诊治' } }),
    prisma.department.create({ data: { name: '肾内科', hospitalId: xiehe.id, parentId: xiehe_neike.id, sort: 5 } }),
    prisma.department.create({ data: { name: '风湿免疫科', hospitalId: xiehe.id, parentId: xiehe_neike.id, sort: 6, introduction: '国内顶尖的风湿免疫疾病诊治中心' } }),
    prisma.department.create({ data: { name: '血液内科', hospitalId: xiehe.id, parentId: xiehe_neike.id, sort: 7 } }),
    prisma.department.create({ data: { name: '神经内科', hospitalId: xiehe.id, parentId: xiehe_neike.id, sort: 8 } }),
  ]);

  // 外科子科室
  await Promise.all([
    prisma.department.create({ data: { name: '普外科', hospitalId: xiehe.id, parentId: xiehe_waike.id, sort: 1 } }),
    prisma.department.create({ data: { name: '骨科', hospitalId: xiehe.id, parentId: xiehe_waike.id, sort: 2 } }),
    prisma.department.create({ data: { name: '泌尿外科', hospitalId: xiehe.id, parentId: xiehe_waike.id, sort: 3 } }),
    prisma.department.create({ data: { name: '心外科', hospitalId: xiehe.id, parentId: xiehe_waike.id, sort: 4 } }),
    prisma.department.create({ data: { name: '胸外科', hospitalId: xiehe.id, parentId: xiehe_waike.id, sort: 5 } }),
    prisma.department.create({ data: { name: '神经外科', hospitalId: xiehe.id, parentId: xiehe_waike.id, sort: 6 } }),
  ]);

  // 其他科室
  await Promise.all([
    prisma.department.create({ data: { name: '皮肤科', hospitalId: xiehe.id, sort: 6, introduction: '国内皮肤病诊治权威' } }),
    prisma.department.create({ data: { name: '口腔科', hospitalId: xiehe.id, sort: 7 } }),
    prisma.department.create({ data: { name: '耳鼻喉科', hospitalId: xiehe.id, sort: 8 } }),
    prisma.department.create({ data: { name: '放射科', hospitalId: xiehe.id, sort: 9 } }),
    prisma.department.create({ data: { name: '检验科', hospitalId: xiehe.id, sort: 10 } }),
    prisma.department.create({ data: { name: '病理科', hospitalId: xiehe.id, sort: 11, introduction: '全国病理诊断中心' } }),
  ]);

  // 3.2 北京大学第一医院
  const beiyiyuan = await prisma.hospital.create({
    data: {
      name: '北京大学第一医院',
      level: '三甲',
      type: '综合',
      address: '北京市西城区西什库大街8号',
      phone: '010-83572211',
      latitude: 39.9289,
      longitude: 116.3837,
      introduction: '北京大学第一医院（简称"北大医院"）创建于1915年，是我国最早创办的国立医院，也是国内首批建立的临床医学院之一。',
      trafficGuide: '地铁4号线西四站D口出，步行约500米',
      parkingInfo: '医院设有停车场，建议提前到达',
    },
  });

  const beiyiyuan_neike = await prisma.department.create({
    data: { name: '内科', hospitalId: beiyiyuan.id, sort: 1 },
  });
  const beiyiyuan_waike = await prisma.department.create({
    data: { name: '外科', hospitalId: beiyiyuan.id, sort: 2 },
  });

  await Promise.all([
    prisma.department.create({ data: { name: '肾内科', hospitalId: beiyiyuan.id, parentId: beiyiyuan_neike.id, sort: 1, introduction: '全国肾脏病临床医学研究中心' } }),
    prisma.department.create({ data: { name: '心内科', hospitalId: beiyiyuan.id, parentId: beiyiyuan_neike.id, sort: 2 } }),
    prisma.department.create({ data: { name: '消化内科', hospitalId: beiyiyuan.id, parentId: beiyiyuan_neike.id, sort: 3 } }),
    prisma.department.create({ data: { name: '呼吸内科', hospitalId: beiyiyuan.id, parentId: beiyiyuan_neike.id, sort: 4 } }),
    prisma.department.create({ data: { name: '神经内科', hospitalId: beiyiyuan.id, parentId: beiyiyuan_neike.id, sort: 5 } }),
    prisma.department.create({ data: { name: '泌尿外科', hospitalId: beiyiyuan.id, parentId: beiyiyuan_waike.id, sort: 1, introduction: '全国泌尿外科诊疗中心' } }),
    prisma.department.create({ data: { name: '普外科', hospitalId: beiyiyuan.id, parentId: beiyiyuan_waike.id, sort: 2 } }),
    prisma.department.create({ data: { name: '骨科', hospitalId: beiyiyuan.id, parentId: beiyiyuan_waike.id, sort: 3 } }),
    prisma.department.create({ data: { name: '妇产科', hospitalId: beiyiyuan.id, sort: 3 } }),
    prisma.department.create({ data: { name: '儿科', hospitalId: beiyiyuan.id, sort: 4 } }),
    prisma.department.create({ data: { name: '皮肤科', hospitalId: beiyiyuan.id, sort: 5, introduction: '皮肤性病诊疗中心' } }),
    prisma.department.create({ data: { name: '眼科', hospitalId: beiyiyuan.id, sort: 6 } }),
  ]);

  // 3.3 北京大学第三医院
  const beisanyuan = await prisma.hospital.create({
    data: {
      name: '北京大学第三医院',
      level: '三甲',
      type: '综合',
      address: '北京市海淀区花园北路49号',
      phone: '010-82266699',
      latitude: 39.9842,
      longitude: 116.3567,
      introduction: '北京大学第三医院（简称"北医三院"）始建于1958年，是国家卫生健康委委管的集医疗、教学、科研和预防保健为一体的现代化综合性三级甲等医院。生殖医学中心为国内辅助生殖技术的发源地。',
      trafficGuide: '地铁10号线西土城站A口出，步行约600米',
      parkingInfo: '医院周边停车位紧张，建议公共交通出行',
    },
  });

  const beisanyuan_neike = await prisma.department.create({
    data: { name: '内科', hospitalId: beisanyuan.id, sort: 1 },
  });
  const beisanyuan_waike = await prisma.department.create({
    data: { name: '外科', hospitalId: beisanyuan.id, sort: 2 },
  });

  await Promise.all([
    prisma.department.create({ data: { name: '心内科', hospitalId: beisanyuan.id, parentId: beisanyuan_neike.id, sort: 1 } }),
    prisma.department.create({ data: { name: '消化内科', hospitalId: beisanyuan.id, parentId: beisanyuan_neike.id, sort: 2 } }),
    prisma.department.create({ data: { name: '呼吸内科', hospitalId: beisanyuan.id, parentId: beisanyuan_neike.id, sort: 3 } }),
    prisma.department.create({ data: { name: '神经内科', hospitalId: beisanyuan.id, parentId: beisanyuan_neike.id, sort: 4 } }),
    prisma.department.create({ data: { name: '骨科', hospitalId: beisanyuan.id, parentId: beisanyuan_waike.id, sort: 1, introduction: '运动医学研究所所在地，骨科诊疗全国领先' } }),
    prisma.department.create({ data: { name: '普外科', hospitalId: beisanyuan.id, parentId: beisanyuan_waike.id, sort: 2 } }),
    prisma.department.create({ data: { name: '泌尿外科', hospitalId: beisanyuan.id, parentId: beisanyuan_waike.id, sort: 3 } }),
    prisma.department.create({ data: { name: '生殖医学中心', hospitalId: beisanyuan.id, sort: 3, introduction: '中国大陆首例试管婴儿诞生地，国内辅助生殖技术发源地' } }),
    prisma.department.create({ data: { name: '妇产科', hospitalId: beisanyuan.id, sort: 4 } }),
    prisma.department.create({ data: { name: '眼科', hospitalId: beisanyuan.id, sort: 5, introduction: '眼科中心' } }),
    prisma.department.create({ data: { name: '康复医学科', hospitalId: beisanyuan.id, sort: 6 } }),
  ]);

  // 3.4 北京天坛医院
  const tiantan = await prisma.hospital.create({
    data: {
      name: '首都医科大学附属北京天坛医院',
      level: '三甲',
      type: '综合',
      address: '北京市丰台区南四环西路119号',
      phone: '010-59976611',
      latitude: 39.8453,
      longitude: 116.2889,
      introduction: '北京天坛医院始建于1956年，是一所以神经外科为先导，以神经科学集群为特色的大型三级甲等综合医院。神经外科、神经内科在国内外享有盛誉。',
      trafficGuide: '地铁8号线天桥站或14号线西铁营站',
      parkingInfo: '医院设有大型停车场',
    },
  });

  const tiantan_neike = await prisma.department.create({
    data: { name: '内科', hospitalId: tiantan.id, sort: 1 },
  });
  const tiantan_waike = await prisma.department.create({
    data: { name: '外科', hospitalId: tiantan.id, sort: 2 },
  });

  await Promise.all([
    prisma.department.create({ data: { name: '神经内科', hospitalId: tiantan.id, parentId: tiantan_neike.id, sort: 1, introduction: '国家神经系统疾病临床医学研究中心' } }),
    prisma.department.create({ data: { name: '心内科', hospitalId: tiantan.id, parentId: tiantan_neike.id, sort: 2 } }),
    prisma.department.create({ data: { name: '消化内科', hospitalId: tiantan.id, parentId: tiantan_neike.id, sort: 3 } }),
    prisma.department.create({ data: { name: '呼吸内科', hospitalId: tiantan.id, parentId: tiantan_neike.id, sort: 4 } }),
    prisma.department.create({ data: { name: '神经外科', hospitalId: tiantan.id, parentId: tiantan_waike.id, sort: 1, introduction: '亚洲最大的神经外科诊疗中心，世界著名' } }),
    prisma.department.create({ data: { name: '脊柱脊髓外科', hospitalId: tiantan.id, parentId: tiantan_waike.id, sort: 2 } }),
    prisma.department.create({ data: { name: '普外科', hospitalId: tiantan.id, parentId: tiantan_waike.id, sort: 3 } }),
    prisma.department.create({ data: { name: '介入神经病学科', hospitalId: tiantan.id, sort: 3, introduction: '神经介入诊疗中心' } }),
    prisma.department.create({ data: { name: '癫痫科', hospitalId: tiantan.id, sort: 4 } }),
    prisma.department.create({ data: { name: '功能神经外科', hospitalId: tiantan.id, sort: 5 } }),
  ]);

  // 3.5 中国人民解放军总医院(301医院)
  const h301 = await prisma.hospital.create({
    data: {
      name: '中国人民解放军总医院',
      level: '三甲',
      type: '综合',
      address: '北京市海淀区复兴路28号',
      phone: '010-66887329',
      latitude: 39.9074,
      longitude: 116.2949,
      introduction: '中国人民解放军总医院（301医院）创建于1953年，是集医疗、保健、教学、科研于一体的大型现代化综合性医院。',
      trafficGuide: '地铁1号线五棵松站A口出',
      parkingInfo: '院内设有停车场，凭就诊卡可享受停车优惠',
    },
  });

  const h301_neike = await prisma.department.create({
    data: { name: '内科', hospitalId: h301.id, sort: 1 },
  });
  const h301_waike = await prisma.department.create({
    data: { name: '外科', hospitalId: h301.id, sort: 2 },
  });

  await Promise.all([
    prisma.department.create({ data: { name: '心内科', hospitalId: h301.id, parentId: h301_neike.id, sort: 1 } }),
    prisma.department.create({ data: { name: '消化内科', hospitalId: h301.id, parentId: h301_neike.id, sort: 2 } }),
    prisma.department.create({ data: { name: '呼吸内科', hospitalId: h301.id, parentId: h301_neike.id, sort: 3 } }),
    prisma.department.create({ data: { name: '肾内科', hospitalId: h301.id, parentId: h301_neike.id, sort: 4 } }),
    prisma.department.create({ data: { name: '神经内科', hospitalId: h301.id, parentId: h301_neike.id, sort: 5 } }),
    prisma.department.create({ data: { name: '骨科', hospitalId: h301.id, parentId: h301_waike.id, sort: 1, introduction: '全军骨科研究所' } }),
    prisma.department.create({ data: { name: '普外科', hospitalId: h301.id, parentId: h301_waike.id, sort: 2 } }),
    prisma.department.create({ data: { name: '泌尿外科', hospitalId: h301.id, parentId: h301_waike.id, sort: 3 } }),
    prisma.department.create({ data: { name: '心外科', hospitalId: h301.id, parentId: h301_waike.id, sort: 4 } }),
    prisma.department.create({ data: { name: '神经外科', hospitalId: h301.id, parentId: h301_waike.id, sort: 5 } }),
    prisma.department.create({ data: { name: '耳鼻喉科', hospitalId: h301.id, sort: 3, introduction: '全军耳鼻咽喉头颈外科中心' } }),
    prisma.department.create({ data: { name: '眼科', hospitalId: h301.id, sort: 4 } }),
    prisma.department.create({ data: { name: '口腔科', hospitalId: h301.id, sort: 5 } }),
  ]);

  // 3.6 北京阜外医院
  const fuwai = await prisma.hospital.create({
    data: {
      name: '中国医学科学院阜外医院',
      level: '三甲',
      type: '专科',
      address: '北京市西城区北礼士路167号',
      phone: '010-88398866',
      latitude: 39.9391,
      longitude: 116.3513,
      introduction: '阜外医院是国家心血管病中心所在地，是以诊治心血管疾病为主的三级甲等专科医院，心血管疾病诊治能力全国第一、世界领先。',
      trafficGuide: '地铁2号线阜成门站B口出，步行约300米',
      parkingInfo: '医院停车位有限，建议乘坐公共交通',
    },
  });

  await Promise.all([
    prisma.department.create({ data: { name: '心内科', hospitalId: fuwai.id, sort: 1, introduction: '国家心血管病中心，心内科诊疗世界领先' } }),
    prisma.department.create({ data: { name: '心外科', hospitalId: fuwai.id, sort: 2, introduction: '心脏外科手术量全国第一' } }),
    prisma.department.create({ data: { name: '心律失常中心', hospitalId: fuwai.id, sort: 3 } }),
    prisma.department.create({ data: { name: '冠心病中心', hospitalId: fuwai.id, sort: 4 } }),
    prisma.department.create({ data: { name: '结构性心脏病中心', hospitalId: fuwai.id, sort: 5 } }),
    prisma.department.create({ data: { name: '高血压诊治中心', hospitalId: fuwai.id, sort: 6 } }),
    prisma.department.create({ data: { name: '心力衰竭中心', hospitalId: fuwai.id, sort: 7 } }),
    prisma.department.create({ data: { name: '血管外科', hospitalId: fuwai.id, sort: 8 } }),
    prisma.department.create({ data: { name: '心脏重症监护中心', hospitalId: fuwai.id, sort: 9 } }),
  ]);

  // 3.7 北京积水潭医院
  const jishuitan = await prisma.hospital.create({
    data: {
      name: '北京积水潭医院',
      level: '三甲',
      type: '综合',
      address: '北京市西城区新街口东街31号',
      phone: '010-58516688',
      latitude: 39.9439,
      longitude: 116.3774,
      introduction: '北京积水潭医院是以骨科、烧伤科为重点学科的三级甲等综合医院，骨科诊疗综合实力全国领先。',
      trafficGuide: '地铁2号线积水潭站A口出',
      parkingInfo: '医院停车场位于南门',
    },
  });

  const jishuitan_guke = await prisma.department.create({
    data: { name: '骨科', hospitalId: jishuitan.id, sort: 1, introduction: '全国骨科诊疗中心，运动医学、创伤骨科全国领先' },
  });

  await Promise.all([
    prisma.department.create({ data: { name: '创伤骨科', hospitalId: jishuitan.id, parentId: jishuitan_guke.id, sort: 1, introduction: '创伤骨科全国领先' } }),
    prisma.department.create({ data: { name: '脊柱外科', hospitalId: jishuitan.id, parentId: jishuitan_guke.id, sort: 2 } }),
    prisma.department.create({ data: { name: '矫形骨科', hospitalId: jishuitan.id, parentId: jishuitan_guke.id, sort: 3 } }),
    prisma.department.create({ data: { name: '手外科', hospitalId: jishuitan.id, parentId: jishuitan_guke.id, sort: 4, introduction: '手外科诊疗中心' } }),
    prisma.department.create({ data: { name: '足踝外科', hospitalId: jishuitan.id, parentId: jishuitan_guke.id, sort: 5 } }),
    prisma.department.create({ data: { name: '关节外科', hospitalId: jishuitan.id, parentId: jishuitan_guke.id, sort: 6 } }),
    prisma.department.create({ data: { name: '运动医学科', hospitalId: jishuitan.id, parentId: jishuitan_guke.id, sort: 7, introduction: '国家运动医学中心' } }),
    prisma.department.create({ data: { name: '烧伤科', hospitalId: jishuitan.id, sort: 2, introduction: '全国烧伤诊疗中心' } }),
    prisma.department.create({ data: { name: '内科', hospitalId: jishuitan.id, sort: 3 } }),
    prisma.department.create({ data: { name: '康复科', hospitalId: jishuitan.id, sort: 4 } }),
  ]);

  // 3.8 北京同仁医院
  const tongren = await prisma.hospital.create({
    data: {
      name: '首都医科大学附属北京同仁医院',
      level: '三甲',
      type: '综合',
      address: '北京市东城区东交民巷1号',
      phone: '010-58269911',
      latitude: 39.9072,
      longitude: 116.4090,
      introduction: '北京同仁医院始建于1886年，是一所以眼科、耳鼻咽喉科和心血管疾病诊疗为重点的大型综合性三甲医院。眼科、耳鼻喉科在国内外享有盛誉。',
      trafficGuide: '地铁2号线崇文门站C口出，步行约500米',
      parkingInfo: '医院周边停车位紧张',
    },
  });

  await Promise.all([
    prisma.department.create({ data: { name: '眼科', hospitalId: tongren.id, sort: 1, introduction: '全国眼科诊疗中心，北京眼科研究所所在地' } }),
    prisma.department.create({ data: { name: '耳鼻咽喉头颈外科', hospitalId: tongren.id, sort: 2, introduction: '全国耳鼻咽喉诊疗中心' } }),
    prisma.department.create({ data: { name: '心内科', hospitalId: tongren.id, sort: 3 } }),
    prisma.department.create({ data: { name: '消化内科', hospitalId: tongren.id, sort: 4 } }),
    prisma.department.create({ data: { name: '内分泌科', hospitalId: tongren.id, sort: 5, introduction: '糖尿病诊疗中心' } }),
    prisma.department.create({ data: { name: '普外科', hospitalId: tongren.id, sort: 6 } }),
    prisma.department.create({ data: { name: '骨科', hospitalId: tongren.id, sort: 7 } }),
    prisma.department.create({ data: { name: '妇产科', hospitalId: tongren.id, sort: 8 } }),
  ]);

  // 3.9 北京安贞医院
  const anzhen = await prisma.hospital.create({
    data: {
      name: '首都医科大学附属北京安贞医院',
      level: '三甲',
      type: '综合',
      address: '北京市朝阳区安贞路2号',
      phone: '010-64456611',
      latitude: 39.9716,
      longitude: 116.4052,
      introduction: '北京安贞医院是以治疗心肺血管疾病为重点的三级甲等综合医院，心脏外科、心内科、血管外科在国内处于领先地位。',
      trafficGuide: '地铁10号线安贞门站B口出',
      parkingInfo: '医院设有地下停车场',
    },
  });

  await Promise.all([
    prisma.department.create({ data: { name: '心内科', hospitalId: anzhen.id, sort: 1, introduction: '心血管疾病诊治中心' } }),
    prisma.department.create({ data: { name: '心外科', hospitalId: anzhen.id, sort: 2, introduction: '心脏手术量全国领先' } }),
    prisma.department.create({ data: { name: '血管外科', hospitalId: anzhen.id, sort: 3 } }),
    prisma.department.create({ data: { name: '呼吸内科', hospitalId: anzhen.id, sort: 4 } }),
    prisma.department.create({ data: { name: '胸外科', hospitalId: anzhen.id, sort: 5 } }),
    prisma.department.create({ data: { name: '消化内科', hospitalId: anzhen.id, sort: 6 } }),
    prisma.department.create({ data: { name: '神经内科', hospitalId: anzhen.id, sort: 7 } }),
    prisma.department.create({ data: { name: '妇产科', hospitalId: anzhen.id, sort: 8 } }),
  ]);

  // 3.10 北京宣武医院
  const xuanwu = await prisma.hospital.create({
    data: {
      name: '首都医科大学宣武医院',
      level: '三甲',
      type: '综合',
      address: '北京市西城区长椿街45号',
      phone: '010-83198899',
      latitude: 39.8936,
      longitude: 116.3647,
      introduction: '宣武医院是以神经科学和老年医学为重点的三级甲等综合医院，神经内科、神经外科在国内处于领先地位。',
      trafficGuide: '地铁2号线长椿街站A口出',
      parkingInfo: '医院停车位有限',
    },
  });

  const xuanwu_neike = await prisma.department.create({
    data: { name: '内科', hospitalId: xuanwu.id, sort: 1 },
  });
  const xuanwu_waike = await prisma.department.create({
    data: { name: '外科', hospitalId: xuanwu.id, sort: 2 },
  });

  await Promise.all([
    prisma.department.create({ data: { name: '神经内科', hospitalId: xuanwu.id, parentId: xuanwu_neike.id, sort: 1, introduction: '国家老年疾病临床医学研究中心' } }),
    prisma.department.create({ data: { name: '心内科', hospitalId: xuanwu.id, parentId: xuanwu_neike.id, sort: 2 } }),
    prisma.department.create({ data: { name: '消化内科', hospitalId: xuanwu.id, parentId: xuanwu_neike.id, sort: 3 } }),
    prisma.department.create({ data: { name: '呼吸内科', hospitalId: xuanwu.id, parentId: xuanwu_neike.id, sort: 4 } }),
    prisma.department.create({ data: { name: '神经外科', hospitalId: xuanwu.id, parentId: xuanwu_waike.id, sort: 1, introduction: '功能神经外科中心' } }),
    prisma.department.create({ data: { name: '普外科', hospitalId: xuanwu.id, parentId: xuanwu_waike.id, sort: 2 } }),
    prisma.department.create({ data: { name: '骨科', hospitalId: xuanwu.id, parentId: xuanwu_waike.id, sort: 3 } }),
    prisma.department.create({ data: { name: '康复医学科', hospitalId: xuanwu.id, sort: 3, introduction: '神经康复中心' } }),
    prisma.department.create({ data: { name: '老年医学科', hospitalId: xuanwu.id, sort: 4 } }),
    prisma.department.create({ data: { name: '血管超声诊断科', hospitalId: xuanwu.id, sort: 5 } }),
  ]);

  console.log('✅ 医院和科室创建完成');

  // 4. 创建轮播图
  await Promise.all([
    prisma.banner.create({
      data: {
        title: '科科灵专业陪诊服务',
        image: '/images/banner1.png',
        sort: 1,
      },
    }),
    prisma.banner.create({
      data: {
        title: '新用户首单立减',
        image: '/images/banner2.png',
        sort: 2,
      },
    }),
  ]);
  console.log('✅ 轮播图创建完成');

  // 统计
  const hospitalCount = await prisma.hospital.count();
  const departmentCount = await prisma.department.count();
  
  console.log('\n📊 数据统计:');
  console.log(`   医院: ${hospitalCount} 家`);
  console.log(`   科室: ${departmentCount} 个`);

  console.log('\n🎉 真实数据添加完成！');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
