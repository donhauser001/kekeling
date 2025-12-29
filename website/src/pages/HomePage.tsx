import { Link } from 'react-router-dom'
import { 
  Stethoscope, 
  Clock, 
  Shield, 
  Heart,
  Users,
  MapPin,
  Star,
  ArrowRight,
  CheckCircle2,
  Phone
} from 'lucide-react'
import { useSite } from '@/context/SiteContext'
import { useLatestArticles } from '@/hooks/useApi'
import { Seo } from '@/components/Seo'

const services = [
  {
    icon: Stethoscope,
    title: '全程陪诊',
    description: '专业陪诊员全程陪同就医，挂号、候诊、检查、取药一条龙服务',
    color: 'primary',
  },
  {
    icon: Clock,
    title: '代办跑腿',
    description: '代取检查报告、代开药、代挂号，节省您的宝贵时间',
    color: 'accent',
  },
  {
    icon: Shield,
    title: '住院陪护',
    description: '专业陪护人员24小时照护，让患者住院更安心',
    color: 'blue',
  },
  {
    icon: MapPin,
    title: '异地就医',
    description: '外地患者就医全流程服务，解决人生地不熟的困扰',
    color: 'purple',
  },
]

const features = [
  { icon: CheckCircle2, text: '专业培训认证' },
  { icon: CheckCircle2, text: '实名身份验证' },
  { icon: CheckCircle2, text: '全程服务保障' },
  { icon: CheckCircle2, text: '透明收费标准' },
]

const stats = [
  { value: '50+', label: '覆盖医院' },
  { value: '1000+', label: '专业陪诊员' },
  { value: '10万+', label: '服务人次' },
  { value: '99%', label: '好评率' },
]

const testimonials = [
  {
    content: '第一次带孩子去儿童医院看病，人太多完全不知道怎么办，幸好有科科灵的陪诊员帮忙，整个过程非常顺利。',
    author: '王女士',
    role: '北京 · 儿童就医',
    avatar: '👩',
  },
  {
    content: '老人年纪大了，去医院检查项目多，子女又不能总请假陪同。科科灵的服务真的帮了大忙，陪诊员很专业也很耐心。',
    author: '李先生',
    role: '上海 · 老人陪诊',
    avatar: '👨',
  },
  {
    content: '从外地来北京看病，人生地不熟的。科科灵不仅帮忙挂号，还安排了住宿接送，服务太周到了！',
    author: '张女士',
    role: '河北 · 异地就医',
    avatar: '👩‍🦰',
  },
]

export function HomePage() {
  const { getSetting } = useSite()
  const { data: latestArticles } = useLatestArticles(3)
  
  // 从后台获取设置
  const siteName = getSetting('site_name', '科科灵陪诊')
  const contactPhone = getSetting('contact_phone', '400-123-4567')
  const statHospitals = getSetting('stat_hospitals', '50+')
  const statEscorts = getSetting('stat_escorts', '1000+')
  const statServices = getSetting('stat_services', '10万+')
  const statRating = getSetting('stat_rating', '99%')

  // 动态统计数据
  const dynamicStats = [
    { value: statHospitals, label: '覆盖医院' },
    { value: statEscorts, label: '专业陪诊员' },
    { value: statServices, label: '服务人次' },
    { value: statRating, label: '好评率' },
  ]

  return (
    <div className="overflow-hidden">
      {/* SEO */}
      <Seo isHome />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center bg-mesh">
        {/* Background Decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -left-40 w-80 h-80 bg-accent-400/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 right-1/4 w-72 h-72 bg-primary-400/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full 
                            border border-primary-100 text-primary-700 text-sm font-medium
                            animate-fade-in">
                <Heart className="w-4 h-4 fill-primary-500" />
                <span>让就医不再孤单</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight animate-slide-up">
                <span className="text-gray-900">专业医院</span>
                <br />
                <span className="gradient-text">陪诊服务平台</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-gray-600 max-w-xl leading-relaxed animate-slide-up animate-delay-100">
                科科灵陪诊为您提供专业、贴心的医院陪诊服务。
                无论是挂号排队、检查陪同、还是取药送诊，我们都在您身边。
              </p>
              
              <div className="flex flex-wrap gap-4 animate-slide-up animate-delay-200">
                <Link to="/booking" className="btn-primary group">
                  立即预约陪诊
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a href="tel:400-123-4567" className="btn-secondary">
                  <Phone className="w-4 h-4 mr-2" />
                  咨询热线
                </a>
              </div>
              
              {/* Features */}
              <div className="flex flex-wrap gap-x-6 gap-y-3 pt-4 animate-slide-up animate-delay-300">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-gray-600">
                    <feature.icon className="w-5 h-5 text-accent-500" />
                    <span className="text-sm font-medium">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Image/Illustration */}
            <div className="relative lg:pl-12 animate-slide-in-right animate-delay-200">
              <div className="relative">
                {/* Main Card */}
                <div className="glass-card p-8 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 
                                  flex items-center justify-center shadow-lg shadow-primary-500/30">
                      <Stethoscope className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">预约陪诊服务</h3>
                      <p className="text-gray-500">选择您需要的服务类型</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {['全程陪诊', '代办跑腿', '住院陪护', '异地就医'].map((item) => (
                      <button
                        key={item}
                        className="p-4 rounded-xl border-2 border-gray-100 hover:border-primary-300 
                                 hover:bg-primary-50 transition-all text-sm font-medium text-gray-700
                                 hover:text-primary-700"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                  
                  <button className="w-full btn-primary">
                    开始预约
                  </button>
                </div>

                {/* Floating Cards */}
                <div className="absolute -top-6 -right-6 glass-card p-4 animate-float">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent-100 flex items-center justify-center">
                      <Star className="w-5 h-5 text-accent-600 fill-accent-500" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">99%</p>
                      <p className="text-xs text-gray-500">好评率</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-4 -left-6 glass-card p-4 animate-float" style={{ animationDelay: '2s' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">1000+</p>
                      <p className="text-xs text-gray-500">专业陪诊员</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {dynamicStats.map((stat, index) => (
              <div 
                key={index} 
                className="text-center p-6 rounded-2xl hover:bg-gray-50 transition-colors"
              >
                <p className="text-4xl lg:text-5xl font-bold gradient-text mb-2">
                  {stat.value}
                </p>
                <p className="text-gray-600 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title">我们的服务</h2>
            <p className="section-subtitle">
              提供全方位的医院陪诊服务，满足您不同的就医需求
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => {
              const colors = {
                primary: 'from-primary-500 to-primary-600 shadow-primary-500/30',
                accent: 'from-accent-500 to-accent-600 shadow-accent-500/30',
                blue: 'from-blue-500 to-blue-600 shadow-blue-500/30',
                purple: 'from-purple-500 to-purple-600 shadow-purple-500/30',
              }
              return (
                <div
                  key={index}
                  className="group bg-white rounded-2xl p-6 shadow-lg shadow-black/5 
                           hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colors[service.color as keyof typeof colors]} 
                                flex items-center justify-center mb-5 shadow-lg
                                group-hover:scale-110 transition-transform duration-300`}>
                    <service.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">{service.description}</p>
                  <Link 
                    to={`/services/${service.title}`}
                    className="inline-flex items-center text-primary-600 font-medium 
                             hover:text-primary-700 transition-colors group/link"
                  >
                    了解更多
                    <ArrowRight className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
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
            <h2 className="section-title">服务流程</h2>
            <p className="section-subtitle">
              简单四步，轻松预约专业陪诊服务
            </p>
          </div>

          <div className="relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r 
                          from-primary-200 via-primary-400 to-primary-200 -translate-y-1/2" />
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { step: '01', title: '选择服务', desc: '根据需求选择陪诊服务类型' },
                { step: '02', title: '填写信息', desc: '填写就诊医院、时间等信息' },
                { step: '03', title: '匹配陪诊员', desc: '系统智能匹配专业陪诊员' },
                { step: '04', title: '开始服务', desc: '陪诊员按时到达提供服务' },
              ].map((item, index) => (
                <div key={index} className="relative text-center group">
                  <div className="relative z-10 w-20 h-20 mx-auto mb-6 rounded-full 
                                bg-gradient-to-br from-primary-500 to-primary-600
                                flex items-center justify-center shadow-xl shadow-primary-500/30
                                group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl font-bold text-white">{item.step}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-mesh">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title">用户评价</h2>
            <p className="section-subtitle">
              听听他们怎么说
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg shadow-black/5
                         hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed mb-6">"{item.content}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-2xl">
                    {item.avatar}
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
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            让每一次就医都更安心
          </h2>
          <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
            立即预约专业陪诊服务，我们的陪诊员将全程陪伴您，让就医不再是一个人的战斗
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/booking" className="inline-flex items-center px-8 py-4 bg-white text-primary-600 
                                         font-semibold rounded-full shadow-xl shadow-black/20
                                         hover:bg-primary-50 transition-colors group">
              立即预约
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href={`tel:${contactPhone}`} className="inline-flex items-center px-8 py-4 
                                                border-2 border-white/30 text-white font-semibold rounded-full
                                                hover:bg-white/10 transition-colors">
              <Phone className="w-5 h-5 mr-2" />
              {contactPhone}
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

