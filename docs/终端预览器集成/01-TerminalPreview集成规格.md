# TerminalPreview 集成规格

> **文档版本**: v1.3  
> **创建日期**: 2024-12-12  
> **状态**: 📋 规划中  
> **返回**: [总览](./README.md)

---

## 术语约定

| 术语 | 定义 | 说明 |
|------|------|------|
| `viewerRole` | 当前视角角色 | 统一使用，`role` 字段**已废弃** |
| `userSession` | 用户会话 | 包含 userToken |
| `escortSession` | 陪诊员会话 | 包含 escortToken |

> ⚠️ **重要**：原 `role` 字段废弃，统一使用 `viewerRole`。真实终端中 `viewerRole` 由 token 推导，预览器中允许强制模拟。

---

## 一、当前预览器架构

### 1.1 组件结构

```
src/components/terminal-preview/
├── index.tsx              # 主组件（路由分发）
├── types.ts               # 类型定义
├── api.ts                 # API 请求封装
├── constants.ts           # TabBar 配置
├── hooks/
│   └── useScrollDrag.ts   # 拖拽滚动
└── components/
    ├── pages/             # 页面组件
    │   ├── ServicesPage.tsx
    │   ├── ServiceDetailPage.tsx
    │   ├── CasesPage.tsx
    │   └── ProfilePage.tsx
    └── [其他 UI 组件]
```

### 1.2 当前支持的页面

| 页面类型 | 路由 Key | 组件文件 | 数据来源 | 使用场景 |
|---------|---------|---------|---------|---------|
| 首页 | `home` | `renderHomePage()` | `previewApi.getHomePageSettings()` | 首页管理、品牌设置 |
| 服务列表 | `services` | `ServicesPage.tsx` | `previewApi.getServices()` | 服务管理 |
| 服务详情 | `service-detail` | `ServiceDetailPage.tsx` | `previewApi.getServiceDetail()` | 服务编辑页预览 |
| 病历管理 | `cases` | `CasesPage.tsx` | 静态数据 | 病历管理模块 |
| 个人中心 | `profile` | `ProfilePage.tsx` | 静态数据 | 个人中心设置 |

### 1.3 当前使用位置

1. **首页管理** (`src/features/app-settings/homepage/index.tsx`)
   - 用途：实时预览首页配置效果
   - 数据覆盖：`homeSettings`（统计卡片、内容区、服务推荐）

2. **品牌设置** (`src/features/app-settings/brand/index.tsx`)
   - 用途：实时预览品牌配置效果
   - 数据覆盖：`themeSettings`（Logo、品牌名、布局等）

### 1.4 当前 API 集成

```typescript
// 当前 previewApi 支持的数据获取
previewApi = {
  getThemeSettings()        // ✅ 主题设置
  getHomePageSettings()     // ✅ 首页设置
  getBanners()             // ✅ 轮播图
  getStats()               // ✅ 统计数据
  getCategories()          // ✅ 服务分类
  getRecommendedServices() // ✅ 推荐服务
  getServices()            // ✅ 服务列表
  getServiceDetail()       // ✅ 服务详情
}
```

---

## 二、Props 扩展规格

### 2.1 类型系统扩展

```typescript
// types.ts

// 页面路由扩展
export type PreviewPage = 
  // 现有页面
  | 'home' | 'services' | 'cases' | 'profile'
  // 营销中心
  | 'membership' | 'membership-plans'
  | 'coupons' | 'coupons-available'
  | 'points' | 'points-records'
  | 'referrals' | 'campaigns' | 'campaigns-detail'
  // 陪诊员
  | 'escort-list' | 'escort-detail'
  | 'workbench' | 'workbench-orders-pool' | 'workbench-order-detail'
  | 'workbench-earnings' | 'workbench-withdraw'

// 视角角色
export type PreviewViewerRole = 'user' | 'escort'

// 用户上下文
export interface UserContext {
  membershipLevel?: string
  membershipExpireAt?: string
  points?: number
  couponCount?: number
}

// 陪诊员上下文
export interface EscortContext {
  id?: string
  name?: string
  level?: string
  workStatus?: 'available' | 'busy' | 'offline'
  earnings?: number
  orderCount?: number
}

// 双会话模拟
export interface UserSession {
  token?: string
  userId?: string
}

export interface EscortSession {
  token?: string
  escortId?: string
}
```

### 2.2 完整 Props 定义

```typescript
export interface TerminalPreviewProps {
  // 页面路由
  page: PreviewPage

  // 视角控制（用于预览器模拟）
  viewerRole?: PreviewViewerRole

  // 双会话模拟（预览器场景可选）
  userSession?: UserSession
  escortSession?: EscortSession

  // 身份上下文
  userContext?: UserContext
  escortContext?: EscortContext

  // 现有数据覆盖
  themeSettings?: Partial<ThemeSettings>
  homeSettings?: Partial<HomePageSettings>
  bannerData?: BannerAreaData | null
  statsData?: Partial<StatsData>
  categories?: ServiceCategory[]
  recommendedServices?: RecommendedServicesData | null

  // 营销数据覆盖
  marketingData?: {
    membership?: Partial<MembershipData>
    coupons?: Partial<CouponsData>
    points?: Partial<PointsData>
    campaigns?: Partial<CampaignsData>
  }

  // 陪诊员数据覆盖
  escortData?: {
    escorts?: Escort[]
    escortDetail?: EscortDetail
    workbenchStats?: WorkbenchStats
    orderPool?: OrderPoolData
  }

  // 基础配置
  autoLoad?: boolean
  height?: number
  showFrame?: boolean
  className?: string
}
```

---

## 三、路由注册表（单一真源）

### 3.0 RouteRegistry 映射表

> ⚠️ **这是单一真源**：终端路由、预览器路由、管理后台预览入口必须统一引用此表，禁止各写各的。

| 路由 Key | 终端页面路径 | 预览器组件 | TabBar | 所需通道 | 优先级 |
|---------|-------------|-----------|--------|---------|--------|
| **基础功能** |
| `home` | `/pages/index/index` | `renderHomePage()` | ✅ 首页 | user | - |
| `services` | `/pages/services/index` | `ServicesPage` | ✅ 服务 | user | - |
| `cases` | `/pages/cases/index` | `CasesPage` | ✅ 病历 | user | - |
| `profile` | `/pages/user/index` | `ProfilePage` | ✅ 我的 | user | - |
| **营销中心** |
| `membership` | `/pages/marketing/membership/index` | `MembershipPage` | ❌ | user | P0 |
| `membership-plans` | `/pages/marketing/membership/plans` | `MembershipPlansPage` | ❌ | user | P0 |
| `coupons` | `/pages/marketing/coupons/index` | `CouponsPage` | ❌ | user | P0 |
| `coupons-available` | `/pages/marketing/coupons/available` | `CouponsAvailablePage` | ❌ | user | P1 |
| `points` | `/pages/marketing/points/index` | `PointsPage` | ❌ | user | P1 |
| `points-records` | `/pages/marketing/points/records` | `PointsRecordsPage` | ❌ | user | P1 |
| `referrals` | `/pages/marketing/referrals/index` | `ReferralsPage` | ❌ | user | P1 |
| `campaigns` | `/pages/marketing/campaigns/index` | `CampaignsPage` | ❌ | user | P1 |
| `campaigns-detail` | `/pages/marketing/campaigns/detail` | `CampaignDetailPage` | ❌ | user | P1 |
| **陪诊员（用户视角）** |
| `escort-list` | `/pages/escort/list` | `EscortListPage` | ❌ | user | P1 |
| `escort-detail` | `/pages/escort/detail` | `EscortDetailPage` | ❌ | user | P1 |
| **陪诊员工作台（陪诊员视角）** |
| `workbench` | `/pages/workbench/index` | `WorkbenchPage` | ✅ 工作台 | **escort** | P2 |
| `workbench-orders-pool` | `/pages/workbench/orders/pool` | `WorkbenchOrdersPoolPage` | ❌ | **escort** | P2 |
| `workbench-order-detail` | `/pages/workbench/orders/detail` | `WorkbenchOrderDetailPage` | ❌ | **escort** | P2 |
| `workbench-earnings` | `/pages/workbench/earnings/index` | `WorkbenchEarningsPage` | ❌ | **escort** | P2 |
| `workbench-withdraw` | `/pages/workbench/withdraw/index` | `WorkbenchWithdrawPage` | ❌ | **escort** | P2 |

### 3.1 TypeScript 类型定义

```typescript
// routes.ts（单一真源）

export const ROUTE_REGISTRY = {
  // 基础功能
  home: { path: '/pages/index/index', component: 'renderHomePage', tabBar: true, channel: 'user' },
  services: { path: '/pages/services/index', component: 'ServicesPage', tabBar: true, channel: 'user' },
  cases: { path: '/pages/cases/index', component: 'CasesPage', tabBar: true, channel: 'user' },
  profile: { path: '/pages/user/index', component: 'ProfilePage', tabBar: true, channel: 'user' },
  
  // 营销中心
  membership: { path: '/pages/marketing/membership/index', component: 'MembershipPage', tabBar: false, channel: 'user' },
  // ... 其他路由
  
  // 陪诊员工作台（注意 channel: 'escort'）
  workbench: { path: '/pages/workbench/index', component: 'WorkbenchPage', tabBar: true, channel: 'escort' },
  // ...
} as const

export type PreviewPage = keyof typeof ROUTE_REGISTRY
```

### 3.2 路由分发逻辑

```typescript
// index.tsx
const renderPageContent = () => {
  // 服务详情页（现有逻辑）
  if (selectedServiceId) {
    return <ServiceDetailPage ... />
  }

  switch (currentPage) {
    // 现有页面
    case 'home': return renderHomePage()
    case 'services': return <ServicesPage ... />
    case 'cases': return <CasesPage ... />
    case 'profile': return <ProfilePage ... />
    
    // 营销中心
    case 'membership': return <MembershipPage ... />
    case 'membership-plans': return <MembershipPlansPage ... />
    case 'coupons': return <CouponsPage ... />
    case 'coupons-available': return <CouponsAvailablePage ... />
    case 'points': return <PointsPage ... />
    case 'points-records': return <PointsRecordsPage ... />
    case 'referrals': return <ReferralsPage ... />
    case 'campaigns': return <CampaignsPage ... />
    case 'campaigns-detail': return <CampaignDetailPage ... />
    
    // 陪诊员
    case 'escort-list': return <EscortListPage ... />
    case 'escort-detail': return <EscortDetailPage ... />
    case 'workbench': return <WorkbenchPage ... />
    case 'workbench-orders-pool': return <WorkbenchOrdersPoolPage ... />
    case 'workbench-order-detail': return <WorkbenchOrderDetailPage ... />
    case 'workbench-earnings': return <WorkbenchEarningsPage ... />
    case 'workbench-withdraw': return <WorkbenchWithdrawPage ... />
    
    default: return renderHomePage()
  }
}
```

### 3.2 组件目录扩展

```
components/pages/
├── ServicesPage.tsx           # 现有
├── ServiceDetailPage.tsx      # 现有
├── CasesPage.tsx              # 现有
├── ProfilePage.tsx            # 现有
├── marketing/                 # 新增：营销中心页面
│   ├── MembershipPage.tsx
│   ├── MembershipPlansPage.tsx
│   ├── CouponsPage.tsx
│   ├── CouponsAvailablePage.tsx
│   ├── PointsPage.tsx
│   ├── PointsRecordsPage.tsx
│   ├── ReferralsPage.tsx
│   ├── CampaignsPage.tsx
│   └── CampaignDetailPage.tsx
├── escort/                    # 新增：陪诊员页面
│   ├── EscortListPage.tsx
│   └── EscortDetailPage.tsx
└── workbench/                 # 新增：工作台页面
    ├── WorkbenchPage.tsx
    ├── WorkbenchOrdersPoolPage.tsx
    ├── WorkbenchOrderDetailPage.tsx
    ├── WorkbenchEarningsPage.tsx
    └── WorkbenchWithdrawPage.tsx
```

---

## 四、数据覆盖机制

### 4.1 覆盖原则

- 管理后台配置的数据应能实时反映在预览器中
- 优先使用 `override` 数据，其次使用 API 获取的数据，最后使用默认值

### 4.2 合并逻辑

```typescript
// 数据合并示例
const themeSettings: ThemeSettings = useMemo(
  () => ({ 
    ...defaultThemeSettings, 
    ...fetchedThemeSettings, 
    ...themeSettingsOverride 
  }),
  [fetchedThemeSettings, themeSettingsOverride]
)

// 营销数据合并
const membershipData = useMemo(
  () => ({
    ...fetchedMembershipData,
    ...marketingData?.membership,
  }),
  [fetchedMembershipData, marketingData?.membership]
)
```

### 4.3 使用示例

```typescript
// 会员管理页面
<TerminalPreview
  page="membership"
  viewerRole="user"
  userContext={{
    membershipLevel: formData.currentLevel,
    points: formData.points,
  }}
  marketingData={{
    membership: {
      levels: formData.levels,
      myMembership: formData.myMembership,
    }
  }}
/>

// 陪诊员工作台预览（需模拟 escortSession）
<TerminalPreview
  page="workbench"
  viewerRole="escort"
  escortSession={{ token: 'mock-escort-token', escortId: 'mock-escort-id' }}
  escortContext={{
    id: 'escort-001',
    name: '张三',
    level: 'senior',
    workStatus: 'available',
    earnings: 12500,
    orderCount: 156,
  }}
/>
```

---

## 五、预览器 UI 增强

### 5.1 调试面板（必选）

在预览器顶部（PhoneFrame 组件）**必须**增加调试面板，展示以下三项信息：

| 展示项 | 说明 | 示例 |
|--------|------|------|
| **当前 viewerRole** | 当前视角角色 | `👤 用户` / `🔐 陪诊员` |
| **Token 状态** | 双 token 有效性 | `userToken ✅` `escortToken ❌` |
| **请求通道** | 当前使用的 API 通道 | `userRequest` / `escortRequest` |

> 💡 这是排查"为什么接口 403 / 为什么页面空白"的最高频手段，**必须实现**。

### 5.2 调试面板功能

- **ViewerRole 切换**：User / Escort
- **EscortSession 模拟**：
  - 无会话（模拟普通用户）
  - 模拟已登录（注入 mock escortToken / escortContext）
- **Token 状态指示**：实时显示双 token 有效性

### 5.3 实现代码

```typescript
// PhoneFrame.tsx 扩展
interface PhoneFrameProps {
  // ... 现有属性
  viewerRole?: PreviewViewerRole
  onViewerRoleChange?: (role: PreviewViewerRole) => void
  userSession?: UserSession
  escortSession?: EscortSession
}

// 调试面板组件（必选）
function DebugPanel({
  viewerRole,
  onViewerRoleChange,
  userSession,
  escortSession,
  onEscortSessionChange,
}: DebugPanelProps) {
  const hasUserToken = !!userSession?.token
  const hasEscortToken = !!escortSession?.token
  
  return (
    <div className="flex items-center gap-2 px-2 py-1 bg-gray-100 text-xs border-b">
      {/* 视角切换 */}
      <div className="flex items-center gap-1">
        <span className="text-gray-500">视角:</span>
        <button 
          className={`px-1.5 py-0.5 rounded ${viewerRole === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => onViewerRoleChange('user')}
        >
          👤 用户
        </button>
        <button 
          className={`px-1.5 py-0.5 rounded ${viewerRole === 'escort' ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}
          onClick={() => onViewerRoleChange('escort')}
        >
          🔐 陪诊员
        </button>
      </div>
      
      {/* Token 状态 */}
      <div className="flex items-center gap-1 ml-2 text-gray-500">
        <span>Token:</span>
        <span className={hasUserToken ? 'text-green-600' : 'text-red-500'}>
          user {hasUserToken ? '✅' : '❌'}
        </span>
        <span className={hasEscortToken ? 'text-green-600' : 'text-red-500'}>
          escort {hasEscortToken ? '✅' : '❌'}
        </span>
      </div>
      
      {/* 陪诊员会话模拟 */}
      {viewerRole === 'escort' && (
        <div className="flex items-center gap-1 ml-2">
          <span className="text-gray-500">会话:</span>
          <select 
            className="text-xs border rounded px-1"
            value={escortSession ? 'mock' : 'none'}
            onChange={(e) => onEscortSessionChange(
              e.target.value === 'mock' 
                ? { token: 'mock-token', escortId: 'mock-id' }
                : null
            )}
          >
            <option value="none">无</option>
            <option value="mock">模拟</option>
          </select>
        </div>
      )}
      
      {/* API 通道指示 */}
      <div className="ml-auto text-gray-400">
        {viewerRole === 'escort' ? '📡 escortRequest' : '📡 userRequest'}
      </div>
    </div>
  )
}
```

---

## 六、管理后台集成点

### 6.1 营销中心管理页面

| 管理页面 | 路由 | 预览器集成 | 预览页面 |
|---------|------|-----------|---------|
| 会员管理 | `/marketing/membership` | ✅ 建议集成 | `membership`, `membership-plans` |
| 优惠券管理 | `/marketing/coupons` | ✅ 建议集成 | `coupons`, `coupons-available` |
| 积分管理 | `/marketing/points` | ✅ 建议集成 | `points`, `points-records` |
| 邀请奖励 | `/marketing/referrals` | ✅ 建议集成 | `referrals` |
| 活动管理 | `/marketing/campaigns` | ✅ 建议集成 | `campaigns`, `campaigns-detail` |

### 6.2 陪诊员管理页面

| 管理页面 | 路由 | 预览器集成 | 预览页面 |
|---------|------|-----------|---------|
| 陪诊员管理 | `/escorts` | ✅ 建议集成 | `escort-list`, `escort-detail` |
| 工作台管理 | `/escort-app/workbench` | ✅ 建议集成 | `workbench` |

---

## 七、成功标准

### 7.1 功能完整性

- ✅ 所有营销中心页面可在预览器中查看
- ✅ 所有陪诊员相关页面可在预览器中查看
- ✅ 管理后台相关页面集成预览器
- ✅ 数据覆盖机制正常工作
- ✅ 角色切换功能正常

### 7.2 技术质量

- ✅ 类型系统完整，无 TypeScript 错误
- ✅ 组件遵循现有代码规范
- ✅ API 集成完整，支持错误处理
- ✅ 性能满足要求（页面切换流畅）

### 7.3 用户体验

- ✅ 预览器界面与终端一致
- ✅ 数据实时更新（配置修改后预览器同步更新）
- ✅ 支持深色/浅色模式切换

