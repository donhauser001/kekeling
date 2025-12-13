import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import type { Patient, CreatePatientData } from '@/lib/api'

interface PatientFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patient?: Patient | null
  userId?: string
  onSubmit: (data: CreatePatientData) => Promise<void>
  isLoading?: boolean
}

const relationOptions = [
  '本人',
  '配偶',
  '父母',
  '子女',
  '兄弟姐妹',
  '其他亲属',
  '朋友',
  '其他',
]

export function PatientFormDialog({
  open,
  onOpenChange,
  patient,
  onSubmit,
  isLoading,
}: PatientFormDialogProps) {
  const isEdit = !!patient

  const [form, setForm] = useState<CreatePatientData>({
    name: '',
    gender: 'male',
    birthday: '',
    phone: '',
    idCard: '',
    relation: '本人',
    isDefault: false,
  })

  // 编辑时回填数据
  useEffect(() => {
    if (patient) {
      setForm({
        name: patient.name,
        gender: patient.gender,
        birthday: patient.birthday ? patient.birthday.split('T')[0] : '',
        phone: patient.phone,
        idCard: patient.idCard || '',
        relation: patient.relation,
        isDefault: patient.isDefault,
      })
    } else {
      setForm({
        name: '',
        gender: 'male',
        birthday: '',
        phone: '',
        idCard: '',
        relation: '本人',
        isDefault: false,
      })
    }
  }, [patient, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(form)
  }

  const updateField = <K extends keyof CreatePatientData>(
    key: K,
    value: CreatePatientData[K]
  ) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const isValid = form.name && form.phone && form.relation

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? '编辑就诊人' : '添加就诊人'}</DialogTitle>
            <DialogDescription>
              {isEdit ? '修改就诊人的基本信息' : '填写就诊人的基本信息'}
            </DialogDescription>
          </DialogHeader>

          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='name' className='text-right'>
                姓名 <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='name'
                value={form.name}
                onChange={e => updateField('name', e.target.value)}
                className='col-span-3'
                placeholder='请输入真实姓名'
              />
            </div>

            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='gender' className='text-right'>
                性别 <span className='text-destructive'>*</span>
              </Label>
              <Select
                value={form.gender}
                onValueChange={value => updateField('gender', value)}
              >
                <SelectTrigger className='col-span-3'>
                  <SelectValue placeholder='选择性别' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='male'>男</SelectItem>
                  <SelectItem value='female'>女</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='birthday' className='text-right'>
                出生日期
              </Label>
              <Input
                id='birthday'
                type='date'
                value={form.birthday || ''}
                onChange={e => updateField('birthday', e.target.value)}
                className='col-span-3'
              />
            </div>

            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='phone' className='text-right'>
                手机号 <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='phone'
                value={form.phone}
                onChange={e => updateField('phone', e.target.value)}
                className='col-span-3'
                placeholder='请输入手机号'
                maxLength={11}
              />
            </div>

            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='idCard' className='text-right'>
                身份证号
              </Label>
              <Input
                id='idCard'
                value={form.idCard || ''}
                onChange={e => updateField('idCard', e.target.value.toUpperCase())}
                className='col-span-3'
                placeholder='选填'
                maxLength={18}
              />
            </div>

            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='relation' className='text-right'>
                关系 <span className='text-destructive'>*</span>
              </Label>
              <Select
                value={form.relation}
                onValueChange={value => updateField('relation', value)}
              >
                <SelectTrigger className='col-span-3'>
                  <SelectValue placeholder='选择与用户的关系' />
                </SelectTrigger>
                <SelectContent>
                  {relationOptions.map(option => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='isDefault' className='text-right'>
                设为默认
              </Label>
              <div className='col-span-3 flex items-center gap-2'>
                <Switch
                  id='isDefault'
                  checked={form.isDefault}
                  onCheckedChange={checked => updateField('isDefault', checked)}
                />
                <span className='text-muted-foreground text-sm'>
                  {form.isDefault ? '是' : '否'}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button type='submit' disabled={!isValid || isLoading}>
              {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              {isEdit ? '保存' : '添加'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
