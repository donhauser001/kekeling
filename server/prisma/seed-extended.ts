import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ========== 用户种子数据 ==========
async function createUsers() {
  console.log('\n👥 正在创建用户数据...');

  const users: { id: string; nickname: string | null; phone: string | null }[] = [];

  // 创建50个测试用户
  for (let i = 1; i <= 50; i++) {
    const phone = `138${String(i).padStart(8, '0')}`;
    const user = await prisma.user.create({
      data: {
        openid: `test_openid_${i}`,
        unionid: `test_unionid_${i}`,
        nickname: `测试用户${i}`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`,
        phone,
      },
    });
    users.push({ id: user.id, nickname: user.nickname, phone: user.phone });

    // 为用户创建积分账户
    await prisma.userPoint.create({
      data: {
        userId: user.id,
        totalPoints: Math.floor(Math.random() * 5000),
        usedPoints: Math.floor(Math.random() * 1000),
        expiredPoints: 0,
        currentPoints: Math.floor(Math.random() * 3000),
      },
    });
  }

  console.log(`   ✅ 创建用户: ${users.length} 个`);
  return users;
}

// ========== 就诊人种子数据 ==========
async function createPatients(users: { id: string; nickname: string | null; phone: string | null }[]) {
  console.log('\n🏥 正在创建就诊人数据...');

  const patients: { id: string; userId: string; name: string; phone: string }[] = [];
  const relations = ['本人', '父亲', '母亲', '配偶', '子女', '其他'];

  for (const user of users) {
    // 每个用户创建1-3个就诊人
    const count = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < count; i++) {
      const isDefault = i === 0;
      const isSelf = i === 0;
      const patient = await prisma.patient.create({
        data: {
          userId: user.id,
          name: isSelf ? (user.nickname || `用户${patients.length + 1}`) : `就诊人${patients.length + 1}`,
          gender: Math.random() > 0.5 ? 'male' : 'female',
          phone: isSelf ? (user.phone || `139${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`) : `139${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
          idCard: `110101${1960 + Math.floor(Math.random() * 50)}${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
          relation: isSelf ? '本人' : relations[Math.floor(Math.random() * relations.length)],
          isDefault,
        },
      });
      patients.push({ id: patient.id, userId: patient.userId, name: patient.name, phone: patient.phone });
    }
  }

  console.log(`   ✅ 创建就诊人: ${patients.length} 个`);
  return patients;
}

// ========== 工作流种子数据 ==========
async function createWorkflows() {
  console.log('\n📋 正在创建工作流数据...');

  // 1. 门诊陪诊流程
  const outpatientWorkflow = await prisma.workflow.create({
    data: {
      name: '门诊陪诊标准流程',
      description: '适用于门诊就医的标准陪诊服务流程',
      category: '陪诊流程',
      status: 'active',
      usageCount: 1256,
      baseDuration: 240, // 4小时
      overtimeEnabled: true,
      overtimePrice: 50,
      overtimeUnit: '小时',
      overtimeMax: 240,
      overtimeGrace: 15,
    },
  });

  await Promise.all([
    prisma.workflowStep.create({ data: { workflowId: outpatientWorkflow.id, name: '接单确认', description: '陪诊员确认接单，联系用户确认服务详情', type: 'start', sort: 1 } }),
    prisma.workflowStep.create({ data: { workflowId: outpatientWorkflow.id, name: '到达医院', description: '提前到达医院，在约定地点等候用户', type: 'action', sort: 2 } }),
    prisma.workflowStep.create({ data: { workflowId: outpatientWorkflow.id, name: '协助挂号', description: '协助用户完成挂号、取号', type: 'action', sort: 3 } }),
    prisma.workflowStep.create({ data: { workflowId: outpatientWorkflow.id, name: '陪同就诊', description: '陪同用户到诊室就诊，协助沟通', type: 'action', sort: 4 } }),
    prisma.workflowStep.create({ data: { workflowId: outpatientWorkflow.id, name: '协助检查', description: '陪同完成各项检查，帮助排队取结果', type: 'action', sort: 5 } }),
    prisma.workflowStep.create({ data: { workflowId: outpatientWorkflow.id, name: '取药送别', description: '协助取药、整理资料，送别用户', type: 'action', sort: 6 } }),
    prisma.workflowStep.create({ data: { workflowId: outpatientWorkflow.id, name: '服务完成', description: '确认服务完成，用户评价', type: 'end', sort: 7 } }),
  ]);

  // 2. 住院陪护流程
  const inpatientWorkflow = await prisma.workflow.create({
    data: {
      name: '住院陪护标准流程',
      description: '适用于住院患者的陪护服务流程',
      category: '陪诊流程',
      status: 'active',
      usageCount: 892,
      baseDuration: 720, // 12小时
      overtimeEnabled: true,
      overtimePrice: 30,
      overtimeUnit: '小时',
      overtimeMax: 720,
      overtimeGrace: 30,
    },
  });

  await Promise.all([
    prisma.workflowStep.create({ data: { workflowId: inpatientWorkflow.id, name: '接单确认', description: '确认服务时间、病房位置', type: 'start', sort: 1 } }),
    prisma.workflowStep.create({ data: { workflowId: inpatientWorkflow.id, name: '到达病房', description: '到达病房，与家属交接', type: 'action', sort: 2 } }),
    prisma.workflowStep.create({ data: { workflowId: inpatientWorkflow.id, name: '日常护理', description: '协助患者日常生活起居', type: 'action', sort: 3 } }),
    prisma.workflowStep.create({ data: { workflowId: inpatientWorkflow.id, name: '陪同检查', description: '陪同患者外出检查', type: 'action', sort: 4 } }),
    prisma.workflowStep.create({ data: { workflowId: inpatientWorkflow.id, name: '送餐协助', description: '协助用餐、送餐', type: 'action', sort: 5 } }),
    prisma.workflowStep.create({ data: { workflowId: inpatientWorkflow.id, name: '交接班', description: '与家属或下班陪护交接', type: 'end', sort: 6 } }),
  ]);

  // 3. 跑腿代办流程
  const errandWorkflow = await prisma.workflow.create({
    data: {
      name: '跑腿代办标准流程',
      description: '适用于药品代购、病历代办等跑腿服务',
      category: '跑腿流程',
      status: 'active',
      usageCount: 567,
      baseDuration: 120, // 2小时
      overtimeEnabled: true,
      overtimePrice: 30,
      overtimeUnit: '小时',
      overtimeMax: 120,
      overtimeGrace: 15,
    },
  });

  await Promise.all([
    prisma.workflowStep.create({ data: { workflowId: errandWorkflow.id, name: '接单确认', description: '确认代办内容、地点', type: 'start', sort: 1 } }),
    prisma.workflowStep.create({ data: { workflowId: errandWorkflow.id, name: '前往医院', description: '出发前往指定医院', type: 'action', sort: 2 } }),
    prisma.workflowStep.create({ data: { workflowId: errandWorkflow.id, name: '办理业务', description: '代为办理指定业务', type: 'action', sort: 3 } }),
    prisma.workflowStep.create({ data: { workflowId: errandWorkflow.id, name: '拍照确认', description: '办理完成后拍照存证', type: 'action', sort: 4 } }),
    prisma.workflowStep.create({ data: { workflowId: errandWorkflow.id, name: '配送/通知', description: '配送上门或通知用户自取', type: 'end', sort: 5 } }),
  ]);

  // 4. 检查陪同流程
  const examWorkflow = await prisma.workflow.create({
    data: {
      name: '检查陪同标准流程',
      description: '适用于各类医学检查的陪同服务',
      category: '陪诊流程',
      status: 'active',
      usageCount: 423,
      baseDuration: 180, // 3小时
      overtimeEnabled: true,
      overtimePrice: 40,
      overtimeUnit: '小时',
      overtimeMax: 180,
      overtimeGrace: 15,
    },
  });

  await Promise.all([
    prisma.workflowStep.create({ data: { workflowId: examWorkflow.id, name: '接单确认', description: '确认检查项目、时间、注意事项', type: 'start', sort: 1 } }),
    prisma.workflowStep.create({ data: { workflowId: examWorkflow.id, name: '到达等候', description: '到达检查科室，协助登记', type: 'action', sort: 2 } }),
    prisma.workflowStep.create({ data: { workflowId: examWorkflow.id, name: '陪同检查', description: '陪同完成检查全程', type: 'action', sort: 3 } }),
    prisma.workflowStep.create({ data: { workflowId: examWorkflow.id, name: '等候结果', description: '代为等候并取回检查结果', type: 'action', sort: 4 } }),
    prisma.workflowStep.create({ data: { workflowId: examWorkflow.id, name: '服务完成', description: '交付结果，服务结束', type: 'end', sort: 5 } }),
  ]);

  console.log(`   ✅ 创建工作流: 4 个`);
  return [outpatientWorkflow, inpatientWorkflow, errandWorkflow, examWorkflow];
}

// ========== 服务保障种子数据 ==========
async function createServiceGuarantees() {
  console.log('\n🛡️ 正在创建服务保障数据...');

  const guarantees = await Promise.all([
    prisma.serviceGuarantee.create({
      data: {
        name: '平台担保',
        icon: 'shield-check',
        description: '订单资金由平台托管，服务完成后才会打款给陪诊员，全程保障您的资金安全',
        sort: 1,
        status: 'active',
      },
    }),
    prisma.serviceGuarantee.create({
      data: {
        name: '隐私保护',
        icon: 'lock',
        description: '严格保护用户个人信息和就诊信息，陪诊员签署保密协议，信息不外泄',
        sort: 2,
        status: 'active',
      },
    }),
    prisma.serviceGuarantee.create({
      data: {
        name: '售后无忧',
        icon: 'headphones',
        description: '7x24小时客服在线，服务问题随时反馈，不满意可申请退款',
        sort: 3,
        status: 'active',
      },
    }),
    prisma.serviceGuarantee.create({
      data: {
        name: '专业培训',
        icon: 'graduation-cap',
        description: '所有陪诊员均经过专业培训并通过考核，持证上岗',
        sort: 4,
        status: 'active',
      },
    }),
    prisma.serviceGuarantee.create({
      data: {
        name: '准时保障',
        icon: 'clock',
        description: '陪诊员迟到超过15分钟，可申请补偿或免服务费',
        sort: 5,
        status: 'active',
      },
    }),
    prisma.serviceGuarantee.create({
      data: {
        name: '保险保障',
        icon: 'umbrella',
        description: '服务期间意外险保障，让您安心就医',
        sort: 6,
        status: 'active',
      },
    }),
  ]);

  // 为所有服务关联保障
  const services = await prisma.service.findMany();
  for (const service of services) {
    for (const guarantee of guarantees) {
      await prisma.serviceGuaranteeOnService.create({
        data: {
          serviceId: service.id,
          guaranteeId: guarantee.id,
          sort: guarantee.sort,
        },
      }).catch(() => { }); // 忽略重复
    }
  }

  console.log(`   ✅ 创建服务保障: ${guarantees.length} 个`);
  return guarantees;
}

// ========== 操作规范种子数据 ==========
async function createOperationGuides() {
  console.log('\n📖 正在创建操作规范数据...');

  const categories = await prisma.operationGuideCategory.findMany();
  const categoryMap: Record<string, string> = {};
  for (const cat of categories) {
    categoryMap[cat.name] = cat.id;
  }

  const guides = [
    // 服务礼仪
    {
      categoryId: categoryMap['服务礼仪'],
      title: '陪诊员着装规范',
      summary: '统一着装要求，展现专业形象',
      content: `# 陪诊员着装规范

## 一、基本要求

1. **服装整洁**：保持衣物干净、平整，无污渍、无破损
2. **工牌佩戴**：服务期间必须佩戴平台统一工牌
3. **舒适得体**：穿着舒适便于行动，同时保持得体

## 二、具体要求

### 上装
- 推荐穿着平台统一polo衫或干净整洁的衬衫
- 颜色以深蓝、白色、灰色为主
- 不得穿着过于花哨或暴露的服装

### 下装
- 推荐穿着深色长裤或及膝半身裙
- 不得穿着短裤、破洞牛仔裤

### 鞋袜
- 穿着舒适的平底鞋或运动鞋
- 不得穿着拖鞋、高跟鞋

## 三、配饰要求

- 不佩戴夸张饰品
- 手表、眼镜保持简洁
- 不使用浓烈香水`,
      tags: ['着装', '形象', '规范'],
      sort: 1,
      status: 'active',
    },
    {
      categoryId: categoryMap['服务礼仪'],
      title: '与患者沟通技巧',
      summary: '专业、温暖、有效的沟通方式',
      content: `# 与患者沟通技巧

## 一、沟通原则

1. **耐心倾听**：让患者充分表达，不打断
2. **温和回应**：语气平和，态度温暖
3. **专业解答**：对于医疗问题引导咨询医生

## 二、场景沟通

### 首次见面
- "您好，我是您今天的陪诊员XXX，请问您是X先生/女士吗？"
- 主动自我介绍，确认身份

### 等候期间
- 关注患者情绪，适时安抚
- "您放心，我会全程陪着您"

### 就诊时
- 协助患者描述症状
- 记录医嘱要点

### 服务结束
- "今天辛苦了，有任何问题可以随时联系我"
- 提醒注意事项

## 三、禁忌事项

- ❌ 不主动询问具体病情
- ❌ 不对病情做出判断或建议
- ❌ 不与患者讨论医生的诊断
- ❌ 不抱怨或传递负面情绪`,
      tags: ['沟通', '技巧', '患者关系'],
      sort: 2,
      status: 'active',
    },
    // 医院流程
    {
      categoryId: categoryMap['医院流程'],
      title: '门诊就诊标准流程',
      summary: '门诊就诊全流程指引',
      content: `# 门诊就诊标准流程

## 一、就诊准备

### 患者需准备
- 身份证（必需）
- 医保卡（如有）
- 既往病历、检查报告
- 就诊卡/医院APP

### 陪诊员准备
- 提前了解医院布局
- 确认科室位置
- 准备零钱（部分医院需要）

## 二、就诊流程

### Step 1: 到达医院
- 提前15-30分钟到达
- 在约定地点接到患者

### Step 2: 挂号取号
- 自助机/窗口挂号
- 获取就诊号和候诊序号

### Step 3: 候诊
- 陪同到指定候诊区
- 关注叫号提醒

### Step 4: 就诊
- 陪同进入诊室
- 协助描述病情
- 记录医嘱

### Step 5: 检查
- 陪同完成各项检查
- 协助预约和缴费

### Step 6: 取药/办理
- 取检查结果
- 缴费取药
- 协助办理住院（如需）

## 三、特殊情况处理

- 急诊：优先挂急诊号，快速分诊
- 号源紧张：可协助预约改期
- 需住院：协助办理入院手续`,
      tags: ['门诊', '流程', '就诊'],
      sort: 1,
      status: 'active',
    },
    {
      categoryId: categoryMap['医院流程'],
      title: '住院办理流程指南',
      summary: '住院登记、入院、出院全流程',
      content: `# 住院办理流程指南

## 一、住院登记

### 所需材料
- 住院证/住院通知单
- 身份证原件
- 医保卡
- 押金（现金/银行卡）

### 办理地点
- 住院处/入院服务中心

## 二、入院流程

1. **办理入院手续**
   - 缴纳住院押金
   - 领取住院病历

2. **前往病房**
   - 按指引前往科室
   - 护士站报到

3. **入院评估**
   - 护士进行入院评估
   - 医生问诊查体

## 三、住院期间

- 每日医生查房
- 按时服药/输液
- 配合各项检查

## 四、出院流程

1. **医生开具出院小结**
2. **护士站确认费用**
3. **住院处结算**
4. **领取出院带药**
5. **预约复诊**`,
      tags: ['住院', '入院', '出院'],
      sort: 2,
      status: 'active',
    },
    // 检查陪同
    {
      categoryId: categoryMap['检查陪同'],
      title: 'CT/MRI检查陪同指南',
      summary: 'CT和MRI检查注意事项与陪同要点',
      content: `# CT/MRI检查陪同指南

## 一、检查前准备

### CT检查
- 普通CT：无特殊准备
- 增强CT：需空腹4-6小时，带造影剂同意书

### MRI检查
- 去除所有金属物品
- 更换检查服
- 确认无金属植入物

## 二、检查流程

1. **到达检查科室**
   - 预约号报到
   - 确认检查项目

2. **等候准备**
   - 协助更衣
   - 妥善保管物品

3. **检查中**
   - 在等候区等待
   - 关注患者状态

4. **检查后**
   - 协助穿衣
   - 确认取报告时间

## 三、特殊情况

- **幽闭恐惧症**：提前告知医生，必要时用药
- **体内有金属**：详细告知医生，评估风险
- **过敏体质**：增强检查前详细告知

## 四、取报告

- 通常2-24小时出结果
- 可现场等待或预约时间取`,
      tags: ['CT', 'MRI', '影像检查'],
      sort: 1,
      status: 'active',
    },
    {
      categoryId: categoryMap['检查陪同'],
      title: '胃肠镜检查陪同指南',
      summary: '胃镜、肠镜检查的全程陪同要点',
      content: `# 胃肠镜检查陪同指南

## 一、检查前准备

### 胃镜
- 检查前禁食8小时以上
- 检查前2小时禁水
- 带既往胃镜报告

### 肠镜
- 提前3天低渣饮食
- 检查前一天服用泻药清肠
- 检查当天禁食

## 二、检查当天

### 到达流程
1. 提前30分钟到达
2. 护士站签到
3. 确认肠道准备情况（肠镜）

### 检查前
- 协助更换检查服
- 静脉注射（无痛检查）
- 协助进入检查室

### 检查中
- 在等候区等待
- 准备好纸巾、水杯

### 检查后
- 陪同到恢复区
- 观察至少30分钟
- 确认可以进食

## 三、注意事项

- 无痛检查后24小时内不得驾驶
- 检查后可能腹胀，属正常现象
- 如有不适及时反馈医护

## 四、取报告

- 普通检查即时出结果
- 病理活检3-5个工作日`,
      tags: ['胃镜', '肠镜', '消化内镜'],
      sort: 2,
      status: 'active',
    },
    // 患者护理
    {
      categoryId: categoryMap['患者护理'],
      title: '老年患者护理要点',
      summary: '老年患者的特殊护理需求与注意事项',
      content: `# 老年患者护理要点

## 一、行动辅助

### 步行陪同
- 慢步行走，适应患者节奏
- 必要时搀扶或使用轮椅
- 注意地面湿滑、台阶

### 轮椅使用
- 推行前检查刹车
- 上下坡控制速度
- 过门槛前后轮分别过

## 二、沟通注意

- 说话清晰、音量适中
- 重要信息重复确认
- 耐心等待回应

## 三、就诊协助

- 协助描述症状
- 记录医嘱和用药
- 提醒复诊时间

## 四、特殊关注

### 慢性病患者
- 了解常用药物
- 注意低血糖症状
- 关注血压变化

### 行动不便
- 预约绿色通道
- 提前准备轮椅
- 规划无障碍路线

## 五、紧急情况

- 胸闷、气促：立即就近就医
- 跌倒：不急于扶起，先评估
- 意识模糊：立即呼救`,
      tags: ['老年护理', '行动辅助', '慢病管理'],
      sort: 1,
      status: 'active',
    },
    {
      categoryId: categoryMap['患者护理'],
      title: '儿童患者陪诊指南',
      summary: '儿童就医的特殊注意事项',
      content: `# 儿童患者陪诊指南

## 一、沟通技巧

### 与孩子沟通
- 蹲下与孩子平视
- 用简单易懂的语言
- 适当使用玩具分散注意力

### 与家长沟通
- 详细了解病情和就诊目的
- 确认过敏史、用药史
- 及时反馈就诊进展

## 二、就诊准备

### 携带物品
- 儿童医保卡
- 疫苗本（如需）
- 既往病历
- 玩具、零食

### 注意事项
- 穿易穿脱的衣物
- 准备备换衣物
- 带好纸巾、湿巾

## 三、检查配合

### 抽血
- 安抚情绪
- 转移注意力
- 配合医护按压

### 其他检查
- 提前解释过程
- 鼓励勇敢配合
- 及时表扬

## 四、特殊处理

- **发热**：体温超过38.5°C可先服用退烧药
- **哭闹**：耐心安抚，不强迫
- **呕吐腹泻**：注意补液防脱水`,
      tags: ['儿童', '小儿科', '儿童护理'],
      sort: 2,
      status: 'active',
    },
    // 应急处理
    {
      categoryId: categoryMap['应急处理'],
      title: '突发情况应急处理',
      summary: '服务过程中突发情况的处理流程',
      content: `# 突发情况应急处理

## 一、医疗紧急情况

### 患者晕倒
1. 保持冷静，呼叫周围人帮助
2. 让患者平躺，抬高下肢
3. 检查呼吸和意识
4. 立即呼叫医护人员
5. 必要时拨打120

### 胸痛/呼吸困难
1. 立即停止行动，就地休息
2. 呼叫最近的医护人员
3. 如在医院外，拨打120
4. 保持患者气道通畅

### 低血糖
1. 症状：头晕、出冷汗、心慌
2. 立即补充糖分（糖果、果汁）
3. 休息观察
4. 如未好转，就医

## 二、服务冲突

### 患者/家属不满
1. 保持冷静，不与争执
2. 耐心倾听诉求
3. 如无法解决，联系平台客服
4. 做好记录

### 服务中断
1. 如需临时离开，告知患者
2. 确保患者安全
3. 尽快返回或安排替换

## 三、其他紧急情况

### 物品丢失
1. 协助寻找
2. 如证件丢失，协助挂失补办
3. 联系平台客服报备

### 天气突变
1. 协助患者避雨/避暑
2. 调整出行计划
3. 及时与平台沟通`,
      tags: ['应急', '紧急情况', '突发处理'],
      sort: 1,
      status: 'active',
    },
    // 售后服务
    {
      categoryId: categoryMap['售后服务'],
      title: '服务结束后跟进规范',
      summary: '服务完成后的回访与跟进流程',
      content: `# 服务结束后跟进规范

## 一、服务结束当时

### 确认清单
- ✅ 药品已取齐
- ✅ 检查报告已取
- ✅ 复诊时间已记录
- ✅ 注意事项已告知

### 告别语
- "今天辛苦您了，回去好好休息"
- "有任何问题随时联系我"
- "祝您早日康复"

## 二、服务后2小时

### 发送服务报告
- 就诊过程记录
- 医嘱要点整理
- 后续注意事项

### 提醒
- 用药时间提醒
- 注意事项再确认

## 三、复诊前提醒

### 提前1-2天
- 短信/消息提醒复诊时间
- 确认是否需要再次陪诊服务

## 四、投诉处理

### 接到投诉
1. 第一时间致歉
2. 了解具体情况
3. 记录反馈内容
4. 上报平台处理

### 处理原则
- 优先解决用户问题
- 不推诿、不争辩
- 及时反馈处理结果`,
      tags: ['售后', '跟进', '回访'],
      sort: 1,
      status: 'active',
    },
  ];

  for (const guide of guides) {
    if (guide.categoryId) {
      await prisma.operationGuide.create({
        data: guide,
      });
    }
  }

  console.log(`   ✅ 创建操作规范: ${guides.length} 个`);
}

// ========== 订单种子数据 ==========
async function createOrders(users: { id: string; nickname: string | null; phone: string | null }[], patients: { id: string; userId: string; name: string; phone: string }[]) {
  console.log('\n📦 正在创建订单数据...');

  const services = await prisma.service.findMany({ where: { status: 'active' } });
  const hospitals = await prisma.hospital.findMany();
  const escorts = await prisma.escort.findMany({ where: { status: 'active' } });

  if (services.length === 0 || hospitals.length === 0 || escorts.length === 0 || users.length === 0) {
    console.log('   ⚠️ 缺少前置数据，跳过订单创建');
    return [];
  }

  const orders: { id: string; status: string }[] = [];
  const statuses = ['pending', 'paid', 'confirmed', 'assigned', 'arrived', 'in_progress', 'completed', 'cancelled'];

  // 创建100个测试订单
  for (let i = 1; i <= 100; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const userPatients = patients.filter(p => p.userId === user.id);
    if (userPatients.length === 0) continue;

    const patient = userPatients[Math.floor(Math.random() * userPatients.length)];
    const service = services[Math.floor(Math.random() * services.length)];
    const hospital = hospitals[Math.floor(Math.random() * hospitals.length)];
    const escort = escorts[Math.floor(Math.random() * escorts.length)];

    // 随机状态，完成和取消的较多
    let status: string;
    const rand = Math.random();
    if (rand < 0.5) status = 'completed';
    else if (rand < 0.65) status = 'cancelled';
    else if (rand < 0.75) status = 'in_progress';
    else if (rand < 0.85) status = 'assigned';
    else status = statuses[Math.floor(Math.random() * statuses.length)];

    // 随机日期（过去30天到未来7天）
    const appointmentDate = new Date();
    appointmentDate.setDate(appointmentDate.getDate() + Math.floor(Math.random() * 37) - 30);

    const totalAmount = Number(service.price) + Math.floor(Math.random() * 100);
    const discountAmount = Math.floor(Math.random() * 50);
    const paidAmount = status === 'pending' ? 0 : totalAmount - discountAmount;

    const commissionRate = 70;
    const commissionAmount = paidAmount * commissionRate / 100;
    const platformAmount = paidAmount - commissionAmount;

    try {
      const order = await prisma.order.create({
        data: {
          orderNo: `ORD${Date.now()}${String(i).padStart(4, '0')}`,
          userId: user.id,
          patientId: patient.id,
          serviceId: service.id,
          hospitalId: hospital.id,
          escortId: ['assigned', 'arrived', 'in_progress', 'completed'].includes(status) ? escort.id : null,
          appointmentDate,
          appointmentTime: ['08:00', '09:00', '10:00', '14:00', '15:00'][Math.floor(Math.random() * 5)],
          departmentName: '内科',
          totalAmount,
          discountAmount,
          paidAmount,
          commissionRate,
          commissionAmount,
          platformAmount,
          status,
        },
      });
      orders.push({ id: order.id, status: order.status });

      // 为已完成的订单创建评价
      if (status === 'completed' && Math.random() > 0.3) {
        await prisma.escortReview.create({
          data: {
            escortId: escort.id,
            orderId: order.id,
            userId: user.id,
            rating: Math.floor(Math.random() * 2) + 4, // 4-5分
            content: ['服务很专业，非常满意', '陪诊员态度很好', '很耐心，感谢', '推荐给大家', null][Math.floor(Math.random() * 5)],
            tags: ['态度好', '准时', '专业'].filter(() => Math.random() > 0.5),
            isAnonymous: Math.random() > 0.7,
          },
        }).catch(() => { }); // 忽略重复
      }
    } catch (e) {
      // 忽略错误，继续
    }
  }

  console.log(`   ✅ 创建订单: ${orders.length} 个`);
  return orders;
}

// ========== 主函数 ==========
async function main() {
  console.log('🌱 开始导入扩展种子数据...\n');

  // 检查是否已有用户数据
  const existingUsers = await prisma.user.count();
  if (existingUsers > 0) {
    console.log(`⚠️  已存在 ${existingUsers} 个用户，跳过用户数据创建`);
    console.log('   如需重新创建，请先清空用户表\n');
  }

  // 1. 创建用户（如果没有）
  let users: { id: string; nickname: string | null; phone: string | null }[] = [];
  let patients: { id: string; userId: string; name: string; phone: string }[] = [];
  if (existingUsers === 0) {
    users = await createUsers();
    patients = await createPatients(users);
  } else {
    const dbUsers = await prisma.user.findMany({ take: 50 });
    users = dbUsers.map(u => ({ id: u.id, nickname: u.nickname, phone: u.phone }));
    const dbPatients = await prisma.patient.findMany();
    patients = dbPatients.map(p => ({ id: p.id, userId: p.userId, name: p.name, phone: p.phone }));
  }

  // 2. 创建工作流
  const existingWorkflows = await prisma.workflow.count();
  if (existingWorkflows === 0) {
    await createWorkflows();
  } else {
    console.log(`\n⚠️  已存在 ${existingWorkflows} 个工作流，跳过创建`);
  }

  // 3. 创建服务保障
  const existingGuarantees = await prisma.serviceGuarantee.count();
  if (existingGuarantees === 0) {
    await createServiceGuarantees();
  } else {
    console.log(`\n⚠️  已存在 ${existingGuarantees} 个服务保障，跳过创建`);
  }

  // 4. 创建操作规范
  const existingGuides = await prisma.operationGuide.count();
  if (existingGuides === 0) {
    await createOperationGuides();
  } else {
    console.log(`\n⚠️  已存在 ${existingGuides} 个操作规范，跳过创建`);
  }

  // 5. 创建订单
  const existingOrders = await prisma.order.count();
  if (existingOrders === 0) {
    await createOrders(users, patients);
  } else {
    console.log(`\n⚠️  已存在 ${existingOrders} 个订单，跳过创建`);
  }

  // 统计
  console.log('\n📊 扩展数据统计:');
  console.log(`   用户: ${await prisma.user.count()} 个`);
  console.log(`   就诊人: ${await prisma.patient.count()} 个`);
  console.log(`   工作流: ${await prisma.workflow.count()} 个`);
  console.log(`   服务保障: ${await prisma.serviceGuarantee.count()} 个`);
  console.log(`   操作规范: ${await prisma.operationGuide.count()} 个`);
  console.log(`   订单: ${await prisma.order.count()} 个`);

  console.log('\n🎉 扩展种子数据导入完成！');
}

main()
  .catch((e) => {
    console.error('❌ 种子数据导入失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
