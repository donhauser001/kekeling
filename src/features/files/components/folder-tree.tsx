import { useState } from 'react'
import {
    ChevronRight,
    ChevronDown,
    Folder,
    FolderOpen,
    Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
    type FolderItem,
    systemFolders,
    categoryFolders,
    userFolders,
} from '../data/folders'

interface FolderTreeProps {
    selectedFolder: string
    onSelectFolder: (folderId: string) => void
}

export function FolderTree({ selectedFolder, onSelectFolder }: FolderTreeProps) {
    return (
        <ScrollArea className='h-full'>
            <div className='space-y-4 p-3'>
                {/* 快捷入口 */}
                <div>
                    <div className='text-muted-foreground mb-2 px-2 text-xs font-semibold uppercase tracking-wider'>
                        快捷访问
                    </div>
                    <div className='space-y-0.5'>
                        {systemFolders.map((folder) => (
                            <FolderButton
                                key={folder.id}
                                folder={folder}
                                isSelected={selectedFolder === folder.id}
                                onSelect={onSelectFolder}
                            />
                        ))}
                    </div>
                </div>

                {/* 按类型分类 */}
                <div>
                    <div className='text-muted-foreground mb-2 px-2 text-xs font-semibold uppercase tracking-wider'>
                        文件类型
                    </div>
                    <div className='space-y-0.5'>
                        {categoryFolders.map((folder) => (
                            <FolderButton
                                key={folder.id}
                                folder={folder}
                                isSelected={selectedFolder === folder.id}
                                onSelect={onSelectFolder}
                            />
                        ))}
                    </div>
                </div>

                {/* 用户文件夹 */}
                <div>
                    <div className='text-muted-foreground mb-2 flex items-center justify-between px-2'>
                        <span className='text-xs font-semibold uppercase tracking-wider'>
                            文件目录
                        </span>
                        <Button
                            variant='ghost'
                            size='icon'
                            className='h-5 w-5'
                            title='新建文件夹'
                        >
                            <Plus className='h-3.5 w-3.5' />
                        </Button>
                    </div>
                    <div className='space-y-0.5'>
                        {userFolders.map((folder) => (
                            <FolderTreeItem
                                key={folder.id}
                                folder={folder}
                                selectedFolder={selectedFolder}
                                onSelect={onSelectFolder}
                                level={0}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </ScrollArea>
    )
}

interface FolderButtonProps {
    folder: FolderItem
    isSelected: boolean
    onSelect: (folderId: string) => void
}

function FolderButton({ folder, isSelected, onSelect }: FolderButtonProps) {
    const Icon = folder.icon || Folder

    return (
        <button
            onClick={() => onSelect(folder.id)}
            className={cn(
                'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                isSelected && 'bg-accent text-accent-foreground font-medium'
            )}
        >
            <Icon className='h-4 w-4 shrink-0' />
            <span className='truncate'>{folder.name}</span>
            {folder.count !== undefined && (
                <span className='text-muted-foreground ml-auto text-xs'>
                    {folder.count}
                </span>
            )}
        </button>
    )
}

interface FolderTreeItemProps {
    folder: FolderItem
    selectedFolder: string
    onSelect: (folderId: string) => void
    level: number
}

function FolderTreeItem({
    folder,
    selectedFolder,
    onSelect,
    level,
}: FolderTreeItemProps) {
    const [isOpen, setIsOpen] = useState(false)
    const hasChildren = folder.children && folder.children.length > 0
    const isSelected = selectedFolder === folder.id

    if (!hasChildren) {
        return (
            <button
                onClick={() => onSelect(folder.id)}
                className={cn(
                    'flex w-full items-center gap-1 rounded-md py-1.5 text-sm transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    isSelected && 'bg-accent text-accent-foreground font-medium'
                )}
                style={{ paddingLeft: `${level * 12 + 8}px`, paddingRight: '8px' }}
            >
                <div className='w-4' /> {/* 占位，对齐有子节点的项 */}
                <Folder className='text-primary h-4 w-4 shrink-0' />
                <span className='truncate'>{folder.name}</span>
            </button>
        )
    }

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
                <button
                    className={cn(
                        'flex w-full items-center gap-1 rounded-md py-1.5 text-sm transition-colors',
                        'hover:bg-accent hover:text-accent-foreground',
                        isSelected && 'bg-accent text-accent-foreground font-medium'
                    )}
                    style={{ paddingLeft: `${level * 12 + 8}px`, paddingRight: '8px' }}
                    onClick={(e) => {
                        // 点击箭头展开/收起，点击其他区域选择
                        const target = e.target as HTMLElement
                        if (!target.closest('.chevron-icon')) {
                            onSelect(folder.id)
                        }
                    }}
                >
                    <span className='chevron-icon flex h-4 w-4 shrink-0 items-center justify-center'>
                        {isOpen ? (
                            <ChevronDown className='h-3.5 w-3.5' />
                        ) : (
                            <ChevronRight className='h-3.5 w-3.5' />
                        )}
                    </span>
                    {isOpen ? (
                        <FolderOpen className='text-primary h-4 w-4 shrink-0' />
                    ) : (
                        <Folder className='text-primary h-4 w-4 shrink-0' />
                    )}
                    <span className='truncate'>{folder.name}</span>
                </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <div className='space-y-0.5'>
                    {folder.children?.map((child) => (
                        <FolderTreeItem
                            key={child.id}
                            folder={child}
                            selectedFolder={selectedFolder}
                            onSelect={onSelect}
                            level={level + 1}
                        />
                    ))}
                </div>
            </CollapsibleContent>
        </Collapsible>
    )
}

