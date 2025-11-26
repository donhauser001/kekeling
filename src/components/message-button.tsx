import { Link } from '@tanstack/react-router'
import { MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'

interface MessageButtonProps {
    unreadCount?: number
}

export function MessageButton({ unreadCount = 3 }: MessageButtonProps) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant='ghost'
                        size='icon'
                        className='relative'
                        asChild
                    >
                        <Link to='/chats'>
                            <MessageSquare className='h-5 w-5' />
                            {unreadCount > 0 && (
                                <span className='absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white'>
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                            <span className='sr-only'>消息中心</span>
                        </Link>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>消息中心 {unreadCount > 0 && `(${unreadCount}条未读)`}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}

