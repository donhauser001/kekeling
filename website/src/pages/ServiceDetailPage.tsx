/**
 * 服务详情页面
 */

import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { serviceApi, type Service } from '@/lib/api'
import { SafeHTML } from '@/components/SafeHTML'

// 图标组件
function Icon({ name, className = '' }: { name: string; className?: string }) {
  return <i className={`iconfont icon-${name} ${className}`} />
}

// 骨架屏
function ServiceDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="aspect-[4/3] bg-gray-200 rounded-2xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
            <div className="h-12 bg-gray-200 rounded animate-pulse w-1/3 mt-6" />
          </div>
        </div>
      </div>
    </div>
  )
}

// 星级评分组件
function StarRating({ rating }: { rating: number }) {
  // 确保 rating 在有效范围内
  const safeRating = Math.max(0, Math.min(5, rating || 0))
  const fullStars = Math.floor(safeRating)
  const hasHalf = safeRating - fullStars >= 0.5
  const emptyStars = Math.max(0, 5 - fullStars - (hasHalf ? 1 : 0))

  return (
    <div className="flex items-center gap-0.5">
      {fullStars > 0 && Array(fullStars).fill(0).map((_, i) => (
        <Icon key={`full-${i}`} name="star-full" className="text-amber-400" />
      ))}
      {hasHalf && <Icon name="star-half" className="text-amber-400" />}
      {emptyStars > 0 && Array(emptyStars).fill(0).map((_, i) => (
        <Icon key={`empty-${i}`} name="star" className="text-gray-300" />
      ))}
    </div>
  )
}

export function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentImage, setCurrentImage] = useState(0)

  useEffect(() => {
    if (!id) return

    setLoading(true)
    setError(null)
    
    serviceApi
      .getById(id)
      .then(setService)
      .catch((err) => {
        setError(err.message || '加载失败')
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return <ServiceDetailSkeleton />
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Icon name="warning" className="text-6xl text-gray-300 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">服务不存在</h1>
          <p className="text-gray-500 mb-8">{error || '找不到该服务'}</p>
          <Link
            to="/services"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-medium rounded-full hover:bg-primary-700 transition-colors"
          >
            <Icon name="back" />
            <span>返回服务列表</span>
          </Link>
        </div>
      </div>
    )
  }

  // 合并封面图和详情图片列表
  const allImages = service.coverImage
    ? [service.coverImage, ...(service.detailImages || [])]
    : service.detailImages || []

  // 计算折扣百分比
  const discountPercent = service.originalPrice && service.price < service.originalPrice
    ? Math.round((1 - service.price / service.originalPrice) * 100)
    : null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 面包屑 */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 py-4 text-sm">
            <Link to="/" className="text-gray-500 hover:text-primary-600">
              首页
            </Link>
            <span className="text-gray-300">/</span>
            <Link to="/services" className="text-gray-500 hover:text-primary-600">
              服务项目
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900">{service.name}</span>
          </nav>
        </div>
      </div>

      {/* 主内容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* 左侧：图片区域 */}
          <div className="space-y-4">
            {/* 主图 */}
            <div className="aspect-[4/3] bg-white rounded-2xl overflow-hidden shadow-sm relative">
              {allImages.length > 0 ? (
                <img
                  src={allImages[currentImage]}
                  alt={service.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
                  <Icon name="stethoscope" className="text-8xl text-primary-300" />
                </div>
              )}
              
              {/* 热门标签 */}
              {service.isHot && (
                <div className="absolute top-4 left-4 px-3 py-1 bg-rose-500 text-white text-xs font-medium rounded-full shadow-lg">
                  <Icon name="fire" className="mr-1" />
                  热门服务
                </div>
              )}
            </div>

            {/* 缩略图列表 */}
            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {allImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      currentImage === index ? 'border-primary-600' : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 右侧：信息区域 */}
          <div>
            {/* 分类和标签 */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {service.category && (
                <span className="px-3 py-1 bg-primary-50 text-primary-600 text-xs font-medium rounded-full">
                  {service.category.name}
                </span>
              )}
              {service.tags?.map((tag, index) => (
                <span key={index} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                  {tag}
                </span>
              ))}
            </div>

            {/* 标题 */}
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
              {service.name}
            </h1>

            {/* 评分和订单数 */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <StarRating rating={service.rating || 5} />
                <span className="text-sm text-gray-500">{(service.rating || 5).toFixed(1)}</span>
              </div>
              <span className="text-gray-300">|</span>
              <span className="text-sm text-gray-500">
                <Icon name="checklist" className="mr-1" />
                已服务 {service.orderCount || 0} 次
              </span>
            </div>

            {/* 描述 */}
            {service.description && (
              <p className="text-gray-600 leading-relaxed mb-6">
                {service.description}
              </p>
            )}

            {/* 价格卡片 */}
            <div className="bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-2xl p-6 mb-6">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-4xl font-bold text-primary-600">¥{service.price}</span>
                <span className="text-gray-500">/{service.unit}</span>
                {service.originalPrice && service.originalPrice > service.price && (
                  <>
                    <span className="text-lg text-gray-400 line-through">¥{service.originalPrice}</span>
                    {discountPercent && (
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-600 text-xs font-medium rounded">
                        省{discountPercent}%
                      </span>
                    )}
                  </>
                )}
              </div>
              
              {service.duration && (
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Icon name="time" className="text-primary-500" />
                  服务时长：{service.duration}
                </p>
              )}

              {/* 会员政策提示 */}
              {service.membershipPolicy === 'exclusive' && (
                <div className="mt-3 flex items-center gap-2 text-sm text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                  <Icon name="vip" />
                  <span>会员专属服务</span>
                </div>
              )}
              {service.membershipPolicy === 'normal' && service.membershipDiscount && (
                <div className="mt-3 flex items-center gap-2 text-sm text-primary-600 bg-primary-50/50 rounded-lg px-3 py-2">
                  <Icon name="vip" />
                  <span>会员可享 {service.membershipDiscount}% 折扣</span>
                </div>
              )}
            </div>

            {/* 服务包含 */}
            {service.serviceIncludes && service.serviceIncludes.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Icon name="checklist" className="text-primary-600" />
                  服务包含
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {service.serviceIncludes.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 bg-white rounded-lg px-4 py-3 shadow-sm">
                      <Icon name={item.icon || 'check-correct'} className="text-primary-600 flex-shrink-0" />
                      <span className="text-gray-700">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 预约按钮 */}
            <div className="flex gap-4">
              <Link
                to={`/booking?serviceId=${service.id}`}
                className="flex-1 inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-600 text-white font-semibold rounded-full shadow-lg shadow-primary-200 hover:bg-primary-700 transition-colors"
              >
                <Icon name="appointment" />
                <span>立即预约</span>
              </Link>
              <a
                href="tel:400-123-4567"
                className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-white text-gray-700 font-semibold rounded-full border-2 border-gray-200 hover:border-primary-300 hover:text-primary-600 transition-colors"
              >
                <Icon name="phone-telephone" />
                <span>电话咨询</span>
              </a>
            </div>
          </div>
        </div>

        {/* 详细内容区域 */}
        <div className="mt-12 space-y-8">
          {/* 富文本详情 */}
          {service.content && (
            <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Icon name="document" className="text-primary-600" />
                服务详情
              </h2>
              <SafeHTML
                className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-a:text-primary-600"
                html={service.content}
              />
            </div>
          )}

          {/* 三栏信息卡片 */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 注意事项 */}
            {service.serviceNotes && service.serviceNotes.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Icon name="tips" className="text-amber-500" />
                  注意事项
                </h3>
                <div className="space-y-4">
                  {service.serviceNotes.map((note, index) => (
                    <div key={index}>
                      <h4 className="font-medium text-gray-800 mb-1">{note.title}</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">{note.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 服务保障 */}
            {service.guarantees && service.guarantees.length > 0 ? (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Icon name="shield" className="text-emerald-500" />
                  服务保障
                </h3>
                <ul className="space-y-3">
                  {service.guarantees.map((guarantee) => (
                    <li key={guarantee.id} className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon name={guarantee.icon || 'check-correct'} className="text-emerald-600 text-sm" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{guarantee.name}</p>
                        {guarantee.description && (
                          <p className="text-sm text-gray-500">{guarantee.description}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Icon name="shield" className="text-emerald-500" />
                  服务保障
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-gray-600">
                    <Icon name="check-correct" className="text-emerald-600" />
                    <span>专业培训认证陪诊员</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <Icon name="check-correct" className="text-emerald-600" />
                    <span>服务全程保险保障</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <Icon name="check-correct" className="text-emerald-600" />
                    <span>不满意可申请退款</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <Icon name="check-correct" className="text-emerald-600" />
                    <span>7x24小时客服支持</span>
                  </li>
                </ul>
              </div>
            )}

            {/* 预约须知 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Icon name="document" className="text-primary-600" />
                预约须知
              </h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</span>
                  <span>请提前至少24小时预约服务</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</span>
                  <span>预约成功后会有专人联系确认</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">3</span>
                  <span>如需取消请提前6小时告知</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">4</span>
                  <span>服务完成后请及时评价</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <section className="py-16 bg-gray-900 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">还有疑问？</h2>
          <p className="text-gray-400 mb-8">我们的客服团队随时为您解答</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/services"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white font-semibold rounded-full border border-white/20 hover:bg-white/20 transition-colors"
            >
              <Icon name="back" />
              <span>查看更多服务</span>
            </Link>
            <a
              href="tel:400-123-4567"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-600 text-white font-semibold rounded-full hover:bg-primary-700 transition-colors"
            >
              <Icon name="phone-telephone" />
              <span>400-123-4567</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
