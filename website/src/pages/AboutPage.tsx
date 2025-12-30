/**
 * 关于我们页面
 * 公司介绍、使命愿景、服务理念等
 */

import { Link } from 'react-router-dom'

// 图标组件
function Icon({ name, className = '' }: { name: string; className?: string }) {
    return <i className={`iconfont icon-${name} ${className}`} />
}

// 价值观数据
const values = [
    { label: '专业可信赖', icon: 'shield', color: 'primary' },
    { label: '服务有温度', icon: 'Heart', color: 'rose' },
    { label: '科技有实效', icon: 'computer', color: 'blue' },
]

// 就医困境数据
const problems = [
    {
        icon: 'question',
        title: '信息尊严的缺失',
        desc: '医学信息复杂晦涩，患者难以判断方向，只能被动接受。',
        color: 'amber',
    },
    {
        icon: 'time',
        title: '精力尊严的消耗',
        desc: '反复排队、奔波问路，让患者在身体最虚弱时承担最多体力消耗。',
        color: 'red',
    },
    {
        icon: 'peoples',
        title: '决策尊严的缺位',
        desc: '在有限的问诊时间里，患者难以充分表达诉求，缺乏参与感。',
        color: 'violet',
    },
    {
        icon: 'Heart',
        title: '情感尊严的缺乏',
        desc: '面对冰冷高效的系统，患者常常感到孤独与无助。',
        color: 'gray',
    },
]

// 解决方案数据
const solutions = [
    {
        icon: 'stethoscope',
        title: '专业医疗陪诊',
        desc: '从诊前规划、诊中协助到诊后解读，全流程陪伴，让患者专注于治疗本身。',
        color: 'primary',
    },
    {
        icon: 'file-text',
        title: '关键就医代办',
        desc: '检查预约、病理递送、报告代领等高频事务，由专业人员处理，避免患者反复奔波。',
        color: 'emerald',
    },
    {
        icon: 'global',
        title: '全球来华医疗',
        desc: '为海外患者提供从医疗对接到在华协调的一站式解决方案。',
        color: 'blue',
    },
]

// 承诺数据
const promises = [
    { icon: 'eye', text: '尊重知情权：信息透明、清晰解释' },
    { icon: 'check-correct', text: '尊重选择权：提供多种可行方案' },
    { icon: 'user', text: '尊重主导权：流程以患者为中心' },
    { icon: 'lock', text: '尊重隐私权：严格保护个人信息' },
    { icon: 'like', text: '尊重体面感：避免不必要的奔波与等待' },
]

// 颜色映射
const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    primary: { bg: 'bg-primary-100', text: 'text-primary-600', border: 'border-primary-200' },
    emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600', border: 'border-emerald-200' },
    amber: { bg: 'bg-amber-100', text: 'text-amber-600', border: 'border-amber-200' },
    rose: { bg: 'bg-rose-100', text: 'text-rose-600', border: 'border-rose-200' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' },
    violet: { bg: 'bg-violet-100', text: 'text-violet-600', border: 'border-violet-200' },
    red: { bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-200' },
    gray: { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' },
}

export function AboutPage() {
    return (
        <div className="overflow-hidden">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-b from-primary-50 via-white to-white overflow-hidden">
                {/* 背景装饰 */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-32 -right-32 w-[400px] h-[400px] bg-primary-100/50 rounded-full blur-[100px]" />
                    <div className="absolute -bottom-32 -left-32 w-[300px] h-[300px] bg-primary-100/30 rounded-full blur-[80px]" />
                </div>

                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
                    <div className="text-center">
                        {/* 标签 */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 rounded-full text-primary-700 text-sm font-medium mb-6">
                            <Icon name="peoples" className="text-primary-500" />
                            <span>关于科科灵</span>
                        </div>

                        {/* 主标题 */}
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                            专业就医服务伙伴
                        </h1>

                        {/* 副标题 */}
                        <p className="mt-6 text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
                            通过科技与专业服务的结合，系统性解决"挂号难、流程乱、心很累"的就医困境，
                            让每一次就医都更加高效、安心、有尊严。
                        </p>
                    </div>
                </div>
            </section>

            {/* 我们是谁 */}
            <section className="py-16 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">我们是谁</h2>
                    <p className="text-gray-600 text-lg leading-relaxed mb-10">
                        科科灵是一家专注于为个人与家庭提供智慧就医解决方案的医疗科技公司。
                        我们相信，就医不应是一场消耗尊严与精力的战斗，而是一段被专业托底的过程。
                    </p>

                    {/* 使命、愿景、价值观卡片 */}
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-primary-50 to-white rounded-2xl p-6 border border-primary-100">
                            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                                <Icon name="flag" className="text-2xl text-primary-600" />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">我们的使命</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                让每一次就医，都成为一次高效、安心、有尊严的体验。
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl p-6 border border-emerald-100">
                            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                                <Icon name="eye" className="text-2xl text-emerald-600" />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">我们的愿景</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                成为一亿中国家庭首选的终身健康伙伴。
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-amber-50 to-white rounded-2xl p-6 border border-amber-100">
                            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                                <Icon name="Heart" className="text-2xl text-amber-600" />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">我们的价值观</h3>
                            <div className="flex flex-wrap gap-2 mt-3">
                                {values.map((item, index) => {
                                    const colors = colorMap[item.color]
                                    return (
                                        <span
                                            key={index}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1 ${colors.bg} ${colors.text} rounded-full text-xs font-medium`}
                                        >
                                            <Icon name={item.icon} className="text-sm" />
                                            {item.label}
                                        </span>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 传统就医的困境 */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">传统就医的困境</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            在现实就医过程中，患者往往被迫承担信息不对称、流程复杂、
                            精力透支与情绪孤立等问题，尊严在流程中被不断消耗。
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        {problems.map((item, index) => {
                            const colors = colorMap[item.color]
                            return (
                                <div
                                    key={index}
                                    className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`w-10 h-10 ${colors.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                                            <Icon name={item.icon} className={`text-lg ${colors.text}`} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                                            <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* 科科灵如何解决 */}
            <section className="py-16 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">科科灵如何解决</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            我们不是简单"陪着看病"，而是通过专业能力，
                            系统性地为患者找回知情权、掌控感与安全感。
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {solutions.map((item, index) => {
                            const colors = colorMap[item.color]
                            return (
                                <div
                                    key={index}
                                    className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                                >
                                    <div className={`w-14 h-14 ${colors.bg} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                                        <Icon name={item.icon} className={`text-2xl ${colors.text}`} />
                                    </div>
                                    <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* 我们承诺 */}
            <section className="py-16 bg-gradient-to-br from-primary-600 to-primary-700">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4">我们承诺</h2>
                        <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
                            在科科灵，您首先是一个值得被尊重的人，
                            然后才是一位需要被服务的患者。
                        </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20">
                        <div className="grid sm:grid-cols-2 gap-4">
                            {promises.map((item, index) => (
                                <div key={index} className="flex items-center gap-3 text-white/90">
                                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Icon name={item.icon} className="text-sm" />
                                    </div>
                                    <span className="text-sm">{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* 品牌宣言 */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8">品牌宣言</h2>

                        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 max-w-2xl mx-auto">
                            <Icon name="quote-left" className="text-4xl text-primary-200 mb-4" />
                            <p className="text-xl text-gray-700 leading-relaxed mb-6">
                                科科灵致力于推动一场"有尊严的就医体验"变革。
                                <br />
                                医疗效率的提升，不应以个体尊严的磨损为代价。
                            </p>
                            <div className="flex items-center justify-center gap-2 text-gray-500">
                                <span className="w-8 h-px bg-gray-300" />
                                <span className="text-sm">科科灵 · 专业就医服务伙伴</span>
                                <span className="w-8 h-px bg-gray-300" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                        开始您的就医新体验
                    </h2>
                    <p className="text-gray-600 mb-8 max-w-xl mx-auto">
                        让科科灵成为您的专业就医伙伴，为您和家人提供贴心的陪诊服务
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/booking"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-600 text-white font-semibold rounded-full shadow-lg shadow-primary-200 hover:bg-primary-700 hover:shadow-xl transition-all"
                        >
                            <Icon name="appointment" className="text-lg" />
                            <span>立即预约</span>
                        </Link>
                        <Link
                            to="/"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-700 font-semibold rounded-full border-2 border-gray-200 hover:border-primary-300 hover:text-primary-600 transition-all"
                        >
                            <Icon name="home" className="text-lg" />
                            <span>返回首页</span>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}

