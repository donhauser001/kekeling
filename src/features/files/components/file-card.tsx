import {
    Download,
    Eye,
    MoreHorizontal,
    Share2,
    Star,
    Trash2,
    Edit,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import {
    type FileItem,
    fileTypeConfig,
    formatFileSize,
    formatDate,
} from '../data/files'

interface FileCardProps {
    file: FileItem
    view: 'grid' | 'list'
}

export function FileCard({ file, view }: FileCardProps) {
    const config = fileTypeConfig[file.type]
    const Icon = config.icon

    if (view === 'list') {
        return (
            <div className='hover:bg-muted/50 group flex items-center gap-4 rounded-lg border p-3 transition-colors'>
                <div
                    className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                        config.bgColor
                    )}
                >
                    <Icon className={cn('h-5 w-5', config.color)} />
                </div>
                <div className='min-w-0 flex-1'>
                    <div className='flex items-center gap-2'>
                        <p className='truncate font-medium'>{file.name}</p>
                        {file.starred && (
                            <Star className='h-4 w-4 shrink-0 fill-yellow-400 text-yellow-400' />
                        )}
                        {file.shared && (
                            <Share2 className='text-muted-foreground h-4 w-4 shrink-0' />
                        )}
                    </div>
                    <p className='text-muted-foreground text-sm'>
                        {formatFileSize(file.size)} · {formatDate(file.updatedAt)}
                    </p>
                </div>
                <FileActions file={file} />
            </div>
        )
    }

    return (
        <div className='hover:bg-muted/50 group relative rounded-lg border p-4 transition-colors'>
            <div className='absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100'>
                <FileActions file={file} />
            </div>
            <div
                className={cn(
                    'mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl',
                    config.bgColor
                )}
            >
                <Icon className={cn('h-8 w-8', config.color)} />
            </div>
            <div className='text-center'>
                <p className='mb-1 truncate font-medium' title={file.name}>
                    {file.name}
                </p>
                <p className='text-muted-foreground text-sm'>
                    {formatFileSize(file.size)}
                </p>
                <div className='mt-2 flex items-center justify-center gap-2'>
                    {file.starred && (
                        <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
                    )}
                    {file.shared && (
                        <Share2 className='text-muted-foreground h-4 w-4' />
                    )}
                </div>
            </div>
        </div>
    )
}

function FileActions({ file }: { file: FileItem }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='icon' className='h-8 w-8'>
                    <MoreHorizontal className='h-4 w-4' />
                    <span className='sr-only'>操作菜单</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
                <DropdownMenuItem>
                    <Eye className='mr-2 h-4 w-4' />
                    查看
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Download className='mr-2 h-4 w-4' />
                    下载
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Share2 className='mr-2 h-4 w-4' />
                    {file.shared ? '取消分享' : '分享'}
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Star className='mr-2 h-4 w-4' />
                    {file.starred ? '取消收藏' : '收藏'}
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Edit className='mr-2 h-4 w-4' />
                    重命名
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className='text-destructive'>
                    <Trash2 className='mr-2 h-4 w-4' />
                    删除
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

