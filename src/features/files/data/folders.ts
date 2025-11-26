import {
    Folder,
    FolderOpen,
    Star,
    Share2,
    Clock,
    Trash2,
    HardDrive,
    Image,
    FileText,
    Video,
    Music,
    Archive,
    type LucideIcon,
} from 'lucide-react'

export interface FolderItem {
    id: string
    name: string
    icon?: LucideIcon
    children?: FolderItem[]
    isSystem?: boolean // 系统文件夹（全部文件、最近、收藏等）
    count?: number
}

// 系统文件夹（固定的快捷入口）
export const systemFolders: FolderItem[] = [
    {
        id: 'all',
        name: '全部文件',
        icon: HardDrive,
        isSystem: true,
    },
    {
        id: 'recent',
        name: '最近使用',
        icon: Clock,
        isSystem: true,
    },
    {
        id: 'starred',
        name: '已收藏',
        icon: Star,
        isSystem: true,
    },
    {
        id: 'shared',
        name: '已分享',
        icon: Share2,
        isSystem: true,
    },
    {
        id: 'trash',
        name: '回收站',
        icon: Trash2,
        isSystem: true,
    },
]

// 按类型分类的虚拟文件夹
export const categoryFolders: FolderItem[] = [
    {
        id: 'cat-documents',
        name: '文档',
        icon: FileText,
        isSystem: true,
    },
    {
        id: 'cat-images',
        name: '图片',
        icon: Image,
        isSystem: true,
    },
    {
        id: 'cat-videos',
        name: '视频',
        icon: Video,
        isSystem: true,
    },
    {
        id: 'cat-audio',
        name: '音频',
        icon: Music,
        isSystem: true,
    },
    {
        id: 'cat-archives',
        name: '压缩包',
        icon: Archive,
        isSystem: true,
    },
]

// 模拟用户文件夹结构（后端API会返回这个数据）
export const userFolders: FolderItem[] = [
    {
        id: 'folder-1',
        name: '工作文档',
        icon: Folder,
        children: [
            {
                id: 'folder-1-1',
                name: '2024年项目',
                icon: Folder,
                children: [
                    {
                        id: 'folder-1-1-1',
                        name: '第一季度',
                        icon: Folder,
                    },
                    {
                        id: 'folder-1-1-2',
                        name: '第二季度',
                        icon: Folder,
                    },
                    {
                        id: 'folder-1-1-3',
                        name: '第三季度',
                        icon: Folder,
                    },
                ],
            },
            {
                id: 'folder-1-2',
                name: '会议记录',
                icon: Folder,
            },
            {
                id: 'folder-1-3',
                name: '报告模板',
                icon: Folder,
            },
        ],
    },
    {
        id: 'folder-2',
        name: '个人资料',
        icon: Folder,
        children: [
            {
                id: 'folder-2-1',
                name: '照片',
                icon: Folder,
            },
            {
                id: 'folder-2-2',
                name: '证件扫描',
                icon: Folder,
            },
        ],
    },
    {
        id: 'folder-3',
        name: '设计素材',
        icon: Folder,
        children: [
            {
                id: 'folder-3-1',
                name: 'UI设计',
                icon: Folder,
            },
            {
                id: 'folder-3-2',
                name: '图标库',
                icon: Folder,
            },
            {
                id: 'folder-3-3',
                name: '品牌素材',
                icon: Folder,
            },
        ],
    },
    {
        id: 'folder-4',
        name: '开发资源',
        icon: Folder,
        children: [
            {
                id: 'folder-4-1',
                name: '前端项目',
                icon: Folder,
            },
            {
                id: 'folder-4-2',
                name: '后端项目',
                icon: Folder,
            },
            {
                id: 'folder-4-3',
                name: '数据库备份',
                icon: Folder,
            },
        ],
    },
    {
        id: 'folder-5',
        name: '培训资料',
        icon: Folder,
    },
    {
        id: 'folder-6',
        name: '临时文件',
        icon: Folder,
    },
]

export { Folder, FolderOpen }

