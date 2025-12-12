import {
    Award,
    Star,
    Medal,
    GraduationCap,
    UserCheck,
    Heart,
    Users,
    Check,
    Calendar,
    Layers,
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

interface EscortCategory {
    id: string
    name: string
    description: string
    escortCount: number
    abilities: string[]
    isSystem: boolean
    color: string
    icon: 'award' | 'star' | 'medal' | 'graduate' | 'user' | 'heart'
}

interface AbilityGroup {
    id: string
    name: string
    abilities: Array<{ id: string; name: string; key: string; description: string }>
}

interface EscortCategoriesDetailSheetProps {
    category: EscortCategory | null
    open: boolean
    onOpenChange: (open: boolean) => void
    abilityGroups: AbilityGroup[]
}

const iconMap: Record<string, typeof Award> = {
    award: Award,
    star: Star,
    medal: Medal,
    graduate: GraduationCap,
    user: UserCheck,
    heart: Heart,
}

export function EscortCategoriesDetailSheet({
    category,
    open,
    onOpenChange,
    abilityGroups,
}: EscortCategoriesDetailSheetProps) {
    if (!category) return null

    const IconComponent = iconMap[category.icon] || UserCheck

    const getAbilityName = (key: string): string => {
        for (const group of abilityGroups) {
            const ability = group.abilities.find(b => b.key === key)
            if (ability) return ability.name
        }
        return key
    }

    const getAbilityDescription = (key: string): string => {
        for (const group of abilityGroups) {
            const ability = group.abilities.find(b => b.key === key)
            if (ability) return ability.description
        }
        return ''
    }

    // 按能力组分组显示
    const groupedAbilities = abilityGroups.map(group => ({
        ...group,
        items: group.abilities.filter(ability =>
            category.abilities.includes('all') || category.abilities.includes(ability.key)
        )
    })).filter(group => group.items.length > 0)

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className='sm:max-w-lg overflow-y-auto'>
                <SheetHeader className='pb-4'>
                    <div className='flex items-start gap-4'>
                        <div className={cn('flex h-14 w-14 items-center justify-center rounded-lg', category.color)}>
                            <IconComponent className='h-7 w-7 text-white' />
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
                                {category.escortCount.toLocaleString()} 名陪诊员
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <Separator className='my-4' />

                <ScrollArea className='h-[calc(100vh-200px)]'>
                    <div className='space-y-6 pr-4'>
                        {/* 描述 */}
                        <div className='space-y-2'>
                            <h4 className='text-sm font-medium'>分类描述</h4>
                            <p className='text-muted-foreground text-sm leading-relaxed'>
                                {category.description}
                            </p>
                        </div>

                        <Separator />

                        {/* 能力配置 */}
                        <div className='space-y-4'>
                            <h4 className='flex items-center gap-2 text-sm font-medium'>
                                <Layers className='h-4 w-4' />
                                能力配置
                                <Badge variant='outline' className='ml-auto'>
                                    {category.abilities.includes('all')
                                        ? '全部能力'
                                        : `${category.abilities.length} 项能力`}
                                </Badge>
                            </h4>

                            {category.abilities.includes('all') ? (
                                <div className='bg-muted/50 rounded-lg p-4'>
                                    <div className='flex items-center gap-2 text-sm font-medium text-green-600'>
                                        <Check className='h-4 w-4' />
                                        拥有全部能力
                                    </div>
                                    <p className='text-muted-foreground mt-1 text-sm'>
                                        该分类的陪诊员可以使用系统中的所有能力
                                    </p>
                                </div>
                            ) : (
                                <div className='space-y-4'>
                                    {groupedAbilities.map(group => (
                                        <div key={group.id} className='space-y-2'>
                                            <div className='flex items-center gap-2'>
                                                <span className='text-sm font-medium'>{group.name}</span>
                                                <Badge variant='secondary' className='text-xs'>
                                                    {group.items.length}
                                                </Badge>
                                            </div>
                                            <div className='space-y-1'>
                                                {group.items.map(ability => (
                                                    <div
                                                        key={ability.id}
                                                        className='bg-muted/50 flex items-center gap-2 rounded-md px-3 py-2'
                                                    >
                                                        <Check className='h-4 w-4 text-green-500' />
                                                        <span className='text-sm'>{ability.name}</span>
                                                        <span className='text-muted-foreground ml-auto text-xs'>
                                                            {ability.description}
                                                        </span>
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
