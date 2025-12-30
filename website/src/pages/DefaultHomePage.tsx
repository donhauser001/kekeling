/**
 * 默认首页组件
 * 当没有设置首页页面时显示的静态内容
 */

import { Link } from 'react-router-dom'
import { useSite } from '@/context/SiteContext'

// 图标组件
function Icon({ name, className = '' }: { name: string; className?: string }) {
  return <i className={`iconfont icon-${name} ${className}`} />
}

// 服务数据
const services = [
  {
    icon: 'peoples',
    title: '门诊陪诊',
    description: '陪诊员全程陪同就医，协助挂号、排队、缴费、取药，让您省心省力',
    color: 'primary',
  },
  {
    icon: 'file-text',
    title: '四大代办',
    description: '代跑腿、代办复杂手续，让患者宝贵的精力只用于最关键的治疗和休息上，保持体面',
    color: 'emerald',
  },
  {
    icon: 'stethoscope',
    title: '肿瘤全程就诊管理',
    description: '针对肿瘤疾病患者，提供单家医院单次住院全程就诊管理服务',
    color: 'rose',
  },
  {
    icon: 'appointment',
    title: '非肿瘤全程就诊管理',
    description: '针对非肿瘤疾病患者，提供单家医院单次住院全程就诊管理服务',
    color: 'violet',
  },
  {
    icon: 'send',
    title: '全球来华医疗服务',
    description: '为海外患者提供端到端全流程就诊管理的一站式服务',
    color: 'amber',
  },
]

// 服务流程
const steps = [
  { step: '01', title: '选择服务', desc: '根据您的需求选择合适的陪诊服务类型' },
  { step: '02', title: '填写信息', desc: '填写就诊医院、时间及个人信息' },
  { step: '03', title: '确认订单', desc: '确认服务详情并完成支付' },
  { step: '04', title: '开始服务', desc: '陪诊员按时到达，开始贴心服务' },
]

// 为什么选择我们
const advantages = [
  {
    icon: 'shield',
    title: '安全保障',
    description: '实名认证，全程保险，服务有保障',
    color: 'primary',
  },
  {
    icon: 'degree-hat',
    title: '专业培训',
    description: '所有陪诊员经过严格培训考核',
    color: 'emerald',
  },
  {
    icon: 'time',
    title: '准时守约',
    description: '严格守时，绝不让您等待',
    color: 'amber',
  },
  {
    icon: 'Heart',
    title: '贴心服务',
    description: '用心对待每一位客户',
    color: 'rose',
  },
]

// 适用人群
const targetGroups = [
  { icon: 'peoples', title: '独居老人', desc: '子女不在身边，需要人陪同就医', color: 'primary' },
  { icon: 'pregnant-women', title: '孕妇产检', desc: '需要专人陪护，确保安全舒适', color: 'emerald' },
  { icon: 'baby', title: '儿童就医', desc: '家长工作繁忙，需要协助带娃看病', color: 'amber' },
  { icon: 'user', title: '外地患者', desc: '异地就医，不熟悉医院环境流程', color: 'violet' },
  { icon: 'workbench', title: '上班族', desc: '工作繁忙，没时间排队等候', color: 'rose' },
  { icon: 'people-safe', title: '行动不便者', desc: '需要轮椅推送等特殊照护', color: 'cyan' },
]

// 用户评价
const testimonials = [
  {
    content: '第一次带孩子去儿童医院看病，人太多完全不知道怎么办，幸好有科科灵的陪诊员帮忙，整个过程非常顺利。',
    author: '王女士',
    role: '北京 · 儿童就医',
  },
  {
    content: '老人年纪大了，去医院检查项目多，子女又不能总请假陪同。科科灵的服务真的帮了大忙，陪诊员很专业也很耐心。',
    author: '李先生',
    role: '上海 · 老人陪诊',
  },
  {
    content: '从外地来北京看病，人生地不熟的。科科灵不仅帮忙挂号，还安排了住宿接送，服务太周到了！',
    author: '张女士',
    role: '河北 · 异地就医',
  },
]

// 颜色映射
const colorMap = {
  primary: {
    bg: 'bg-primary-50',
    text: 'text-primary-600',
    bgHover: 'group-hover:bg-primary-600',
    gradient: 'from-primary-500 to-primary-600',
    shadow: 'shadow-primary-200',
    iconBg: 'bg-primary-500/20',
    iconText: 'text-primary-400',
  },
  emerald: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    bgHover: 'group-hover:bg-emerald-600',
    gradient: 'from-emerald-500 to-emerald-600',
    shadow: 'shadow-emerald-200',
    iconBg: 'bg-emerald-500/20',
    iconText: 'text-emerald-400',
  },
  amber: {
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    bgHover: 'group-hover:bg-amber-600',
    gradient: 'from-amber-500 to-amber-600',
    shadow: 'shadow-amber-200',
    iconBg: 'bg-amber-500/20',
    iconText: 'text-amber-400',
  },
  violet: {
    bg: 'bg-violet-50',
    text: 'text-violet-600',
    bgHover: 'group-hover:bg-violet-600',
    gradient: 'from-violet-500 to-violet-600',
    shadow: 'shadow-violet-200',
    iconBg: 'bg-violet-500/20',
    iconText: 'text-violet-400',
  },
  rose: {
    bg: 'bg-rose-50',
    text: 'text-rose-600',
    bgHover: 'group-hover:bg-rose-600',
    gradient: 'from-rose-500 to-rose-600',
    shadow: 'shadow-rose-200',
    iconBg: 'bg-rose-500/20',
    iconText: 'text-rose-400',
  },
  cyan: {
    bg: 'bg-cyan-50',
    text: 'text-cyan-600',
    bgHover: 'group-hover:bg-cyan-600',
    gradient: 'from-cyan-500 to-cyan-600',
    shadow: 'shadow-cyan-200',
    iconBg: 'bg-cyan-500/20',
    iconText: 'text-cyan-400',
  },
}

export function DefaultHomePage() {
  const { getSetting } = useSite()

  // 从后台获取设置
  const contactPhone = getSetting('contact_phone', '400-123-4567')
  const statHospitals = getSetting('stat_hospitals', '500+')
  const statEscorts = getSetting('stat_escorts', '2000+')
  const statServices = getSetting('stat_services', '10万+')
  const statRating = getSetting('stat_rating', '99.8%')

  // 动态统计数据
  const stats = [
    { value: statHospitals, label: '覆盖医院', icon: 'hospital', color: 'primary' },
    { value: statEscorts, label: '专业陪诊员', icon: 'peoples', color: 'emerald' },
    { value: statServices, label: '服务人次', icon: 'check-correct', color: 'amber' },
    { value: statRating, label: '好评率', icon: 'like', color: 'rose' },
  ]

  return (
    <div className="overflow-hidden">
      {/* Hero Section - 简约现代 · 温馨医疗 */}
      <section className="relative bg-gradient-to-b from-primary-50 via-white to-gray-50 overflow-hidden">
        {/* 柔和的背景装饰 */}
        <div className="absolute inset-0 overflow-hidden">
          {/* 右上角柔和光晕 */}
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-primary-100/60 rounded-full blur-[120px]" />
          {/* 左下角柔和光晕 */}
          <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-primary-100/40 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center py-16 lg:py-24">
            {/* 左侧：文字内容 */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              {/* 标签 */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 rounded-full text-primary-700 text-sm font-medium mb-6">
                <Icon name="Heart" className="text-primary-500" />
                <span>全家一站式就医助手</span>
              </div>

              {/* 主标题 */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                专业院内
                <span className="text-primary-600">陪诊服务</span>
              </h1>

              {/* 副标题 */}
              <p className="mt-6 text-lg sm:text-xl text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                科科灵为您提供全程陪护、专业导诊、报告代取等一站式陪诊服务，让就医不再困难
              </p>

              {/* 按钮组 */}
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/booking"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-600 text-white font-semibold rounded-full shadow-lg shadow-primary-200 hover:bg-primary-700 hover:shadow-xl hover:shadow-primary-300 transition-all duration-300"
                >
                  <Icon name="appointment" className="text-lg" />
                  <span>立即预约</span>
                </Link>
                <a
                  href={`tel:${contactPhone}`}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-700 font-semibold rounded-full border-2 border-gray-200 hover:border-primary-300 hover:text-primary-600 transition-all duration-300"
                >
                  <Icon name="phone-telephone" className="text-lg" />
                  <span>电话咨询</span>
                </a>
              </div>

              {/* 信任指标 */}
              <div className="mt-10 flex flex-wrap justify-center lg:justify-start gap-6">
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <Icon name="peoples" className="text-green-600 text-sm" />
                  </div>
                  <span className="text-sm font-medium">专业陪诊</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Icon name="connect" className="text-blue-600 text-sm" />
                  </div>
                  <span className="text-sm font-medium">智能匹配</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                    <Icon name="time" className="text-amber-600 text-sm" />
                  </div>
                  <span className="text-sm font-medium">实时接单</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
                    <Icon name="like" className="text-rose-600 text-sm" />
                  </div>
                  <span className="text-sm font-medium">99.8%好评</span>
                </div>
              </div>
            </div>

            {/* 右侧：温馨插画区域 */}
            <div className="relative order-1 lg:order-2 flex justify-center">
              {/* 主卡片 */}
              <div className="relative w-full max-w-md">
                {/* 装饰背景圆 */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-primary-50 rounded-[3rem] transform rotate-3" />

                {/* 主内容卡片 */}
                <div className="relative bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 p-8 transform -rotate-1 hover:rotate-0 transition-transform duration-500">
                  {/* 顶部图标 */}
                  <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl flex items-center justify-center shadow-lg shadow-primary-200">
                      <Icon name="peoples" className="text-4xl text-white" />
                    </div>
                  </div>

                  {/* 服务亮点 */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl">
                      <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon name="check-correct" className="text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">门诊陪诊</p>
                        <p className="text-sm text-gray-500">从挂号到取药全程陪同</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon name="stethoscope" className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">四大代办</p>
                        <p className="text-sm text-gray-500">精准推荐科室和专家</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl">
                      <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon name="Heart" className="text-amber-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">全程就诊管理</p>
                        <p className="text-sm text-gray-500">像家人一样关心您</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 浮动小卡片 - 医院数量 */}
                <div
                  className="absolute -left-4 top-[8%] bg-white rounded-2xl shadow-lg shadow-gray-200/50 px-4 py-3"
                  style={{ animation: 'floatSlow 5s ease-in-out infinite' }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Icon name="hospital" className="text-primary-600 text-sm" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">500+</p>
                      <p className="text-xs text-gray-500">覆盖医院</p>
                    </div>
                  </div>
                </div>

                {/* 浮动小卡片 - 好评率 */}
                <div
                  className="absolute -right-4 bottom-1/4 bg-white rounded-2xl shadow-lg shadow-gray-200/50 px-4 py-3"
                  style={{ animation: 'floatSlowRight 6s ease-in-out infinite', animationDelay: '1s' }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center">
                      <Icon name="like" className="text-rose-600 text-sm" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">99.8%</p>
                      <p className="text-xs text-gray-500">好评率</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Stats Section - 悬浮卡片 */}
        <div className="relative py-12 bg-gray-50/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
              {stats.map((stat, index) => {
                const colors = colorMap[stat.color as keyof typeof colorMap]
                return (
                  <div
                    key={index}
                    className="group text-center p-6 bg-white rounded-2xl shadow-lg shadow-gray-200/60 hover:shadow-xl hover:shadow-gray-300/50 hover:-translate-y-1 transition-all duration-300"
                  >
                    <div
                      className={`inline-flex items-center justify-center w-14 h-14 ${colors.bg} ${colors.text} rounded-2xl mb-4 group-hover:scale-110 transition-transform`}
                    >
                      <Icon name={stat.icon} className="text-2xl" />
                    </div>
                    <div className="text-3xl lg:text-4xl font-bold text-gray-900">{stat.value}</div>
                    <div className="mt-1 text-gray-500">{stat.label}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">我们的服务</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              科科灵专注于为您和您的家庭提供线下就医全流程管理与服务
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const colors = colorMap[service.color as keyof typeof colorMap]
              return (
                <div
                  key={index}
                  className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <div
                    className={`w-16 h-16 ${colors.bg} ${colors.text} rounded-2xl flex items-center justify-center mb-6 ${colors.bgHover} group-hover:text-white transition-colors`}
                  >
                    <Icon name={service.icon} className="text-3xl" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{service.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">服务流程</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              简单四步，轻松预约陪诊服务
            </p>
          </div>

          <div className="relative">
            {/* 连接线 - 垂直居中于圆形 (圆形高度80px，所以 top=40px) */}
            <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary-200 via-primary-400 to-primary-200" />

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((item, index) => (
                <div key={index} className="relative text-center group">
                  <div
                    className="inline-flex items-center justify-center w-20 h-20 bg-primary-600 text-white rounded-full text-2xl font-bold mb-6 shadow-lg shadow-primary-200 relative z-10"
                    style={{
                      animation: 'floatCircle 4s ease-in-out infinite',
                      animationDelay: `${index * 0.3}s`
                    }}
                  >
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white">为什么选择科科灵</h2>
            <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
              专业、贴心、可靠，让每一次就医都安心
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {advantages.map((item, index) => {
              const colors = colorMap[item.color as keyof typeof colorMap]
              return (
                <div key={index} className="text-center">
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 ${colors.iconBg} ${colors.iconText} rounded-2xl mb-6`}
                  >
                    <Icon name={item.icon} className="text-3xl" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-gray-400">{item.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Target Groups */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">适用人群</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              无论您是谁，科科灵都能为您提供贴心的陪诊服务
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {targetGroups.map((group, index) => {
              const colors = colorMap[group.color as keyof typeof colorMap]
              return (
                <div key={index} className="flex items-start gap-4 p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                  <div
                    className={`flex-shrink-0 w-12 h-12 ${colors.bg} ${colors.text} rounded-xl flex items-center justify-center`}
                  >
                    <Icon name={group.icon} className="text-2xl" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{group.title}</h3>
                    <p className="text-gray-600 text-sm">{group.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">用户评价</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              听听他们怎么说
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg shadow-black/5 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Icon key={i} name="like" className="text-amber-400 text-lg" />
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed mb-6">"{item.content}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                    <Icon name="user" className="text-primary-600 text-xl" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{item.author}</p>
                    <p className="text-sm text-gray-500">{item.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary-600 to-primary-700 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            现在就预约您的专属陪诊服务
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-10">
            让就医不再困难，让您和家人都能享受专业、贴心的陪诊服务
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/booking"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary-600 font-semibold rounded-xl shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all"
            >
              <Icon name="appointment" className="text-xl" />
              <span>立即预约</span>
            </Link>
            <a
              href={`tel:${contactPhone}`}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white font-semibold rounded-xl border border-white/30 hover:bg-white/20 transition-all backdrop-blur"
            >
              <Icon name="phone-telephone" className="text-xl" />
              <span>{contactPhone}</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
