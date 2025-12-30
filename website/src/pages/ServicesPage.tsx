/**
 * 服务列表页面
 */

import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { serviceApi, type Service, type ServiceCategory } from '@/lib/api'

// 图标组件
function Icon({ name, className = '' }: { name: string; className?: string }) {
  return <i className={`iconfont icon-${name} ${className}`} />
}

// 星级评分组件
function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const safeRating = Math.max(0, Math.min(5, (rating || 0) / 20)) // 假设后端是100分制，转为5分制
  const fullStars = Math.floor(safeRating)
  const hasHalf = safeRating - fullStars >= 0.5
  const sizeClass = size === 'sm' ? 'text-xs' : 'text-sm'

  return (
    <div className="flex items-center gap-0.5">
      {fullStars > 0 && Array(fullStars).fill(0).map((_, i) => (
        <Icon key={`full-${i}`} name="star-full" className={`text-amber-400 ${sizeClass}`} />
      ))}
      {hasHalf && <Icon name="star-half" className={`text-amber-400 ${sizeClass}`} />}
    </div>
  )
}

// 服务卡片组件
function ServiceCard({ service }: { service: Service }) {
  // 计算折扣
  const hasDiscount = service.originalPrice && service.price < service.originalPrice
  const discountPercent = hasDiscount
    ? Math.round((1 - service.price / service.originalPrice!) * 100)
    : null

  return (
    <Link
      to={`/services/${service.id}`}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col"
    >
      {/* 封面图 */}
      <div className="aspect-[16/10] bg-gray-100 relative overflow-hidden">
        {service.coverImage ? (
          <img
            src={service.coverImage}
            alt={service.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
            <Icon name="stethoscope" className="text-5xl text-primary-300" />
          </div>
        )}
        {/* 热门标签 */}
        {service.isHot && (
          <div className="absolute top-3 left-3 px-3 py-1 bg-rose-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
            <Icon name="fire" className="text-xs" />
            热门
          </div>
        )}
        {/* 折扣标签 */}
        {discountPercent && discountPercent > 0 && (
          <div className="absolute top-3 right-3 px-2 py-1 bg-rose-100 text-rose-600 text-xs font-bold rounded">
            省{discountPercent}%
          </div>
        )}
        {/* 分类标签 */}
        {service.category && !discountPercent && (
          <div className="absolute top-3 right-3 px-3 py-1 bg-white/90 backdrop-blur text-gray-700 text-xs font-medium rounded-full">
            {service.category.name}
          </div>
        )}
      </div>

      {/* 内容 */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-1">
          {service.name}
        </h3>
        
        <p className="text-sm text-gray-500 mb-3 line-clamp-2 flex-1">
          {service.description || '专业陪诊服务，让就医更轻松'}
        </p>

        {/* 评分和服务次数 */}
        <div className="flex items-center gap-3 mb-3 text-xs text-gray-400">
          {service.rating > 0 && (
            <div className="flex items-center gap-1">
              <StarRating rating={service.rating} />
              <span>{(service.rating || 0).toFixed(1)}</span>
            </div>
          )}
          {service.orderCount > 0 && (
            <span>已服务 {service.orderCount} 次</span>
          )}
        </div>

        {/* 标签 */}
        {service.tags && service.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {service.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-0.5 bg-primary-50 text-primary-600 text-xs rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* 服务包含预览 */}
        {service.serviceIncludes && service.serviceIncludes.length > 0 && !service.tags?.length && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {service.serviceIncludes.slice(0, 2).map((item, index) => (
              <span
                key={index}
                className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded flex items-center gap-1"
              >
                <Icon name="check-correct" className="text-primary-500 text-xs" />
                {item.text}
              </span>
            ))}
          </div>
        )}

        {/* 价格和按钮 */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-primary-600">¥{service.price}</span>
            <span className="text-sm text-gray-400">/{service.unit}</span>
            {hasDiscount && (
              <span className="text-sm text-gray-300 line-through">¥{service.originalPrice}</span>
            )}
          </div>
          <span className="px-4 py-2 bg-primary-50 text-primary-600 text-sm font-medium rounded-full group-hover:bg-primary-600 group-hover:text-white transition-colors">
            了解详情
          </span>
        </div>
      </div>
    </Link>
  )
}

// 骨架屏
function ServiceCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
      <div className="aspect-[16/10] bg-gray-200 animate-pulse" />
      <div className="p-5 space-y-3">
        <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4" />
        <div className="h-4 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
        <div className="flex gap-2">
          <div className="h-5 bg-gray-200 rounded animate-pulse w-12" />
          <div className="h-5 bg-gray-200 rounded animate-pulse w-16" />
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-24" />
          <div className="h-10 bg-gray-200 rounded-full animate-pulse w-24" />
        </div>
      </div>
    </div>
  )
}

export function ServicesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [services, setServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  const currentCategory = searchParams.get('category') || ''
  const currentPage = parseInt(searchParams.get('page') || '1', 10)
  const pageSize = 12

  // 加载分类
  useEffect(() => {
    serviceApi.getCategories().then(setCategories).catch(console.error)
  }, [])

  // 加载服务列表
  useEffect(() => {
    setLoading(true)
    serviceApi
      .getList({
        page: currentPage,
        pageSize,
        categoryId: currentCategory || undefined,
      })
      .then((res) => {
        setServices(res.data)
        setTotal(res.total)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [currentCategory, currentPage])

  // 切换分类
  const handleCategoryChange = (categoryId: string) => {
    const params = new URLSearchParams(searchParams)
    if (categoryId) {
      params.set('category', categoryId)
    } else {
      params.delete('category')
    }
    params.delete('page')
    setSearchParams(params)
  }

  // 切换页码
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', String(page))
    setSearchParams(params)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary-50 to-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">服务项目</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            科科灵提供全方位的医院陪诊服务，满足您各种就医需求
          </p>
        </div>
      </section>

      {/* 分类筛选 */}
      <section className="bg-white border-b border-gray-100 sticky top-20 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-4 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => handleCategoryChange('')}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !currentCategory
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              全部服务
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                  currentCategory === cat.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.icon && <Icon name={cat.icon} className="text-sm" />}
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 服务列表 */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 统计信息 */}
          {!loading && services.length > 0 && (
            <div className="mb-6 text-sm text-gray-500">
              共 <span className="font-medium text-gray-900">{total}</span> 项服务
              {currentCategory && categories.find(c => c.id === currentCategory) && (
                <span>
                  ，当前分类：
                  <span className="font-medium text-primary-600">
                    {categories.find(c => c.id === currentCategory)?.name}
                  </span>
                </span>
              )}
            </div>
          )}

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <ServiceCardSkeleton key={i} />
              ))}
            </div>
          ) : services.length > 0 ? (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {services.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>

              {/* 分页 */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                      className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Icon name="left" className="mr-1" />
                      上一页
                    </button>
                    
                    {[...Array(totalPages)].map((_, i) => {
                      const page = i + 1
                      // 显示前3页、后3页和当前页附近的页码
                      if (
                        page <= 3 ||
                        page > totalPages - 3 ||
                        Math.abs(page - currentPage) <= 1
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                              currentPage === page
                                ? 'bg-primary-600 text-white'
                                : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        )
                      } else if (
                        (page === 4 && currentPage > 5) ||
                        (page === totalPages - 3 && currentPage < totalPages - 4)
                      ) {
                        return (
                          <span key={page} className="px-2 text-gray-400">
                            ...
                          </span>
                        )
                      }
                      return null
                    })}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                      className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      下一页
                      <Icon name="right" className="ml-1" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <Icon name="inbox" className="text-6xl text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">暂无服务</p>
              <button
                onClick={() => handleCategoryChange('')}
                className="text-primary-600 hover:underline"
              >
                查看全部服务
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">需要帮助选择服务？</h2>
          <p className="text-white/90 mb-8">联系我们的客服，为您推荐最适合的陪诊服务</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/booking"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary-600 font-semibold rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              <Icon name="appointment" />
              <span>立即预约</span>
            </Link>
            <a
              href="tel:400-123-4567"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white font-semibold rounded-full border border-white/30 hover:bg-white/20 transition-all"
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
