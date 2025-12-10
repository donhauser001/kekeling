import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 科室库数据 (科室类目字典)
async function createDepartmentTemplates() {
  const templates: Array<{
    name: string;
    category: string;
    description: string;
    diseases?: string[];
    color: string;
    children?: Array<{
      name: string;
      description: string;
      diseases?: string[];
      color: string;
    }>;
  }> = [
      {
        name: '内科',
        category: '内科',
        description: '诊治内脏疾病',
        color: 'bg-blue-500',
        children: [
          { name: '心内科', description: '心血管系统疾病诊治', diseases: ['冠心病', '心律失常', '高血压', '心肌病', '心力衰竭'], color: 'bg-red-500' },
          { name: '神经内科', description: '神经系统疾病诊治', diseases: ['脑血管病', '帕金森病', '癫痫', '头痛', '眩晕'], color: 'bg-purple-500' },
          { name: '消化内科', description: '消化系统疾病诊治', diseases: ['胃炎', '肝病', '消化性溃疡', '消化道出血', '胃肠道肿瘤'], color: 'bg-amber-500' },
          { name: '呼吸内科', description: '呼吸系统疾病诊治', diseases: ['肺炎', '哮喘', '慢阻肺', '肺癌', '支气管炎'], color: 'bg-cyan-500' },
          { name: '内分泌科', description: '内分泌及代谢疾病诊治', diseases: ['糖尿病', '甲状腺疾病', '骨质疏松', '高脂血症', '肥胖症'], color: 'bg-teal-500' },
          { name: '肾内科', description: '肾脏疾病诊治', diseases: ['肾炎', '肾衰竭', '尿毒症', '肾结石', '肾病综合征'], color: 'bg-indigo-500' },
          { name: '血液内科', description: '血液系统疾病诊治', diseases: ['贫血', '白血病', '淋巴瘤', '血小板疾病', '骨髓瘤'], color: 'bg-rose-500' },
          { name: '风湿免疫科', description: '风湿免疫系统疾病诊治', diseases: ['类风湿关节炎', '红斑狼疮', '痛风', '强直性脊柱炎', '干燥综合征'], color: 'bg-violet-500' },
          { name: '感染科', description: '感染性疾病诊治', diseases: ['肝炎', '艾滋病', '结核病', '流感', '发热待查'], color: 'bg-orange-500' },
          { name: '老年病科', description: '老年综合疾病诊治', diseases: ['老年痴呆', '老年综合征', '跌倒预防', '衰弱综合征'], color: 'bg-gray-500' },
        ],
      },
      {
        name: '外科',
        category: '外科',
        description: '手术治疗为主',
        color: 'bg-red-500',
        children: [
          { name: '普外科', description: '腹部外科疾病诊治', diseases: ['阑尾炎', '胆囊炎', '疝气', '甲状腺结节', '乳腺疾病'], color: 'bg-red-500' },
          { name: '骨科', description: '骨骼和关节疾病诊治', diseases: ['骨折', '关节炎', '颈椎病', '腰椎间盘突出', '运动损伤'], color: 'bg-orange-500' },
          { name: '神经外科', description: '神经系统外科疾病诊治', diseases: ['脑肿瘤', '脑出血', '脑外伤', '脊髓疾病', '神经血管病'], color: 'bg-purple-500' },
          { name: '心胸外科', description: '心脏和胸腔疾病诊治', diseases: ['冠心病手术', '心脏瓣膜病', '肺癌', '食管癌', '先心病'], color: 'bg-rose-500' },
          { name: '泌尿外科', description: '泌尿系统疾病诊治', diseases: ['肾结石', '前列腺疾病', '泌尿系肿瘤', '尿路感染', '膀胱疾病'], color: 'bg-blue-500' },
          { name: '肝胆外科', description: '肝胆胰疾病诊治', diseases: ['肝癌', '胆结石', '胰腺炎', '肝硬化', '胆管癌'], color: 'bg-amber-500' },
          { name: '胃肠外科', description: '胃肠道外科疾病诊治', diseases: ['胃癌', '结直肠癌', '肠梗阻', '胃穿孔', '肠息肉'], color: 'bg-green-500' },
          { name: '血管外科', description: '血管疾病诊治', diseases: ['下肢静脉曲张', '动脉硬化', '血栓', '动脉瘤', '血管畸形'], color: 'bg-cyan-500' },
          { name: '整形外科', description: '整形美容手术', diseases: ['烧伤整形', '瘢痕修复', '先天畸形', '皮肤肿瘤'], color: 'bg-pink-500' },
          { name: '烧伤科', description: '烧伤及创面修复', diseases: ['烧伤', '烫伤', '电击伤', '化学烧伤', '冻伤'], color: 'bg-orange-600' },
        ],
      },
      {
        name: '妇儿',
        category: '妇儿',
        description: '妇女儿童疾病',
        color: 'bg-pink-500',
        children: [
          { name: '妇科', description: '妇科疾病诊治', diseases: ['妇科炎症', '子宫肌瘤', '卵巢囊肿', '宫颈疾病', '月经失调'], color: 'bg-pink-500' },
          { name: '产科', description: '孕产期保健及分娩', diseases: ['产前检查', '高危妊娠', '分娩', '产后护理', '妊娠并发症'], color: 'bg-rose-500' },
          { name: '儿科', description: '儿童疾病诊治', diseases: ['发热', '肺炎', '腹泻', '儿童保健', '生长发育'], color: 'bg-sky-500' },
          { name: '新生儿科', description: '新生儿疾病诊治', diseases: ['新生儿黄疸', '早产儿', '新生儿肺炎', '新生儿窒息'], color: 'bg-blue-400' },
          { name: '小儿外科', description: '小儿外科疾病诊治', diseases: ['小儿疝气', '先天畸形', '小儿肿瘤', '小儿骨科'], color: 'bg-cyan-500' },
          { name: '生殖医学科', description: '不孕不育诊治', diseases: ['不孕症', '试管婴儿', '人工授精', '复发性流产'], color: 'bg-purple-500' },
        ],
      },
      {
        name: '五官',
        category: '五官',
        description: '五官疾病诊治',
        color: 'bg-purple-500',
        children: [
          { name: '眼科', description: '眼部疾病诊治', diseases: ['白内障', '青光眼', '近视', '眼底病', '斜视弱视'], color: 'bg-emerald-500' },
          { name: '耳鼻喉科', description: '耳鼻喉疾病诊治', diseases: ['鼻炎', '中耳炎', '咽喉炎', '听力障碍', '鼻窦炎'], color: 'bg-teal-500' },
          { name: '口腔科', description: '口腔疾病诊治', diseases: ['龋齿', '牙周病', '口腔黏膜病', '正畸', '种植牙'], color: 'bg-amber-500' },
          { name: '口腔颌面外科', description: '口腔颌面外科疾病', diseases: ['颌面肿瘤', '颌面畸形', '颌骨骨折', '唇腭裂'], color: 'bg-orange-500' },
        ],
      },
      {
        name: '皮肤性病',
        category: '其他',
        description: '皮肤疾病诊治',
        color: 'bg-yellow-500',
        children: [
          { name: '皮肤科', description: '皮肤疾病诊治', diseases: ['湿疹', '荨麻疹', '痤疮', '银屑病', '皮肤过敏'], color: 'bg-yellow-500' },
          { name: '性病科', description: '性传播疾病诊治', diseases: ['梅毒', '淋病', '尖锐湿疣', '生殖器疱疹'], color: 'bg-red-400' },
        ],
      },
      {
        name: '医技',
        category: '医技',
        description: '医疗技术科室',
        color: 'bg-green-500',
        children: [
          { name: '放射科', description: '影像检查诊断', diseases: ['CT检查', 'MRI检查', 'X光检查', '造影检查'], color: 'bg-indigo-500' },
          { name: '超声科', description: '超声影像检查', diseases: ['腹部超声', '心脏超声', '妇科超声', '血管超声'], color: 'bg-blue-500' },
          { name: '检验科', description: '临床检验', diseases: ['血液检查', '生化检查', '免疫检查', '微生物检查'], color: 'bg-violet-500' },
          { name: '病理科', description: '病理诊断', diseases: ['活检', '细胞学检查', '免疫组化', '分子病理'], color: 'bg-purple-500' },
          { name: '核医学科', description: '核医学检查治疗', diseases: ['PET-CT', '甲状腺扫描', '骨扫描', '核素治疗'], color: 'bg-cyan-500' },
        ],
      },
      {
        name: '中医',
        category: '其他',
        description: '中医诊疗',
        color: 'bg-emerald-500',
        children: [
          { name: '中医内科', description: '中医内科诊治', diseases: ['脾胃病', '心脑血管', '呼吸系统', '亚健康调理'], color: 'bg-emerald-500' },
          { name: '中医外科', description: '中医外科诊治', diseases: ['疮疡', '痔疮', '乳腺疾病', '周围血管病'], color: 'bg-teal-500' },
          { name: '针灸科', description: '针灸治疗', diseases: ['颈椎病', '腰腿痛', '面瘫', '失眠', '中风后遗症'], color: 'bg-green-500' },
          { name: '推拿科', description: '推拿按摩治疗', diseases: ['颈椎病', '腰椎病', '肩周炎', '运动损伤'], color: 'bg-lime-500' },
          { name: '中医骨伤科', description: '中医骨伤诊治', diseases: ['骨折', '脱位', '筋伤', '骨病'], color: 'bg-amber-500' },
        ],
      },
      {
        name: '其他',
        category: '其他',
        description: '其他专科',
        color: 'bg-gray-500',
        children: [
          { name: '急诊科', description: '急危重症救治', diseases: ['心脏骤停', '严重创伤', '中毒', '急性疼痛', '高热'], color: 'bg-red-600' },
          { name: '重症医学科', description: 'ICU危重症救治', diseases: ['呼吸衰竭', '多器官功能衰竭', '感染性休克', '重症监护'], color: 'bg-red-500' },
          { name: '康复医学科', description: '康复治疗', diseases: ['脑卒中康复', '骨折康复', '脊髓损伤', '神经康复'], color: 'bg-green-500' },
          { name: '疼痛科', description: '疼痛诊治', diseases: ['颈肩腰腿痛', '神经痛', '癌痛', '头痛'], color: 'bg-orange-500' },
          { name: '精神科', description: '精神心理疾病诊治', diseases: ['抑郁症', '焦虑症', '精神分裂症', '失眠', '心理咨询'], color: 'bg-purple-500' },
          { name: '全科医学科', description: '综合诊疗', diseases: ['健康体检', '慢病管理', '家庭医学', '健康咨询'], color: 'bg-blue-500' },
          { name: '营养科', description: '营养评估与指导', diseases: ['营养不良', '肥胖', '糖尿病饮食', '肾病饮食'], color: 'bg-lime-500' },
          { name: '体检中心', description: '健康体检', diseases: ['年度体检', '入职体检', '专项筛查', 'VIP体检'], color: 'bg-sky-500' },
        ],
      },
    ];

  const createdTemplates: Record<string, string> = {};
  let totalCount = 0;
  let parentCount = 0;
  let childCount = 0;

  for (const template of templates) {
    // 创建一级科室
    const parent = await prisma.departmentTemplate.create({
      data: {
        name: template.name,
        category: template.category,
        description: template.description,
        diseases: template.diseases ? JSON.stringify(template.diseases) : null,
        color: template.color,
        sort: templates.indexOf(template),
      },
    });
    createdTemplates[template.name] = parent.id;
    parentCount++;
    totalCount++;

    // 创建二级科室
    if (template.children) {
      for (const child of template.children) {
        await prisma.departmentTemplate.create({
          data: {
            name: child.name,
            category: template.category,
            parentId: parent.id,
            description: child.description,
            diseases: child.diseases ? JSON.stringify(child.diseases) : null,
            color: child.color,
            sort: template.children.indexOf(child),
          },
        });
        childCount++;
        totalCount++;
      }
    }
  }

  console.log(`   科室库: ${totalCount} 个 (一级: ${parentCount}, 二级: ${childCount})`);
  return createdTemplates;
}

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
  await prisma.departmentTemplate.deleteMany();
  console.log('✅ 清理旧数据完成');

  // 0. 创建科室库 (科室类目字典)
  const deptTemplates = await createDepartmentTemplates();
  console.log('✅ 科室库创建完成');

  // 1. 创建服务分类 (在后面统一创建，这里跳过)
  // 服务分类和服务在医院数据后创建

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

  // 协和医院 - 内科系统
  const xiehe_neike = await prisma.department.create({
    data: { name: '内科', hospitalId: xiehe.id, sort: 1 },
  });
  await Promise.all([
    prisma.department.create({ data: { name: '心内科', hospitalId: xiehe.id, parentId: xiehe_neike.id, sort: 1, introduction: '心血管疾病诊治中心，冠心病、心律失常、心力衰竭诊治国内领先', location: '门诊楼3层' } }),
    prisma.department.create({ data: { name: '消化内科', hospitalId: xiehe.id, parentId: xiehe_neike.id, sort: 2, introduction: '消化系统疾病诊疗，胃肠镜检查诊断中心', location: '门诊楼3层' } }),
    prisma.department.create({ data: { name: '呼吸与危重症医学科', hospitalId: xiehe.id, parentId: xiehe_neike.id, sort: 3, introduction: '呼吸系统疾病诊治，RICU重症监护', location: '门诊楼4层' } }),
    prisma.department.create({ data: { name: '内分泌科', hospitalId: xiehe.id, parentId: xiehe_neike.id, sort: 4, introduction: '糖尿病、甲状腺疾病、垂体疾病诊治中心', location: '门诊楼4层' } }),
    prisma.department.create({ data: { name: '肾内科', hospitalId: xiehe.id, parentId: xiehe_neike.id, sort: 5, introduction: '肾脏疾病诊治，血液透析中心', location: '门诊楼5层' } }),
    prisma.department.create({ data: { name: '风湿免疫科', hospitalId: xiehe.id, parentId: xiehe_neike.id, sort: 6, introduction: '国内顶尖的风湿免疫疾病诊治中心，系统性红斑狼疮等自身免疫病诊治权威', location: '门诊楼5层' } }),
    prisma.department.create({ data: { name: '血液内科', hospitalId: xiehe.id, parentId: xiehe_neike.id, sort: 7, introduction: '血液系统疾病诊治，骨髓移植中心', location: '门诊楼6层' } }),
    prisma.department.create({ data: { name: '神经内科', hospitalId: xiehe.id, parentId: xiehe_neike.id, sort: 8, introduction: '神经系统疾病诊治，脑血管病、帕金森病、癫痫诊治', location: '门诊楼6层' } }),
    prisma.department.create({ data: { name: '感染内科', hospitalId: xiehe.id, parentId: xiehe_neike.id, sort: 9, introduction: '感染性疾病诊治，发热待查门诊', location: '门诊楼2层' } }),
    prisma.department.create({ data: { name: '老年医学科', hospitalId: xiehe.id, parentId: xiehe_neike.id, sort: 10, introduction: '老年综合评估，多病共存老年患者诊治', location: '门诊楼7层' } }),
  ]);

  // 协和医院 - 外科系统
  const xiehe_waike = await prisma.department.create({
    data: { name: '外科', hospitalId: xiehe.id, sort: 2 },
  });
  await Promise.all([
    prisma.department.create({ data: { name: '基本外科', hospitalId: xiehe.id, parentId: xiehe_waike.id, sort: 1, introduction: '胃肠外科、肝胆外科、胰腺外科、甲状腺乳腺外科', location: '门诊楼2层' } }),
    prisma.department.create({ data: { name: '骨科', hospitalId: xiehe.id, parentId: xiehe_waike.id, sort: 2, introduction: '脊柱外科、关节外科、创伤骨科', location: '门诊楼2层' } }),
    prisma.department.create({ data: { name: '泌尿外科', hospitalId: xiehe.id, parentId: xiehe_waike.id, sort: 3, introduction: '泌尿系统肿瘤、结石、前列腺疾病诊治', location: '门诊楼2层' } }),
    prisma.department.create({ data: { name: '心脏外科', hospitalId: xiehe.id, parentId: xiehe_waike.id, sort: 4, introduction: '心脏瓣膜病、冠心病、先心病外科治疗', location: '住院楼8层' } }),
    prisma.department.create({ data: { name: '胸外科', hospitalId: xiehe.id, parentId: xiehe_waike.id, sort: 5, introduction: '肺癌、食管癌、纵膈肿瘤诊治', location: '住院楼9层' } }),
    prisma.department.create({ data: { name: '神经外科', hospitalId: xiehe.id, parentId: xiehe_waike.id, sort: 6, introduction: '脑肿瘤、脑血管病、功能神经外科', location: '住院楼10层' } }),
    prisma.department.create({ data: { name: '血管外科', hospitalId: xiehe.id, parentId: xiehe_waike.id, sort: 7, introduction: '主动脉瘤、动脉硬化闭塞症、静脉曲张诊治', location: '门诊楼2层' } }),
    prisma.department.create({ data: { name: '整形美容外科', hospitalId: xiehe.id, parentId: xiehe_waike.id, sort: 8, introduction: '整形修复、美容外科', location: '门诊楼1层' } }),
  ]);

  // 协和医院 - 妇产科
  const xiehe_fuke = await prisma.department.create({
    data: { name: '妇产科', hospitalId: xiehe.id, sort: 3 },
  });
  await Promise.all([
    prisma.department.create({ data: { name: '妇科', hospitalId: xiehe.id, parentId: xiehe_fuke.id, sort: 1, introduction: '妇科肿瘤、子宫肌瘤、子宫内膜异位症诊治', location: '门诊楼4层' } }),
    prisma.department.create({ data: { name: '产科', hospitalId: xiehe.id, parentId: xiehe_fuke.id, sort: 2, introduction: '高危妊娠、产前诊断', location: '门诊楼4层' } }),
    prisma.department.create({ data: { name: '计划生育科', hospitalId: xiehe.id, parentId: xiehe_fuke.id, sort: 3, location: '门诊楼4层' } }),
  ]);

  // 协和医院 - 其他科室
  await Promise.all([
    prisma.department.create({ data: { name: '儿科', hospitalId: xiehe.id, sort: 4, introduction: '儿童常见病、疑难病诊治', location: '门诊楼1层' } }),
    prisma.department.create({ data: { name: '眼科', hospitalId: xiehe.id, sort: 5, introduction: '白内障、青光眼、眼底病、眼眶病诊治', location: '门诊楼5层' } }),
    prisma.department.create({ data: { name: '皮肤科', hospitalId: xiehe.id, sort: 6, introduction: '国内皮肤病诊治权威，银屑病、白癜风、皮肤肿瘤诊治', location: '门诊楼6层' } }),
    prisma.department.create({ data: { name: '口腔科', hospitalId: xiehe.id, sort: 7, introduction: '口腔颌面外科、牙体牙髓、口腔修复', location: '门诊楼1层' } }),
    prisma.department.create({ data: { name: '耳鼻咽喉科', hospitalId: xiehe.id, sort: 8, introduction: '耳聋、鼻炎、鼻窦炎、咽喉肿瘤诊治', location: '门诊楼5层' } }),
    prisma.department.create({ data: { name: '精神心理科', hospitalId: xiehe.id, sort: 9, introduction: '心理咨询、抑郁症、焦虑症诊治', location: '门诊楼7层' } }),
    prisma.department.create({ data: { name: '康复医学科', hospitalId: xiehe.id, sort: 10, introduction: '神经康复、骨科康复、心脏康复', location: '康复楼' } }),
    prisma.department.create({ data: { name: '肿瘤内科', hospitalId: xiehe.id, sort: 11, introduction: '肿瘤化疗、靶向治疗、免疫治疗', location: '门诊楼6层' } }),
    prisma.department.create({ data: { name: '中医科', hospitalId: xiehe.id, sort: 12, introduction: '中西医结合诊疗', location: '门诊楼7层' } }),
    prisma.department.create({ data: { name: '核医学科', hospitalId: xiehe.id, sort: 13, introduction: 'PET-CT检查、甲状腺碘131治疗', location: '医技楼' } }),
    prisma.department.create({ data: { name: '放射科', hospitalId: xiehe.id, sort: 14, introduction: 'CT、MRI、X线检查', location: '医技楼' } }),
    prisma.department.create({ data: { name: '超声医学科', hospitalId: xiehe.id, sort: 15, introduction: 'B超、心脏超声、介入超声', location: '医技楼' } }),
    prisma.department.create({ data: { name: '检验科', hospitalId: xiehe.id, sort: 16, introduction: '临床检验中心', location: '医技楼' } }),
    prisma.department.create({ data: { name: '病理科', hospitalId: xiehe.id, sort: 17, introduction: '全国病理诊断中心，疑难病理会诊', location: '医技楼' } }),
    prisma.department.create({ data: { name: '急诊科', hospitalId: xiehe.id, sort: 18, introduction: '24小时急诊服务', location: '急诊楼' } }),
    prisma.department.create({ data: { name: '麻醉科', hospitalId: xiehe.id, sort: 19, introduction: '手术麻醉、疼痛门诊', location: '手术楼' } }),
    prisma.department.create({ data: { name: '重症医学科', hospitalId: xiehe.id, sort: 20, introduction: 'ICU重症监护', location: '住院楼' } }),
    prisma.department.create({ data: { name: '营养科', hospitalId: xiehe.id, sort: 21, introduction: '临床营养支持、营养门诊', location: '门诊楼7层' } }),
    prisma.department.create({ data: { name: '变态反应科', hospitalId: xiehe.id, sort: 22, introduction: '过敏性疾病诊治中心，国内变态反应学发源地', location: '门诊楼5层' } }),
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
      introduction: '北京大学第一医院（简称"北大医院"）创建于1915年，是我国最早创办的国立医院，也是国内首批建立的临床医学院之一。肾脏内科、泌尿外科、皮肤科为国家重点学科。',
      trafficGuide: '地铁4号线西四站D口出，步行约500米',
      parkingInfo: '医院设有停车场，建议提前到达',
    },
  });

  const beiyiyuan_neike = await prisma.department.create({
    data: { name: '内科', hospitalId: beiyiyuan.id, sort: 1 },
  });
  await Promise.all([
    prisma.department.create({ data: { name: '肾脏内科', hospitalId: beiyiyuan.id, parentId: beiyiyuan_neike.id, sort: 1, introduction: '全国肾脏病临床医学研究中心，IgA肾病、糖尿病肾病诊治权威', location: '门诊楼3层' } }),
    prisma.department.create({ data: { name: '心血管内科', hospitalId: beiyiyuan.id, parentId: beiyiyuan_neike.id, sort: 2, introduction: '冠心病介入治疗、心律失常诊治', location: '门诊楼3层' } }),
    prisma.department.create({ data: { name: '消化内科', hospitalId: beiyiyuan.id, parentId: beiyiyuan_neike.id, sort: 3, introduction: '消化道肿瘤内镜诊治、炎症性肠病', location: '门诊楼4层' } }),
    prisma.department.create({ data: { name: '呼吸与危重症医学科', hospitalId: beiyiyuan.id, parentId: beiyiyuan_neike.id, sort: 4, introduction: '肺癌、COPD、肺部感染诊治', location: '门诊楼4层' } }),
    prisma.department.create({ data: { name: '神经内科', hospitalId: beiyiyuan.id, parentId: beiyiyuan_neike.id, sort: 5, introduction: '脑血管病、癫痫、帕金森病诊治', location: '门诊楼5层' } }),
    prisma.department.create({ data: { name: '内分泌内科', hospitalId: beiyiyuan.id, parentId: beiyiyuan_neike.id, sort: 6, introduction: '糖尿病、甲状腺疾病诊治', location: '门诊楼5层' } }),
    prisma.department.create({ data: { name: '血液内科', hospitalId: beiyiyuan.id, parentId: beiyiyuan_neike.id, sort: 7, introduction: '白血病、淋巴瘤、骨髓增生异常综合征诊治', location: '门诊楼6层' } }),
    prisma.department.create({ data: { name: '风湿免疫科', hospitalId: beiyiyuan.id, parentId: beiyiyuan_neike.id, sort: 8, introduction: '类风湿关节炎、系统性红斑狼疮诊治', location: '门诊楼6层' } }),
    prisma.department.create({ data: { name: '感染疾病科', hospitalId: beiyiyuan.id, parentId: beiyiyuan_neike.id, sort: 9, introduction: '感染性疾病诊治、发热待查', location: '门诊楼2层' } }),
  ]);

  const beiyiyuan_waike = await prisma.department.create({
    data: { name: '外科', hospitalId: beiyiyuan.id, sort: 2 },
  });
  await Promise.all([
    prisma.department.create({ data: { name: '泌尿外科', hospitalId: beiyiyuan.id, parentId: beiyiyuan_waike.id, sort: 1, introduction: '全国泌尿外科诊疗中心，前列腺癌、肾癌、膀胱癌诊治权威', location: '门诊楼2层' } }),
    prisma.department.create({ data: { name: '普通外科', hospitalId: beiyiyuan.id, parentId: beiyiyuan_waike.id, sort: 2, introduction: '胃肠外科、肝胆外科、甲状腺外科', location: '门诊楼2层' } }),
    prisma.department.create({ data: { name: '骨科', hospitalId: beiyiyuan.id, parentId: beiyiyuan_waike.id, sort: 3, introduction: '脊柱外科、关节外科、创伤骨科', location: '门诊楼2层' } }),
    prisma.department.create({ data: { name: '心脏外科', hospitalId: beiyiyuan.id, parentId: beiyiyuan_waike.id, sort: 4, introduction: '心脏瓣膜病、冠心病外科治疗', location: '住院楼' } }),
    prisma.department.create({ data: { name: '神经外科', hospitalId: beiyiyuan.id, parentId: beiyiyuan_waike.id, sort: 5, introduction: '脑肿瘤、脑血管病外科治疗', location: '住院楼' } }),
    prisma.department.create({ data: { name: '胸外科', hospitalId: beiyiyuan.id, parentId: beiyiyuan_waike.id, sort: 6, introduction: '肺癌、食管癌外科治疗', location: '住院楼' } }),
  ]);

  const beiyiyuan_fuke = await prisma.department.create({
    data: { name: '妇产科', hospitalId: beiyiyuan.id, sort: 3 },
  });
  await Promise.all([
    prisma.department.create({ data: { name: '妇科', hospitalId: beiyiyuan.id, parentId: beiyiyuan_fuke.id, sort: 1, introduction: '妇科肿瘤、宫颈疾病诊治', location: '门诊楼4层' } }),
    prisma.department.create({ data: { name: '产科', hospitalId: beiyiyuan.id, parentId: beiyiyuan_fuke.id, sort: 2, introduction: '高危妊娠、产前诊断', location: '门诊楼4层' } }),
    prisma.department.create({ data: { name: '生殖中心', hospitalId: beiyiyuan.id, parentId: beiyiyuan_fuke.id, sort: 3, introduction: '不孕不育诊治、辅助生殖', location: '门诊楼4层' } }),
  ]);

  await Promise.all([
    prisma.department.create({ data: { name: '儿科', hospitalId: beiyiyuan.id, sort: 4, introduction: '小儿肾脏病诊治中心', location: '门诊楼1层' } }),
    prisma.department.create({ data: { name: '皮肤性病科', hospitalId: beiyiyuan.id, sort: 5, introduction: '皮肤病、性病诊治中心，银屑病、湿疹诊治', location: '门诊楼6层' } }),
    prisma.department.create({ data: { name: '眼科', hospitalId: beiyiyuan.id, sort: 6, introduction: '白内障、青光眼、眼底病诊治', location: '门诊楼5层' } }),
    prisma.department.create({ data: { name: '耳鼻咽喉头颈外科', hospitalId: beiyiyuan.id, sort: 7, introduction: '耳聋、鼻炎、头颈肿瘤诊治', location: '门诊楼5层' } }),
    prisma.department.create({ data: { name: '口腔科', hospitalId: beiyiyuan.id, sort: 8, location: '门诊楼1层' } }),
    prisma.department.create({ data: { name: '肿瘤化疗科', hospitalId: beiyiyuan.id, sort: 9, location: '门诊楼6层' } }),
    prisma.department.create({ data: { name: '中医中西医结合科', hospitalId: beiyiyuan.id, sort: 10, location: '门诊楼7层' } }),
    prisma.department.create({ data: { name: '康复医学科', hospitalId: beiyiyuan.id, sort: 11, location: '康复楼' } }),
    prisma.department.create({ data: { name: '急诊科', hospitalId: beiyiyuan.id, sort: 12, introduction: '24小时急诊服务', location: '急诊楼' } }),
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
      introduction: '北京大学第三医院（简称"北医三院"）始建于1958年，是国家卫生健康委委管的集医疗、教学、科研和预防保健为一体的现代化综合性三级甲等医院。生殖医学中心为中国大陆首例试管婴儿诞生地。',
      trafficGuide: '地铁10号线西土城站A口出，步行约600米',
      parkingInfo: '医院周边停车位紧张，建议公共交通出行',
    },
  });

  const beisanyuan_neike = await prisma.department.create({
    data: { name: '内科', hospitalId: beisanyuan.id, sort: 1 },
  });
  await Promise.all([
    prisma.department.create({ data: { name: '心血管内科', hospitalId: beisanyuan.id, parentId: beisanyuan_neike.id, sort: 1, location: '门诊楼3层' } }),
    prisma.department.create({ data: { name: '消化科', hospitalId: beisanyuan.id, parentId: beisanyuan_neike.id, sort: 2, location: '门诊楼3层' } }),
    prisma.department.create({ data: { name: '呼吸与危重症医学科', hospitalId: beisanyuan.id, parentId: beisanyuan_neike.id, sort: 3, location: '门诊楼4层' } }),
    prisma.department.create({ data: { name: '神经内科', hospitalId: beisanyuan.id, parentId: beisanyuan_neike.id, sort: 4, location: '门诊楼4层' } }),
    prisma.department.create({ data: { name: '内分泌科', hospitalId: beisanyuan.id, parentId: beisanyuan_neike.id, sort: 5, location: '门诊楼5层' } }),
    prisma.department.create({ data: { name: '肾内科', hospitalId: beisanyuan.id, parentId: beisanyuan_neike.id, sort: 6, location: '门诊楼5层' } }),
    prisma.department.create({ data: { name: '风湿免疫科', hospitalId: beisanyuan.id, parentId: beisanyuan_neike.id, sort: 7, location: '门诊楼5层' } }),
    prisma.department.create({ data: { name: '血液内科', hospitalId: beisanyuan.id, parentId: beisanyuan_neike.id, sort: 8, location: '门诊楼6层' } }),
  ]);

  const beisanyuan_waike = await prisma.department.create({
    data: { name: '外科', hospitalId: beisanyuan.id, sort: 2 },
  });
  await Promise.all([
    prisma.department.create({ data: { name: '骨科', hospitalId: beisanyuan.id, parentId: beisanyuan_waike.id, sort: 1, introduction: '运动医学研究所所在地，骨科诊疗全国领先，脊柱外科、关节外科、运动医学', location: '门诊楼2层' } }),
    prisma.department.create({ data: { name: '普通外科', hospitalId: beisanyuan.id, parentId: beisanyuan_waike.id, sort: 2, location: '门诊楼2层' } }),
    prisma.department.create({ data: { name: '泌尿外科', hospitalId: beisanyuan.id, parentId: beisanyuan_waike.id, sort: 3, location: '门诊楼2层' } }),
    prisma.department.create({ data: { name: '神经外科', hospitalId: beisanyuan.id, parentId: beisanyuan_waike.id, sort: 4, location: '住院楼' } }),
    prisma.department.create({ data: { name: '心脏外科', hospitalId: beisanyuan.id, parentId: beisanyuan_waike.id, sort: 5, location: '住院楼' } }),
    prisma.department.create({ data: { name: '成形外科', hospitalId: beisanyuan.id, parentId: beisanyuan_waike.id, sort: 6, introduction: '整形修复外科', location: '门诊楼' } }),
  ]);

  await Promise.all([
    prisma.department.create({ data: { name: '生殖医学中心', hospitalId: beisanyuan.id, sort: 3, introduction: '中国大陆首例试管婴儿诞生地，国内辅助生殖技术发源地，不孕不育诊治权威', location: '生殖医学中心楼' } }),
    prisma.department.create({ data: { name: '妇产科', hospitalId: beisanyuan.id, sort: 4, introduction: '妇科肿瘤、高危产科', location: '门诊楼4层' } }),
    prisma.department.create({ data: { name: '眼科', hospitalId: beisanyuan.id, sort: 5, introduction: '眼科中心', location: '门诊楼5层' } }),
    prisma.department.create({ data: { name: '耳鼻喉科', hospitalId: beisanyuan.id, sort: 6, location: '门诊楼5层' } }),
    prisma.department.create({ data: { name: '口腔科', hospitalId: beisanyuan.id, sort: 7, location: '门诊楼1层' } }),
    prisma.department.create({ data: { name: '皮肤科', hospitalId: beisanyuan.id, sort: 8, location: '门诊楼6层' } }),
    prisma.department.create({ data: { name: '儿科', hospitalId: beisanyuan.id, sort: 9, location: '门诊楼1层' } }),
    prisma.department.create({ data: { name: '康复医学科', hospitalId: beisanyuan.id, sort: 10, introduction: '运动损伤康复中心', location: '康复楼' } }),
    prisma.department.create({ data: { name: '运动医学科', hospitalId: beisanyuan.id, sort: 11, introduction: '国家运动医学研究所，运动损伤诊治', location: '运动医学楼' } }),
    prisma.department.create({ data: { name: '肿瘤化疗科', hospitalId: beisanyuan.id, sort: 12, location: '门诊楼6层' } }),
    prisma.department.create({ data: { name: '急诊科', hospitalId: beisanyuan.id, sort: 13, introduction: '24小时急诊', location: '急诊楼' } }),
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
      introduction: '北京天坛医院始建于1956年，是一所以神经外科为先导，以神经科学集群为特色的大型三级甲等综合医院。神经外科、神经内科在国内外享有盛誉，是国家神经系统疾病临床医学研究中心。',
      trafficGuide: '地铁8号线天桥站或14号线西铁营站',
      parkingInfo: '医院设有大型停车场',
    },
  });

  const tiantan_neike = await prisma.department.create({
    data: { name: '内科', hospitalId: tiantan.id, sort: 1 },
  });
  await Promise.all([
    prisma.department.create({ data: { name: '神经内科', hospitalId: tiantan.id, parentId: tiantan_neike.id, sort: 1, introduction: '国家神经系统疾病临床医学研究中心，脑血管病、癫痫、帕金森病、神经肌肉病诊治', location: '门诊楼3层' } }),
    prisma.department.create({ data: { name: '心血管内科', hospitalId: tiantan.id, parentId: tiantan_neike.id, sort: 2, location: '门诊楼3层' } }),
    prisma.department.create({ data: { name: '消化内科', hospitalId: tiantan.id, parentId: tiantan_neike.id, sort: 3, location: '门诊楼4层' } }),
    prisma.department.create({ data: { name: '呼吸内科', hospitalId: tiantan.id, parentId: tiantan_neike.id, sort: 4, location: '门诊楼4层' } }),
    prisma.department.create({ data: { name: '内分泌科', hospitalId: tiantan.id, parentId: tiantan_neike.id, sort: 5, location: '门诊楼5层' } }),
    prisma.department.create({ data: { name: '肾内科', hospitalId: tiantan.id, parentId: tiantan_neike.id, sort: 6, location: '门诊楼5层' } }),
  ]);

  const tiantan_waike = await prisma.department.create({
    data: { name: '神经外科', hospitalId: tiantan.id, sort: 2, introduction: '亚洲最大的神经外科诊疗中心，世界著名' },
  });
  await Promise.all([
    prisma.department.create({ data: { name: '神经肿瘤外科', hospitalId: tiantan.id, parentId: tiantan_waike.id, sort: 1, introduction: '脑胶质瘤、脑膜瘤、听神经瘤等颅内肿瘤手术', location: '住院楼' } }),
    prisma.department.create({ data: { name: '脑血管病外科', hospitalId: tiantan.id, parentId: tiantan_waike.id, sort: 2, introduction: '脑动脉瘤、脑血管畸形、颈动脉狭窄手术', location: '住院楼' } }),
    prisma.department.create({ data: { name: '脊髓脊柱外科', hospitalId: tiantan.id, parentId: tiantan_waike.id, sort: 3, introduction: '脊髓肿瘤、脊柱疾病手术', location: '住院楼' } }),
    prisma.department.create({ data: { name: '功能神经外科', hospitalId: tiantan.id, parentId: tiantan_waike.id, sort: 4, introduction: '帕金森病DBS手术、癫痫手术、三叉神经痛', location: '住院楼' } }),
    prisma.department.create({ data: { name: '小儿神经外科', hospitalId: tiantan.id, parentId: tiantan_waike.id, sort: 5, introduction: '儿童脑肿瘤、先天性脑积水', location: '住院楼' } }),
  ]);

  await Promise.all([
    prisma.department.create({ data: { name: '普通外科', hospitalId: tiantan.id, sort: 3, location: '门诊楼2层' } }),
    prisma.department.create({ data: { name: '骨科', hospitalId: tiantan.id, sort: 4, location: '门诊楼2层' } }),
    prisma.department.create({ data: { name: '介入神经病学科', hospitalId: tiantan.id, sort: 5, introduction: '神经介入诊疗中心，脑血管介入治疗', location: '介入中心' } }),
    prisma.department.create({ data: { name: '癫痫科', hospitalId: tiantan.id, sort: 6, introduction: '癫痫综合诊治中心', location: '门诊楼3层' } }),
    prisma.department.create({ data: { name: '神经影像中心', hospitalId: tiantan.id, sort: 7, introduction: '神经影像诊断', location: '医技楼' } }),
    prisma.department.create({ data: { name: '神经病理中心', hospitalId: tiantan.id, sort: 8, location: '医技楼' } }),
    prisma.department.create({ data: { name: '康复科', hospitalId: tiantan.id, sort: 9, introduction: '神经康复中心', location: '康复楼' } }),
    prisma.department.create({ data: { name: '急诊科', hospitalId: tiantan.id, sort: 10, introduction: '24小时神经急诊', location: '急诊楼' } }),
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
      introduction: '中国人民解放军总医院（301医院）创建于1953年，是集医疗、保健、教学、科研于一体的大型现代化综合性医院，是全军规模最大的综合性医院。',
      trafficGuide: '地铁1号线五棵松站A口出',
      parkingInfo: '院内设有停车场，凭就诊卡可享受停车优惠',
    },
  });

  const h301_neike = await prisma.department.create({
    data: { name: '内科', hospitalId: h301.id, sort: 1 },
  });
  await Promise.all([
    prisma.department.create({ data: { name: '心血管内科', hospitalId: h301.id, parentId: h301_neike.id, sort: 1, introduction: '冠心病、心律失常、心力衰竭诊治', location: '门诊楼3层' } }),
    prisma.department.create({ data: { name: '消化内科', hospitalId: h301.id, parentId: h301_neike.id, sort: 2, location: '门诊楼3层' } }),
    prisma.department.create({ data: { name: '呼吸与危重症医学科', hospitalId: h301.id, parentId: h301_neike.id, sort: 3, location: '门诊楼4层' } }),
    prisma.department.create({ data: { name: '肾脏病科', hospitalId: h301.id, parentId: h301_neike.id, sort: 4, location: '门诊楼4层' } }),
    prisma.department.create({ data: { name: '神经内科', hospitalId: h301.id, parentId: h301_neike.id, sort: 5, location: '门诊楼5层' } }),
    prisma.department.create({ data: { name: '内分泌科', hospitalId: h301.id, parentId: h301_neike.id, sort: 6, location: '门诊楼5层' } }),
    prisma.department.create({ data: { name: '风湿科', hospitalId: h301.id, parentId: h301_neike.id, sort: 7, location: '门诊楼5层' } }),
    prisma.department.create({ data: { name: '血液病科', hospitalId: h301.id, parentId: h301_neike.id, sort: 8, location: '门诊楼6层' } }),
    prisma.department.create({ data: { name: '老年医学科', hospitalId: h301.id, parentId: h301_neike.id, sort: 9, introduction: '老年综合诊疗', location: '门诊楼7层' } }),
  ]);

  const h301_waike = await prisma.department.create({
    data: { name: '外科', hospitalId: h301.id, sort: 2 },
  });
  await Promise.all([
    prisma.department.create({ data: { name: '骨科', hospitalId: h301.id, parentId: h301_waike.id, sort: 1, introduction: '全军骨科研究所，脊柱外科、关节外科、运动医学', location: '门诊楼2层' } }),
    prisma.department.create({ data: { name: '普通外科', hospitalId: h301.id, parentId: h301_waike.id, sort: 2, introduction: '肝胆外科、胃肠外科、甲乳外科', location: '门诊楼2层' } }),
    prisma.department.create({ data: { name: '泌尿外科', hospitalId: h301.id, parentId: h301_waike.id, sort: 3, location: '门诊楼2层' } }),
    prisma.department.create({ data: { name: '心血管外科', hospitalId: h301.id, parentId: h301_waike.id, sort: 4, location: '住院楼' } }),
    prisma.department.create({ data: { name: '神经外科', hospitalId: h301.id, parentId: h301_waike.id, sort: 5, location: '住院楼' } }),
    prisma.department.create({ data: { name: '胸外科', hospitalId: h301.id, parentId: h301_waike.id, sort: 6, location: '住院楼' } }),
    prisma.department.create({ data: { name: '整形外科', hospitalId: h301.id, parentId: h301_waike.id, sort: 7, location: '门诊楼' } }),
  ]);

  await Promise.all([
    prisma.department.create({ data: { name: '耳鼻咽喉头颈外科', hospitalId: h301.id, sort: 3, introduction: '全军耳鼻咽喉头颈外科中心，人工耳蜗植入', location: '门诊楼5层' } }),
    prisma.department.create({ data: { name: '眼科', hospitalId: h301.id, sort: 4, introduction: '眼科中心', location: '门诊楼5层' } }),
    prisma.department.create({ data: { name: '口腔科', hospitalId: h301.id, sort: 5, location: '门诊楼1层' } }),
    prisma.department.create({ data: { name: '皮肤科', hospitalId: h301.id, sort: 6, location: '门诊楼6层' } }),
    prisma.department.create({ data: { name: '妇产科', hospitalId: h301.id, sort: 7, location: '门诊楼4层' } }),
    prisma.department.create({ data: { name: '儿科', hospitalId: h301.id, sort: 8, location: '门诊楼1层' } }),
    prisma.department.create({ data: { name: '肿瘤内科', hospitalId: h301.id, sort: 9, location: '门诊楼6层' } }),
    prisma.department.create({ data: { name: '康复医学科', hospitalId: h301.id, sort: 10, location: '康复楼' } }),
    prisma.department.create({ data: { name: '中医科', hospitalId: h301.id, sort: 11, location: '门诊楼7层' } }),
    prisma.department.create({ data: { name: '急诊科', hospitalId: h301.id, sort: 12, introduction: '24小时急诊', location: '急诊楼' } }),
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
      introduction: '阜外医院是国家心血管病中心所在地，是以诊治心血管疾病为主的三级甲等专科医院，心血管疾病诊治能力全国第一、世界领先。心脏外科手术量、介入治疗量均居全国首位。',
      trafficGuide: '地铁2号线阜成门站B口出，步行约300米',
      parkingInfo: '医院停车位有限，建议乘坐公共交通',
    },
  });

  const fuwai_neike = await prisma.department.create({
    data: { name: '心内科', hospitalId: fuwai.id, sort: 1, introduction: '国家心血管病中心，冠心病、心律失常、心力衰竭诊治世界领先' },
  });
  await Promise.all([
    prisma.department.create({ data: { name: '冠心病诊治中心', hospitalId: fuwai.id, parentId: fuwai_neike.id, sort: 1, introduction: '冠心病介入治疗量全国第一', location: '门诊楼3层' } }),
    prisma.department.create({ data: { name: '心律失常中心', hospitalId: fuwai.id, parentId: fuwai_neike.id, sort: 2, introduction: '房颤、室速等心律失常消融治疗', location: '门诊楼3层' } }),
    prisma.department.create({ data: { name: '心力衰竭中心', hospitalId: fuwai.id, parentId: fuwai_neike.id, sort: 3, introduction: '心衰诊治、心脏移植评估', location: '门诊楼4层' } }),
    prisma.department.create({ data: { name: '结构性心脏病中心', hospitalId: fuwai.id, parentId: fuwai_neike.id, sort: 4, introduction: '瓣膜病介入治疗、先心病封堵', location: '门诊楼4层' } }),
    prisma.department.create({ data: { name: '高血压诊治中心', hospitalId: fuwai.id, parentId: fuwai_neike.id, sort: 5, introduction: '顽固性高血压、继发性高血压诊治', location: '门诊楼5层' } }),
    prisma.department.create({ data: { name: '肺血管病诊治中心', hospitalId: fuwai.id, parentId: fuwai_neike.id, sort: 6, introduction: '肺动脉高压、肺栓塞诊治', location: '门诊楼5层' } }),
  ]);

  const fuwai_waike = await prisma.department.create({
    data: { name: '心外科', hospitalId: fuwai.id, sort: 2, introduction: '心脏外科手术量全国第一，世界领先' },
  });
  await Promise.all([
    prisma.department.create({ data: { name: '成人心脏外科', hospitalId: fuwai.id, parentId: fuwai_waike.id, sort: 1, introduction: '冠脉搭桥、瓣膜置换/修复', location: '住院楼' } }),
    prisma.department.create({ data: { name: '小儿心脏外科', hospitalId: fuwai.id, parentId: fuwai_waike.id, sort: 2, introduction: '先天性心脏病手术', location: '住院楼' } }),
    prisma.department.create({ data: { name: '大血管外科', hospitalId: fuwai.id, parentId: fuwai_waike.id, sort: 3, introduction: '主动脉夹层、主动脉瘤手术', location: '住院楼' } }),
    prisma.department.create({ data: { name: '心脏移植中心', hospitalId: fuwai.id, parentId: fuwai_waike.id, sort: 4, introduction: '心脏移植手术量全国领先', location: '住院楼' } }),
  ]);

  await Promise.all([
    prisma.department.create({ data: { name: '血管外科中心', hospitalId: fuwai.id, sort: 3, introduction: '主动脉疾病、外周血管疾病诊治', location: '门诊楼2层' } }),
    prisma.department.create({ data: { name: '心脏重症监护中心', hospitalId: fuwai.id, sort: 4, introduction: 'CCU/CICU', location: '住院楼' } }),
    prisma.department.create({ data: { name: '心脏康复中心', hospitalId: fuwai.id, sort: 5, introduction: '心脏术后康复', location: '康复楼' } }),
    prisma.department.create({ data: { name: '心血管影像中心', hospitalId: fuwai.id, sort: 6, introduction: '心脏CT、心脏MRI', location: '医技楼' } }),
    prisma.department.create({ data: { name: '心脏超声中心', hospitalId: fuwai.id, sort: 7, introduction: '经胸超声、经食道超声', location: '医技楼' } }),
    prisma.department.create({ data: { name: '急诊科', hospitalId: fuwai.id, sort: 8, introduction: '24小时心血管急诊', location: '急诊楼' } }),
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
      introduction: '北京积水潭医院是以骨科、烧伤科为重点学科的三级甲等综合医院，骨科诊疗综合实力全国领先，是北京大学第四临床医学院。',
      trafficGuide: '地铁2号线积水潭站A口出',
      parkingInfo: '医院停车场位于南门',
    },
  });

  const jishuitan_guke = await prisma.department.create({
    data: { name: '骨科', hospitalId: jishuitan.id, sort: 1, introduction: '全国骨科诊疗中心，运动医学、创伤骨科全国领先' },
  });
  await Promise.all([
    prisma.department.create({ data: { name: '创伤骨科', hospitalId: jishuitan.id, parentId: jishuitan_guke.id, sort: 1, introduction: '创伤骨科全国领先，复杂骨折治疗', location: '门诊楼2层' } }),
    prisma.department.create({ data: { name: '脊柱外科', hospitalId: jishuitan.id, parentId: jishuitan_guke.id, sort: 2, introduction: '脊柱侧弯、颈椎病、腰椎间盘突出', location: '门诊楼2层' } }),
    prisma.department.create({ data: { name: '矫形骨科', hospitalId: jishuitan.id, parentId: jishuitan_guke.id, sort: 3, introduction: '骨关节畸形矫正', location: '门诊楼2层' } }),
    prisma.department.create({ data: { name: '手外科', hospitalId: jishuitan.id, parentId: jishuitan_guke.id, sort: 4, introduction: '手外科诊疗中心，断指再植', location: '门诊楼3层' } }),
    prisma.department.create({ data: { name: '足踝外科', hospitalId: jishuitan.id, parentId: jishuitan_guke.id, sort: 5, introduction: '足踝疾病诊治', location: '门诊楼3层' } }),
    prisma.department.create({ data: { name: '关节外科', hospitalId: jishuitan.id, parentId: jishuitan_guke.id, sort: 6, introduction: '髋膝关节置换', location: '门诊楼3层' } }),
    prisma.department.create({ data: { name: '运动医学科', hospitalId: jishuitan.id, parentId: jishuitan_guke.id, sort: 7, introduction: '国家运动医学中心，运动损伤诊治', location: '门诊楼3层' } }),
    prisma.department.create({ data: { name: '小儿骨科', hospitalId: jishuitan.id, parentId: jishuitan_guke.id, sort: 8, introduction: '儿童骨科疾病', location: '门诊楼1层' } }),
    prisma.department.create({ data: { name: '骨肿瘤科', hospitalId: jishuitan.id, parentId: jishuitan_guke.id, sort: 9, introduction: '骨肿瘤诊治', location: '住院楼' } }),
  ]);

  await Promise.all([
    prisma.department.create({ data: { name: '烧伤科', hospitalId: jishuitan.id, sort: 2, introduction: '全国烧伤诊疗中心，大面积烧伤救治', location: '烧伤楼' } }),
    prisma.department.create({ data: { name: '内科', hospitalId: jishuitan.id, sort: 3, location: '门诊楼4层' } }),
    prisma.department.create({ data: { name: '普外科', hospitalId: jishuitan.id, sort: 4, location: '门诊楼2层' } }),
    prisma.department.create({ data: { name: '泌尿外科', hospitalId: jishuitan.id, sort: 5, location: '门诊楼2层' } }),
    prisma.department.create({ data: { name: '妇产科', hospitalId: jishuitan.id, sort: 6, location: '门诊楼4层' } }),
    prisma.department.create({ data: { name: '康复科', hospitalId: jishuitan.id, sort: 7, introduction: '骨科康复、运动康复', location: '康复楼' } }),
    prisma.department.create({ data: { name: '麻醉科', hospitalId: jishuitan.id, sort: 8, introduction: '疼痛门诊', location: '手术楼' } }),
    prisma.department.create({ data: { name: '急诊科', hospitalId: jishuitan.id, sort: 9, introduction: '24小时急诊，创伤急救中心', location: '急诊楼' } }),
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

  const tongren_yanke = await prisma.department.create({
    data: { name: '眼科', hospitalId: tongren.id, sort: 1, introduction: '全国眼科诊疗中心，北京眼科研究所所在地' },
  });
  await Promise.all([
    prisma.department.create({ data: { name: '白内障中心', hospitalId: tongren.id, parentId: tongren_yanke.id, sort: 1, introduction: '白内障手术量全国领先', location: '眼科楼2层' } }),
    prisma.department.create({ data: { name: '青光眼科', hospitalId: tongren.id, parentId: tongren_yanke.id, sort: 2, location: '眼科楼3层' } }),
    prisma.department.create({ data: { name: '眼底病科', hospitalId: tongren.id, parentId: tongren_yanke.id, sort: 3, introduction: '糖尿病眼底病变、老年黄斑变性', location: '眼科楼3层' } }),
    prisma.department.create({ data: { name: '眼外伤科', hospitalId: tongren.id, parentId: tongren_yanke.id, sort: 4, location: '眼科楼4层' } }),
    prisma.department.create({ data: { name: '眼整形科', hospitalId: tongren.id, parentId: tongren_yanke.id, sort: 5, introduction: '眼眶病、泪道疾病', location: '眼科楼4层' } }),
    prisma.department.create({ data: { name: '斜视弱视科', hospitalId: tongren.id, parentId: tongren_yanke.id, sort: 6, introduction: '小儿斜视弱视', location: '眼科楼2层' } }),
    prisma.department.create({ data: { name: '角膜病科', hospitalId: tongren.id, parentId: tongren_yanke.id, sort: 7, introduction: '角膜移植', location: '眼科楼3层' } }),
    prisma.department.create({ data: { name: '屈光中心', hospitalId: tongren.id, parentId: tongren_yanke.id, sort: 8, introduction: '近视、远视、散光矫正，激光手术', location: '眼科楼5层' } }),
  ]);

  const tongren_erbihou = await prisma.department.create({
    data: { name: '耳鼻咽喉头颈外科', hospitalId: tongren.id, sort: 2, introduction: '全国耳鼻咽喉诊疗中心' },
  });
  await Promise.all([
    prisma.department.create({ data: { name: '耳科', hospitalId: tongren.id, parentId: tongren_erbihou.id, sort: 1, introduction: '耳聋、耳鸣、人工耳蜗', location: '门诊楼3层' } }),
    prisma.department.create({ data: { name: '鼻科', hospitalId: tongren.id, parentId: tongren_erbihou.id, sort: 2, introduction: '鼻炎、鼻窦炎、鼻息肉、过敏性鼻炎', location: '门诊楼3层' } }),
    prisma.department.create({ data: { name: '咽喉科', hospitalId: tongren.id, parentId: tongren_erbihou.id, sort: 3, introduction: '扁桃体、腺样体疾病', location: '门诊楼3层' } }),
    prisma.department.create({ data: { name: '头颈外科', hospitalId: tongren.id, parentId: tongren_erbihou.id, sort: 4, introduction: '甲状腺、喉癌、下咽癌', location: '住院楼' } }),
    prisma.department.create({ data: { name: '睡眠呼吸监测中心', hospitalId: tongren.id, parentId: tongren_erbihou.id, sort: 5, introduction: '睡眠呼吸暂停综合征', location: '门诊楼4层' } }),
  ]);

  await Promise.all([
    prisma.department.create({ data: { name: '心血管中心', hospitalId: tongren.id, sort: 3, introduction: '冠心病、心律失常诊治', location: '门诊楼4层' } }),
    prisma.department.create({ data: { name: '消化内科', hospitalId: tongren.id, sort: 4, location: '门诊楼4层' } }),
    prisma.department.create({ data: { name: '内分泌科', hospitalId: tongren.id, sort: 5, introduction: '糖尿病诊疗中心', location: '门诊楼5层' } }),
    prisma.department.create({ data: { name: '普外科', hospitalId: tongren.id, sort: 6, location: '门诊楼2层' } }),
    prisma.department.create({ data: { name: '骨科', hospitalId: tongren.id, sort: 7, location: '门诊楼2层' } }),
    prisma.department.create({ data: { name: '妇产科', hospitalId: tongren.id, sort: 8, location: '门诊楼4层' } }),
    prisma.department.create({ data: { name: '儿科', hospitalId: tongren.id, sort: 9, location: '门诊楼1层' } }),
    prisma.department.create({ data: { name: '皮肤科', hospitalId: tongren.id, sort: 10, location: '门诊楼6层' } }),
    prisma.department.create({ data: { name: '急诊科', hospitalId: tongren.id, sort: 11, introduction: '24小时急诊', location: '急诊楼' } }),
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
      introduction: '北京安贞医院是以治疗心肺血管疾病为重点的三级甲等综合医院，心脏外科、心内科、血管外科在国内处于领先地位，是北京市心血管疾病诊疗中心。',
      trafficGuide: '地铁10号线安贞门站B口出',
      parkingInfo: '医院设有地下停车场',
    },
  });

  const anzhen_xinnei = await prisma.department.create({
    data: { name: '心内科', hospitalId: anzhen.id, sort: 1, introduction: '心血管疾病诊治中心' },
  });
  await Promise.all([
    prisma.department.create({ data: { name: '冠心病中心', hospitalId: anzhen.id, parentId: anzhen_xinnei.id, sort: 1, introduction: '冠心病介入治疗', location: '门诊楼3层' } }),
    prisma.department.create({ data: { name: '心律失常中心', hospitalId: anzhen.id, parentId: anzhen_xinnei.id, sort: 2, introduction: '心律失常消融治疗', location: '门诊楼3层' } }),
    prisma.department.create({ data: { name: '高血压科', hospitalId: anzhen.id, parentId: anzhen_xinnei.id, sort: 3, location: '门诊楼4层' } }),
    prisma.department.create({ data: { name: '心力衰竭科', hospitalId: anzhen.id, parentId: anzhen_xinnei.id, sort: 4, location: '门诊楼4层' } }),
  ]);

  const anzhen_xinwai = await prisma.department.create({
    data: { name: '心脏外科', hospitalId: anzhen.id, sort: 2, introduction: '心脏手术量全国领先' },
  });
  await Promise.all([
    prisma.department.create({ data: { name: '成人心外科', hospitalId: anzhen.id, parentId: anzhen_xinwai.id, sort: 1, introduction: '冠脉搭桥、瓣膜手术', location: '住院楼' } }),
    prisma.department.create({ data: { name: '小儿心外科', hospitalId: anzhen.id, parentId: anzhen_xinwai.id, sort: 2, introduction: '先心病手术', location: '住院楼' } }),
    prisma.department.create({ data: { name: '大血管中心', hospitalId: anzhen.id, parentId: anzhen_xinwai.id, sort: 3, introduction: '主动脉夹层、主动脉瘤', location: '住院楼' } }),
  ]);

  await Promise.all([
    prisma.department.create({ data: { name: '血管外科', hospitalId: anzhen.id, sort: 3, introduction: '外周血管疾病诊治', location: '门诊楼2层' } }),
    prisma.department.create({ data: { name: '呼吸与危重症医学科', hospitalId: anzhen.id, sort: 4, location: '门诊楼5层' } }),
    prisma.department.create({ data: { name: '胸外科', hospitalId: anzhen.id, sort: 5, introduction: '肺癌、食管癌手术', location: '住院楼' } }),
    prisma.department.create({ data: { name: '消化内科', hospitalId: anzhen.id, sort: 6, location: '门诊楼4层' } }),
    prisma.department.create({ data: { name: '神经内科', hospitalId: anzhen.id, sort: 7, location: '门诊楼5层' } }),
    prisma.department.create({ data: { name: '内分泌科', hospitalId: anzhen.id, sort: 8, location: '门诊楼5层' } }),
    prisma.department.create({ data: { name: '普外科', hospitalId: anzhen.id, sort: 9, location: '门诊楼2层' } }),
    prisma.department.create({ data: { name: '妇产科', hospitalId: anzhen.id, sort: 10, location: '门诊楼4层' } }),
    prisma.department.create({ data: { name: '心脏康复中心', hospitalId: anzhen.id, sort: 11, introduction: '心脏术后康复', location: '康复楼' } }),
    prisma.department.create({ data: { name: '急诊科', hospitalId: anzhen.id, sort: 12, introduction: '24小时心血管急诊', location: '急诊楼' } }),
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
      introduction: '宣武医院是以神经科学和老年医学为重点的三级甲等综合医院，神经内科、神经外科在国内处于领先地位，是国家老年疾病临床医学研究中心。',
      trafficGuide: '地铁2号线长椿街站A口出',
      parkingInfo: '医院停车位有限',
    },
  });

  const xuanwu_neike = await prisma.department.create({
    data: { name: '内科', hospitalId: xuanwu.id, sort: 1 },
  });
  await Promise.all([
    prisma.department.create({ data: { name: '神经内科', hospitalId: xuanwu.id, parentId: xuanwu_neike.id, sort: 1, introduction: '国家老年疾病临床医学研究中心，脑血管病、帕金森病、认知障碍诊治', location: '门诊楼3层' } }),
    prisma.department.create({ data: { name: '心血管内科', hospitalId: xuanwu.id, parentId: xuanwu_neike.id, sort: 2, location: '门诊楼4层' } }),
    prisma.department.create({ data: { name: '消化内科', hospitalId: xuanwu.id, parentId: xuanwu_neike.id, sort: 3, location: '门诊楼4层' } }),
    prisma.department.create({ data: { name: '呼吸内科', hospitalId: xuanwu.id, parentId: xuanwu_neike.id, sort: 4, location: '门诊楼5层' } }),
    prisma.department.create({ data: { name: '内分泌科', hospitalId: xuanwu.id, parentId: xuanwu_neike.id, sort: 5, location: '门诊楼5层' } }),
    prisma.department.create({ data: { name: '肾内科', hospitalId: xuanwu.id, parentId: xuanwu_neike.id, sort: 6, location: '门诊楼5层' } }),
    prisma.department.create({ data: { name: '老年医学科', hospitalId: xuanwu.id, parentId: xuanwu_neike.id, sort: 7, introduction: '老年综合评估、多病共存管理', location: '门诊楼7层' } }),
  ]);

  const xuanwu_waike = await prisma.department.create({
    data: { name: '外科', hospitalId: xuanwu.id, sort: 2 },
  });
  await Promise.all([
    prisma.department.create({ data: { name: '神经外科', hospitalId: xuanwu.id, parentId: xuanwu_waike.id, sort: 1, introduction: '功能神经外科中心，帕金森病DBS手术、癫痫手术', location: '住院楼' } }),
    prisma.department.create({ data: { name: '普通外科', hospitalId: xuanwu.id, parentId: xuanwu_waike.id, sort: 2, location: '门诊楼2层' } }),
    prisma.department.create({ data: { name: '骨科', hospitalId: xuanwu.id, parentId: xuanwu_waike.id, sort: 3, location: '门诊楼2层' } }),
    prisma.department.create({ data: { name: '泌尿外科', hospitalId: xuanwu.id, parentId: xuanwu_waike.id, sort: 4, location: '门诊楼2层' } }),
  ]);

  await Promise.all([
    prisma.department.create({ data: { name: '康复医学科', hospitalId: xuanwu.id, sort: 3, introduction: '神经康复中心，脑卒中康复', location: '康复楼' } }),
    prisma.department.create({ data: { name: '血管超声诊断科', hospitalId: xuanwu.id, sort: 4, introduction: '颈动脉超声、经颅多普勒', location: '医技楼' } }),
    prisma.department.create({ data: { name: '疼痛科', hospitalId: xuanwu.id, sort: 5, introduction: '慢性疼痛诊治', location: '门诊楼6层' } }),
    prisma.department.create({ data: { name: '眼科', hospitalId: xuanwu.id, sort: 6, location: '门诊楼5层' } }),
    prisma.department.create({ data: { name: '耳鼻喉科', hospitalId: xuanwu.id, sort: 7, location: '门诊楼5层' } }),
    prisma.department.create({ data: { name: '口腔科', hospitalId: xuanwu.id, sort: 8, location: '门诊楼1层' } }),
    prisma.department.create({ data: { name: '皮肤科', hospitalId: xuanwu.id, sort: 9, location: '门诊楼6层' } }),
    prisma.department.create({ data: { name: '中医科', hospitalId: xuanwu.id, sort: 10, location: '门诊楼7层' } }),
    prisma.department.create({ data: { name: '急诊科', hospitalId: xuanwu.id, sort: 11, introduction: '24小时急诊，卒中绿色通道', location: '急诊楼' } }),
  ]);

  console.log('✅ 医院和科室创建完成');

  // 4. 创建医生数据
  console.log('\n👨‍⚕️ 正在创建医生数据...');

  // 查询各医院的科室用于关联医生
  const xiehe_xinneike = await prisma.department.findFirst({ where: { hospitalId: xiehe.id, name: '心内科' } });
  const xiehe_xiaohuaneike = await prisma.department.findFirst({ where: { hospitalId: xiehe.id, name: '消化内科' } });
  const xiehe_fengshimianyike = await prisma.department.findFirst({ where: { hospitalId: xiehe.id, name: '风湿免疫科' } });
  const xiehe_pifuke = await prisma.department.findFirst({ where: { hospitalId: xiehe.id, name: '皮肤科' } });
  const xiehe_guke = await prisma.department.findFirst({ where: { hospitalId: xiehe.id, name: '骨科' } });

  const beiyiyuan_shenneike = await prisma.department.findFirst({ where: { hospitalId: beiyiyuan.id, name: '肾脏内科' } });
  const beiyiyuan_miniaoke = await prisma.department.findFirst({ where: { hospitalId: beiyiyuan.id, name: '泌尿外科' } });

  const beisanyuan_guke = await prisma.department.findFirst({ where: { hospitalId: beisanyuan.id, name: '骨科' } });
  const beisanyuan_shengzhi = await prisma.department.findFirst({ where: { hospitalId: beisanyuan.id, name: '生殖医学中心' } });

  const tiantan_shenjingneike = await prisma.department.findFirst({ where: { hospitalId: tiantan.id, name: '神经内科' } });
  const tiantan_shenjingzhongliuwaike = await prisma.department.findFirst({ where: { hospitalId: tiantan.id, name: '神经肿瘤外科' } });

  const h301_guke = await prisma.department.findFirst({ where: { hospitalId: h301.id, name: '骨科' } });
  const h301_erbihou = await prisma.department.findFirst({ where: { hospitalId: h301.id, name: '耳鼻咽喉头颈外科' } });

  const fuwai_guanxinbing = await prisma.department.findFirst({ where: { hospitalId: fuwai.id, name: '冠心病诊治中心' } });
  const fuwai_xinzangyizhi = await prisma.department.findFirst({ where: { hospitalId: fuwai.id, name: '心脏移植中心' } });

  const jishuitan_chuangguke = await prisma.department.findFirst({ where: { hospitalId: jishuitan.id, name: '创伤骨科' } });
  const jishuitan_yundongyixue = await prisma.department.findFirst({ where: { hospitalId: jishuitan.id, name: '运动医学科' } });

  const tongren_baineizhang = await prisma.department.findFirst({ where: { hospitalId: tongren.id, name: '白内障中心' } });
  const tongren_erke = await prisma.department.findFirst({ where: { hospitalId: tongren.id, name: '耳科' } });

  const anzhen_guanxinbing = await prisma.department.findFirst({ where: { hospitalId: anzhen.id, name: '冠心病中心' } });
  const anzhen_daxueguan = await prisma.department.findFirst({ where: { hospitalId: anzhen.id, name: '大血管中心' } });

  const xuanwu_shenjingneike = await prisma.department.findFirst({ where: { hospitalId: xuanwu.id, name: '神经内科' } });
  const xuanwu_shenjingwaike = await prisma.department.findFirst({ where: { hospitalId: xuanwu.id, name: '神经外科' } });

  await Promise.all([
    // ========== 北京协和医院医生 ==========
    prisma.doctor.create({
      data: {
        name: '张抒扬',
        gender: 'male',
        hospitalId: xiehe.id,
        departmentId: xiehe_xinneike!.id,
        title: 'chief',
        level: 'expert',
        specialties: ['冠心病', '心力衰竭', '高血压', '心肌病'],
        introduction: '北京协和医院心内科主任医师、博士生导师，在心血管疾病诊治领域有深厚造诣，尤其擅长冠心病和心力衰竭的诊治。',
        education: '北京协和医学院博士',
        experience: '30年',
        rating: 4.9,
        consultCount: 2568,
        reviewCount: 856,
      },
    }),
    prisma.doctor.create({
      data: {
        name: '曾小峰',
        gender: 'male',
        hospitalId: xiehe.id,
        departmentId: xiehe_fengshimianyike!.id,
        title: 'chief',
        level: 'expert',
        specialties: ['系统性红斑狼疮', '类风湿关节炎', '强直性脊柱炎', '干燥综合征'],
        introduction: '北京协和医院风湿免疫科主任，中国风湿病学界领军人物，在系统性红斑狼疮等自身免疫病领域有突出贡献。',
        education: '北京协和医学院博士',
        experience: '35年',
        rating: 5.0,
        consultCount: 3256,
        reviewCount: 1023,
      },
    }),
    prisma.doctor.create({
      data: {
        name: '钱家鸣',
        gender: 'female',
        hospitalId: xiehe.id,
        departmentId: xiehe_xiaohuaneike!.id,
        title: 'chief',
        level: 'expert',
        specialties: ['炎症性肠病', '消化道肿瘤', '胃肠镜诊治', '功能性胃肠病'],
        introduction: '北京协和医院消化内科主任医师，在炎症性肠病、消化道早癌诊治方面经验丰富。',
        education: '北京医科大学博士',
        experience: '28年',
        rating: 4.9,
        consultCount: 1892,
        reviewCount: 567,
      },
    }),
    prisma.doctor.create({
      data: {
        name: '晋红中',
        gender: 'male',
        hospitalId: xiehe.id,
        departmentId: xiehe_pifuke!.id,
        title: 'chief',
        level: 'expert',
        specialties: ['银屑病', '白癜风', '皮肤肿瘤', '过敏性皮肤病'],
        introduction: '北京协和医院皮肤科主任医师，皮肤病诊治专家，在银屑病、白癜风等疑难皮肤病领域有丰富经验。',
        education: '中国医学科学院博士',
        experience: '25年',
        rating: 4.8,
        consultCount: 1567,
        reviewCount: 423,
      },
    }),

    // ========== 北京大学第一医院医生 ==========
    prisma.doctor.create({
      data: {
        name: '赵明辉',
        gender: 'male',
        hospitalId: beiyiyuan.id,
        departmentId: beiyiyuan_shenneike!.id,
        title: 'chief',
        level: 'expert',
        specialties: ['IgA肾病', '糖尿病肾病', '慢性肾脏病', '肾小球肾炎'],
        introduction: '北京大学第一医院肾内科主任，全国肾脏病学界知名专家，在IgA肾病、糖尿病肾病诊治方面国内领先。',
        education: '北京大学医学部博士',
        experience: '32年',
        rating: 5.0,
        consultCount: 2876,
        reviewCount: 934,
      },
    }),
    prisma.doctor.create({
      data: {
        name: '周利群',
        gender: 'male',
        hospitalId: beiyiyuan.id,
        departmentId: beiyiyuan_miniaoke!.id,
        title: 'chief',
        level: 'expert',
        specialties: ['前列腺癌', '肾癌', '膀胱癌', '微创泌尿外科'],
        introduction: '北京大学第一医院泌尿外科主任，泌尿系肿瘤微创手术专家，在前列腺癌、肾癌诊治方面经验丰富。',
        education: '北京大学医学部博士',
        experience: '28年',
        rating: 4.9,
        consultCount: 1923,
        reviewCount: 612,
      },
    }),

    // ========== 北京大学第三医院医生 ==========
    prisma.doctor.create({
      data: {
        name: '乔杰',
        gender: 'female',
        hospitalId: beisanyuan.id,
        departmentId: beisanyuan_shengzhi!.id,
        title: 'chief',
        level: 'expert',
        specialties: ['试管婴儿', '不孕不育', '多囊卵巢综合征', '子宫内膜异位症'],
        introduction: '北京大学第三医院院长、生殖医学中心主任，中国工程院院士，在辅助生殖技术领域世界知名。',
        education: '北京医科大学博士',
        experience: '35年',
        rating: 5.0,
        consultCount: 4567,
        reviewCount: 1523,
      },
    }),
    prisma.doctor.create({
      data: {
        name: '刘忠军',
        gender: 'male',
        hospitalId: beisanyuan.id,
        departmentId: beisanyuan_guke!.id,
        title: 'chief',
        level: 'expert',
        specialties: ['脊柱侧弯', '颈椎病', '腰椎间盘突出', '脊柱肿瘤'],
        introduction: '北京大学第三医院骨科主任医师，脊柱外科专家，在脊柱畸形矫正、微创脊柱手术方面国内领先。',
        education: '北京大学医学部博士',
        experience: '30年',
        rating: 4.9,
        consultCount: 2134,
        reviewCount: 678,
      },
    }),

    // ========== 北京天坛医院医生 ==========
    prisma.doctor.create({
      data: {
        name: '王拥军',
        gender: 'male',
        hospitalId: tiantan.id,
        departmentId: tiantan_shenjingneike!.id,
        title: 'chief',
        level: 'expert',
        specialties: ['脑血管病', '卒中', '脑梗死', '脑出血'],
        introduction: '首都医科大学附属北京天坛医院院长，国家神经系统疾病临床医学研究中心主任，脑血管病领域国际知名专家。',
        education: '首都医科大学博士',
        experience: '35年',
        rating: 5.0,
        consultCount: 3892,
        reviewCount: 1234,
      },
    }),
    prisma.doctor.create({
      data: {
        name: '江涛',
        gender: 'male',
        hospitalId: tiantan.id,
        departmentId: tiantan_shenjingzhongliuwaike!.id,
        title: 'chief',
        level: 'expert',
        specialties: ['脑胶质瘤', '脑膜瘤', '垂体瘤', '颅底肿瘤'],
        introduction: '北京天坛医院神经外科主任医师，脑肿瘤手术专家，年手术量超过500台，在脑胶质瘤诊治方面国内领先。',
        education: '首都医科大学博士',
        experience: '28年',
        rating: 4.9,
        consultCount: 2567,
        reviewCount: 823,
      },
    }),

    // ========== 301医院医生 ==========
    prisma.doctor.create({
      data: {
        name: '唐佩福',
        gender: 'male',
        hospitalId: h301.id,
        departmentId: h301_guke!.id,
        title: 'chief',
        level: 'expert',
        specialties: ['骨折', '关节置换', '脊柱外科', '运动损伤'],
        introduction: '解放军总医院骨科主任医师，全军骨科研究所所长，在复杂骨折、关节置换手术方面经验丰富。',
        education: '第四军医大学博士',
        experience: '32年',
        rating: 4.9,
        consultCount: 2345,
        reviewCount: 756,
      },
    }),
    prisma.doctor.create({
      data: {
        name: '杨仕明',
        gender: 'male',
        hospitalId: h301.id,
        departmentId: h301_erbihou!.id,
        title: 'chief',
        level: 'expert',
        specialties: ['人工耳蜗', '耳聋', '中耳炎', '耳鸣'],
        introduction: '解放军总医院耳鼻咽喉头颈外科主任，全军耳鼻咽喉头颈外科中心主任，人工耳蜗植入手术专家。',
        education: '解放军医学院博士',
        experience: '30年',
        rating: 5.0,
        consultCount: 1876,
        reviewCount: 567,
      },
    }),

    // ========== 阜外医院医生 ==========
    prisma.doctor.create({
      data: {
        name: '乔树宾',
        gender: 'male',
        hospitalId: fuwai.id,
        departmentId: fuwai_guanxinbing!.id,
        title: 'chief',
        level: 'expert',
        specialties: ['冠心病介入', '心肌梗死', '心绞痛', '支架植入'],
        introduction: '中国医学科学院阜外医院冠心病诊治中心主任，冠心病介入治疗专家，年介入手术量超过1000台。',
        education: '北京协和医学院博士',
        experience: '28年',
        rating: 4.9,
        consultCount: 3234,
        reviewCount: 1023,
      },
    }),
    prisma.doctor.create({
      data: {
        name: '胡盛寿',
        gender: 'male',
        hospitalId: fuwai.id,
        departmentId: fuwai_xinzangyizhi!.id,
        title: 'chief',
        level: 'expert',
        specialties: ['心脏移植', '冠脉搭桥', '瓣膜置换', '先心病'],
        introduction: '中国医学科学院阜外医院院长，中国工程院院士，心脏外科顶级专家，心脏移植手术量全国领先。',
        education: '中国协和医科大学博士',
        experience: '38年',
        rating: 5.0,
        consultCount: 4567,
        reviewCount: 1456,
      },
    }),

    // ========== 积水潭医院医生 ==========
    prisma.doctor.create({
      data: {
        name: '王满宜',
        gender: 'male',
        hospitalId: jishuitan.id,
        departmentId: jishuitan_chuangguke!.id,
        title: 'chief',
        level: 'expert',
        specialties: ['复杂骨折', '骨盆骨折', '髋臼骨折', '创伤骨科'],
        introduction: '北京积水潭医院创伤骨科主任医师，创伤骨科专家，在复杂骨盆骨折、髋臼骨折手术方面国内领先。',
        education: '首都医科大学博士',
        experience: '32年',
        rating: 4.9,
        consultCount: 2678,
        reviewCount: 845,
      },
    }),
    prisma.doctor.create({
      data: {
        name: '王雪松',
        gender: 'male',
        hospitalId: jishuitan.id,
        departmentId: jishuitan_yundongyixue!.id,
        title: 'chief',
        level: 'expert',
        specialties: ['运动损伤', '膝关节镜', '肩关节镜', 'ACL重建'],
        introduction: '北京积水潭医院运动医学科主任，运动损伤诊治专家，多次担任国家队医疗保障工作。',
        education: '北京大学医学部博士',
        experience: '25年',
        rating: 4.8,
        consultCount: 1987,
        reviewCount: 623,
      },
    }),

    // ========== 同仁医院医生 ==========
    prisma.doctor.create({
      data: {
        name: '朱思泉',
        gender: 'male',
        hospitalId: tongren.id,
        departmentId: tongren_baineizhang!.id,
        title: 'chief',
        level: 'expert',
        specialties: ['白内障', '人工晶体植入', '复杂白内障', '高度近视'],
        introduction: '首都医科大学附属北京同仁医院白内障中心主任，白内障手术专家，年手术量超过3000台。',
        education: '首都医科大学博士',
        experience: '28年',
        rating: 4.9,
        consultCount: 4123,
        reviewCount: 1234,
      },
    }),
    prisma.doctor.create({
      data: {
        name: '龚树生',
        gender: 'male',
        hospitalId: tongren.id,
        departmentId: tongren_erke!.id,
        title: 'chief',
        level: 'expert',
        specialties: ['耳聋', '人工耳蜗', '中耳炎', '耳鸣'],
        introduction: '北京同仁医院耳科主任，耳科学专家，在耳聋诊治、人工耳蜗植入方面经验丰富。',
        education: '首都医科大学博士',
        experience: '30年',
        rating: 4.9,
        consultCount: 2345,
        reviewCount: 756,
      },
    }),

    // ========== 安贞医院医生 ==========
    prisma.doctor.create({
      data: {
        name: '聂绍平',
        gender: 'male',
        hospitalId: anzhen.id,
        departmentId: anzhen_guanxinbing!.id,
        title: 'chief',
        level: 'expert',
        specialties: ['冠心病', '心肌梗死', '介入治疗', '急性冠脉综合征'],
        introduction: '首都医科大学附属北京安贞医院急诊危重症中心主任，冠心病急救专家，在急性心肌梗死救治方面经验丰富。',
        education: '首都医科大学博士',
        experience: '28年',
        rating: 4.9,
        consultCount: 2567,
        reviewCount: 812,
      },
    }),
    prisma.doctor.create({
      data: {
        name: '孙立忠',
        gender: 'male',
        hospitalId: anzhen.id,
        departmentId: anzhen_daxueguan!.id,
        title: 'chief',
        level: 'expert',
        specialties: ['主动脉夹层', '主动脉瘤', '大血管手术', '心脏外科'],
        introduction: '北京安贞医院心脏外科中心主任，大血管外科专家，在主动脉夹层手术方面全国领先。',
        education: '首都医科大学博士',
        experience: '35年',
        rating: 5.0,
        consultCount: 3456,
        reviewCount: 1098,
      },
    }),

    // ========== 宣武医院医生 ==========
    prisma.doctor.create({
      data: {
        name: '贾建平',
        gender: 'male',
        hospitalId: xuanwu.id,
        departmentId: xuanwu_shenjingneike!.id,
        title: 'chief',
        level: 'expert',
        specialties: ['阿尔茨海默病', '帕金森病', '认知障碍', '神经退行性疾病'],
        introduction: '首都医科大学宣武医院神经内科主任，国家老年疾病临床医学研究中心主任，认知障碍领域国际知名专家。',
        education: '首都医科大学博士',
        experience: '35年',
        rating: 5.0,
        consultCount: 3789,
        reviewCount: 1156,
      },
    }),
    prisma.doctor.create({
      data: {
        name: '凌锋',
        gender: 'female',
        hospitalId: xuanwu.id,
        departmentId: xuanwu_shenjingwaike!.id,
        title: 'chief',
        level: 'expert',
        specialties: ['脑血管病', '颈动脉狭窄', '脑动脉瘤', '介入神经外科'],
        introduction: '首都医科大学宣武医院神经外科主任医师，介入神经外科专家，在脑血管病介入治疗方面经验丰富。',
        education: '法国巴黎第六大学博士',
        experience: '38年',
        rating: 5.0,
        consultCount: 2987,
        reviewCount: 923,
      },
    }),
  ]);

  console.log('✅ 医生创建完成');

  // 5. 创建服务分类和服务
  console.log('\n📦 正在创建服务分类和服务...');

  // 服务分类 - 扁平化设计纯色
  // isPinned: 置顶分类（最多2个席位，显示为左右并列大卡片）
  const serviceCategories = await Promise.all([
    // 置顶分类 1 - 陪诊服务（靛蓝色）
    prisma.serviceCategory.create({
      data: {
        name: '陪诊服务',
        icon: 'stethoscope',
        color: '#6366f1',
        description: '医院陪诊相关服务，包括门诊、住院、检查等全程陪同',
        isPinned: true,
        sort: 1,
        status: 'active',
      },
    }),
    // 置顶分类 2 - 跑腿服务（粉色）
    prisma.serviceCategory.create({
      data: {
        name: '跑腿服务',
        icon: 'truck',
        color: '#ec4899',
        description: '医疗相关跑腿代办，药品代购、病历代办等',
        isPinned: true,
        sort: 2,
        status: 'active',
      },
    }),
    // 非置顶分类 - 诊断服务（绿色）
    prisma.serviceCategory.create({
      data: {
        name: '诊断服务',
        icon: 'message-square',
        color: '#22c55e',
        description: '在线诊断咨询服务，提供专业医疗咨询',
        isPinned: false,
        sort: 3,
        status: 'active',
      },
    }),
    // 非置顶分类 - 酒店服务（天蓝色）
    prisma.serviceCategory.create({
      data: {
        name: '酒店服务',
        icon: 'building',
        color: '#0ea5e9',
        description: '医院周边住宿服务，方便就医住宿',
        isPinned: false,
        sort: 4,
        status: 'active',
      },
    }),
    // 非置顶分类 - 特色服务（橙色）
    prisma.serviceCategory.create({
      data: {
        name: '特色服务',
        icon: 'sparkles',
        color: '#f97316',
        description: '特色增值服务，满足个性化需求',
        isPinned: false,
        sort: 5,
        status: 'active',
      },
    }),
  ]);

  // 获取分类ID
  const [peizhen, zhenduan, paotui, jiudian, tese] = serviceCategories;

  // 创建服务
  await Promise.all([
    // 陪诊服务
    prisma.service.create({
      data: {
        categoryId: peizhen.id,
        name: '全程陪诊服务',
        description: '专业陪诊师从挂号到就医全程陪同，省时省心',
        price: 299,
        originalPrice: 399,
        unit: '次',
        duration: '4-6小时',
        serviceIncludes: [
          { text: '专业陪诊师全程陪同', icon: 'check' },
          { text: '协助挂号、取号、排队', icon: 'check' },
          { text: '引导就诊流程', icon: 'check' },
          { text: '代取检查报告', icon: 'check' },
          { text: '免费咨询3次', icon: 'phone' },
          { text: '服务报告1份', icon: 'file' },
        ],
        serviceNotes: [
          { title: '服务时间', content: '服务时间为预约当日8:00-17:00，超出时间按小时加收费用' },
          { title: '取消政策', content: '服务开始前24小时可免费取消，24小时内取消扣除50%费用' },
          { title: '特别说明', content: '本服务不包含挂号费、检查费等医疗费用，需由用户自行承担' },
        ],
        needPatient: true,
        needHospital: true,
        needDepartment: true,
        needAppointment: true,
        sort: 1,
        status: 'active',
        orderCount: 1256,
        rating: 98.5,
      },
    }),
    prisma.service.create({
      data: {
        categoryId: peizhen.id,
        name: '半日陪诊服务',
        description: '适合检查项目较少的患者，灵活高效',
        price: 199,
        originalPrice: 249,
        unit: '次',
        duration: '2-3小时',
        serviceIncludes: [
          { text: '陪诊师陪同就诊', icon: 'check' },
          { text: '协助挂号排队', icon: 'check' },
          { text: '引导检查流程', icon: 'check' },
        ],
        serviceNotes: [
          { title: '服务时间', content: '半日服务时长约2-3小时，适合上午或下午就诊' },
          { title: '适用场景', content: '简单复诊、单项检查、开药取药' },
        ],
        needPatient: true,
        needHospital: true,
        needAppointment: true,
        sort: 2,
        status: 'active',
        orderCount: 856,
        rating: 97.8,
      },
    }),

    // 诊断服务 - 在线问诊
    prisma.service.create({
      data: {
        categoryId: zhenduan.id,
        name: '在线问诊',
        description: '专业医生在线解答健康问题',
        price: 29,
        originalPrice: 49,
        unit: '次',
        serviceIncludes: [
          { text: '专业医生解答', icon: 'check' },
          { text: '图文/语音咨询', icon: 'check' },
          { text: '48小时内回复', icon: 'check' },
        ],
        serviceNotes: [
          { title: '服务说明', content: '在线问诊仅提供健康咨询，不能代替线下诊疗' },
        ],
        sort: 1,
        status: 'active',
        orderCount: 3256,
        rating: 96.8,
      },
    }),
    prisma.service.create({
      data: {
        categoryId: zhenduan.id,
        name: '报告解读',
        description: '专业医生帮您解读各类检查报告',
        price: 39,
        unit: '次',
        serviceIncludes: [
          { text: '专业医生解读', icon: 'check' },
          { text: '文字详细说明', icon: 'check' },
          { text: '后续建议指导', icon: 'check' },
        ],
        serviceNotes: [
          { title: '服务说明', content: '请上传清晰的报告照片，以便医生准确解读' },
        ],
        sort: 2,
        status: 'active',
        orderCount: 1892,
        rating: 97.5,
      },
    }),
    prisma.service.create({
      data: {
        categoryId: zhenduan.id,
        name: '健康咨询',
        description: '日常健康问题专业咨询',
        price: 19,
        unit: '次',
        serviceIncludes: [
          { text: '健康问题解答', icon: 'check' },
          { text: '生活方式建议', icon: 'check' },
        ],
        serviceNotes: [
          { title: '服务说明', content: '适合日常保健、饮食、运动等问题咨询' },
        ],
        sort: 3,
        status: 'active',
        orderCount: 2156,
        rating: 95.2,
      },
    }),

    // 跑腿服务 - 药品代购
    prisma.service.create({
      data: {
        categoryId: paotui.id,
        name: '药品代购',
        description: '代购医院及药店药品，送药上门',
        price: 39,
        unit: '次',
        serviceIncludes: [
          { text: '凭处方代为购药', icon: 'check' },
          { text: '核对药品信息', icon: 'check' },
          { text: '送药上门', icon: 'check' },
        ],
        serviceNotes: [
          { title: '服务说明', content: '处方药需提供有效处方，药费需自行承担' },
        ],
        needHospital: true,
        sort: 1,
        status: 'active',
        orderCount: 1567,
        rating: 98.2,
      },
    }),
    prisma.service.create({
      data: {
        categoryId: paotui.id,
        name: '病历代办',
        description: '代办复印病历、办理出院手续等',
        price: 49,
        unit: '次',
        serviceIncludes: [
          { text: '代办病历复印', icon: 'check' },
          { text: '代办出院手续', icon: 'check' },
          { text: '资料整理归档', icon: 'check' },
        ],
        serviceNotes: [
          { title: '服务说明', content: '需提供患者授权和相关证件信息' },
        ],
        needHospital: true,
        sort: 2,
        status: 'active',
        orderCount: 823,
        rating: 97.8,
      },
    }),
    prisma.service.create({
      data: {
        categoryId: paotui.id,
        name: '预约代办',
        description: '代办各类医院预约挂号',
        price: 29,
        unit: '次',
        serviceIncludes: [
          { text: '专人代为预约', icon: 'check' },
          { text: '预约成功通知', icon: 'check' },
          { text: '就诊指引', icon: 'check' },
        ],
        serviceNotes: [
          { title: '服务说明', content: '代办普通号、专家号，具体号源以医院实际为准' },
        ],
        needHospital: true,
        needDepartment: true,
        sort: 3,
        status: 'active',
        orderCount: 2456,
        rating: 96.5,
      },
    }),

    // 酒店服务 - 医院酒店
    prisma.service.create({
      data: {
        categoryId: jiudian.id,
        name: '医院酒店',
        description: '医院周边优选酒店预订',
        price: 199,
        originalPrice: 299,
        unit: '晚',
        serviceIncludes: [
          { text: '优选医院周边酒店', icon: 'check' },
          { text: '就医接送服务', icon: 'check' },
          { text: '24小时管家服务', icon: 'check' },
        ],
        serviceNotes: [
          { title: '服务说明', content: '提供医院周边500米内优选酒店' },
        ],
        needHospital: true,
        needAppointment: true,
        sort: 1,
        status: 'active',
        orderCount: 567,
        rating: 98.5,
      },
    }),
    prisma.service.create({
      data: {
        categoryId: jiudian.id,
        name: '康养公寓',
        description: '术后康养短租公寓',
        price: 299,
        unit: '晚',
        serviceIncludes: [
          { text: '独立康养公寓', icon: 'check' },
          { text: '专业护理人员', icon: 'check' },
          { text: '营养餐配送', icon: 'check' },
        ],
        serviceNotes: [
          { title: '服务说明', content: '适合术后康复期患者及家属' },
        ],
        needAppointment: true,
        sort: 2,
        status: 'active',
        orderCount: 234,
        rating: 99.2,
      },
    }),
    prisma.service.create({
      data: {
        categoryId: jiudian.id,
        name: '家属住宿',
        description: '陪护家属经济住宿',
        price: 99,
        unit: '晚',
        serviceIncludes: [
          { text: '经济舒适住宿', icon: 'check' },
          { text: '步行可达医院', icon: 'check' },
          { text: '行李寄存', icon: 'check' },
        ],
        serviceNotes: [
          { title: '服务说明', content: '经济型住宿，适合陪护家属' },
        ],
        needHospital: true,
        needAppointment: true,
        sort: 3,
        status: 'active',
        orderCount: 892,
        rating: 96.8,
      },
    }),

    // 特色服务 - 医疗翻译
    prisma.service.create({
      data: {
        categoryId: tese.id,
        name: '医疗翻译',
        description: '专业医疗翻译陪同就医',
        price: 499,
        unit: '次',
        serviceIncludes: [
          { text: '专业医疗翻译', icon: 'check' },
          { text: '全程陪同就医', icon: 'check' },
          { text: '病历翻译服务', icon: 'check' },
        ],
        serviceNotes: [
          { title: '服务说明', content: '支持英语、日语、韩语等主要语种' },
        ],
        needHospital: true,
        needAppointment: true,
        sort: 1,
        status: 'active',
        orderCount: 156,
        rating: 99.5,
      },
    }),
    prisma.service.create({
      data: {
        categoryId: tese.id,
        name: '心理疏导',
        description: '专业心理咨询师疏导服务',
        price: 199,
        unit: '次',
        serviceIncludes: [
          { text: '专业心理咨询', icon: 'check' },
          { text: '情绪疏导', icon: 'check' },
          { text: '私密保护', icon: 'check' },
        ],
        serviceNotes: [
          { title: '服务说明', content: '适合就医焦虑、术前紧张等情况' },
        ],
        needAppointment: true,
        sort: 2,
        status: 'active',
        orderCount: 423,
        rating: 98.8,
      },
    }),
    prisma.service.create({
      data: {
        categoryId: tese.id,
        name: '营养指导',
        description: '专业营养师膳食指导',
        price: 99,
        unit: '次',
        serviceIncludes: [
          { text: '专业营养评估', icon: 'check' },
          { text: '个性化食谱', icon: 'check' },
          { text: '饮食建议指导', icon: 'check' },
        ],
        serviceNotes: [
          { title: '服务说明', content: '适合术后康复、慢病管理等人群' },
        ],
        sort: 3,
        status: 'active',
        orderCount: 567,
        rating: 97.6,
      },
    }),

    // 陪诊服务 - 门诊陪诊（新增）
    prisma.service.create({
      data: {
        categoryId: peizhen.id,
        name: '门诊陪诊',
        description: '门诊就医全程陪同服务',
        price: 199,
        originalPrice: 249,
        unit: '次',
        duration: '3-4小时',
        serviceIncludes: [
          { text: '门诊全程陪同', icon: 'check' },
          { text: '协助挂号取号', icon: 'check' },
          { text: '引导就诊流程', icon: 'check' },
        ],
        serviceNotes: [
          { title: '服务说明', content: '适合门诊复诊、专家门诊等场景' },
        ],
        needPatient: true,
        needHospital: true,
        needDepartment: true,
        needAppointment: true,
        sort: 3,
        status: 'active',
        orderCount: 1567,
        rating: 98.2,
      },
    }),
    prisma.service.create({
      data: {
        categoryId: peizhen.id,
        name: '住院陪护',
        description: '住院期间全程陪护服务',
        price: 399,
        unit: '天',
        serviceIncludes: [
          { text: '24小时专人陪护', icon: 'check' },
          { text: '协助日常护理', icon: 'check' },
          { text: '及时反馈病情', icon: 'check' },
        ],
        serviceNotes: [
          { title: '服务说明', content: '住院期间全天候陪护服务' },
        ],
        needPatient: true,
        needHospital: true,
        needAppointment: true,
        sort: 4,
        status: 'active',
        orderCount: 892,
        rating: 99.1,
      },
    }),
    prisma.service.create({
      data: {
        categoryId: peizhen.id,
        name: '检查陪同',
        description: '各类检查项目全程陪同',
        price: 149,
        unit: '次',
        serviceIncludes: [
          { text: '检查全程陪同', icon: 'check' },
          { text: '排队代候', icon: 'check' },
          { text: '结果代取', icon: 'check' },
        ],
        serviceNotes: [
          { title: '服务说明', content: '适合CT、MRI、胃肠镜等检查项目' },
        ],
        needPatient: true,
        needHospital: true,
        needAppointment: true,
        sort: 5,
        status: 'active',
        orderCount: 1234,
        rating: 97.8,
      },
    }),

  ]);

  console.log('✅ 服务分类和服务创建完成');

  // 5. 创建轮播图
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

  // 6. 创建陪诊员数据
  console.log('\n👥 正在创建陪诊员数据...');

  const escorts = await Promise.all([
    prisma.escort.create({
      data: {
        name: '张晓红',
        gender: 'female',
        phone: '13800138001',
        cityCode: '110100',
        level: 'senior',
        experience: '8年',
        introduction: '从事医疗陪诊服务8年，熟悉北京各大三甲医院就诊流程，服务过上千位患者，深受好评。',
        tags: ['耐心细致', '经验丰富', '三甲医院专家'],
        rating: 4.9,
        orderCount: 1258,
        status: 'active',
        workStatus: 'working',
      },
    }),
    prisma.escort.create({
      data: {
        name: '李明华',
        gender: 'male',
        phone: '13800138002',
        cityCode: '110100',
        level: 'senior',
        experience: '6年',
        introduction: '专注肿瘤科陪诊，对北京肿瘤医院、中国医学科学院肿瘤医院非常熟悉。',
        tags: ['肿瘤科专家', '24小时服务', '住院陪护'],
        rating: 4.8,
        orderCount: 876,
        status: 'active',
        workStatus: 'working',
      },
    }),
    prisma.escort.create({
      data: {
        name: '王芳',
        gender: 'female',
        phone: '13800138003',
        cityCode: '110100',
        level: 'intermediate',
        experience: '4年',
        introduction: '擅长儿科陪诊，有爱心，善于与小朋友沟通，让看病不再可怕。',
        tags: ['儿科专长', '亲和力强', '细心周到'],
        rating: 4.7,
        orderCount: 542,
        status: 'active',
        workStatus: 'resting',
      },
    }),
    prisma.escort.create({
      data: {
        name: '陈志强',
        gender: 'male',
        phone: '13800138004',
        cityCode: '110100',
        level: 'intermediate',
        experience: '3年',
        introduction: '退伍军人，责任心强，擅长老年患者陪护。',
        tags: ['老年护理', '责任心强', '力量型服务'],
        rating: 4.6,
        orderCount: 328,
        status: 'active',
        workStatus: 'busy',
      },
    }),
    prisma.escort.create({
      data: {
        name: '刘婷婷',
        gender: 'female',
        phone: '13800138005',
        cityCode: '110100',
        level: 'junior',
        experience: '2年',
        introduction: '护理专业毕业，持有护士资格证，专业素养高。',
        tags: ['护理专业', '持证上岗', '年轻活力'],
        rating: 4.5,
        orderCount: 186,
        status: 'active',
        workStatus: 'working',
      },
    }),
    prisma.escort.create({
      data: {
        name: '赵伟',
        gender: 'male',
        phone: '13800138006',
        cityCode: '110100',
        level: 'junior',
        experience: '1年',
        introduction: '认真负责，服务态度好，正在快速成长中。',
        tags: ['态度好', '守时', '学习能力强'],
        rating: 4.3,
        orderCount: 87,
        status: 'active',
        workStatus: 'resting',
      },
    }),
    prisma.escort.create({
      data: {
        name: '孙丽',
        gender: 'female',
        phone: '13800138007',
        cityCode: '110100',
        level: 'trainee',
        experience: '半年',
        introduction: '实习陪诊员，热情学习中。',
        tags: ['新人', '热情'],
        rating: 4.0,
        orderCount: 25,
        status: 'active',
        workStatus: 'resting',
      },
    }),
    prisma.escort.create({
      data: {
        name: '周强',
        gender: 'male',
        phone: '13800138008',
        cityCode: '110100',
        level: 'senior',
        experience: '10年',
        introduction: '资深陪诊员，曾任医院护工组长，对医院运作非常了解。',
        tags: ['资深专家', '全科服务', 'VIP专属'],
        rating: 5.0,
        orderCount: 2156,
        status: 'active',
        workStatus: 'busy',
      },
    }),
    prisma.escort.create({
      data: {
        name: '吴敏',
        gender: 'female',
        phone: '13800138009',
        cityCode: '110100',
        level: 'intermediate',
        experience: '5年',
        introduction: '妇产科陪诊专家，陪伴过上百位准妈妈完成产检和分娩。',
        tags: ['妇产科', '产检陪同', '温柔体贴'],
        rating: 4.8,
        orderCount: 623,
        status: 'active',
        workStatus: 'working',
      },
    }),
    prisma.escort.create({
      data: {
        name: '郑涛',
        gender: 'male',
        phone: '13800138010',
        cityCode: '110100',
        level: 'intermediate',
        experience: '4年',
        introduction: '骨科陪诊专长，熟悉骨科检查和手术流程。',
        tags: ['骨科专长', '手术陪护', '康复指导'],
        rating: 4.6,
        orderCount: 412,
        status: 'inactive', // 暂停服务
        workStatus: 'resting',
      },
    }),
  ]);

  // 关联陪诊员和医院
  // 张晓红 - 协和、北大一院
  await Promise.all([
    prisma.escortHospital.create({
      data: { escortId: escorts[0].id, hospitalId: xiehe.id, familiarDepts: JSON.stringify(['内科', '外科']) },
    }),
    prisma.escortHospital.create({
      data: { escortId: escorts[0].id, hospitalId: beiyiyuan.id, familiarDepts: JSON.stringify(['心内科']) },
    }),
  ]);

  // 李明华 - 天坛、安贞
  await Promise.all([
    prisma.escortHospital.create({
      data: { escortId: escorts[1].id, hospitalId: tiantan.id, familiarDepts: JSON.stringify(['神经内科', '神经外科']) },
    }),
    prisma.escortHospital.create({
      data: { escortId: escorts[1].id, hospitalId: anzhen.id, familiarDepts: JSON.stringify(['心内科']) },
    }),
  ]);

  // 王芳 - 同仁、宣武
  await Promise.all([
    prisma.escortHospital.create({
      data: { escortId: escorts[2].id, hospitalId: tongren.id, familiarDepts: JSON.stringify(['眼科', '耳鼻喉科']) },
    }),
    prisma.escortHospital.create({
      data: { escortId: escorts[2].id, hospitalId: xuanwu.id, familiarDepts: JSON.stringify(['神经内科']) },
    }),
  ]);

  // 陈志强 - 301医院
  await prisma.escortHospital.create({
    data: { escortId: escorts[3].id, hospitalId: h301.id, familiarDepts: JSON.stringify(['骨科', '康复医学科']) },
  });

  // 周强 - 多家医院 (资深，熟悉多家)
  await Promise.all([
    prisma.escortHospital.create({
      data: { escortId: escorts[7].id, hospitalId: xiehe.id, familiarDepts: JSON.stringify(['全科']) },
    }),
    prisma.escortHospital.create({
      data: { escortId: escorts[7].id, hospitalId: beiyiyuan.id },
    }),
    prisma.escortHospital.create({
      data: { escortId: escorts[7].id, hospitalId: beisanyuan.id, familiarDepts: JSON.stringify(['骨科']) },
    }),
    prisma.escortHospital.create({
      data: { escortId: escorts[7].id, hospitalId: h301.id },
    }),
  ]);

  // 吴敏 - 北医三院 (妇产科)
  await prisma.escortHospital.create({
    data: { escortId: escorts[8].id, hospitalId: beisanyuan.id, familiarDepts: JSON.stringify(['妇产科', '产科']) },
  });

  // 郑涛 - 积水潭 (骨科)
  await prisma.escortHospital.create({
    data: { escortId: escorts[9].id, hospitalId: jishuitan.id, familiarDepts: JSON.stringify(['骨科', '脊柱外科']) },
  });

  console.log('✅ 陪诊员数据创建完成');

  // 统计
  const hospitalCount = await prisma.hospital.count();
  const departmentCount = await prisma.department.count();
  const topLevelDepts = await prisma.department.count({ where: { parentId: null } });
  const subDepts = await prisma.department.count({ where: { NOT: { parentId: null } } });

  const templateCount = await prisma.departmentTemplate.count();
  const topLevelTemplates = await prisma.departmentTemplate.count({ where: { parentId: null } });
  const subTemplates = await prisma.departmentTemplate.count({ where: { NOT: { parentId: null } } });

  const categoryCount = await prisma.serviceCategory.count();
  const serviceCount = await prisma.service.count();
  const doctorCount = await prisma.doctor.count();
  const escortCount = await prisma.escort.count();
  const activeEscorts = await prisma.escort.count({ where: { status: 'active' } });
  const workingEscorts = await prisma.escort.count({ where: { workStatus: 'working' } });

  console.log('\n📊 数据统计:');
  console.log(`   科室库: ${templateCount} 个 (一级: ${topLevelTemplates}, 二级: ${subTemplates})`);
  console.log(`   医院: ${hospitalCount} 家`);
  console.log(`   医院科室: ${departmentCount} 个`);
  console.log(`   - 一级科室: ${topLevelDepts} 个`);
  console.log(`   - 二级科室: ${subDepts} 个`);
  console.log(`   医生: ${doctorCount} 位`);
  console.log(`   服务分类: ${categoryCount} 个`);
  console.log(`   服务项目: ${serviceCount} 个`);
  console.log(`   陪诊员: ${escortCount} 人 (在岗: ${activeEscorts}, 接单中: ${workingEscorts})`);

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
