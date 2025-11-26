import { type ChangeEvent, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import {
    LayoutGrid,
    List,
    Upload,
    FolderPlus,
    FolderOpen,
    SlidersHorizontal,
    ArrowUpAZ,
    ArrowDownAZ,
    PanelLeftClose,
    PanelLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { MessageButton } from '@/components/message-button'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { cn } from '@/lib/utils'
import { FileCard } from './components/file-card'
import { FolderTree } from './components/folder-tree'
import { type FileType, files, fileTypeConfig } from './data/files'

const route = getRouteApi('/_authenticated/files/')

type FilterType = 'all' | 'starred' | 'shared' | FileType

const filterOptions: { value: FilterType; label: string }[] = [
    { value: 'all', label: '全部文件' },
    { value: 'starred', label: '已收藏' },
    { value: 'shared', label: '已分享' },
    { value: 'document', label: '文档' },
    { value: 'image', label: '图片' },
    { value: 'video', label: '视频' },
    { value: 'audio', label: '音频' },
    { value: 'archive', label: '压缩包' },
    { value: 'code', label: '代码' },
    { value: 'spreadsheet', label: '表格' },
    { value: 'presentation', label: '演示' },
]

// 根据文件夹ID映射到筛选类型
function getFolderFilter(folderId: string): FilterType {
    const mapping: Record<string, FilterType> = {
        all: 'all',
        starred: 'starred',
        shared: 'shared',
        'cat-documents': 'document',
        'cat-images': 'image',
        'cat-videos': 'video',
        'cat-audio': 'audio',
        'cat-archives': 'archive',
    }
    return mapping[folderId] || 'all'
}

// 获取文件夹名称用于面包屑
function getFolderName(folderId: string): string {
    const names: Record<string, string> = {
        all: '全部文件',
        recent: '最近使用',
        starred: '已收藏',
        shared: '已分享',
        trash: '回收站',
        'cat-documents': '文档',
        'cat-images': '图片',
        'cat-videos': '视频',
        'cat-audio': '音频',
        'cat-archives': '压缩包',
    }
    return names[folderId] || '全部文件'
}

export function Files() {
    const {
        filter = '',
        sort: initSort = 'name',
        view: initView = 'grid',
        folder: initFolder = 'all',
    } = route.useSearch()
    const navigate = route.useNavigate()

    const [sort, setSort] = useState(initSort)
    const [searchTerm, setSearchTerm] = useState(filter)
    const [view, setView] = useState<'grid' | 'list'>(initView as 'grid' | 'list')
    const [selectedFolder, setSelectedFolder] = useState(initFolder)
    const [sidebarOpen, setSidebarOpen] = useState(true)

    // 根据选中的文件夹确定筛选类型
    const filterType = getFolderFilter(selectedFolder)

    const filteredFiles = files
        .sort((a, b) => {
            if (sort === 'name') return a.name.localeCompare(b.name)
            if (sort === 'name-desc') return b.name.localeCompare(a.name)
            if (sort === 'size') return b.size - a.size
            if (sort === 'date') return b.updatedAt.getTime() - a.updatedAt.getTime()
            return 0
        })
        .filter((file) => {
            if (filterType === 'all') return true
            if (filterType === 'starred') return file.starred
            if (filterType === 'shared') return file.shared
            return file.type === filterType
        })
        .filter((file) =>
            file.name.toLowerCase().includes(searchTerm.toLowerCase())
        )

    const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
        navigate({
            search: (prev) => ({
                ...prev,
                filter: e.target.value || undefined,
            }),
        })
    }

    const handleSortChange = (value: string) => {
        setSort(value)
        navigate({ search: (prev) => ({ ...prev, sort: value }) })
    }

    const handleViewChange = (value: string) => {
        setView(value as 'grid' | 'list')
        navigate({ search: (prev) => ({ ...prev, view: value }) })
    }

    const handleFolderSelect = (folderId: string) => {
        setSelectedFolder(folderId)
        navigate({ search: (prev) => ({ ...prev, folder: folderId }) })
    }

    return (
        <>
            {/* ===== Top Heading ===== */}
            <Header>
                <Search />
                <div className='ms-auto flex items-center gap-4'>
                    <MessageButton />
                    <ThemeSwitch />
                    <ConfigDrawer />
                    <ProfileDropdown />
                </div>
            </Header>

            {/* ===== Content ===== */}
            <Main fixed className='flex h-[calc(100vh-theme(spacing.16))] flex-col'>
                {/* 顶部标题区域 */}
                <div className='flex flex-col gap-4 pb-4 md:flex-row md:items-center md:justify-between'>
                    <div>
                        <h1 className='text-2xl font-bold tracking-tight'>文件中心</h1>
                        <p className='text-muted-foreground'>管理和浏览您的所有文件</p>
                    </div>
                    <div className='flex gap-2'>
                        <Button variant='outline'>
                            <FolderPlus className='mr-2 h-4 w-4' />
                            新建文件夹
                        </Button>
                        <Button>
                            <Upload className='mr-2 h-4 w-4' />
                            上传文件
                        </Button>
                    </div>
                </div>

                {/* 主内容区域：侧边栏 + 文件列表 */}
                <div className='flex min-h-0 flex-1 gap-4'>
                    {/* 左侧目录树侧边栏 */}
                    <div
                        className={cn(
                            'border-border bg-muted/30 shrink-0 overflow-hidden rounded-lg border transition-all duration-300',
                            sidebarOpen ? 'w-60' : 'w-0 border-0'
                        )}
                    >
                        {sidebarOpen && (
                            <FolderTree
                                selectedFolder={selectedFolder}
                                onSelectFolder={handleFolderSelect}
                            />
                        )}
                    </div>

                    {/* 右侧文件列表区域 */}
                    <div className='flex min-w-0 flex-1 flex-col'>
                        {/* 工具栏 */}
                        <div className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                            <div className='flex items-center gap-2'>
                                <Button
                                    variant='ghost'
                                    size='icon'
                                    className='h-8 w-8'
                                    onClick={() => setSidebarOpen(!sidebarOpen)}
                                    title={sidebarOpen ? '收起目录' : '展开目录'}
                                >
                                    {sidebarOpen ? (
                                        <PanelLeftClose className='h-4 w-4' />
                                    ) : (
                                        <PanelLeft className='h-4 w-4' />
                                    )}
                                </Button>
                                <Separator orientation='vertical' className='h-6' />
                                <div className='text-sm font-medium'>
                                    {getFolderName(selectedFolder)}
                                </div>
                                <span className='text-muted-foreground text-sm'>
                                    ({filteredFiles.length} 个文件)
                                </span>
                            </div>
                            <div className='flex items-center gap-2'>
                                <Input
                                    placeholder='搜索文件...'
                                    className='h-8 w-[180px]'
                                    value={searchTerm}
                                    onChange={handleSearch}
                                />
                                <Select value={sort} onValueChange={handleSortChange}>
                                    <SelectTrigger className='h-8 w-[110px]'>
                                        <SlidersHorizontal className='mr-1.5 h-3.5 w-3.5' />
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent align='end'>
                                        <SelectItem value='name'>
                                            <div className='flex items-center gap-2'>
                                                <ArrowUpAZ className='h-3.5 w-3.5' />
                                                名称升序
                                            </div>
                                        </SelectItem>
                                        <SelectItem value='name-desc'>
                                            <div className='flex items-center gap-2'>
                                                <ArrowDownAZ className='h-3.5 w-3.5' />
                                                名称降序
                                            </div>
                                        </SelectItem>
                                        <SelectItem value='size'>大小</SelectItem>
                                        <SelectItem value='date'>日期</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Tabs value={view} onValueChange={handleViewChange}>
                                    <TabsList className='h-8'>
                                        <TabsTrigger value='grid' className='px-2'>
                                            <LayoutGrid className='h-3.5 w-3.5' />
                                        </TabsTrigger>
                                        <TabsTrigger value='list' className='px-2'>
                                            <List className='h-3.5 w-3.5' />
                                        </TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>
                        </div>

                        {/* 文件类型快捷筛选 */}
                        <div className='mb-3 flex flex-wrap gap-1.5'>
                            {Object.entries(fileTypeConfig).map(([key, config]) => {
                                const count = files.filter((f) => f.type === key).length
                                if (count === 0) return null
                                const Icon = config.icon
                                const isActive =
                                    (filterType === key) ||
                                    (selectedFolder === `cat-${key}s`) ||
                                    (selectedFolder === `cat-${key}`)
                                return (
                                    <Button
                                        key={key}
                                        variant={isActive ? 'secondary' : 'ghost'}
                                        size='sm'
                                        className='h-7 text-xs'
                                        onClick={() => handleFolderSelect(`cat-${key}s`)}
                                    >
                                        <Icon className={cn('mr-1 h-3.5 w-3.5', config.color)} />
                                        {config.label}
                                        <span className='text-muted-foreground ml-1'>{count}</span>
                                    </Button>
                                )
                            })}
                        </div>

                        {/* 文件列表 */}
                        <div className='min-h-0 flex-1 overflow-auto'>
                            {filteredFiles.length === 0 ? (
                                <div className='flex h-full flex-col items-center justify-center'>
                                    <FolderOpen className='text-muted-foreground h-12 w-12' />
                                    <h3 className='mt-3 font-semibold'>没有找到文件</h3>
                                    <p className='text-muted-foreground mt-1 text-sm'>
                                        尝试调整筛选条件或上传新文件
                                    </p>
                                </div>
                            ) : (
                                <div
                                    className={cn(
                                        view === 'grid'
                                            ? 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                                            : 'flex flex-col gap-1.5'
                                    )}
                                >
                                    {filteredFiles.map((file) => (
                                        <FileCard key={file.id} file={file} view={view} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Main>
        </>
    )
}
