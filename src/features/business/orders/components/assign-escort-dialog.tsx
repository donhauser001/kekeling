import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { orderApi, escortApi, type Escort } from '@/lib/api'

interface AssignEscortDialogProps {
  orderId: string
  orderNo: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AssignEscortDialog({
  orderId,
  orderNo,
  open,
  onOpenChange,
}: AssignEscortDialogProps) {
  const queryClient = useQueryClient()
  const [escorts, setEscorts] = useState<Escort[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [selectedEscortId, setSelectedEscortId] = useState<string>('')
  const [comboboxOpen, setComboboxOpen] = useState(false)

  // 加载陪诊员列表
  useEffect(() => {
    if (open) {
      loadEscorts()
    }
  }, [open])

  const loadEscorts = async () => {
    setLoading(true)
    try {
      const result = await escortApi.getList({
        status: 'active',
        workStatus: 'working',
        pageSize: 100,
      })
      setEscorts(result.data || [])
    } catch (error) {
      console.error('加载陪诊员列表失败:', error)
      toast.error('加载陪诊员列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleAssign = async () => {
    if (!selectedEscortId) {
      toast.error('请选择陪诊员')
      return
    }

    setSubmitting(true)
    try {
      await orderApi.assign(orderId, selectedEscortId)
      toast.success('派单成功')
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      onOpenChange(false)
      setSelectedEscortId('')
    } catch (error: any) {
      console.error('派单失败:', error)
      toast.error(error.message || '派单失败')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedEscort = escorts.find((e) => e.id === selectedEscortId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>派单</DialogTitle>
          <DialogDescription>
            为订单 {orderNo} 分配陪诊员
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">选择陪诊员</label>
              <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={comboboxOpen}
                    className="w-full justify-between"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        加载中...
                      </span>
                    ) : selectedEscort ? (
                      <span className="flex items-center gap-2">
                        <span>{selectedEscort.name}</span>
                        <span className="text-muted-foreground text-xs">
                          {selectedEscort.phone}
                        </span>
                      </span>
                    ) : (
                      '选择陪诊员...'
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[380px] p-0">
                  <Command>
                    <CommandInput placeholder="搜索陪诊员..." />
                    <CommandList>
                      <CommandEmpty>未找到陪诊员</CommandEmpty>
                      <CommandGroup>
                        {escorts.map((escort) => (
                          <CommandItem
                            key={escort.id}
                            value={`${escort.name} ${escort.phone}`}
                            onSelect={() => {
                              setSelectedEscortId(escort.id)
                              setComboboxOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                selectedEscortId === escort.id
                                  ? 'opacity-100'
                                  : 'opacity-0'
                              )}
                            />
                            <div className="flex flex-col">
                              <span className="font-medium">{escort.name}</span>
                              <span className="text-muted-foreground text-xs">
                                {escort.phone} · 评分 {escort.rating} · 完成{' '}
                                {escort.orderCount} 单
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {selectedEscort && (
              <div className="bg-muted rounded-lg p-3">
                <div className="text-sm font-medium mb-2">陪诊员信息</div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div>姓名：{selectedEscort.name}</div>
                  <div>手机号：{selectedEscort.phone}</div>
                  <div>评分：{selectedEscort.rating} 分</div>
                  <div>完成订单：{selectedEscort.orderCount} 单</div>
                  <div>
                    状态：
                    {selectedEscort.workStatus === 'working' && (
                      <span className="text-green-600">接单中</span>
                    )}
                    {selectedEscort.workStatus === 'resting' && (
                      <span className="text-yellow-600">休息中</span>
                    )}
                    {selectedEscort.workStatus === 'busy' && (
                      <span className="text-orange-600">服务中</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleAssign} disabled={!selectedEscortId || submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            确认派单
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
