import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { MailPlus, Send } from 'lucide-react'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
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
import { Textarea } from '@/components/ui/textarea'
import { SelectDropdown } from '@/components/select-dropdown'
import { categories } from '../data/data'

const formSchema = z.object({
  email: z.email({
    error: (iss) =>
      iss.input === '' ? '请输入邀请邮箱地址' : undefined,
  }),
  category: z.string().min(1, '请选择分类'),
  desc: z.string().optional(),
})

type EscortInviteForm = z.infer<typeof formSchema>

type EscortInviteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EscortsInviteDialog({
  open,
  onOpenChange,
}: EscortInviteDialogProps) {
  const form = useForm<EscortInviteForm>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', category: '', desc: '' },
  })

  const onSubmit = (values: EscortInviteForm) => {
    form.reset()
    showSubmittedData(values)
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-md'>
        <DialogHeader className='text-start'>
          <DialogTitle className='flex items-center gap-2'>
            <MailPlus /> 邀请陪诊员
          </DialogTitle>
          <DialogDescription>
            通过发送邮件邀请新陪诊员加入您的团队。
            选择分类以定义其级别。
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='escort-invite-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>邮箱</FormLabel>
                  <FormControl>
                    <Input
                      type='email'
                      placeholder='例如：zhangsan@example.com'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='category'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>分类</FormLabel>
                  <SelectDropdown
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    placeholder='请选择分类'
                    items={categories.map(({ label, value }) => ({
                      label,
                      value,
                    }))}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='desc'
              render={({ field }) => (
                <FormItem className=''>
                  <FormLabel>备注（可选）</FormLabel>
                  <FormControl>
                    <Textarea
                      className='resize-none'
                      placeholder='添加邀请备注（可选）'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter className='gap-y-2'>
          <DialogClose asChild>
            <Button variant='outline'>取消</Button>
          </DialogClose>
          <Button type='submit' form='escort-invite-form'>
            发送邀请 <Send />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
