import { Routes, Route } from 'react-router-dom'
import { SiteProvider } from './context/SiteContext'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { ArticleListPage } from './pages/ArticleListPage'
import { ArticleDetailPage } from './pages/ArticleDetailPage'
import { CategoryPage } from './pages/CategoryPage'
import { PageDetail } from './pages/PageDetail'
import { NotFoundPage } from './pages/NotFoundPage'

function App() {
  return (
    <SiteProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* 首页 */}
          <Route index element={<HomePage />} />
          
          {/* 新闻资讯 */}
          <Route path="news" element={<ArticleListPage />} />
          <Route path="article/:slug" element={<ArticleDetailPage />} />
          
          {/* 文章分类 */}
          <Route path="category/:slug" element={<CategoryPage />} />
          
          {/* 静态页面 */}
          <Route path="page/:slug" element={<PageDetail />} />
          
          {/* 其他路由占位 */}
          <Route path="services/*" element={<NotFoundPage message="服务页面开发中..." />} />
          <Route path="escorts" element={<NotFoundPage message="陪诊员页面开发中..." />} />
          <Route path="about" element={<NotFoundPage message="关于我们页面开发中..." />} />
          <Route path="booking" element={<NotFoundPage message="预约页面开发中..." />} />
          <Route path="help" element={<NotFoundPage message="帮助中心开发中..." />} />
          <Route path="faq" element={<NotFoundPage message="常见问题开发中..." />} />
          <Route path="terms" element={<NotFoundPage message="服务条款开发中..." />} />
          <Route path="privacy" element={<NotFoundPage message="隐私政策开发中..." />} />
          <Route path="join" element={<NotFoundPage message="加入我们开发中..." />} />
          
          {/* 陪诊员相关 */}
          <Route path="escort/*" element={<NotFoundPage message="陪诊员页面开发中..." />} />
          <Route path="login" element={<NotFoundPage message="登录页面开发中..." />} />
          
          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </SiteProvider>
  )
}

export default App
