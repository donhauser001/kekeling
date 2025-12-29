import { useState, useMemo, useEffect } from 'react'
import { Tag, Plus, Loader2, X, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { MessageButton } from '@/components/message-button'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useArticles } from '@/hooks/use-api'

// 文章标签管理页面
// 注：文章标签存储在 Article 的 tags 字段中（字符串数组），不是独立的数据表
// 这个页面用于展示所有使用过的标签，并提供管理功能

export function ArticleTags() {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [newTag, setNewTag] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedTag, setSelectedTag] = useState<string | null>(null)

    // 获取所有文章，提取标签
    const { data: articlesData, isLoading } = useArticles({ pageSize: 1000 })

    // 统计所有标签及其使用次数
    const tagsWithCount = useMemo(() => {
        const tagMap = new Map<string, number>()

        if (articlesData?.list) {
            articlesData.list.forEach((article) => {
                article.tags?.forEach((tag) => {
                    tagMap.set(tag, (tagMap.get(tag) || 0) + 1)
                })
            })
        }

        return Array.from(tagMap.entries())
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count)
    }, [articlesData])

    // 过滤标签
    const filteredTags = useMemo(() => {
        if (!searchTerm) return tagsWithCount
        return tagsWithCount.filter((item) =>
            item.tag.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }, [tagsWithCount, searchTerm])

    // 添加新标签（实际上只是提供建议，需要在文章中使用才会生效）
    const handleAddTag = () => {
        if (!newTag.trim()) {
            toast.error('请输入标签名称')
            return
        }
        if (tagsWithCount.some((t) => t.tag === newTag.trim())) {
            toast.error('该标签已存在')
            return
        }
        toast.success('标签已添加，请在文章编辑时使用该标签')
        setDialogOpen(false)
        setNewTag('')
    }

    // 删除标签确认
    const handleDeleteClick = (tag: string) => {
        setSelectedTag(tag)
        setDeleteDialogOpen(true)
    }

    // 删除标签（提示用户需要在文章中移除）
    const handleConfirmDelete = () => {
        if (!selectedTag) return
        const usageCount = tagsWithCount.find((t) => t.tag === selectedTag)?.count || 0
        toast.info(
            `标签「${selectedTag}」正在被 ${usageCount} 篇文章使用。\n要删除此标签，请在相关文章中移除它。`,
            { duration: 5000 }
        )
        setDeleteDialogOpen(false)
        setSelectedTag(null)
    }

    return (
        <>
            <Header>
                <Search />
                <div className='ms-auto flex items-center gap-4'>
                    <MessageButton />
                    <ThemeSwitch />
                    <ConfigDrawer />
                    <ProfileDropdown />
                </div>
            </Header>

            <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
                <div className='flex flex-wrap items-end justify-between gap-2'>
                    <div>
                        <h2 className='text-2xl font-bold tracking-tight'>文章标签</h2>
                        <p className='text-muted-foreground'>
                            查看和管理文章使用的标签
                        </p>
                    </div>
                    <Button onClick={() => setDialogOpen(true)}>
                        <Plus className='mr-2 h-4 w-4' />
                        建议标签
                    </Button>
                </div>

                {/* 搜索框 */}
                <div className='flex items-center gap-4'>
                    <Input
                        placeholder='搜索标签...'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className='w-[250px]'
                    />
                    <span className='text-sm text-muted-foreground'>
                        共 {tagsWithCount.length} 个标签
                    </span>
                </div>

                {/* 标签列表 */}
                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'>
                            <Tag className='h-5 w-5' />
                            标签云
                        </CardTitle>
                        <CardDescription>
                            标签来源于文章，数字表示使用该标签的文章数量
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className='flex h-40 items-center justify-center'>
                                <Loader2 className='h-6 w-6 animate-spin' />
                            </div>
                        ) : filteredTags.length === 0 ? (
                            <div className='flex h-40 flex-col items-center justify-center text-muted-foreground'>
                                <Tag className='mb-2 h-8 w-8' />
                                <p>{searchTerm ? '未找到匹配的标签' : '暂无标签'}</p>
                            </div>
                        ) : (
                            <div className='flex flex-wrap gap-2'>
                                {filteredTags.map(({ tag, count }) => (
                                    <Badge
                                        key={tag}
                                        variant='outline'
                                        className='group cursor-default px-3 py-1.5 text-sm hover:bg-accent'
                                    >
                                        <span>{tag}</span>
                                        <span className='ml-2 rounded bg-muted px-1.5 text-xs text-muted-foreground'>
                                            {count}
                                        </span>
                                        <button
                                            className='ml-2 hidden text-muted-foreground hover:text-destructive group-hover:inline-flex'
                                            onClick={() => handleDeleteClick(tag)}
                                        >
                                            <X className='h-3 w-3' />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* 使用说明 */}
                <Card>
                    <CardHeader>
                        <CardTitle>使用说明</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-2 text-sm text-muted-foreground'>
                        <p>• 文章标签在编辑文章时添加，会自动出现在标签云中</p>
                        <p>• 标签用于文章分类和搜索，建议使用简短、准确的词语</p>
                        <p>• 删除标签需要在相关文章中移除该标签</p>
                        <p>• 点击「建议标签」可以预先规划常用标签</p>
                    </CardContent>
                </Card>
            </Main>

            {/* 添加标签弹窗 */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className='max-w-sm'>
                    <DialogHeader>
                        <DialogTitle className='flex items-center gap-2'>
                            <Tag className='h-5 w-5' />
                            建议标签
                        </DialogTitle>
                        <DialogDescription>
                            添加建议标签，在编辑文章时可快速选用
                        </DialogDescription>
                    </DialogHeader>

                    <div className='space-y-4'>
                        <div className='space-y-2'>
                            <Label>标签名称</Label>
                            <Input
                                placeholder='输入标签名称'
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                            />
                        </div>

                        {/* 常用标签建议 */}
                        <div className='space-y-2'>
                            <Label className='text-muted-foreground'>常用标签</Label>
                            <div className='flex flex-wrap gap-1'>
                                {['教程', '公告', '活动', '帮助', '新闻', '指南', '问答'].map((tag) => (
                                    <Badge
                                        key={tag}
                                        variant='outline'
                                        className='cursor-pointer hover:bg-accent'
                                        onClick={() => setNewTag(tag)}
                                    >
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className='flex justify-end gap-2 pt-4'>
                        <Button variant='outline' onClick={() => setDialogOpen(false)}>
                            取消
                        </Button>
                        <Button onClick={handleAddTag}>
                            添加
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* 删除确认弹窗 */}
            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                handleConfirm={handleConfirmDelete}
                title='删除标签'
                desc={
                    <>
                        标签「{selectedTag}」正在被使用中。
                        <span className='block mt-2 text-muted-foreground'>
                            要删除此标签，请在相关文章中移除它。
                        </span>
                    </>
                }
                confirmText='知道了'
            />
        </>
    )
}

