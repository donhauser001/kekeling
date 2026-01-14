/**
 * 文章种子数据
 * 运行: npx ts-node prisma/seed-articles.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 开始插入文章种子数据...')

  // 1. 首先创建文章分类
  const categories = await Promise.all([
    prisma.articleCategory.upsert({
      where: { slug: 'news' },
      update: {},
      create: {
        name: '新闻动态',
        slug: 'news',
        description: '科科灵最新动态和行业资讯',
        icon: 'newspaper',
        sort: 1,
        status: 'active',
      },
    }),
    prisma.articleCategory.upsert({
      where: { slug: 'health' },
      update: {},
      create: {
        name: '健康知识',
        slug: 'health',
        description: '实用的健康养生知识和就医指南',
        icon: 'heart-pulse',
        sort: 2,
        status: 'active',
      },
    }),
    prisma.articleCategory.upsert({
      where: { slug: 'guide' },
      update: {},
      create: {
        name: '就医指南',
        slug: 'guide',
        description: '医院就诊流程和注意事项',
        icon: 'map',
        sort: 3,
        status: 'active',
      },
    }),
  ])

  const [newsCategory, healthCategory, guideCategory] = categories
  console.log('✅ 分类创建完成')

  // 2. 创建文章
  const articles = [
    // 新闻动态
    {
      categoryId: newsCategory.id,
      title: '科科灵陪诊服务正式上线，让就医不再孤单',
      slug: 'kekeling-launch-announcement',
      summary: '科科灵陪诊平台今日正式上线，致力于为广大患者提供专业、贴心的医院陪诊服务，让每一位患者在就医过程中都能感受到温暖和关怀。',
      content: `
        <h2>科科灵陪诊服务正式上线</h2>
        <p>在医疗资源日益紧张的今天，很多患者在就医过程中面临着排队难、流程复杂、沟通不畅等问题。尤其是老年人、异地就医患者、以及需要特殊照顾的病患，更是倍感困难。</p>
        
        <h3>我们的服务理念</h3>
        <p>科科灵陪诊平台应运而生，我们秉承"让就医不再孤单"的理念，为每一位有需要的患者提供专业、贴心的陪诊服务。</p>
        
        <h3>核心服务内容</h3>
        <ul>
          <li><strong>全程陪诊</strong>：从挂号到取药，全程陪同，省心省力</li>
          <li><strong>代办服务</strong>：代取报告、代办病历、代购药品</li>
          <li><strong>预约协助</strong>：协助预约专家号、检查项目</li>
          <li><strong>翻译陪同</strong>：为外地患者提供方言翻译服务</li>
        </ul>
        
        <h3>专业陪诊团队</h3>
        <p>我们的陪诊员均经过严格筛选和专业培训，熟悉各大医院的就诊流程，能够为患者提供高效、贴心的陪诊服务。</p>
        
        <p>科科灵，让每一次就医都充满温暖！</p>
      `,
      coverImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800',
      author: '科科灵官方',
      tags: ['上线公告', '陪诊服务', '新闻'],
      viewCount: 1520,
      isTop: true,
      isHot: true,
      status: 'published',
      publishedAt: new Date('2024-12-01'),
    },
    {
      categoryId: newsCategory.id,
      title: '科科灵与多家三甲医院达成战略合作',
      slug: 'hospital-partnership-news',
      summary: '近日，科科灵陪诊平台与本市多家三甲医院签署战略合作协议，将为更多患者提供便捷的陪诊服务。',
      content: `
        <h2>强强联合，服务升级</h2>
        <p>为了给患者提供更加便捷、高效的陪诊服务，科科灵近日与本市多家知名三甲医院达成战略合作。</p>
        
        <h3>合作医院名单</h3>
        <ul>
          <li>市第一人民医院</li>
          <li>市中心医院</li>
          <li>省人民医院</li>
          <li>市妇幼保健院</li>
          <li>市中医院</li>
        </ul>
        
        <h3>合作内容</h3>
        <p>本次合作将在以下方面展开深入合作：</p>
        <ol>
          <li>建立绿色通道，优化就诊流程</li>
          <li>共享医疗资源，提升服务效率</li>
          <li>联合培训陪诊员，提高服务质量</li>
          <li>开展健康宣教活动</li>
        </ol>
        
        <p>未来，科科灵将继续拓展合作医院范围，为更多患者带来便利。</p>
      `,
      coverImage: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800',
      author: '科科灵官方',
      tags: ['合作', '三甲医院', '新闻'],
      viewCount: 890,
      isHot: true,
      status: 'published',
      publishedAt: new Date('2024-12-10'),
    },
    {
      categoryId: newsCategory.id,
      title: '科科灵获得A轮融资，加速布局全国市场',
      slug: 'series-a-funding',
      summary: '科科灵陪诊平台宣布完成A轮融资，将用于技术升级、团队扩充和全国市场拓展。',
      content: `
        <h2>资本助力，未来可期</h2>
        <p>科科灵陪诊平台今日宣布完成A轮融资，本轮融资由知名投资机构领投，老股东跟投。</p>
        
        <h3>融资用途</h3>
        <ul>
          <li>技术平台升级，提升用户体验</li>
          <li>扩充陪诊员团队，覆盖更多医院</li>
          <li>拓展全国重点城市市场</li>
          <li>加强品牌建设和市场推广</li>
        </ul>
        
        <h3>发展规划</h3>
        <p>科科灵计划在未来一年内：</p>
        <ol>
          <li>覆盖全国30个重点城市</li>
          <li>合作医院突破500家</li>
          <li>陪诊员团队扩展至5000人</li>
          <li>服务用户突破100万</li>
        </ol>
        
        <p>感谢所有用户的支持与信任，科科灵将继续努力，为大家提供更好的服务！</p>
      `,
      coverImage: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800',
      author: '科科灵官方',
      tags: ['融资', '发展', '新闻'],
      viewCount: 2100,
      status: 'published',
      publishedAt: new Date('2024-12-15'),
    },

    // 健康知识
    {
      categoryId: healthCategory.id,
      title: '冬季养生：这些习惯让你远离感冒',
      slug: 'winter-health-tips',
      summary: '冬季是感冒高发季节，掌握正确的养生方法，可以有效预防感冒，保持身体健康。',
      content: `
        <h2>冬季养生要点</h2>
        <p>冬季天气寒冷，是各种呼吸道疾病的高发期。以下养生建议可以帮助您安然度过寒冬。</p>
        
        <h3>一、保暖很重要</h3>
        <ul>
          <li>注意头部、颈部、脚部保暖</li>
          <li>室内温度保持在18-22°C</li>
          <li>出门佩戴帽子、围巾</li>
        </ul>
        
        <h3>二、饮食调理</h3>
        <ul>
          <li>多喝温水，保持身体水分</li>
          <li>适量食用姜、蒜等温性食物</li>
          <li>多吃富含维生素C的水果蔬菜</li>
          <li>适当进补，如羊肉、牛肉等</li>
        </ul>
        
        <h3>三、适度运动</h3>
        <p>冬季也要保持适度运动，可以选择：</p>
        <ul>
          <li>室内瑜伽、健身操</li>
          <li>阳光充足时户外散步</li>
          <li>太极拳、八段锦等传统养生运动</li>
        </ul>
        
        <h3>四、作息规律</h3>
        <p>冬季应早睡晚起，保证充足睡眠，增强免疫力。</p>
        
        <blockquote>
          <p>温馨提示：如果出现发热、咳嗽等症状，请及时就医，科科灵可为您提供专业的陪诊服务。</p>
        </blockquote>
      `,
      coverImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
      author: '健康小编',
      tags: ['冬季养生', '预防感冒', '健康知识'],
      viewCount: 3200,
      isHot: true,
      status: 'published',
      publishedAt: new Date('2024-12-05'),
    },
    {
      categoryId: healthCategory.id,
      title: '体检报告怎么看？专家教你读懂关键指标',
      slug: 'how-to-read-health-report',
      summary: '很多人拿到体检报告一头雾水，本文将教您如何读懂体检报告中的关键指标，及时发现健康隐患。',
      content: `
        <h2>体检报告解读指南</h2>
        <p>每年的健康体检是了解自身健康状况的重要途径，但很多人拿到体检报告后却不知如何解读。下面为大家详细讲解几个关键指标。</p>
        
        <h3>血常规检查</h3>
        <ul>
          <li><strong>白细胞（WBC）</strong>：正常值4-10×10⁹/L，偏高可能有感染</li>
          <li><strong>红细胞（RBC）</strong>：男性4.5-5.5×10¹²/L，女性4.0-5.0×10¹²/L</li>
          <li><strong>血红蛋白（Hb）</strong>：男性120-160g/L，女性110-150g/L</li>
          <li><strong>血小板（PLT）</strong>：100-300×10⁹/L</li>
        </ul>
        
        <h3>肝功能检查</h3>
        <ul>
          <li><strong>谷丙转氨酶（ALT）</strong>：正常值0-40U/L</li>
          <li><strong>谷草转氨酶（AST）</strong>：正常值0-40U/L</li>
          <li>转氨酶升高可能提示肝脏损伤</li>
        </ul>
        
        <h3>血脂检查</h3>
        <ul>
          <li><strong>总胆固醇（TC）</strong>：< 5.2mmol/L</li>
          <li><strong>甘油三酯（TG）</strong>：< 1.7mmol/L</li>
          <li><strong>低密度脂蛋白（LDL-C）</strong>：< 3.4mmol/L</li>
          <li><strong>高密度脂蛋白（HDL-C）</strong>：> 1.0mmol/L</li>
        </ul>
        
        <h3>血糖检查</h3>
        <ul>
          <li><strong>空腹血糖</strong>：3.9-6.1mmol/L</li>
          <li>6.1-7.0为糖尿病前期</li>
          <li>≥7.0需进一步检查</li>
        </ul>
        
        <blockquote>
          <p>建议：如有指标异常，建议及时就医咨询专科医生。科科灵可提供报告解读和陪诊服务。</p>
        </blockquote>
      `,
      coverImage: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800',
      author: '健康小编',
      tags: ['体检报告', '健康指标', '医学知识'],
      viewCount: 4500,
      isTop: true,
      status: 'published',
      publishedAt: new Date('2024-12-08'),
    },
    {
      categoryId: healthCategory.id,
      title: '老年人常见慢性病的日常管理',
      slug: 'elderly-chronic-disease-management',
      summary: '高血压、糖尿病、冠心病是老年人常见的慢性病，科学的日常管理对控制病情至关重要。',
      content: `
        <h2>慢性病日常管理要点</h2>
        <p>随着年龄增长，很多老年人会患上一种或多种慢性病。科学的日常管理可以有效控制病情，提高生活质量。</p>
        
        <h3>高血压管理</h3>
        <ul>
          <li>每日定时测量血压，记录血压变化</li>
          <li>按时服药，不要自行停药或减量</li>
          <li>低盐低脂饮食，每日盐摄入<6g</li>
          <li>戒烟限酒，保持心情舒畅</li>
          <li>适度运动，控制体重</li>
        </ul>
        
        <h3>糖尿病管理</h3>
        <ul>
          <li>定期监测血糖，建议每周至少测3次</li>
          <li>控制饮食，少食多餐</li>
          <li>主食选择粗粮杂粮</li>
          <li>规律运动，餐后散步30分钟</li>
          <li>定期检查眼底、肾功能等</li>
        </ul>
        
        <h3>冠心病管理</h3>
        <ul>
          <li>随身携带急救药物（如硝酸甘油）</li>
          <li>避免剧烈运动和情绪激动</li>
          <li>定期复查心电图、心脏彩超</li>
          <li>注意天气变化，注意保暖</li>
        </ul>
        
        <h3>就医建议</h3>
        <p>慢性病患者应定期复诊，一般建议每1-3个月复查一次。如需陪同就医，可预约科科灵陪诊服务。</p>
      `,
      coverImage: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800',
      author: '健康小编',
      tags: ['慢性病', '老年健康', '日常管理'],
      viewCount: 2800,
      status: 'published',
      publishedAt: new Date('2024-12-12'),
    },

    // 就医指南
    {
      categoryId: guideCategory.id,
      title: '第一次去大医院看病，这份攻略请收好',
      slug: 'first-time-hospital-guide',
      summary: '第一次去大医院看病难免紧张，提前了解就诊流程和注意事项，可以让您的就医之旅更加顺利。',
      content: `
        <h2>大医院就诊全攻略</h2>
        <p>大医院科室多、人流量大，第一次去可能会感到无所适从。这份攻略帮您轻松应对。</p>
        
        <h3>就诊前准备</h3>
        <ol>
          <li><strong>提前预约挂号</strong>：通过医院官网、APP或电话预约</li>
          <li><strong>准备证件</strong>：身份证、医保卡、就诊卡</li>
          <li><strong>准备病历资料</strong>：既往病历、检查报告、用药清单</li>
          <li><strong>了解医院位置</strong>：提前查好交通路线和停车信息</li>
        </ol>
        
        <h3>就诊当天流程</h3>
        <ol>
          <li><strong>取号</strong>：到门诊大厅自助机或窗口取号</li>
          <li><strong>候诊</strong>：到相应诊区候诊，注意叫号</li>
          <li><strong>就诊</strong>：向医生描述病情，配合检查</li>
          <li><strong>缴费</strong>：自助机或窗口缴纳检查费用</li>
          <li><strong>检查</strong>：按指引到相应科室完成检查</li>
          <li><strong>取报告</strong>：等待检查结果</li>
          <li><strong>复诊</strong>：带报告回诊室，医生给出诊断和治疗方案</li>
          <li><strong>取药</strong>：到药房窗口取药</li>
        </ol>
        
        <h3>温馨提示</h3>
        <ul>
          <li>尽量避开周一上午等高峰时段</li>
          <li>空腹检查项目请勿进食</li>
          <li>穿宽松舒适的衣服便于检查</li>
          <li>保持手机畅通，关注叫号信息</li>
        </ul>
        
        <blockquote>
          <p>如果您对就医流程不熟悉，可以预约科科灵陪诊员全程陪同，让您省心省力。</p>
        </blockquote>
      `,
      coverImage: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800',
      author: '就医指南编辑',
      tags: ['就医攻略', '医院', '新手指南'],
      viewCount: 5600,
      isTop: true,
      isHot: true,
      status: 'published',
      publishedAt: new Date('2024-12-03'),
    },
    {
      categoryId: guideCategory.id,
      title: '医保报销全攻略：这些费用可以报销',
      slug: 'medical-insurance-guide',
      summary: '医保报销政策复杂，很多人不清楚哪些费用可以报销。本文详细介绍医保报销的相关知识。',
      content: `
        <h2>医保报销指南</h2>
        <p>医疗保险是我们重要的健康保障，了解医保报销政策可以帮助我们更好地利用这一福利。</p>
        
        <h3>门诊报销</h3>
        <ul>
          <li>挂号费：部分地区可报销</li>
          <li>诊查费：可报销</li>
          <li>检查费：医保目录内可报销</li>
          <li>药品费：医保目录内可报销</li>
          <li>治疗费：医保目录内可报销</li>
        </ul>
        
        <h3>住院报销</h3>
        <ul>
          <li>起付线：各地标准不同，一般为几百到一千元</li>
          <li>报销比例：一般为70%-90%不等</li>
          <li>封顶线：年度最高报销限额</li>
        </ul>
        
        <h3>这些费用不能报销</h3>
        <ul>
          <li>非医保定点医院的费用</li>
          <li>医保目录外的药品和检查</li>
          <li>美容整形类项目</li>
          <li>交通事故、工伤等应由第三方支付的费用</li>
        </ul>
        
        <h3>报销流程</h3>
        <ol>
          <li>持医保卡就医，直接结算</li>
          <li>异地就医需先备案，再结算</li>
          <li>未直接结算的，保留票据到医保中心报销</li>
        </ol>
        
        <p>如有医保报销相关疑问，可咨询当地医保部门或科科灵客服。</p>
      `,
      coverImage: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800',
      author: '就医指南编辑',
      tags: ['医保', '报销', '政策'],
      viewCount: 3800,
      status: 'published',
      publishedAt: new Date('2024-12-07'),
    },
    {
      categoryId: guideCategory.id,
      title: '外地就医必看：异地就医备案全流程',
      slug: 'cross-region-medical-guide',
      summary: '异地就医备案是享受医保待遇的前提，本文详细介绍异地就医备案的流程和注意事项。',
      content: `
        <h2>异地就医备案指南</h2>
        <p>随着人口流动，异地就医需求越来越大。做好异地就医备案，可以享受医保直接结算的便利。</p>
        
        <h3>哪些人需要备案</h3>
        <ul>
          <li>异地安置退休人员</li>
          <li>异地长期居住人员</li>
          <li>常驻异地工作人员</li>
          <li>异地转诊人员</li>
          <li>临时外出就医人员</li>
        </ul>
        
        <h3>备案渠道</h3>
        <ol>
          <li><strong>线上备案</strong>：国家医保服务平台APP、微信小程序</li>
          <li><strong>线下备案</strong>：参保地医保经办机构窗口</li>
          <li><strong>电话备案</strong>：拨打12333服务热线</li>
        </ol>
        
        <h3>备案所需材料</h3>
        <ul>
          <li>身份证</li>
          <li>医保卡或医保电子凭证</li>
          <li>异地居住证明（如有）</li>
          <li>转诊证明（转诊患者）</li>
        </ul>
        
        <h3>就医结算</h3>
        <p>备案成功后，在备案的异地定点医院：</p>
        <ul>
          <li>出示医保电子凭证或社保卡</li>
          <li>出院时直接结算，只需支付个人自付部分</li>
        </ul>
        
        <h3>注意事项</h3>
        <ul>
          <li>备案生效时间各地不同，建议提前办理</li>
          <li>急诊可先就医后补备案</li>
          <li>部分地区支持长期备案，无需每次重新办理</li>
        </ul>
        
        <blockquote>
          <p>外地就医人生地不熟？科科灵在多个城市都有陪诊服务，为您提供专业陪同。</p>
        </blockquote>
      `,
      coverImage: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800',
      author: '就医指南编辑',
      tags: ['异地就医', '医保备案', '跨省'],
      viewCount: 4200,
      isHot: true,
      status: 'published',
      publishedAt: new Date('2024-12-11'),
    },
  ]

  // 插入文章
  for (const article of articles) {
    await prisma.article.upsert({
      where: { slug: article.slug },
      update: article,
      create: article,
    })
  }

  console.log(`✅ 成功插入 ${articles.length} 篇文章`)
  console.log('🎉 种子数据插入完成！')
}

main()
  .catch((e) => {
    console.error('❌ 错误:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })







