import { useState, useCallback, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
    Users,
    ChevronRight,
    ChevronDown,
    Search,
    Loader2,
    AlertCircle,
    User,
    Star,
    DollarSign,
    Award,
    RefreshCw,
    Maximize2,
    Minimize2,
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search as SearchInput } from '@/components/search'
import { MessageButton } from '@/components/message-button'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { distributionApi, type TreeNode } from '@/lib/api'

// 等级配置
const levelConfig: Record<number, { label: string; color: string; bgColor: string }> = {
    1: { label: '城市合伙人', color: 'text-amber-700', bgColor: 'bg-amber-50' },
    2: { label: '团队长', color: 'text-blue-700', bgColor: 'bg-blue-50' },
    3: { label: '普通成员', color: 'text-gray-700', bgColor: 'bg-gray-50' },
}

// 树节点组件
interface TreeNodeItemProps {
    node: TreeNode
    depth: number
    expandedNodes: Set<string>
    onToggle: (id: string) => void
    onLoadChildren: (id: string) => Promise<void>
    loadingNodes: Set<string>
    selectedNode: string | null
    onSelect: (node: TreeNode) => void
}

function TreeNodeItem({
    node,
    depth,
    expandedNodes,
    onToggle,
    onLoadChildren,
    loadingNodes,
    selectedNode,
    onSelect,
}: TreeNodeItemProps) {
    const isExpanded = expandedNodes.has(node.id)
    const isLoading = loadingNodes.has(node.id)
    const isSelected = selectedNode === node.id
    const hasChildren = node._hasChildren || (node.children && node.children.length > 0)
    const level = levelConfig[node.distributionLevel] || levelConfig[3]

    const handleToggle = async () => {
        if (hasChildren) {
            if (!isExpanded && !node.children?.length) {
                await onLoadChildren(node.id)
            }
            onToggle(node.id)
        }
    }

    return (
        <div className="select-none">
            <div
                className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors',
                    'hover:bg-muted/50',
                    isSelected && 'bg-primary/10 border border-primary/20'
                )}
                style={{ paddingLeft: `${depth * 24 + 12}px` }}
                onClick={() => onSelect(node)}
            >
                {/* 展开/折叠按钮 */}
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        handleToggle()
                    }}
                    className={cn(
                        'w-6 h-6 flex items-center justify-center rounded hover:bg-muted',
                        !hasChildren && 'invisible'
                    )}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                </button>

                {/* 头像 */}
                <Avatar className="h-8 w-8">
                    <AvatarImage src={node.avatar || undefined} />
                    <AvatarFallback className={level.bgColor}>
                        {node.name.slice(0, 1)}
                    </AvatarFallback>
                </Avatar>

                {/* 信息 */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{node.name}</span>
                        <Badge variant="outline" className={cn('text-xs', level.color, level.bgColor)}>
                            {level.label}
                        </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">{node.phone}</div>
                </div>

                {/* 统计信息 */}
                <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1" title="团队规模">
                        <Users className="h-3.5 w-3.5" />
                        <span>{node.totalTeamSize}</span>
                    </div>
                    <div className="flex items-center gap-1" title="订单数">
                        <Award className="h-3.5 w-3.5" />
                        <span>{node.orderCount}</span>
                    </div>
                    <div className="flex items-center gap-1" title="评分">
                        <Star className="h-3.5 w-3.5" />
                        <span>{node.rating.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1" title="累计收益">
                        <DollarSign className="h-3.5 w-3.5" />
                        <span>¥{node.totalEarned.toFixed(0)}</span>
                    </div>
                </div>
            </div>

            {/* 子节点 */}
            {isExpanded && node.children && node.children.length > 0 && (
                <div className="relative">
                    {/* 连接线 */}
                    <div
                        className="absolute left-0 top-0 bottom-0 border-l-2 border-dashed border-muted"
                        style={{ left: `${depth * 24 + 24}px` }}
                    />
                    {node.children.map((child) => (
                        <TreeNodeItem
                            key={child.id}
                            node={child}
                            depth={depth + 1}
                            expandedNodes={expandedNodes}
                            onToggle={onToggle}
                            onLoadChildren={onLoadChildren}
                            loadingNodes={loadingNodes}
                            selectedNode={selectedNode}
                            onSelect={onSelect}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

// 节点详情面板
interface NodeDetailPanelProps {
    node: TreeNode | null
    onClose: () => void
}

function NodeDetailPanel({ node, onClose }: NodeDetailPanelProps) {
    if (!node) return null

    const level = levelConfig[node.distributionLevel] || levelConfig[3]

    return (
        <Card className="w-80 shrink-0">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={node.avatar || undefined} />
                            <AvatarFallback className={level.bgColor}>
                                {node.name.slice(0, 1)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-lg">{node.name}</CardTitle>
                            <CardDescription className="font-mono">{node.phone}</CardDescription>
                        </div>
                    </div>
                    <Badge className={cn(level.color, level.bgColor)}>{level.label}</Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">直接下级</p>
                        <p className="text-lg font-semibold">{node.teamSize}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">团队总数</p>
                        <p className="text-lg font-semibold">{node.totalTeamSize}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">完成订单</p>
                        <p className="text-lg font-semibold">{node.orderCount}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">评分</p>
                        <p className="text-lg font-semibold flex items-center gap-1">
                            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                            {node.rating.toFixed(1)}
                        </p>
                    </div>
                </div>
                <div className="pt-3 border-t">
                    <p className="text-xs text-muted-foreground mb-1">累计收益</p>
                    <p className="text-2xl font-bold text-green-600">
                        ¥{node.totalEarned.toFixed(2)}
                    </p>
                </div>
                <Button variant="outline" className="w-full" onClick={onClose}>
                    关闭
                </Button>
            </CardContent>
        </Card>
    )
}

// 骨架屏
function TreeSkeleton() {
    return (
        <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3" style={{ paddingLeft: `${(i % 3) * 24}px` }}>
                    <Skeleton className="h-6 w-6 rounded" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-4 w-48 hidden md:block" />
                </div>
            ))}
        </div>
    )
}

// 主组件
export function DistributionTree() {
    const queryClient = useQueryClient()
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
    const [loadingNodes, setLoadingNodes] = useState<Set<string>>(new Set())
    const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null)
    const [searchKeyword, setSearchKeyword] = useState('')
    const [depth, setDepth] = useState(2)

    // 获取树数据
    const { data: treeData, isLoading, error, refetch } = useQuery({
        queryKey: ['distribution-tree', depth],
        queryFn: () => distributionApi.getTree({ depth }),
    })

    // 获取统计数据
    const { data: stats } = useQuery({
        queryKey: ['distribution-stats'],
        queryFn: () => distributionApi.getStats(),
    })

    // 展开/折叠节点
    const handleToggle = useCallback((id: string) => {
        setExpandedNodes((prev) => {
            const next = new Set(prev)
            if (next.has(id)) {
                next.delete(id)
            } else {
                next.add(id)
            }
            return next
        })
    }, [])

    // 懒加载子节点
    const handleLoadChildren = useCallback(async (id: string) => {
        setLoadingNodes((prev) => new Set(prev).add(id))
        try {
            const children = await distributionApi.getTreeChildren(id)
            // 更新缓存中的树数据
            queryClient.setQueryData(['distribution-tree', depth], (oldData: TreeNode[] | undefined) => {
                if (!oldData) return oldData
                
                const updateNode = (nodes: TreeNode[]): TreeNode[] => {
                    return nodes.map((node) => {
                        if (node.id === id) {
                            return { ...node, children }
                        }
                        if (node.children) {
                            return { ...node, children: updateNode(node.children) }
                        }
                        return node
                    })
                }
                
                return updateNode(oldData)
            })
        } finally {
            setLoadingNodes((prev) => {
                const next = new Set(prev)
                next.delete(id)
                return next
            })
        }
    }, [queryClient, depth])

    // 全部展开
    const expandAll = useCallback(() => {
        const collectIds = (nodes: TreeNode[]): string[] => {
            const ids: string[] = []
            for (const node of nodes) {
                if (node._hasChildren || (node.children && node.children.length > 0)) {
                    ids.push(node.id)
                }
                if (node.children) {
                    ids.push(...collectIds(node.children))
                }
            }
            return ids
        }
        if (treeData) {
            setExpandedNodes(new Set(collectIds(treeData)))
        }
    }, [treeData])

    // 全部折叠
    const collapseAll = useCallback(() => {
        setExpandedNodes(new Set())
    }, [])

    // 过滤树数据
    const filteredData = useMemo(() => {
        if (!searchKeyword || !treeData) return treeData

        const keyword = searchKeyword.toLowerCase()
        
        const filterNodes = (nodes: TreeNode[]): TreeNode[] => {
            const result: TreeNode[] = []
            for (const node of nodes) {
                const match = node.name.toLowerCase().includes(keyword) ||
                    node.phone.includes(keyword)
                
                const filteredChildren = node.children ? filterNodes(node.children) : []
                
                if (match || filteredChildren.length > 0) {
                    result.push({
                        ...node,
                        children: filteredChildren.length > 0 ? filteredChildren : node.children,
                    })
                }
            }
            return result
        }
        
        return filterNodes(treeData)
    }, [treeData, searchKeyword])

    return (
        <>
            <Header fixed>
                <SearchInput />
                <div className="ms-auto flex items-center space-x-4">
                    <MessageButton />
                    <ThemeSwitch />
                    <ConfigDrawer />
                    <ProfileDropdown />
                </div>
            </Header>

            <Main className="flex flex-1 flex-col gap-4 sm:gap-6">
                {/* 标题 */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">关系树</h1>
                        <p className="text-muted-foreground">可视化分销网络的层级关系</p>
                    </div>
                </div>

                {/* 统计卡片 */}
                {stats && (
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card>
                            <CardContent className="flex items-center gap-4 p-4">
                                <div className="rounded-full bg-amber-50 p-3 dark:bg-amber-950">
                                    <Award className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-sm">城市合伙人</p>
                                    <p className="text-2xl font-bold">{stats.l1Count}</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="flex items-center gap-4 p-4">
                                <div className="rounded-full bg-blue-50 p-3 dark:bg-blue-950">
                                    <Users className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-sm">团队长</p>
                                    <p className="text-2xl font-bold">{stats.l2Count}</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="flex items-center gap-4 p-4">
                                <div className="rounded-full bg-gray-50 p-3 dark:bg-gray-800">
                                    <User className="h-5 w-5 text-gray-600" />
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-sm">普通成员</p>
                                    <p className="text-2xl font-bold">{stats.l3Count}</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="flex items-center gap-4 p-4">
                                <div className="rounded-full bg-green-50 p-3 dark:bg-green-950">
                                    <DollarSign className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-sm">总分润</p>
                                    <p className="text-2xl font-bold">
                                        ¥{(stats.totalDistribution || 0).toFixed(0)}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* 工具栏 */}
                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="搜索姓名或手机号..."
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Select value={String(depth)} onValueChange={(v) => setDepth(Number(v))}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="展开层级" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1">展开 1 层</SelectItem>
                            <SelectItem value="2">展开 2 层</SelectItem>
                            <SelectItem value="3">展开 3 层</SelectItem>
                            <SelectItem value="4">展开 4 层</SelectItem>
                            <SelectItem value="5">展开 5 层</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={expandAll}>
                        <Maximize2 className="h-4 w-4 mr-1" />
                        全部展开
                    </Button>
                    <Button variant="outline" size="sm" onClick={collapseAll}>
                        <Minimize2 className="h-4 w-4 mr-1" />
                        全部折叠
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => refetch()}>
                        <RefreshCw className="h-4 w-4 mr-1" />
                        刷新
                    </Button>
                </div>

                {/* 内容区 */}
                <div className="flex gap-4 flex-1 min-h-0">
                    {/* 树形列表 */}
                    <Card className="flex-1 overflow-hidden">
                        <CardContent className="p-0 h-full overflow-auto">
                            {isLoading ? (
                                <TreeSkeleton />
                            ) : error ? (
                                <div className="flex flex-col items-center justify-center h-64 gap-2">
                                    <AlertCircle className="h-12 w-12 text-destructive" />
                                    <p className="text-muted-foreground">加载失败，请刷新重试</p>
                                    <Button variant="outline" onClick={() => refetch()}>
                                        重新加载
                                    </Button>
                                </div>
                            ) : !filteredData || filteredData.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 gap-2">
                                    <Users className="h-12 w-12 text-muted-foreground" />
                                    <p className="text-muted-foreground">
                                        {searchKeyword ? '没有找到匹配的成员' : '暂无分销成员'}
                                    </p>
                                </div>
                            ) : (
                                <div className="py-2">
                                    {filteredData.map((node) => (
                                        <TreeNodeItem
                                            key={node.id}
                                            node={node}
                                            depth={0}
                                            expandedNodes={expandedNodes}
                                            onToggle={handleToggle}
                                            onLoadChildren={handleLoadChildren}
                                            loadingNodes={loadingNodes}
                                            selectedNode={selectedNode?.id || null}
                                            onSelect={setSelectedNode}
                                        />
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* 详情面板 */}
                    {selectedNode && (
                        <NodeDetailPanel
                            node={selectedNode}
                            onClose={() => setSelectedNode(null)}
                        />
                    )}
                </div>
            </Main>
        </>
    )
}

