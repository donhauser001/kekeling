/**
 * 搜索框组件
 */

import { Search } from 'lucide-react'

interface SearchBarProps {
  isDarkMode?: boolean
}

export function SearchBar({ isDarkMode = false }: SearchBarProps) {
  return (
    <div className='relative z-10 px-3'>
      <div
        className='flex items-center gap-2.5 rounded-full px-4 py-3 shadow-md cursor-pointer transition-all duration-200 hover:shadow-lg active:scale-[0.98]'
        style={{
          backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
        }}
      >
        <Search
          className='h-5 w-5'
          style={{ color: isDarkMode ? '#6b7280' : '#9ca3af' }}
        />
        <span
          className='text-sm'
          style={{ color: isDarkMode ? '#6b7280' : '#9ca3af' }}
        >
          搜索服务、医院、医生
        </span>
      </div>
    </div>
  )
}
