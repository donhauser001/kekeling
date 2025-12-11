import { useState, useEffect } from 'react'
import { Loader2, X, Plus, Building2 } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useCreateEscort, useUpdateEscort, useHospitals } from '@/hooks/use-api'
import type { Escort, CreateEscortData, UpdateEscortData } from '@/lib/api'

interface EscortFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  escort: Escort | null // null 表示新建
  onSuccess: () => void
}

// 表单数据类型
interface FormData {
  name: string
  gender: 'male' | 'female'
  phone: string
  idCard: string
  cityCode: string
  level: 'senior' | 'intermediate' | 'junior' | 'trainee'
  experience: string
  introduction: string
  tags: string[]
  hospitalIds: string[]
}

const defaultFormData: FormData = {
  name: '',
  gender: 'male',
  phone: '',
  idCard: '',
  cityCode: '110100',
  level: 'junior',
  experience: '',
  introduction: '',
  tags: [],
  hospitalIds: [],
}

// 城市代码映射
const cityCodes = [
  { code: '110100', name: '北京市' },
  { code: '310100', name: '上海市' },
  { code: '440100', name: '广州市' },
  { code: '440300', name: '深圳市' },
  { code: '330100', name: '杭州市' },
]

// 预设标签
const presetTags = [
  '耐心细致', '经验丰富', '24小时服务', '三甲医院专家',
  '儿科专长', '老年护理', '护理专业', '持证上岗',
  '妇产科', '骨科专长', '肿瘤科专家', 'VIP专属',
]

export function EscortFormDialog({
  open,
  onOpenChange,
  escort,
  onSuccess,
}: EscortFormDialogProps) {
  const [formData, setFormData] = useState<FormData>(defaultFormData)
  const [tagInput, setTagInput] = useState('')
  const [hospitalPopoverOpen, setHospitalPopoverOpen] = useState(false)

  const createMutation = useCreateEscort()
  const updateMutation = useUpdateEscort()
  const { data: hospitalsData } = useHospitals({ pageSize: 100 })

  const hospitals = hospitalsData?.data || []
  const isEditing = !!escort

  // 初始化表单
  useEffect(() => {
    if (escort) {
      setFormData({
        name: escort.name,
        gender: escort.gender,
        phone: escort.phone,
        idCard: escort.idCard || '',
        cityCode: escort.cityCode,
        level: escort.level,
        experience: escort.experience || '',
        introduction: escort.introduction || '',
        tags: escort.tags || [],
        hospitalIds: escort.hospitals.map(h => h.id),
      })
    } else {
      setFormData(defaultFormData)
    }
  }, [escort, open])

  // 更新字段
  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  // 添加标签
  const addTag = (tag: string) => {
    const trimmed = tag.trim()
    if (trimmed && !formData.tags.includes(trimmed)) {
      updateField('tags', [...formData.tags, trimmed])
    }
    setTagInput('')
  }

  // 删除标签
  const removeTag = (tag: string) => {
    updateField('tags', formData.tags.filter(t => t !== tag))
  }

  // 切换医院选择
  const toggleHospital = (hospitalId: string) => {
    if (formData.hospitalIds.includes(hospitalId)) {
      updateField('hospitalIds', formData.hospitalIds.filter(id => id !== hospitalId))
    } else {
      updateField('hospitalIds', [...formData.hospitalIds, hospitalId])
    }
  }

  // 提交表单
  const handleSubmit = async () => {
    // 验证
    if (!formData.name.trim()) {
      toast.error('请输入姓名')
      return
    }
    if (!formData.phone.trim()) {
      toast.error('请输入手机号')
      return
    }
    if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      toast.error('请输入有效的手机号')
      return
    }

    try {
      if (isEditing) {
        const updateData: UpdateEscortData = {
          name: formData.name.trim(),
          gender: formData.gender,
          phone: formData.phone.trim(),
          idCard: formData.idCard.trim() || undefined,
          cityCode: formData.cityCode,
          level: formData.level,
          experience: formData.experience.trim() || undefined,
          introduction: formData.introduction.trim() || undefined,
          tags: formData.tags.length ? formData.tags : undefined,
        }
        await updateMutation.mutateAsync({ id: escort!.id, data: updateData })
        toast.success('更新成功')
      } else {
        const createData: CreateEscortData = {
          name: formData.name.trim(),
          gender: formData.gender,
          phone: formData.phone.trim(),
          idCard: formData.idCard.trim() || undefined,
          cityCode: formData.cityCode,
          level: formData.level,
          experience: formData.experience.trim() || undefined,
          introduction: formData.introduction.trim() || undefined,
          tags: formData.tags.length ? formData.tags : undefined,
          hospitalIds: formData.hospitalIds.length ? formData.hospitalIds : undefined,
        }
        await createMutation.mutateAsync(createData)
        toast.success('创建成功')
      }
      onSuccess()
    } catch (err: any) {
      toast.error(err.message || '操作失败')
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] max-w-2xl overflow-hidden'>
        <DialogHeader>
          <DialogTitle>{isEditing ? '编辑陪诊员' : '新增陪诊员'}</DialogTitle>
          <DialogDescription>
            {isEditing ? '修改陪诊员信息' : '填写基本信息创建新陪诊员'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className='max-h-[60vh] pr-4'>
          <div className='space-y-6 py-4'>
            {/* 基本信息 */}
            <div className='space-y-4'>
              <h4 className='text-sm font-medium'>基本信息</h4>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='name'>姓名 *</Label>
                  <Input
                    id='name'
                    value={formData.name}
                    onChange={e => updateField('name', e.target.value)}
                    placeholder='请输入姓名'
                  />
                </div>
                <div className='space-y-2'>
                  <Label>性别 *</Label>
                  <RadioGroup
                    value={formData.gender}
                    onValueChange={v => updateField('gender', v as 'male' | 'female')}
                    className='flex gap-4'
                  >
                    <div className='flex items-center space-x-2'>
                      <RadioGroupItem value='male' id='male' />
                      <Label htmlFor='male' className='cursor-pointer'>男</Label>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <RadioGroupItem value='female' id='female' />
                      <Label htmlFor='female' className='cursor-pointer'>女</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='phone'>手机号 *</Label>
                  <Input
                    id='phone'
                    value={formData.phone}
                    onChange={e => updateField('phone', e.target.value)}
                    placeholder='请输入手机号'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='idCard'>身份证号</Label>
                  <Input
                    id='idCard'
                    value={formData.idCard}
                    onChange={e => updateField('idCard', e.target.value)}
                    placeholder='请输入身份证号'
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* 职业信息 */}
            <div className='space-y-4'>
              <h4 className='text-sm font-medium'>职业信息</h4>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='level'>等级 *</Label>
                  <Select
                    value={formData.level}
                    onValueChange={v => updateField('level', v as FormData['level'])}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='senior'>资深</SelectItem>
                      <SelectItem value='intermediate'>中级</SelectItem>
                      <SelectItem value='junior'>初级</SelectItem>
                      <SelectItem value='trainee'>实习</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='experience'>从业年限</Label>
                  <Input
                    id='experience'
                    value={formData.experience}
                    onChange={e => updateField('experience', e.target.value)}
                    placeholder='如: 5年'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='cityCode'>服务城市 *</Label>
                  <Select
                    value={formData.cityCode}
                    onValueChange={v => updateField('cityCode', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {cityCodes.map(city => (
                        <SelectItem key={city.code} value={city.code}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='introduction'>个人简介</Label>
                <Textarea
                  id='introduction'
                  value={formData.introduction}
                  onChange={e => updateField('introduction', e.target.value)}
                  placeholder='请输入个人简介，介绍服务经验和专长...'
                  rows={3}
                />
              </div>
            </div>

            <Separator />

            {/* 服务标签 */}
            <div className='space-y-4'>
              <h4 className='text-sm font-medium'>服务标签</h4>
              <div className='flex flex-wrap gap-2'>
                {formData.tags.map(tag => (
                  <Badge key={tag} variant='secondary' className='gap-1'>
                    {tag}
                    <X
                      className='h-3 w-3 cursor-pointer'
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
              <div className='flex gap-2'>
                <Input
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  placeholder='输入标签后按回车添加'
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTag(tagInput)
                    }
                  }}
                />
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => addTag(tagInput)}
                >
                  添加
                </Button>
              </div>
              <div className='flex flex-wrap gap-2'>
                {presetTags
                  .filter(tag => !formData.tags.includes(tag))
                  .slice(0, 8)
                  .map(tag => (
                    <Badge
                      key={tag}
                      variant='outline'
                      className='cursor-pointer hover:bg-secondary'
                      onClick={() => addTag(tag)}
                    >
                      + {tag}
                    </Badge>
                  ))}
              </div>
            </div>

            <Separator />

            {/* 关联医院 */}
            <div className='space-y-4'>
              <h4 className='text-sm font-medium'>关联医院</h4>
              <Popover open={hospitalPopoverOpen} onOpenChange={setHospitalPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant='outline' className='w-full justify-start'>
                    <Building2 className='mr-2 h-4 w-4' />
                    {formData.hospitalIds.length
                      ? `已选择 ${formData.hospitalIds.length} 家医院`
                      : '选择关联医院'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-[400px] p-0' align='start'>
                  <Command>
                    <CommandInput placeholder='搜索医院...' />
                    <CommandList>
                      <CommandEmpty>未找到医院</CommandEmpty>
                      <CommandGroup>
                        {hospitals.map(hospital => (
                          <CommandItem
                            key={hospital.id}
                            onSelect={() => toggleHospital(hospital.id)}
                            className='cursor-pointer'
                          >
                            <Checkbox
                              checked={formData.hospitalIds.includes(hospital.id)}
                              className='mr-2'
                            />
                            <span className='flex-1 truncate'>{hospital.name}</span>
                            <Badge variant='outline' className='ml-2 text-xs'>
                              {hospital.level}
                            </Badge>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {formData.hospitalIds.length > 0 && (
                <div className='flex flex-wrap gap-2'>
                  {formData.hospitalIds.map(id => {
                    const hospital = hospitals.find(h => h.id === id)
                    return hospital ? (
                      <Badge key={id} variant='secondary' className='gap-1'>
                        {hospital.name.length > 10
                          ? hospital.name.slice(0, 10) + '...'
                          : hospital.name}
                        <X
                          className='h-3 w-3 cursor-pointer'
                          onClick={() => toggleHospital(id)}
                        />
                      </Badge>
                    ) : null
                  })}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {isEditing ? '保存' : '创建'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

