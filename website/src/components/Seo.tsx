import { useEffect } from 'react'
import { useSite } from '@/context/SiteContext'

interface SeoProps {
  /** 页面标题（会与网站名称组合） */
  title?: string
  /** 页面描述 */
  description?: string
  /** 页面关键词 */
  keywords?: string
  /** 是否为首页（首页使用完整的 SEO 标题） */
  isHome?: boolean
}

/**
 * SEO 组件
 * 动态更新页面的 title 和 meta 标签
 */
export function Seo({ title, description, keywords, isHome = false }: SeoProps) {
  const { getSetting } = useSite()

  // 从后台获取 SEO 设置
  const siteName = getSetting('site_name', '科科灵陪诊')
  const seoTitle = getSetting('seo_title', '科科灵陪诊 - 专业陪诊服务平台')
  const seoDescription = getSetting('seo_description', '科科灵提供专业的陪诊服务，让您的就医之路更轻松')
  const seoKeywords = getSetting('seo_keywords', '陪诊服务,医院陪诊,就医陪护')
  const siteFavicon = getSetting('site_favicon', '')

  useEffect(() => {
    // 设置页面标题
    if (isHome) {
      document.title = seoTitle
    } else if (title) {
      document.title = `${title} - ${siteName}`
    } else {
      document.title = seoTitle
    }

    // 设置 meta description
    const metaDescription = document.querySelector('meta[name="description"]')
    const descContent = description || seoDescription
    if (metaDescription) {
      metaDescription.setAttribute('content', descContent)
    } else {
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content = descContent
      document.head.appendChild(meta)
    }

    // 设置 meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]')
    const keywordsContent = keywords || seoKeywords
    if (metaKeywords) {
      metaKeywords.setAttribute('content', keywordsContent)
    } else {
      const meta = document.createElement('meta')
      meta.name = 'keywords'
      meta.content = keywordsContent
      document.head.appendChild(meta)
    }

    // 设置 favicon（如果后台配置了）
    if (siteFavicon) {
      const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement
      if (link) {
        link.href = siteFavicon
      } else {
        const newLink = document.createElement('link')
        newLink.rel = 'icon'
        newLink.href = siteFavicon
        document.head.appendChild(newLink)
      }
    }
  }, [title, description, keywords, isHome, siteName, seoTitle, seoDescription, seoKeywords, siteFavicon])

  // 这个组件不渲染任何内容
  return null
}

