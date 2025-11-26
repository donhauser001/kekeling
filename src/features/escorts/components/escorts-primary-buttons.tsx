import { MailPlus, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEscorts } from './escorts-provider'

export function EscortsPrimaryButtons() {
  const { setOpen } = useEscorts()
  return (
    <div className='flex gap-2'>
      <Button
        variant='outline'
        className='space-x-1'
        onClick={() => setOpen('invite')}
      >
        <span>邀请陪诊员</span> <MailPlus size={18} />
      </Button>
      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>添加陪诊员</span> <UserPlus size={18} />
      </Button>
    </div>
  )
}
