/**
 * 搜索框组件
 */

import { Search } from 'lucide-react'

export function SearchBar() {
  return (
    <div className='relative z-10 px-3'>
      <div className='flex items-center gap-2.5 rounded-full bg-white px-4 py-3 shadow-md'>
        <Search className='h-5 w-5 text-gray-400' />
        <span className='text-sm text-gray-400'>搜索服务、医院、医生</span>
      </div>
    </div>
  )
}
