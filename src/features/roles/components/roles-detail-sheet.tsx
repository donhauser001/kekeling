import {
    Users,
    Check,
    Crown,
    Star,
    Building2,
    UserCheck,
    Zap,
    Gift,
    Tag,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface UserCategory {
    id: string
    name: string
    description: string
    userCount: number
    benefits: string[]
    isSystem: boolean
    color: string
    icon: 'crown' | 'star' | 'building' | 'user' | 'zap' | 'gift'
}

interface BenefitGroup {
    id: string
    name: string
    benefits: Array<{
        id: string
        name: string
        key: string
        description: string
    }>
}

interface RolesDetailSheetProps {
    category: UserCategory | null
    benefitGroups: BenefitGroup[]
    open: boolean
    onOpenChange: (open: boolean) => void
    getBenefitName: (key: string) => string
}

const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, typeof Crown> = {
        crown: Crown,
        star: Star,
        building: Building2,
        user: UserCheck,
        zap: Zap,
        gift: Gift,
    }
    return iconMap[iconName] || UserCheck
}

export function RolesDetailSheet({
    category,
    benefitGroups,
    open,
    onOpenChange,
    getBenefitName,
}: RolesDetailSheetProps) {
    if (!category) return null

    const IconComponent = getIconComponent(category.icon)

    // 将 benefits 按组分类
    const groupedBenefits = benefitGroups.map(group => ({
        ...group,
        enabledBenefits: group.benefits.filter(b =>
            category.benefits.includes('all') || category.benefits.includes(b.key)
        ),
    })).filter(g => g.enabledBenefits.length > 0)

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className='sm:max-w-md overflow-y-auto'>
                <SheetHeader className='pb-4'>
                    <div className='flex items-start gap-4'>
                        <div
                            className={cn(
                                'flex h-12 w-12 items-center justify-center rounded-lg',
                                category.color
                            )}
                        >
                            <IconComponent className='h-6 w-6 text-white' />
                        </div>
                        <div className='flex-1 space-y-1'>
                            <SheetTitle className='flex items-center gap-2'>
                                {category.name}
                                {category.isSystem && (
                                    <Badge variant='secondary' className='text-xs'>
                                        系统
                                    </Badge>
                                )}
                            </SheetTitle>
                            <SheetDescription className='flex items-center gap-2'>
                                <Users className='h-4 w-4' />
                                {category.userCount.toLocaleString()} 人
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <Separator className='my-4' />

                <ScrollArea className='h-[calc(100vh-200px)]'>
                    <div className='space-y-6 pr-4'>
                        {/* 分类描述 */}
                        <div className='space-y-3'>
                            <h4 className='flex items-center gap-2 text-sm font-medium'>
                                <Tag className='h-4 w-4' />
                                分类描述
                            </h4>
                            <p className='text-muted-foreground text-sm leading-relaxed'>
                                {category.description}
                            </p>
                        </div>

                        <Separator />

                        {/* 权益统计 */}
                        <div className='space-y-3'>
                            <h4 className='flex items-center gap-2 text-sm font-medium'>
                                <Check className='h-4 w-4' />
                                权益统计
                            </h4>
                            <div className='bg-muted/50 rounded-lg p-4'>
                                <div className='text-2xl font-bold'>
                                    {category.benefits.includes('all')
                                        ? '全部'
                                        : category.benefits.length}
                                </div>
                                <p className='text-muted-foreground text-sm'>个权益</p>
                            </div>
                        </div>

                        <Separator />

                        {/* 权益列表 */}
                        <div className='space-y-3'>
                            <h4 className='text-sm font-medium'>权益详情</h4>
                            {category.benefits.includes('all') ? (
                                <div className='bg-primary/5 rounded-lg p-4 text-center'>
                                    <Crown className='text-primary mx-auto h-8 w-8' />
                                    <p className='mt-2 font-medium'>拥有全部权益</p>
                                    <p className='text-muted-foreground text-sm'>
                                        此分类享有系统所有权益
                                    </p>
                                </div>
                            ) : (
                                <div className='space-y-4'>
                                    {groupedBenefits.map(group => (
                                        <div key={group.id} className='space-y-2'>
                                            <h5 className='text-muted-foreground text-xs font-medium uppercase'>
                                                {group.name}
                                            </h5>
                                            <div className='space-y-1'>
                                                {group.enabledBenefits.map(benefit => (
                                                    <div
                                                        key={benefit.id}
                                                        className='bg-muted/50 flex items-center gap-2 rounded-md px-3 py-2'
                                                    >
                                                        <Check className='text-primary h-4 w-4' />
                                                        <div>
                                                            <span className='text-sm font-medium'>
                                                                {benefit.name}
                                                            </span>
                                                            <p className='text-muted-foreground text-xs'>
                                                                {benefit.description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    )
}
