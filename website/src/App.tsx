import { Routes, Route } from 'react-router-dom'
import { SiteProvider } from './context/SiteContext'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { ArticleListPage } from './pages/ArticleListPage'
import { ArticleDetailPage } from './pages/ArticleDetailPage'
import { CategoryPage } from './pages/CategoryPage'
import { PageDetail } from './pages/PageDetail'
import { AboutPage } from './pages/AboutPage'
import { ServicesPage } from './pages/ServicesPage'
import { ServiceDetailPage } from './pages/ServiceDetailPage'
import { NotFoundPage } from './pages/NotFoundPage'
// 用户认证页面
import { LoginPage } from './pages/LoginPage'
// 陪诊员页面
import { EscortLoginPage } from './pages/EscortLoginPage'
import { EscortRegisterPage } from './pages/EscortRegisterPage'
import { EscortForgotPasswordPage } from './pages/EscortForgotPasswordPage'
import { EscortProfilePage } from './pages/EscortProfilePage'

function App() {
  return (
    <SiteProvider>
      <Routes>
        {/* 独立页面（不使用 Layout） */}
        <Route path="login" element={<LoginPage />} />
        <Route path="escort/login" element={<EscortLoginPage />} />
        <Route path="escort/register" element={<EscortRegisterPage />} />
        <Route path="escort/forgot-password" element={<EscortForgotPasswordPage />} />
        <Route path="escort/profile" element={<EscortProfilePage />} />
        
        {/* 带 Layout 的页面 */}
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
          <Route path="escort-terms" element={<PageDetail slugOverride="escort-terms" />} />
          <Route path="terms" element={<PageDetail slugOverride="terms" />} />
          
          {/* 服务项目 */}
          <Route path="services" element={<ServicesPage />} />
          <Route path="services/:id" element={<ServiceDetailPage />} />
          
          {/* 其他路由占位 */}
          <Route path="escorts" element={<NotFoundPage message="陪诊员页面开发中..." />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="booking" element={<NotFoundPage message="预约页面开发中..." />} />
          <Route path="help" element={<NotFoundPage message="帮助中心开发中..." />} />
          <Route path="faq" element={<NotFoundPage message="常见问题开发中..." />} />
          <Route path="privacy" element={<NotFoundPage message="隐私政策开发中..." />} />
          <Route path="join" element={<NotFoundPage message="加入我们开发中..." />} />
          
          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </SiteProvider>
  )
}

export default App
