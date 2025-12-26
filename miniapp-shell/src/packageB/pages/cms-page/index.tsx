/**
 * CMS 页面详情
 *
 * 使用 WebView 加载服务器渲染的完整 HTML 页面
 * 这样可以完整保留样式
 */
import { useEffect } from 'react'
import { WebView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { getApiBaseUrl } from '@terminal-preview/platform/config'

// slug 对应的页面标题
const SLUG_TITLES: Record<string, string> = {
  about: '关于我们',
  privacy: '隐私政策',
  terms: '服务条款',
  faq: '常见问题',
}

export default function CmsPageDetailPage() {
  const router = useRouter()
  const slug = router.params?.slug || ''
  const pageTitle = SLUG_TITLES[slug] || '详情'

  // 动态设置导航栏标题
  useEffect(() => {
    Taro.setNavigationBarTitle({ title: pageTitle })
  }, [pageTitle])

  if (!slug) {
    return null
  }

  // 构建 WebView URL
  const baseUrl = getApiBaseUrl()
  const pageUrl = `${baseUrl}/api/cms/pages/view/${slug}`

  return <WebView src={pageUrl} />
}
