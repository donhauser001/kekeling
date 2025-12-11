import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始创建业务数据...');

  // 1. 创建服务分类
  console.log('\n📦 创建服务分类...');
  const categories = await Promise.all([
    prisma.serviceCategory.create({
      data: {
        name: '代办服务',
        icon: 'clipboard-list',
        color: 'bg-blue-500',
        description: '代办各类医院手续，省时省心',
        isPinned: true,
        sort: 1,
        status: 'active',
      },
    }),
    prisma.serviceCategory.create({
      data: {
        name: '陪诊服务',
        icon: 'heart-handshake',
        color: 'bg-emerald-500',
        description: '专业陪诊，全程陪护',
        isPinned: true,
        sort: 2,
        status: 'active',
      },
    }),
  ]);
  const [daiBanCategory, peiZhenCategory] = categories;
  console.log(`   分类: ${categories.length} 个`);

  // 2. 创建服务流程
  console.log('\n⚙️ 创建服务流程...');
  const workflows = await Promise.all([
    // 代办服务流程
    prisma.workflow.create({
      data: {
        name: '代办服务流程',
        description: '适用于代办病历、取报告、入出院手续等服务',
        category: '代办',
        status: 'active',
        baseDuration: 60,
        overtimeEnabled: false,
        overtimeUnit: '30分钟',
        overtimeGrace: 15,
        steps: {
          create: [
            { name: '接单确认', description: '陪诊员确认接单，了解服务详情', type: 'start', sort: 0 },
            { name: '前往医院', description: '陪诊员前往指定医院', type: 'action', sort: 1 },
            { name: '办理业务', description: '代办相关手续或业务', type: 'action', sort: 2 },
            { name: '交付材料', description: '将办理好的材料交付给客户（可邮寄）', type: 'action', sort: 3 },
            { name: '服务完成', description: '确认服务完成，客户满意', type: 'end', sort: 4 },
          ],
        },
      },
    }),
    // 门诊陪诊流程
    prisma.workflow.create({
      data: {
        name: '门诊陪诊流程',
        description: '适用于门诊就诊陪护服务',
        category: '陪诊',
        status: 'active',
        baseDuration: 180,
        overtimeEnabled: true,
        overtimePrice: 50,
        overtimeUnit: '30分钟',
        overtimeMax: 240,
        overtimeGrace: 30,
        steps: {
          create: [
            { name: '接单确认', description: '陪诊员确认接单，与客户沟通就诊需求', type: 'start', sort: 0 },
            { name: '医院集合', description: '在医院指定地点与客户集合', type: 'action', sort: 1 },
            { name: '挂号取号', description: '协助挂号、取号', type: 'action', sort: 2 },
            { name: '陪同候诊', description: '陪同客户在诊室外候诊', type: 'action', sort: 3 },
            { name: '陪同就诊', description: '陪同客户进入诊室就诊，记录医嘱', type: 'action', sort: 4 },
            { name: '检查缴费', description: '协助客户完成各项检查和缴费', type: 'action', sort: 5 },
            { name: '取药送别', description: '协助取药，整理就诊资料，送别客户', type: 'action', sort: 6 },
            { name: '服务完成', description: '确认服务完成，发送就诊总结', type: 'end', sort: 7 },
          ],
        },
      },
    }),
    // 手术陪诊流程
    prisma.workflow.create({
      data: {
        name: '手术陪诊流程',
        description: '适用于日间手术或检查陪护服务',
        category: '陪诊',
        status: 'active',
        baseDuration: 240,
        overtimeEnabled: true,
        overtimePrice: 80,
        overtimeUnit: '30分钟',
        overtimeMax: 360,
        overtimeGrace: 30,
        steps: {
          create: [
            { name: '接单确认', description: '陪诊员确认接单，了解手术/检查详情', type: 'start', sort: 0 },
            { name: '术前准备', description: '协助客户完成术前检查和准备', type: 'action', sort: 1 },
            { name: '手术等候', description: '陪同等候，随时与医护沟通', type: 'action', sort: 2 },
            { name: '术后陪护', description: '术后观察，协助恢复', type: 'action', sort: 3 },
            { name: '办理出院', description: '协助办理相关手续', type: 'action', sort: 4 },
            { name: '服务完成', description: '确认服务完成，叮嘱注意事项', type: 'end', sort: 5 },
          ],
        },
      },
    }),
    // 住院陪诊流程
    prisma.workflow.create({
      data: {
        name: '住院陪诊流程',
        description: '适用于住院全程陪护服务',
        category: '陪诊',
        status: 'active',
        baseDuration: 480,
        overtimeEnabled: true,
        overtimePrice: 100,
        overtimeUnit: '小时',
        overtimeMax: 720,
        overtimeGrace: 60,
        steps: {
          create: [
            { name: '接单确认', description: '陪诊员确认接单，了解住院情况', type: 'start', sort: 0 },
            { name: '入院办理', description: '协助办理入院手续', type: 'action', sort: 1 },
            { name: '病房陪护', description: '全程陪护，照顾起居', type: 'action', sort: 2 },
            { name: '医患沟通', description: '协助与医护人员沟通', type: 'action', sort: 3 },
            { name: '检查陪同', description: '陪同完成各项检查', type: 'action', sort: 4 },
            { name: '出院办理', description: '协助办理出院手续', type: 'action', sort: 5 },
            { name: '服务完成', description: '确认服务完成，整理资料', type: 'end', sort: 6 },
          ],
        },
      },
    }),
  ]);
  const [daiBanWorkflow, menZhenWorkflow, shouShuWorkflow, zhuYuanWorkflow] = workflows;
  console.log(`   流程: ${workflows.length} 个`);

  // 3. 创建服务保障
  console.log('\n🛡️ 创建服务保障...');
  const guarantees = await Promise.all([
    prisma.serviceGuarantee.create({
      data: {
        name: '平台担保',
        icon: 'shield',
        description: '平台全程担保，不满意可退款',
        sort: 1,
        status: 'active',
      },
    }),
    prisma.serviceGuarantee.create({
      data: {
        name: '实名认证',
        icon: 'check',
        description: '所有陪诊员均通过实名认证',
        sort: 2,
        status: 'active',
      },
    }),
    prisma.serviceGuarantee.create({
      data: {
        name: '专业培训',
        icon: 'star',
        description: '陪诊员均经过专业培训考核',
        sort: 3,
        status: 'active',
      },
    }),
    prisma.serviceGuarantee.create({
      data: {
        name: '隐私保护',
        icon: 'lock',
        description: '严格保护客户个人信息和隐私',
        sort: 4,
        status: 'active',
      },
    }),
    prisma.serviceGuarantee.create({
      data: {
        name: '准时到达',
        icon: 'clock',
        description: '承诺准时到达服务地点',
        sort: 5,
        status: 'active',
      },
    }),
    prisma.serviceGuarantee.create({
      data: {
        name: '透明定价',
        icon: 'money',
        description: '价格透明，无隐藏收费',
        sort: 6,
        status: 'active',
      },
    }),
  ]);
  console.log(`   保障: ${guarantees.length} 个`);

  // 4. 创建操作规范分类和规范
  console.log('\n📚 创建操作规范...');
  const guideCategories = await Promise.all([
    prisma.operationGuideCategory.create({
      data: {
        name: '服务礼仪',
        description: '陪诊服务中的礼仪规范和沟通技巧',
        icon: 'heart-handshake',
        sort: 1,
        status: 'active',
      },
    }),
    prisma.operationGuideCategory.create({
      data: {
        name: '医院流程',
        description: '各类医院就诊流程的标准操作指南',
        icon: 'building-2',
        sort: 2,
        status: 'active',
      },
    }),
    prisma.operationGuideCategory.create({
      data: {
        name: '检查陪同',
        description: '各类医学检查的陪同操作规范',
        icon: 'stethoscope',
        sort: 3,
        status: 'active',
      },
    }),
  ]);

  // 创建操作规范
  const guides = await Promise.all([
    prisma.operationGuide.create({
      data: {
        categoryId: guideCategories[0].id,
        title: '陪诊员着装规范',
        summary: '专业整洁的着装是建立客户信任的第一步',
        content: `
<h2>着装要求</h2>
<ul>
  <li>穿着公司统一工装或整洁的便装</li>
  <li>保持服装干净整洁，无破损褶皱</li>
  <li>佩戴工作证件</li>
</ul>
<h2>仪容仪表</h2>
<ul>
  <li>头发整洁，女士建议扎起</li>
  <li>保持面部清洁，妆容淡雅</li>
  <li>指甲修剪整齐，不涂深色指甲油</li>
</ul>
        `,
        sort: 1,
        status: 'active',
      },
    }),
    prisma.operationGuide.create({
      data: {
        categoryId: guideCategories[1].id,
        title: '门诊挂号流程',
        summary: '详解医院门诊挂号的各种方式和注意事项',
        content: `
<h2>挂号方式</h2>
<ol>
  <li><strong>线上预约</strong>：通过医院官方App、微信公众号或挂号平台提前预约</li>
  <li><strong>自助机挂号</strong>：在医院自助机上操作挂号</li>
  <li><strong>窗口挂号</strong>：到人工窗口排队挂号</li>
</ol>
<h2>注意事项</h2>
<ul>
  <li>提前了解医院放号时间</li>
  <li>准备好身份证和医保卡</li>
  <li>初诊需建档的提前到达</li>
</ul>
        `,
        sort: 1,
        status: 'active',
      },
    }),
    prisma.operationGuide.create({
      data: {
        categoryId: guideCategories[2].id,
        title: '胃肠镜检查陪同指南',
        summary: '胃肠镜检查前、中、后的陪同要点',
        content: `
<h2>检查前准备</h2>
<ul>
  <li>确认客户已完成肠道准备</li>
  <li>携带检查预约单和相关病历</li>
  <li>准备宽松舒适的衣物</li>
</ul>
<h2>检查中陪同</h2>
<ul>
  <li>协助办理检查登记</li>
  <li>在等候区耐心等待</li>
  <li>保管好客户随身物品</li>
</ul>
<h2>检查后照护</h2>
<ul>
  <li>扶助客户休息</li>
  <li>观察客户状态</li>
  <li>协助取检查报告</li>
</ul>
        `,
        sort: 1,
        status: 'active',
      },
    }),
  ]);
  console.log(`   规范分类: ${guideCategories.length} 个`);
  console.log(`   规范: ${guides.length} 个`);

  // 5. 创建服务项目
  console.log('\n🛒 创建服务项目...');

  // 代办服务
  const daiBanServices = [
    {
      name: '代办病历打印',
      price: 98,
      description: '代为前往医院打印病历复印件，节省您的宝贵时间',
      content: `
<h3>服务内容</h3>
<ul>
  <li>前往指定医院病案室</li>
  <li>协助填写病历复印申请</li>
  <li>完成病历打印及盖章</li>
  <li>材料交付（可邮寄）</li>
</ul>
<h3>所需材料</h3>
<ul>
  <li>患者身份证复印件</li>
  <li>代办人身份证</li>
  <li>患者签字的委托书</li>
</ul>
      `,
    },
    {
      name: '代取报告',
      price: 98,
      description: '代为前往医院领取各类检查检验报告',
      content: `
<h3>服务内容</h3>
<ul>
  <li>前往医院检验科/影像科</li>
  <li>代为领取检查报告</li>
  <li>报告交付（可邮寄）</li>
</ul>
<h3>温馨提示</h3>
<p>请提供检查凭证和取报告所需的相关信息</p>
      `,
    },
    {
      name: '代办入院手续',
      price: 168,
      description: '代为办理医院入院相关手续，让您安心就医',
      content: `
<h3>服务内容</h3>
<ul>
  <li>协助完成入院登记</li>
  <li>办理住院缴费</li>
  <li>领取住院物品</li>
  <li>熟悉病区环境</li>
</ul>
      `,
    },
    {
      name: '代办出院手续',
      price: 168,
      description: '代为办理医院出院相关手续，省时省心',
      content: `
<h3>服务内容</h3>
<ul>
  <li>办理出院结算</li>
  <li>领取出院小结</li>
  <li>办理医保报销材料</li>
  <li>预约复诊（如需）</li>
</ul>
      `,
    },
    {
      name: '代办预约检查单',
      price: 268,
      description: '代为预约医院各类检查项目',
      content: `
<h3>服务内容</h3>
<ul>
  <li>代为预约CT、MRI、超声等检查</li>
  <li>协助选择合适的检查时间</li>
  <li>提供检查前注意事项说明</li>
</ul>
      `,
    },
    {
      name: '代办病理会诊',
      price: 798,
      description: '代为办理病理切片会诊，协助获取专家意见',
      content: `
<h3>服务内容</h3>
<ul>
  <li>协助借取病理切片</li>
  <li>代送至会诊医院</li>
  <li>跟进会诊进度</li>
  <li>领取会诊报告</li>
</ul>
<h3>温馨提示</h3>
<p>病理会诊费用需另行支付给医院</p>
      `,
    },
  ];

  // 陪诊服务
  const peiZhenServices = [
    {
      name: '门诊陪诊',
      price: 498,
      originalPrice: 598,
      description: '专业陪诊员全程陪同门诊就医，让就诊更轻松',
      content: `
<h3>服务内容</h3>
<ul>
  <li>医院接送或集合</li>
  <li>协助挂号、缴费</li>
  <li>陪同候诊、就诊</li>
  <li>陪同检查、取药</li>
  <li>记录医嘱、整理资料</li>
</ul>
<h3>服务时长</h3>
<p>基础服务时长3小时，超时按30分钟50元计费</p>
      `,
      workflowId: menZhenWorkflow.id,
      baseDuration: 180,
    },
    {
      name: '胃肠镜手术陪诊',
      price: 980,
      description: '专业陪同胃肠镜检查，全程照护让您安心',
      content: `
<h3>服务内容</h3>
<ul>
  <li>检查前准备指导</li>
  <li>全程陪同等候</li>
  <li>检查后休息照护</li>
  <li>协助取报告</li>
</ul>
<h3>服务时长</h3>
<p>基础服务时长4小时，超时按30分钟80元计费</p>
      `,
      workflowId: shouShuWorkflow.id,
      baseDuration: 240,
    },
    {
      name: '住院陪诊',
      price: 1980,
      description: '住院全程陪护，专业照护让家人放心',
      content: `
<h3>服务内容</h3>
<ul>
  <li>入院手续办理</li>
  <li>病房全程陪护</li>
  <li>医患沟通协助</li>
  <li>检查陪同</li>
  <li>出院手续办理</li>
</ul>
<h3>服务时长</h3>
<p>基础服务时长8小时（1天），超时按小时100元计费</p>
      `,
      workflowId: zhuYuanWorkflow.id,
      baseDuration: 480,
    },
  ];

  // 创建代办服务
  for (let i = 0; i < daiBanServices.length; i++) {
    const svc = daiBanServices[i];
    const service = await prisma.service.create({
      data: {
        name: svc.name,
        categoryId: daiBanCategory.id,
        description: svc.description,
        content: svc.content,
        price: svc.price,
        unit: '次',
        coverImage: `/images/services/daiban-${i + 1}.jpg`,
        minQuantity: 1,
        maxQuantity: 10,
        needPatient: false,
        needHospital: true,
        needDepartment: false,
        needDoctor: false,
        needAppointment: false,
        sort: i + 1,
        status: 'active',
        workflowId: daiBanWorkflow.id,
        commissionRate: 60,
        commissionNote: '代办服务分成比例',
      },
    });

    // 关联服务保障
    await prisma.serviceGuaranteeOnService.createMany({
      data: guarantees.slice(0, 4).map((g, idx) => ({
        serviceId: service.id,
        guaranteeId: g.id,
        sort: idx,
      })),
    });
  }

  // 创建陪诊服务
  for (let i = 0; i < peiZhenServices.length; i++) {
    const svc = peiZhenServices[i];
    const service = await prisma.service.create({
      data: {
        name: svc.name,
        categoryId: peiZhenCategory.id,
        description: svc.description,
        content: svc.content,
        price: svc.price,
        originalPrice: svc.originalPrice,
        unit: '次',
        coverImage: `/images/services/peizhen-${i + 1}.jpg`,
        minQuantity: 1,
        maxQuantity: 5,
        needPatient: true,
        needHospital: true,
        needDepartment: true,
        needDoctor: false,
        needAppointment: true,
        sort: i + 1,
        status: 'active',
        workflowId: svc.workflowId,
        commissionRate: 70,
        commissionNote: '陪诊服务分成比例',
      },
    });

    // 关联服务保障
    await prisma.serviceGuaranteeOnService.createMany({
      data: guarantees.map((g, idx) => ({
        serviceId: service.id,
        guaranteeId: g.id,
        sort: idx,
      })),
    });

    // 关联操作规范
    await prisma.operationGuideOnService.createMany({
      data: guides.map((g, idx) => ({
        serviceId: service.id,
        guideId: g.id,
        sort: idx,
      })),
    });
  }

  console.log(`   代办服务: ${daiBanServices.length} 个`);
  console.log(`   陪诊服务: ${peiZhenServices.length} 个`);

  console.log('\n🎉 业务数据创建完成！');
  console.log('\n📊 数据统计:');
  console.log(`   服务分类: ${categories.length} 个`);
  console.log(`   服务流程: ${workflows.length} 个`);
  console.log(`   服务保障: ${guarantees.length} 个`);
  console.log(`   操作规范: ${guides.length} 个`);
  console.log(`   服务项目: ${daiBanServices.length + peiZhenServices.length} 个`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
