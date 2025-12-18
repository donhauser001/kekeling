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
  useArticle,
  useActiveArticleCategories,
  useCreateArticle,
  useUpdateArticle,
} from '@/hooks/use-api'

// 状态选项
const statusOptions = [
  { value: 'draft', label: '草稿' },
  { value: 'published', label: '已发布' },
  { value: 'archived', label: '已归档' },
]

// 表单数据类型
interface ArticleFormData {
  categoryId: string
  title: string
  slug: string
  summary: string
  content: string
  coverImage: string
  author: string
  source: string
  tags: string
  isTop: boolean
  isHot: boolean
  seoTitle: string
  seoDesc: string
  seoKeywords: string
  sort: string
  status: string
}

const defaultFormData: ArticleFormData = {
  categoryId: 'none',
  title: '',
  slug: '',
  summary: '',
  content: '',
  coverImage: '',
  author: '',
  source: '',
  tags: '',
  isTop: false,
  isHot: false,
  seoTitle: '',
  seoDesc: '',
  seoKeywords: '',
  sort: '0',
  status: 'draft',
}

export function ArticleEdit() {
  const navigate = useNavigate()
  const { id } = useParams({ strict: false })
  const isEdit = id && id !== 'new'

  const [formData, setFormData] = useState<ArticleFormData>(defaultFormData)
  const [activeTab, setActiveTab] = useState('content')
  const [editorMode, setEditorMode] = useState<'rich' | 'html'>('rich')

  // API hooks
  const { data: article, isLoading: isLoadingArticle } = useArticle(isEdit ? id : undefined)
  const { data: categories = [] } = useActiveArticleCategories()
  const createMutation = useCreateArticle()
  const updateMutation = useUpdateArticle()

  // 加载文章数据
  useEffect(() => {
    if (article) {
      setFormData({
        categoryId: article.categoryId || 'none',
        title: article.title,
        slug: article.slug,
        summary: article.summary || '',
        content: article.content,
        coverImage: article.coverImage || '',
        author: article.author || '',
        source: article.source || '',
        tags: article.tags.join(', '),
        isTop: article.isTop,
        isHot: article.isHot,
        seoTitle: article.seoTitle || '',
        seoDesc: article.seoDesc || '',
        seoKeywords: article.seoKeywords || '',
        sort: article.sort.toString(),
        status: article.status,
      })
    }
  }, [article])

  // 自动生成 slug
  const generateSlug = () => {
    if (!formData.slug && formData.title) {
      const slug = `article-${Date.now()}`
      setFormData({ ...formData, slug })
    }
  }

  // 保存
  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error('请输入文章标题')
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
    if (!formData.content.trim()) {
      toast.error('请输入文章内容')
      return
    }

    const submitData = {
      categoryId: formData.categoryId && formData.categoryId !== 'none' ? formData.categoryId : undefined,
      title: formData.title.trim(),
      slug: formData.slug.trim(),
      summary: formData.summary.trim() || undefined,
      content: formData.content,
      coverImage: formData.coverImage.trim() || undefined,
      author: formData.author.trim() || undefined,
      source: formData.source.trim() || undefined,
      tags: formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      isTop: formData.isTop,
      isHot: formData.isHot,
      seoTitle: formData.seoTitle.trim() || undefined,
      seoDesc: formData.seoDesc.trim() || undefined,
      seoKeywords: formData.seoKeywords.trim() || undefined,
      sort: parseInt(formData.sort) || 0,
      status: formData.status as 'draft' | 'published' | 'archived',
    }

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id, data: submitData })
        toast.success('保存成功')
      } else {
        const newArticle = await createMutation.mutateAsync(submitData)
        toast.success('创建成功')
        navigate({ to: '/cms/articles/$id', params: { id: newArticle.id } })
      }
    } catch (err: unknown) {
      const error = err as Error
      toast.error(error.message || '操作失败')
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  if (isEdit && isLoadingArticle) {
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
            onClick={() => navigate({ to: '/cms/articles' })}
          >
            <ArrowLeft className='h-5 w-5' />
          </Button>
          <div className='flex items-center gap-3'>
            <FileText className='h-5 w-5 text-muted-foreground' />
            <div>
              <h1 className='text-lg font-semibold'>
                {isEdit ? '编辑文章' : '新建文章'}
              </h1>
              <p className='text-sm text-muted-foreground'>
                {isEdit ? `编辑「${article?.title || ''}」` : '创建新的文章'}
              </p>
            </div>
          </div>
        </div>
        <div className='ms-auto flex items-center gap-2'>
          {formData.isTop && (
            <Badge variant='destructive'>置顶</Badge>
          )}
          {formData.isHot && (
            <Badge variant='secondary' className='bg-orange-500 text-white'>热门</Badge>
          )}
          {formData.status === 'published' && (
            <Badge variant='default' className='bg-green-500'>已发布</Badge>
          )}
          {formData.status === 'draft' && (
            <Badge variant='secondary'>草稿</Badge>
          )}
          {formData.status === 'archived' && (
            <Badge variant='outline'>已归档</Badge>
          )}
          <div className='ml-2 flex items-center gap-4'>
            <Button
              variant='outline'
              onClick={() => navigate({ to: '/cms/articles' })}
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
                <CardDescription>设置文章的标题和基本属性</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label>
                      文章标题 <span className='text-destructive'>*</span>
                    </Label>
                    <Input
                      placeholder='输入文章标题'
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      onBlur={generateSlug}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>
                      URL 别名 <span className='text-destructive'>*</span>
                    </Label>
                    <Input
                      placeholder='如：how-to-use'
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                        })
                      }
                    />
                    <p className='text-xs text-muted-foreground'>
                      访问地址：/article/{formData.slug || 'xxx'}
                    </p>
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label>摘要</Label>
                  <Textarea
                    placeholder='文章简介，用于列表展示'
                    value={formData.summary}
                    onChange={(e) =>
                      setFormData({ ...formData, summary: e.target.value })
                    }
                    rows={3}
                  />
                </div>

                <div className='space-y-2'>
                  <Label>标签</Label>
                  <Input
                    placeholder='多个标签用逗号分隔'
                    value={formData.tags}
                    onChange={(e) =>
                      setFormData({ ...formData, tags: e.target.value })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* 文章内容 */}
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <div>
                  <CardTitle>
                    文章内容 <span className='text-destructive'>*</span>
                  </CardTitle>
                  <CardDescription>编辑文章的主体内容</CardDescription>
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
                    placeholder='输入文章内容...'
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
                  <Label>文章分类</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(v) =>
                      setFormData({ ...formData, categoryId: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='选择分类' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='none'>未分类</SelectItem>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

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
                </div>

                <div className='flex items-center justify-between pt-2'>
                  <Label>置顶文章</Label>
                  <Switch
                    checked={formData.isTop}
                    onCheckedChange={(v) =>
                      setFormData({ ...formData, isTop: v })
                    }
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <Label>热门文章</Label>
                  <Switch
                    checked={formData.isHot}
                    onCheckedChange={(v) =>
                      setFormData({ ...formData, isHot: v })
                    }
                  />
                </div>

                {isEdit && article && (
                  <div className='pt-4 border-t space-y-2 text-sm text-muted-foreground'>
                    <p>阅读量：{article.viewCount}</p>
                    <p>创建时间：{new Date(article.createdAt).toLocaleString('zh-CN')}</p>
                    <p>更新时间：{new Date(article.updatedAt).toLocaleString('zh-CN')}</p>
                    {article.publishedAt && (
                      <p>发布时间：{new Date(article.publishedAt).toLocaleString('zh-CN')}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 作者信息 */}
            <Card>
              <CardHeader>
                <CardTitle>作者信息</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <Label>作者</Label>
                  <Input
                    placeholder='文章作者'
                    value={formData.author}
                    onChange={(e) =>
                      setFormData({ ...formData, author: e.target.value })
                    }
                  />
                </div>

                <div className='space-y-2'>
                  <Label>来源</Label>
                  <Input
                    placeholder='文章来源'
                    value={formData.source}
                    onChange={(e) =>
                      setFormData({ ...formData, source: e.target.value })
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
                    placeholder='留空则使用文章标题'
                    value={formData.seoTitle}
                    onChange={(e) =>
                      setFormData({ ...formData, seoTitle: e.target.value })
                    }
                  />
                </div>

                <div className='space-y-2'>
                  <Label>SEO 描述</Label>
                  <Textarea
                    placeholder='留空则使用文章摘要'
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
          </div>
        </div>
      </Main>
    </>
  )
}

