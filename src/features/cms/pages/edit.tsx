import { useEffect, useState } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { Loader2, ArrowLeft, Save, FileText, Code, Type } from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { RichEditor } from '@/components/rich-editor'
import { HTMLPreview } from '@/components/html-preview'
import {
  useCmsPage,
  useCreateCmsPage,
  useUpdateCmsPage,
} from '@/hooks/use-api'

// 状态选项
const statusOptions = [
  { value: 'draft', label: '草稿' },
  { value: 'published', label: '已发布' },
]

// 常用页面模板
const pageTemplates = [
  { slug: 'about', title: '关于我们', desc: '公司介绍、发展历程、团队介绍等' },
  { slug: 'privacy', title: '隐私政策', desc: '用户隐私保护条款' },
  { slug: 'terms', title: '用户协议', desc: '服务使用条款' },
  { slug: 'help', title: '帮助中心', desc: '常见问题解答' },
  { slug: 'contact', title: '联系我们', desc: '联系方式、地址信息' },
]

// 表单数据类型
interface PageFormData {
  title: string
  slug: string
  content: string
  excerpt: string
  coverImage: string
  layout: string
  showTitle: boolean
  seoTitle: string
  seoDesc: string
  seoKeywords: string
  sort: string
  status: string
}

const defaultFormData: PageFormData = {
  title: '',
  slug: '',
  content: '',
  excerpt: '',
  coverImage: '',
  layout: 'boxed',
  showTitle: true,
  seoTitle: '',
  seoDesc: '',
  seoKeywords: '',
  sort: '0',
  status: 'draft',
}

export function PageEdit() {
  const navigate = useNavigate()
  const { id } = useParams({ strict: false })
  const isEdit = id && id !== 'new'

  const [formData, setFormData] = useState<PageFormData>(defaultFormData)
  const [activeTab, setActiveTab] = useState('content')
  const [editorMode, setEditorMode] = useState<'rich' | 'html'>('rich')

  // API hooks
  const { data: page, isLoading: isLoadingPage } = useCmsPage(isEdit ? id : undefined)
  const createMutation = useCreateCmsPage()
  const updateMutation = useUpdateCmsPage()

  // 加载页面数据
  useEffect(() => {
    if (page) {
      setFormData({
        title: page.title,
        slug: page.slug,
        content: page.content,
        excerpt: page.excerpt || '',
        coverImage: page.coverImage || '',
        layout: page.layout || 'boxed',
        showTitle: page.showTitle ?? true,
        seoTitle: page.seoTitle || '',
        seoDesc: page.seoDesc || '',
        seoKeywords: page.seoKeywords || '',
        sort: page.sort.toString(),
        status: page.status,
      })
    }
  }, [page])

  // 使用模板
  const handleUseTemplate = (template: typeof pageTemplates[0]) => {
    setFormData({
      ...formData,
      title: template.title,
      slug: template.slug,
      excerpt: template.desc,
    })
  }

  // 保存
  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error('请输入页面标题')
      return
    }
    if (!formData.slug.trim()) {
      toast.error('请输入 URL 别名')
      return
    }
    if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      toast.error('URL 别名只能包含小写字母、数字和连字符')
      return
    }

    const submitData = {
      title: formData.title.trim(),
      slug: formData.slug.trim(),
      content: formData.content,
      excerpt: formData.excerpt.trim() || undefined,
      coverImage: formData.coverImage.trim() || undefined,
      layout: formData.layout as 'boxed' | 'fullwidth',
      showTitle: formData.showTitle,
      seoTitle: formData.seoTitle.trim() || undefined,
      seoDesc: formData.seoDesc.trim() || undefined,
      seoKeywords: formData.seoKeywords.trim() || undefined,
      sort: parseInt(formData.sort) || 0,
      status: formData.status as 'draft' | 'published',
    }

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id, data: submitData })
        toast.success('保存成功')
      } else {
        const newPage = await createMutation.mutateAsync(submitData)
        toast.success('创建成功')
        navigate({ to: '/cms/pages/$id', params: { id: newPage.id } })
      }
    } catch (err: unknown) {
      const error = err as Error
      toast.error(error.message || '操作失败')
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  if (isEdit && isLoadingPage) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    )
  }

  return (
    <>
      <Header>
        <div className='flex items-center gap-4'>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => navigate({ to: '/cms/pages' })}
          >
            <ArrowLeft className='h-5 w-5' />
          </Button>
          <div className='flex items-center gap-3'>
            <FileText className='h-5 w-5 text-muted-foreground' />
            <div>
              <h1 className='text-lg font-semibold'>
                {isEdit ? '编辑页面' : '新建页面'}
              </h1>
              <p className='text-sm text-muted-foreground'>
                {isEdit ? `编辑「${page?.title || ''}」` : '创建新的静态页面'}
              </p>
            </div>
          </div>
        </div>
        <div className='ms-auto flex items-center gap-4'>
          {formData.status === 'published' && (
            <Badge variant='default' className='bg-green-500'>已发布</Badge>
          )}
          {formData.status === 'draft' && (
            <Badge variant='secondary'>草稿</Badge>
          )}
          <Button
            variant='outline'
            onClick={() => navigate({ to: '/cms/pages' })}
            disabled={isPending}
          >
            取消
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            <Save className='mr-2 h-4 w-4' />
            {isEdit ? '保存' : '创建'}
          </Button>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='pb-8'>
        <div className='flex gap-6'>
          {/* 左侧：主编辑区域 */}
          <div className='flex-1 min-w-0 space-y-6'>
            {/* 基本信息 */}
            <Card>
              <CardHeader>
                <CardTitle>基本信息</CardTitle>
                <CardDescription>设置页面的标题和访问地址</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                {/* 快速模板（仅新建时显示） */}
                {!isEdit && (
                  <div className='space-y-2'>
                    <Label className='text-muted-foreground'>常用模板</Label>
                    <div className='flex flex-wrap gap-2'>
                      {pageTemplates.map((template) => (
                        <Button
                          key={template.slug}
                          variant='outline'
                          size='sm'
                          onClick={() => handleUseTemplate(template)}
                        >
                          {template.title}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label>
                      页面标题 <span className='text-destructive'>*</span>
                    </Label>
                    <Input
                      placeholder='如：关于我们'
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>
                      URL 别名 <span className='text-destructive'>*</span>
                    </Label>
                    <Input
                      placeholder='如：about'
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                        })
                      }
                    />
                    <p className='text-xs text-muted-foreground'>
                      访问地址：/page/{formData.slug || 'xxx'}
                    </p>
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label>摘要/描述</Label>
                  <Textarea
                    placeholder='页面简介，用于列表展示和 SEO'
                    value={formData.excerpt}
                    onChange={(e) =>
                      setFormData({ ...formData, excerpt: e.target.value })
                    }
                    rows={2}
                  />
                </div>

                <div className='flex items-center justify-between rounded-lg border p-4'>
                  <div className='space-y-0.5'>
                    <Label className='text-base'>全宽布局</Label>
                    <p className='text-sm text-muted-foreground'>
                      开启后页面内容将占满整个宽度，适合Landing页面
                    </p>
                  </div>
                  <Switch
                    checked={formData.layout === 'fullwidth'}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, layout: checked ? 'fullwidth' : 'boxed' })
                    }
                  />
                </div>

                {formData.layout === 'boxed' && (
                  <div className='flex items-center justify-between rounded-lg border p-4'>
                    <div className='space-y-0.5'>
                      <Label className='text-base'>显示标题栏</Label>
                      <p className='text-sm text-muted-foreground'>
                        盒式布局下是否显示页面标题和摘要
                      </p>
                    </div>
                    <Switch
                      checked={formData.showTitle}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, showTitle: checked })
                      }
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 页面内容 */}
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <div>
                  <CardTitle>页面内容</CardTitle>
                  <CardDescription>编辑页面的主体内容</CardDescription>
                </div>
                <div className='flex items-center gap-1 rounded-lg border p-1'>
                  <Button
                    variant={editorMode === 'rich' ? 'secondary' : 'ghost'}
                    size='sm'
                    className='h-7 px-2 text-xs'
                    onClick={() => setEditorMode('rich')}
                  >
                    <Type className='mr-1 h-3.5 w-3.5' />
                    富文本
                  </Button>
                  <Button
                    variant={editorMode === 'html' ? 'secondary' : 'ghost'}
                    size='sm'
                    className='h-7 px-2 text-xs'
                    onClick={() => setEditorMode('html')}
                  >
                    <Code className='mr-1 h-3.5 w-3.5' />
                    HTML
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {editorMode === 'rich' ? (
                  <RichEditor
                    value={formData.content}
                    onChange={(value) => setFormData({ ...formData, content: value })}
                    placeholder='输入页面内容...'
                    minHeight={400}
                    maxHeight={600}
                  />
                ) : (
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList>
                      <TabsTrigger value='content'>HTML 代码</TabsTrigger>
                      <TabsTrigger value='preview'>预览</TabsTrigger>
                    </TabsList>
                    <TabsContent value='content' className='mt-4'>
                      <Textarea
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        placeholder='输入 HTML 代码...'
                        rows={20}
                        className='font-mono text-sm'
                      />
                    </TabsContent>
                    <TabsContent value='preview' className='mt-4'>
                      <HTMLPreview html={formData.content} minHeight={400} />
                    </TabsContent>
                  </Tabs>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 右侧：设置面板 */}
          <div className='w-[320px] shrink-0 space-y-6'>
            {/* 发布设置 */}
            <Card>
              <CardHeader>
                <CardTitle>发布设置</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <Label>状态</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) =>
                      setFormData({ ...formData, status: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label>排序</Label>
                  <Input
                    type='number'
                    value={formData.sort}
                    onChange={(e) =>
                      setFormData({ ...formData, sort: e.target.value })
                    }
                  />
                  <p className='text-xs text-muted-foreground'>数字越大排序越靠前</p>
                </div>

                {isEdit && page && (
                  <div className='pt-4 border-t space-y-2 text-sm text-muted-foreground'>
                    <p>创建时间：{new Date(page.createdAt).toLocaleString('zh-CN')}</p>
                    <p>更新时间：{new Date(page.updatedAt).toLocaleString('zh-CN')}</p>
                    {page.publishedAt && (
                      <p>发布时间：{new Date(page.publishedAt).toLocaleString('zh-CN')}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* SEO 设置 */}
            <Card>
              <CardHeader>
                <CardTitle>SEO 设置</CardTitle>
                <CardDescription>优化搜索引擎展示</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <Label>SEO 标题</Label>
                  <Input
                    placeholder='留空则使用页面标题'
                    value={formData.seoTitle}
                    onChange={(e) =>
                      setFormData({ ...formData, seoTitle: e.target.value })
                    }
                  />
                </div>

                <div className='space-y-2'>
                  <Label>SEO 描述</Label>
                  <Textarea
                    placeholder='留空则使用页面摘要'
                    value={formData.seoDesc}
                    onChange={(e) =>
                      setFormData({ ...formData, seoDesc: e.target.value })
                    }
                    rows={3}
                  />
                </div>

                <div className='space-y-2'>
                  <Label>SEO 关键词</Label>
                  <Input
                    placeholder='多个关键词用逗号分隔'
                    value={formData.seoKeywords}
                    onChange={(e) =>
                      setFormData({ ...formData, seoKeywords: e.target.value })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* 封面图 */}
            <Card>
              <CardHeader>
                <CardTitle>封面图</CardTitle>
                <CardDescription>用于列表和分享展示</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  <Input
                    placeholder='输入图片 URL'
                    value={formData.coverImage}
                    onChange={(e) =>
                      setFormData({ ...formData, coverImage: e.target.value })
                    }
                  />
                  {formData.coverImage && (
                    <div className='mt-2 rounded-lg overflow-hidden border'>
                      <img
                        src={formData.coverImage}
                        alt='封面预览'
                        className='w-full h-40 object-cover'
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Main>
    </>
  )
}

