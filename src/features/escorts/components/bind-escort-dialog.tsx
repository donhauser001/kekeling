import { useState, useEffect, useRef } from 'react'
import { useQueryClient, useQuery } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { escortApi, userApi, type User } from '@/lib/api'
import { toast } from 'sonner'
import { type Escort } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Search, Loader2, User as UserIcon, Phone, X, Check } from 'lucide-react'

interface BindEscortDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  escort: Escort | null
  mode: 'bind' | 'unbind'
}

export function BindEscortDialog({
  open,
  onOpenChange,
  escort,
  mode,
}: BindEscortDialogProps) {
  const queryClient = useQueryClient()
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [debouncedKeyword, setDebouncedKeyword] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 防抖搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(searchKeyword)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchKeyword])

  // 搜索用户
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['users-search', debouncedKeyword],
    queryFn: () => userApi.getList({ keyword: debouncedKeyword, pageSize: 10 }),
    enabled: debouncedKeyword.length >= 2 && mode === 'bind',
  })

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 重置状态
  useEffect(() => {
    if (open) {
      setSelectedUser(null)
      setSearchKeyword('')
      setReason('')
      setShowDropdown(false)
    }
  }, [open])

  const handleSelectUser = (user: User) => {
    setSelectedUser(user)
    setSearchKeyword('')
    setShowDropdown(false)
  }

  const handleClearSelection = () => {
    setSelectedUser(null)
    setSearchKeyword('')
    inputRef.current?.focus()
  }

  const handleSubmit = async () => {
    if (!escort) return

    if (mode === 'bind' && !selectedUser) {
      toast.error('请选择要绑定的用户')
      return
    }

    setLoading(true)
    try {
      if (mode === 'bind') {
        await escortApi.bind(escort.id, selectedUser!.id, reason || undefined)
        toast.success('绑定成功')
      } else {
        await escortApi.unbind(escort.id, reason || undefined)
        toast.success('解绑成功')
      }
      queryClient.invalidateQueries({ queryKey: ['escorts'] })
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.message || `${mode === 'bind' ? '绑定' : '解绑'}失败`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>
            {mode === 'bind' ? '绑定用户' : '解除绑定'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'bind'
              ? `将用户绑定到陪诊员 ${escort?.name || ''}`
              : `解除陪诊员 ${escort?.name || ''} 的用户绑定`}
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4 py-4'>
          {mode === 'bind' && (
            <div className='space-y-2'>
              <Label>选择用户</Label>

              {/* 已选择的用户 */}
              {selectedUser ? (
                <div className='flex items-center justify-between rounded-md border bg-muted/50 p-3'>
                  <div className='flex items-center gap-3'>
                    <div className='flex h-10 w-10 items-center justify-center rounded-full bg-primary/10'>
                      <UserIcon className='h-5 w-5 text-primary' />
                    </div>
                    <div>
                      <p className='font-medium'>{selectedUser.nickname || '未设置昵称'}</p>
                      <p className='text-sm text-muted-foreground flex items-center gap-1'>
                        <Phone className='h-3 w-3' />
                        {selectedUser.phone || '未绑定手机'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8'
                    onClick={handleClearSelection}
                  >
                    <X className='h-4 w-4' />
                  </Button>
                </div>
              ) : (
                /* 搜索输入框 */
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                  <Input
                    ref={inputRef}
                    value={searchKeyword}
                    onChange={(e) => {
                      setSearchKeyword(e.target.value)
                      setShowDropdown(true)
                    }}
                    onFocus={() => setShowDropdown(true)}
                    placeholder='输入手机号或昵称搜索用户...'
                    className='pl-9'
                  />
                  {isSearching && (
                    <Loader2 className='absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground' />
                  )}

                  {/* 搜索结果下拉框 */}
                  {showDropdown && debouncedKeyword.length >= 2 && (
                    <div
                      ref={dropdownRef}
                      className='absolute top-full left-0 right-0 z-50 mt-1 max-h-64 overflow-auto rounded-md border bg-popover shadow-md'
                    >
                      {isSearching ? (
                        <div className='flex items-center justify-center py-6'>
                          <Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
                        </div>
                      ) : searchResults?.data && searchResults.data.length > 0 ? (
                        <div className='py-1'>
                          {searchResults.data.map((user) => (
                            <button
                              key={user.id}
                              type='button'
                              className={cn(
                                'flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-accent',
                                user.isEscort && 'opacity-50'
                              )}
                              onClick={() => handleSelectUser(user)}
                              disabled={user.isEscort}
                            >
                              <div className='flex h-8 w-8 items-center justify-center rounded-full bg-muted'>
                                <UserIcon className='h-4 w-4 text-muted-foreground' />
                              </div>
                              <div className='flex-1 min-w-0'>
                                <p className='truncate font-medium text-sm'>
                                  {user.nickname || '未设置昵称'}
                                </p>
                                <p className='truncate text-xs text-muted-foreground'>
                                  {user.phone || '未绑定手机'}
                                </p>
                              </div>
                              {user.isEscort && (
                                <span className='text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded'>
                                  已是陪诊员
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className='py-6 text-center text-sm text-muted-foreground'>
                          未找到匹配的用户
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              <p className='text-xs text-muted-foreground'>
                输入至少 2 个字符开始搜索
              </p>
            </div>
          )}
          <div className='space-y-2'>
            <Label htmlFor='reason'>原因（可选）</Label>
            <Textarea
              id='reason'
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder='请输入操作原因'
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || (mode === 'bind' && !selectedUser)}
          >
            {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {loading ? '处理中...' : mode === 'bind' ? '确认绑定' : '确认解绑'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
