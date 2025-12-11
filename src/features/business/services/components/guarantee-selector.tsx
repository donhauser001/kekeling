import { useState } from 'react'
import {
    Shield,
    Check,
    Star,
    Heart,
    Clock,
    Banknote,
    Lock,
    ThumbsUp,
    Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import type { ServiceGuarantee } from '@/lib/api'

// 根据图标名称获取图标组件
const getGuaranteeIcon = (iconName: string, className = 'h-4 w-4') => {
    switch (iconName) {
        case 'shield':
            return <Shield className={className} />
        case 'check':
            return <Check className={className} />
        case 'star':
            return <Star className={className} />
        case 'heart':
            return <Heart className={className} />
        case 'clock':
            return <Clock className={className} />
        case 'money':
            return <Banknote className={className} />
        case 'lock':
            return <Lock className={className} />
        case 'thumbs-up':
            return <ThumbsUp className={className} />
        default:
            return <Shield className={className} />
    }
}

interface GuaranteeSelectorProps {
    guarantees: ServiceGuarantee[]
    selectedIds: string[]
    onToggle: (id: string) => void
    onNavigate: () => void
}

export function GuaranteeSelector({
    guarantees,
    selectedIds,
    onToggle,
    onNavigate,
}: GuaranteeSelectorProps) {
    const [displayCount, setDisplayCount] = useState(5)
    const PAGE_SIZE = 5

    const displayedGuarantees = guarantees.slice(0, displayCount)
    const hasMore = displayCount < guarantees.length

    const loadMore = () => {
        setDisplayCount(prev => Math.min(prev + PAGE_SIZE, guarantees.length))
    }

    if (!guarantees || guarantees.length === 0) {
        return (
            <div className='text-center py-4'>
                <p className='text-sm text-muted-foreground mb-2'>
                    暂无可用的服务保障
                </p>
                <Button variant='outline' size='sm' onClick={onNavigate}>
                    前往创建
                </Button>
            </div>
        )
    }

    return (
        <div className='space-y-2'>
            {displayedGuarantees.map(guarantee => (
                <div
                    key={guarantee.id}
                    className='flex gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors'
                    onClick={() => onToggle(guarantee.id)}
                >
                    <Checkbox
                        checked={selectedIds.includes(guarantee.id)}
                        onCheckedChange={() => onToggle(guarantee.id)}
                        className='mt-0.5'
                    />
                    <span className='text-emerald-500 mt-0.5 shrink-0'>
                        {getGuaranteeIcon(guarantee.icon, 'h-4 w-4')}
                    </span>
                    <div className='flex-1 min-w-0'>
                        <p className='text-sm font-medium leading-tight'>{guarantee.name}</p>
                        {guarantee.description && (
                            <p className='text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed'>
                                {guarantee.description}
                            </p>
                        )}
                    </div>
                </div>
            ))}

            {hasMore && (
                <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    className='w-full text-muted-foreground mt-2'
                    onClick={loadMore}
                >
                    <Plus className='mr-1 h-3 w-3' />
                    加载更多（剩余 {guarantees.length - displayCount} 项）
                </Button>
            )}
        </div>
    )
}
