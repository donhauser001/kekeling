import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'

interface NotFoundPageProps {
  message?: string
}

export function NotFoundPage({ message }: NotFoundPageProps) {
  return (
    <div className="min-h-screen pt-32 pb-20 bg-gray-50 flex items-center">
      <div className="max-w-lg mx-auto px-4 text-center">
        {/* Illustration */}
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-6xl">🔍</span>
          </div>
        </div>

        {/* Content */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {message ? '页面开发中' : '页面不存在'}
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          {message || '您访问的页面可能已被删除或移动，请检查链接是否正确。'}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="btn-primary inline-flex items-center justify-center"
          >
            <Home className="w-4 h-4 mr-2" />
            返回首页
          </Link>
          <button
            onClick={() => window.history.back()}
            className="btn-secondary inline-flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回上页
          </button>
        </div>
      </div>
    </div>
  )
}







