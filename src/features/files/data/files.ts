import {
    FileText,
    FileImage,
    FileVideo,
    FileAudio,
    FileArchive,
    FileCode,
    FileSpreadsheet,
    File,
    Presentation,
} from 'lucide-react'

export type FileType =
    | 'document'
    | 'image'
    | 'video'
    | 'audio'
    | 'archive'
    | 'code'
    | 'spreadsheet'
    | 'presentation'
    | 'other'

export interface FileItem {
    id: string
    name: string
    type: FileType
    size: number // bytes
    createdAt: Date
    updatedAt: Date
    shared: boolean
    starred: boolean
    thumbnail?: string
}

export const fileTypeConfig = {
    document: {
        label: '文档',
        icon: FileText,
        color: 'text-blue-500',
        bgColor: 'bg-blue-50 dark:bg-blue-950',
        extensions: ['.pdf', '.doc', '.docx', '.txt', '.rtf'],
    },
    image: {
        label: '图片',
        icon: FileImage,
        color: 'text-green-500',
        bgColor: 'bg-green-50 dark:bg-green-950',
        extensions: ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'],
    },
    video: {
        label: '视频',
        icon: FileVideo,
        color: 'text-purple-500',
        bgColor: 'bg-purple-50 dark:bg-purple-950',
        extensions: ['.mp4', '.avi', '.mov', '.wmv', '.mkv'],
    },
    audio: {
        label: '音频',
        icon: FileAudio,
        color: 'text-orange-500',
        bgColor: 'bg-orange-50 dark:bg-orange-950',
        extensions: ['.mp3', '.wav', '.flac', '.aac', '.ogg'],
    },
    archive: {
        label: '压缩包',
        icon: FileArchive,
        color: 'text-amber-500',
        bgColor: 'bg-amber-50 dark:bg-amber-950',
        extensions: ['.zip', '.rar', '.7z', '.tar', '.gz'],
    },
    code: {
        label: '代码',
        icon: FileCode,
        color: 'text-cyan-500',
        bgColor: 'bg-cyan-50 dark:bg-cyan-950',
        extensions: ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.html', '.css'],
    },
    spreadsheet: {
        label: '表格',
        icon: FileSpreadsheet,
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-50 dark:bg-emerald-950',
        extensions: ['.xls', '.xlsx', '.csv'],
    },
    presentation: {
        label: '演示',
        icon: Presentation,
        color: 'text-rose-500',
        bgColor: 'bg-rose-50 dark:bg-rose-950',
        extensions: ['.ppt', '.pptx', '.key'],
    },
    other: {
        label: '其他',
        icon: File,
        color: 'text-gray-500',
        bgColor: 'bg-gray-50 dark:bg-gray-950',
        extensions: [],
    },
}

// 格式化文件大小
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 格式化日期
export function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date)
}

// 模拟文件数据
export const files: FileItem[] = [
    {
        id: '1',
        name: '2024年度报告.pdf',
        type: 'document',
        size: 2456789,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-03-20'),
        shared: true,
        starred: true,
    },
    {
        id: '2',
        name: '产品设计图.png',
        type: 'image',
        size: 1234567,
        createdAt: new Date('2024-02-10'),
        updatedAt: new Date('2024-02-10'),
        shared: false,
        starred: false,
    },
    {
        id: '3',
        name: '宣传视频.mp4',
        type: 'video',
        size: 56789012,
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-02-15'),
        shared: true,
        starred: true,
    },
    {
        id: '4',
        name: '会议录音.mp3',
        type: 'audio',
        size: 8901234,
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date('2024-03-01'),
        shared: false,
        starred: false,
    },
    {
        id: '5',
        name: '项目源码.zip',
        type: 'archive',
        size: 34567890,
        createdAt: new Date('2024-02-25'),
        updatedAt: new Date('2024-03-10'),
        shared: true,
        starred: false,
    },
    {
        id: '6',
        name: 'App.tsx',
        type: 'code',
        size: 12345,
        createdAt: new Date('2024-03-15'),
        updatedAt: new Date('2024-03-18'),
        shared: false,
        starred: true,
    },
    {
        id: '7',
        name: '销售数据.xlsx',
        type: 'spreadsheet',
        size: 567890,
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-03-22'),
        shared: true,
        starred: true,
    },
    {
        id: '8',
        name: '产品介绍.pptx',
        type: 'presentation',
        size: 4567890,
        createdAt: new Date('2024-02-20'),
        updatedAt: new Date('2024-03-05'),
        shared: true,
        starred: false,
    },
    {
        id: '9',
        name: '用户手册.docx',
        type: 'document',
        size: 890123,
        createdAt: new Date('2024-03-10'),
        updatedAt: new Date('2024-03-15'),
        shared: false,
        starred: false,
    },
    {
        id: '10',
        name: 'Banner.jpg',
        type: 'image',
        size: 2345678,
        createdAt: new Date('2024-01-25'),
        updatedAt: new Date('2024-01-25'),
        shared: true,
        starred: false,
    },
    {
        id: '11',
        name: '培训视频.mov',
        type: 'video',
        size: 123456789,
        createdAt: new Date('2024-02-05'),
        updatedAt: new Date('2024-02-28'),
        shared: false,
        starred: true,
    },
    {
        id: '12',
        name: '背景音乐.wav',
        type: 'audio',
        size: 15678901,
        createdAt: new Date('2024-03-08'),
        updatedAt: new Date('2024-03-08'),
        shared: false,
        starred: false,
    },
    {
        id: '13',
        name: '数据库备份.tar.gz',
        type: 'archive',
        size: 78901234,
        createdAt: new Date('2024-03-20'),
        updatedAt: new Date('2024-03-20'),
        shared: false,
        starred: true,
    },
    {
        id: '14',
        name: 'utils.ts',
        type: 'code',
        size: 5678,
        createdAt: new Date('2024-03-12'),
        updatedAt: new Date('2024-03-19'),
        shared: false,
        starred: false,
    },
    {
        id: '15',
        name: '财务报表.csv',
        type: 'spreadsheet',
        size: 234567,
        createdAt: new Date('2024-02-15'),
        updatedAt: new Date('2024-03-25'),
        shared: true,
        starred: false,
    },
    {
        id: '16',
        name: '季度总结.ppt',
        type: 'presentation',
        size: 6789012,
        createdAt: new Date('2024-03-22'),
        updatedAt: new Date('2024-03-25'),
        shared: true,
        starred: true,
    },
]

