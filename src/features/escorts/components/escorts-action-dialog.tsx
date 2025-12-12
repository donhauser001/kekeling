'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { showSubmittedData } from '@/lib/show-submitted-data'
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'
import { SelectDropdown } from '@/components/select-dropdown'
import { TerminalPreview } from '@/components/terminal-preview'
import { categories } from '../data/data'
import { type Escort } from '../data/schema'

const formSchema = z
  .object({
    firstName: z.string().min(1, '请输入名字'),
    lastName: z.string().min(1, '请输入姓氏'),
    username: z.string().min(1, '请输入用户名'),
    phoneNumber: z.string().min(1, '请输入电话号码'),
    email: z.email({
      error: (iss) => (iss.input === '' ? '请输入邮箱地址' : undefined),
    }),
    password: z.string().transform((pwd) => pwd.trim()),
    category: z.string().min(1, '请选择分类'),
    confirmPassword: z.string().transform((pwd) => pwd.trim()),
    isEdit: z.boolean(),
  })
  .refine(
    (data) => {
      if (data.isEdit && !data.password) return true
      return data.password.length > 0
    },
    {
      message: '请输入密码',
      path: ['password'],
    }
  )
  .refine(
    ({ isEdit, password }) => {
      if (isEdit && !password) return true
      return password.length >= 8
    },
    {
      message: '密码至少需要8个字符',
      path: ['password'],
    }
  )
  .refine(
    ({ isEdit, password }) => {
      if (isEdit && !password) return true
      return /[a-z]/.test(password)
    },
    {
      message: '密码必须包含至少一个小写字母',
      path: ['password'],
    }
  )
  .refine(
    ({ isEdit, password }) => {
      if (isEdit && !password) return true
      return /\d/.test(password)
    },
    {
      message: '密码必须包含至少一个数字',
      path: ['password'],
    }
  )
  .refine(
    ({ isEdit, password, confirmPassword }) => {
      if (isEdit && !password) return true
      return password === confirmPassword
    },
    {
      message: '两次输入的密码不一致',
      path: ['confirmPassword'],
    }
  )
type EscortForm = z.infer<typeof formSchema>

type EscortActionDialogProps = {
  currentRow?: Escort
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EscortsActionDialog({
  currentRow,
  open,
  onOpenChange,
}: EscortActionDialogProps) {
  const isEdit = !!currentRow
  const form = useForm<EscortForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
        ...currentRow,
        password: '',
        confirmPassword: '',
        isEdit,
      }
      : {
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        category: '',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
        isEdit,
      },
  })

  const onSubmit = (values: EscortForm) => {
    form.reset()
    showSubmittedData(values)
    onOpenChange(false)
  }

  const isPasswordTouched = !!form.formState.dirtyFields.password

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-[900px]'>
        <DialogHeader className='text-start'>
          <DialogTitle>{isEdit ? '编辑陪诊员' : '添加新陪诊员'}</DialogTitle>
          <DialogDescription>
            {isEdit ? '在此处更新陪诊员信息。' : '在此处创建新陪诊员。'}
            完成后点击保存。
          </DialogDescription>
        </DialogHeader>

        <div className='flex gap-6'>
          {/* 左侧：表单 */}
          <div className='flex-1 max-h-[60vh] min-h-[300px] overflow-y-auto py-1 px-1'>
            <Form {...form}>
              <form
                id='escort-form'
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-4 px-0.5'
              >
                <FormField
                  control={form.control}
                  name='firstName'
                  render={({ field }) => (
                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                      <FormLabel className='col-span-2 text-end'>
                        名字
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder='张'
                          className='col-span-4'
                          autoComplete='off'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className='col-span-4 col-start-3' />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='lastName'
                  render={({ field }) => (
                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                      <FormLabel className='col-span-2 text-end'>
                        姓氏
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder='三'
                          className='col-span-4'
                          autoComplete='off'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className='col-span-4 col-start-3' />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='username'
                  render={({ field }) => (
                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                      <FormLabel className='col-span-2 text-end'>
                        用户名
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder='zhangsan'
                          className='col-span-4'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className='col-span-4 col-start-3' />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                      <FormLabel className='col-span-2 text-end'>邮箱</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='zhangsan@example.com'
                          className='col-span-4'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className='col-span-4 col-start-3' />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='phoneNumber'
                  render={({ field }) => (
                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                      <FormLabel className='col-span-2 text-end'>
                        电话号码
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder='13800138000'
                          className='col-span-4'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className='col-span-4 col-start-3' />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='category'
                  render={({ field }) => (
                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                      <FormLabel className='col-span-2 text-end'>分类</FormLabel>
                      <SelectDropdown
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        placeholder='请选择分类'
                        className='col-span-4'
                        items={categories.map(({ label, value }) => ({
                          label,
                          value,
                        }))}
                      />
                      <FormMessage className='col-span-4 col-start-3' />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='password'
                  render={({ field }) => (
                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                      <FormLabel className='col-span-2 text-end'>
                        密码
                      </FormLabel>
                      <FormControl>
                        <PasswordInput
                          placeholder='请输入密码'
                          className='col-span-4'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className='col-span-4 col-start-3' />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='confirmPassword'
                  render={({ field }) => (
                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                      <FormLabel className='col-span-2 text-end'>
                        确认密码
                      </FormLabel>
                      <FormControl>
                        <PasswordInput
                          disabled={!isPasswordTouched}
                          placeholder='请再次输入密码'
                          className='col-span-4'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className='col-span-4 col-start-3' />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>

          {/* 右侧：预览器 */}
          <div className='w-[375px] flex-shrink-0'>
            <div className='text-sm text-muted-foreground mb-2'>终端预览</div>
            <TerminalPreview
              page={isEdit ? 'escort-detail' : 'escort-list'}
              height={500}
              showFrame={false}
              autoLoad={false}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type='submit' form='escort-form'>
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
