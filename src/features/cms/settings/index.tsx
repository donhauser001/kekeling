import { useState, useEffect, useRef } from 'react'
import { Settings, Loader2, Save, Image as ImageIcon, Upload, X, Cog, Search as SearchIcon, Phone, Globe } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { MessageButton } from '@/components/message-button'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import {
    useCmsSettingGroups,
    useCmsSettingsByGroup,
    useBatchUpdateCmsSettings,
} from '@/hooks/use-api'
import { useAuthStore } from '@/stores/auth-store'
import type { CmsSetting } from '@/lib/api/cms'

// 分组图标映射
const groupIcons: Record<string, React.ReactNode> = {
    general: <Cog className='h-4 w-4' />,
    seo: <SearchIcon className='h-4 w-4' />,
    contact: <Phone className='h-4 w-4' />,
    social: <Globe className='h-4 w-4' />,
}

// 单个设置项组件
function SettingItem({
    setting,
    value,
    onChange,
}: {
    setting: CmsSetting
    value: string
    onChange: (value: string) => void
}) {
    const { auth } = useAuthStore()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isUploading, setIsUploading] = useState(false)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            toast.error('请选择图片文件')
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('图片大小不能超过 5MB')
            return
        }

        setIsUploading(true)
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('folder', 'cms')

            const response = await fetch('/api/upload', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${auth.accessToken}`,
                },
                body: formData,
            })

            if (!response.ok) {
                throw new Error('上传失败')
            }

            const result = await response.json()
            const url = result.data?.url || result.url
            onChange(url)
            toast.success('上传成功')
        } catch {
            toast.error('上传失败，请重试')
        } finally {
            setIsUploading(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    // 解析选项
    const options = setting.options ? JSON.parse(setting.options) : []

    switch (setting.type) {
        case 'textarea':
            return (
                <div className='space-y-2'>
                    <Label htmlFor={setting.key}>{setting.label}</Label>
                    <Textarea
                        id={setting.key}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        rows={3}
                        placeholder={`请输入${setting.label}`}
                    />
                </div>
            )

        case 'image':
            return (
                <div className='space-y-2'>
                    <Label>{setting.label}</Label>
                    <div className='flex items-start gap-4'>
                        {value ? (
                            <div className='relative'>
                                <img
                                    src={value}
                                    alt={setting.label}
                                    className='h-20 w-auto rounded border object-contain'
                                />
                                <Button
                                    variant='destructive'
                                    size='icon'
                                    className='absolute -right-2 -top-2 h-5 w-5'
                                    onClick={() => onChange('')}
                                >
                                    <X className='h-3 w-3' />
                                </Button>
                            </div>
                        ) : (
                            <div
                                className='flex h-20 w-32 cursor-pointer items-center justify-center rounded border-2 border-dashed hover:bg-accent'
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {isUploading ? (
                                    <Loader2 className='h-6 w-6 animate-spin' />
                                ) : (
                                    <ImageIcon className='h-6 w-6 text-muted-foreground' />
                                )}
                            </div>
                        )}
                        <Button
                            variant='outline'
                            size='sm'
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                        >
                            <Upload className='mr-2 h-4 w-4' />
                            {value ? '更换' : '上传'}
                        </Button>
                        <input
                            ref={fileInputRef}
                            type='file'
                            accept='image/*'
                            className='hidden'
                            onChange={handleFileChange}
                            disabled={isUploading}
                        />
                    </div>
                </div>
            )

        case 'switch':
            return (
                <div className='flex items-center justify-between'>
                    <Label htmlFor={setting.key}>{setting.label}</Label>
                    <Switch
                        id={setting.key}
                        checked={value === 'true' || value === '1'}
                        onCheckedChange={(checked) => onChange(checked ? 'true' : 'false')}
                    />
                </div>
            )

        case 'select':
            return (
                <div className='space-y-2'>
                    <Label htmlFor={setting.key}>{setting.label}</Label>
                    <Select value={value} onValueChange={onChange}>
                        <SelectTrigger>
                            <SelectValue placeholder={`请选择${setting.label}`} />
                        </SelectTrigger>
                        <SelectContent>
                            {options.map((opt: { value: string; label: string }) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )

        case 'color':
            return (
                <div className='space-y-2'>
                    <Label htmlFor={setting.key}>{setting.label}</Label>
                    <div className='flex items-center gap-2'>
                        <input
                            type='color'
                            id={setting.key}
                            value={value || '#000000'}
                            onChange={(e) => onChange(e.target.value)}
                            className='h-10 w-14 cursor-pointer rounded border p-1'
                        />
                        <Input
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder='#000000'
                            className='w-32'
                        />
                    </div>
                </div>
            )

        default: // text
            return (
                <div className='space-y-2'>
                    <Label htmlFor={setting.key}>{setting.label}</Label>
                    <Input
                        id={setting.key}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={`请输入${setting.label}`}
                    />
                </div>
            )
    }
}

// 设置分组组件
function SettingsGroup({ group }: { group: string }) {
    const { data: settings = [], isLoading } = useCmsSettingsByGroup(group)
    const batchUpdateMutation = useBatchUpdateCmsSettings()
    const [values, setValues] = useState<Record<string, string>>({})
    const [hasChanges, setHasChanges] = useState(false)

    // 初始化表单值
    useEffect(() => {
        if (settings.length > 0) {
            const initial: Record<string, string> = {}
            settings.forEach((s) => {
                initial[s.key] = s.value
            })
            setValues(initial)
            setHasChanges(false)
        }
    }, [settings])

    const handleChange = (key: string, value: string) => {
        setValues((prev) => ({ ...prev, [key]: value }))
        setHasChanges(true)
    }

    const handleSave = async () => {
        try {
            const settingsToUpdate = Object.entries(values).map(([key, value]) => ({
                key,
                value,
            }))
            await batchUpdateMutation.mutateAsync(settingsToUpdate)
            toast.success('保存成功')
            setHasChanges(false)
        } catch (err: unknown) {
            const error = err as Error
            toast.error(error.message || '保存失败')
        }
    }

    if (isLoading) {
        return (
            <div className='flex h-40 items-center justify-center'>
                <Loader2 className='h-6 w-6 animate-spin' />
            </div>
        )
    }

    if (settings.length === 0) {
        return (
            <div className='flex h-40 items-center justify-center text-muted-foreground'>
                暂无设置项
            </div>
        )
    }

    return (
        <div className='space-y-6'>
            {settings.map((setting) => (
                <SettingItem
                    key={setting.id}
                    setting={setting}
                    value={values[setting.key] || ''}
                    onChange={(v) => handleChange(setting.key, v)}
                />
            ))}
            <div className='flex justify-end border-t pt-4'>
                <Button onClick={handleSave} disabled={!hasChanges || batchUpdateMutation.isPending}>
                    {batchUpdateMutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                    <Save className='mr-2 h-4 w-4' />
                    保存设置
                </Button>
            </div>
        </div>
    )
}

export function CmsSettings() {
    const { data: groups = [], isLoading: groupsLoading } = useCmsSettingGroups()
    const [activeTab, setActiveTab] = useState('general')

    if (groupsLoading) {
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
                <Main>
                    <div className='flex h-64 items-center justify-center'>
                        <Loader2 className='h-8 w-8 animate-spin' />
                    </div>
                </Main>
            </>
        )
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
                <div>
                    <h2 className='text-2xl font-bold tracking-tight'>网站设置</h2>
                    <p className='text-muted-foreground'>
                        配置网站基本信息、SEO、联系方式等
                    </p>
                </div>

                <Card>
                    <CardHeader className='pb-3'>
                        <CardTitle className='flex items-center gap-2'>
                            <Settings className='h-5 w-5' />
                            设置项
                        </CardTitle>
                        <CardDescription>
                            按分组管理网站配置，修改后点击保存生效
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className='grid w-full' style={{ gridTemplateColumns: `repeat(${groups.length || 1}, 1fr)` }}>
                                {groups.map((group) => (
                                    <TabsTrigger key={group.value} value={group.value}>
                                        <span className='mr-1.5'>{groupIcons[group.value] || <Cog className='h-4 w-4' />}</span>
                                        {group.label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                            {groups.map((group) => (
                                <TabsContent key={group.value} value={group.value} className='mt-6'>
                                    <SettingsGroup group={group.value} />
                                </TabsContent>
                            ))}
                        </Tabs>
                    </CardContent>
                </Card>
            </Main>
        </>
    )
}

