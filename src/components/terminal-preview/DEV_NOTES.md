# TerminalPreview 改造开发笔记

> **文档版本**: v1.0  
> **创建日期**: 2024-12-12  
> **适用范围**: `src/components/terminal-preview/**`

---

## ⚠️ 重要声明

**本组件（TerminalPreview）仅用于管理后台的预览模拟，不代表真实终端逻辑。**

- `viewerRole` / `userSession` / `escortSession` 等字段仅用于后台预览调试
- 真实终端的视角切换由 token validate 结果推导，不允许手动写入
- 禁止将本组件的视角切换逻辑搬到真实终端，否则会导致越权风险

---

## 分步改造策略

### Step 0: 执行约束与护栏 ✅

**目标**: 建立规范边界，不改变现有功能

**验收点**:
- [x] 添加 DEV_NOTES.md 说明改造策略
- [x] 关键代码补充"仅用于预览模拟"注释
- [x] TypeScript 编译通过
- [x] 现有预览功能不受影响

---

### Step 1: 类型系统骨架 ✅

**目标**: 建立统一类型系统，为后续路由扩展与双会话做准备

**验收点**:
- [x] 定义 `PreviewPage` 类型（补全营销中心 + 陪诊员 + 工作台 page keys）
- [x] 定义 `PreviewViewerRole = 'user' | 'escort'`
- [x] 定义 `UserSession` / `EscortSession` 接口
- [x] 定义 `UserContext` / `EscortContext` 接口
- [x] 更新 `TerminalPreviewProps`，新增 viewerRole / userSession / escortSession
- [x] 保持向后兼容，现有调用方无需修改
- [x] TypeScript 编译通过

**新增类型清单**:
```typescript
// types.ts 新增
PreviewPage          // 页面路由类型（25 种）
PreviewViewerRole    // 'user' | 'escort'
UserSession          // { token?, userId? }
EscortSession        // { token?, escortId? }
UserContext          // { membershipLevel?, points?, ... }
EscortContext        // { id?, name?, level?, workStatus?, ... }
```

---

### Step 2: 请求层双通道封装 ✅

**目标**: 建立强制规范的双请求通道，避免 token 串用

**验收点**:
- [x] 实现 `getUserToken()` 和 `getEscortToken()`（预览器用管理后台 token，终端 TODO）
- [x] 实现 `userRequest<T>(endpoint, options?)`，自动携带 userToken
- [x] 实现 `escortRequest<T>(endpoint, options?)`，自动携带 escortToken
- [x] 统一错误处理：401 清 token / 403 无权限 / 500 服务器错误
- [x] 添加 `ApiError` 和 `ChannelMismatchError` 错误类
- [x] 现有 previewApi 方法全部改为 userRequest
- [x] 添加 Escort Channel TODO 注释（Step 6 接入）
- [x] TypeScript 编译通过
- [x] 现有预览器功能正常

**Token 存储位置**:
| 环境 | userToken | escortToken |
|------|-----------|-------------|
| 管理后台预览器 | Cookie: `thisisjustarandomstring` | 暂无（TODO） |
| 小程序 | `wx.storage: userToken` | `wx.storage: escortToken` |
| H5 | `localStorage: kekeling_userToken` | `localStorage: kekeling_escortToken` |

**导出函数**:
```typescript
// api.ts 新增导出
getUserToken()      // 获取用户 token
getEscortToken()    // 获取陪诊员 token
clearEscortToken()  // 清除陪诊员 token
userRequest<T>()    // 用户通道请求
escortRequest<T>()  // 陪诊员通道请求
ApiError            // API 错误类
ChannelMismatchError // 通道不匹配错误
```

---

### Step 3: 双会话状态与 viewerRole 推导 ✅

**目标**: 把"视角切换的唯一依据"落成代码规则

**验收点**:
- [x] 新增 `useViewerRole` hook（输入 userSession/escortSession/viewerRole，输出 effectiveViewerRole）
- [x] 实现 `validateEscortSession()` 函数（v1: token 存在即有效，预留真实接口扩展点）
- [x] 预览器模式允许 viewerRole 强制覆盖
- [x] 真实终端以 escortToken 是否有效决定 effectiveViewerRole
- [x] 集成到 TerminalPreview（暂保留内部，Step 4 用于 DebugPanel）
- [x] TypeScript 编译通过

**viewerRole 推导规则**:
1. 预览器模式 + 显式 `viewerRole` Props → 使用 viewerRole（强制模拟）
2. 预览器模式 + `escortSession.token` 存在 → escort
3. 真实终端 + `escortToken` 存在且验证有效 → escort
4. 其他情况 → user

**新增文件**:
```
hooks/useViewerRole.ts  # 视角角色推导 hook
```

**导出**:
```typescript
// index.tsx 新增导出
export { useViewerRole, validateEscortSession } from './hooks/useViewerRole'
export type { UseViewerRoleOptions, UseViewerRoleResult } from './hooks/useViewerRole'
```

---

### Step 4: 预览器 DebugPanel ✅

**目标**: 提供开发态的"视角切换器"和"会话模拟开关"

**验收点**:
- [x] 新增 `components/DebugPanel.tsx` 组件
- [x] 显示 effectiveViewerRole（当前视角）
- [x] 显示 userToken / escortToken 状态（打码：前6位...后4位）
- [x] 按钮：注入 mock escortToken
- [x] 按钮：清除 escortToken
- [x] 按钮：刷新会话校验
- [x] 仅开发环境显示（`shouldShowDebugPanel()`）
- [x] 集成到 `TerminalPreview` renderContent 顶部
- [x] 注入/清除 escortToken 能立刻切换 effectiveViewerRole
- [x] TypeScript 编译通过

**组件位置**: `src/components/terminal-preview/components/DebugPanel.tsx`

**开启条件**: `process.env.NODE_ENV === 'development'`

**DebugPanel 功能**:
| 显示项 | 说明 |
|--------|------|
| effectiveViewerRole | 👤 用户 / 🔐 陪诊员 |
| userToken 状态 | ✅/❌ + 打码显示 |
| escortToken 状态 | ✅/❌ + 打码显示 |

| 按钮 | 功能 |
|------|------|
| 注入 mock escortToken | 生成 `mock-escort-xxx` token |
| 清除 escortToken | 退出陪诊员视角 |
| 刷新校验 | 触发 validateEscortSession |

---

### Step 5: 路由扩展样板（coupons 页面） ✅

**目标**: 跑通 "page key → 页面组件 → renderPageContent → userRequest" 最小闭环

**验收点**:
- [x] 新增 `components/pages/marketing/CouponsPage.tsx`
- [x] 在 `renderPageContent()` 增加 `case 'coupons'`
- [x] 在 `previewApi` 增加 `getMyCoupons()`（走 userRequest）
- [x] 接口失败时自动降级为 mock 数据
- [x] `PreviewPage` 类型已包含 `'coupons'`
- [x] TypeScript 编译通过
- [x] 请求失败也能显示空态，不崩溃

**新增文件**:
```
components/pages/marketing/CouponsPage.tsx  # 优惠券页面
components/pages/marketing/index.ts         # 营销页面导出
```

**API 新增**:
```typescript
// api.ts
previewApi.getMyCoupons(): Promise<CouponsResponse>
// 接口: GET /marketing/coupons/my
// 通道: userRequest
// 降级: 接口 404/500 时返回 mock 数据
```

**Mock 数据结构**（与未来接口映射）:
```typescript
interface CouponItem {
  id: string           // 优惠券 ID
  name: string         // 名称
  description?: string // 描述
  amount: number       // 优惠金额
  minAmount: number    // 最低消费
  expireAt: string     // 过期时间 (YYYY-MM-DD)
  status: 'available' | 'used' | 'expired'
}

interface CouponsResponse {
  items: CouponItem[]
  total: number
}
```

---

### Step 6: 批量接入页面

**目标**: 按模块逐批接入，每批最多 2 个页面

---

#### 批次 A: membership + membership-plans ✅

**验收点**:
- [x] 新增 `MembershipPage.tsx` (会员中心)
- [x] 新增 `MembershipPlansPage.tsx` (会员套餐)
- [x] `renderPageContent()` 增加 case 'membership' / 'membership-plans'
- [x] `previewApi.getMyMembership()` / `getMembershipPlans()`
- [x] 每个页面支持 loading / error / mock 降级
- [x] TypeScript 编译通过

**API 新增**:
```typescript
previewApi.getMyMembership(): Promise<MembershipInfo | null>
previewApi.getMembershipPlans(): Promise<MembershipPlan[]>
```

---

#### 批次 B: points + points-records ✅

**验收点**:
- [x] 新增 `PointsPage.tsx` (积分首页: 积分卡片、任务列表、商城入口)
- [x] 新增 `PointsRecordsPage.tsx` (积分明细: 收支记录列表)
- [x] `renderPageContent()` 增加 case 'points' / 'points-records'
- [x] `previewApi.getMyPoints()` / `getPointsRecords()`
- [x] 每个页面支持 loading / error / mock 降级
- [x] TypeScript 编译通过

**API 新增**:
```typescript
// 接口路径 + mock 字段映射

// GET /marketing/points/my
previewApi.getMyPoints(): Promise<PointsInfo>
interface PointsInfo {
  balance: number      // 当前积分余额
  totalEarned: number  // 累计获得
  totalUsed: number    // 累计使用
  expiringSoon: number // 即将过期（30天内）
}

// GET /marketing/points/records
previewApi.getPointsRecords(params?): Promise<PointsRecordsResponse>
interface PointsRecord {
  id: string
  title: string        // 标题
  points: number       // 积分变动数量
  type: 'earn' | 'use' // 类型
  createdAt: string    // 创建时间
}
interface PointsRecordsResponse {
  items: PointsRecord[]
  total: number
}
```

---

#### 批次 C: referrals + campaigns ✅

**验收点**:
- [x] 新增 `ReferralsPage.tsx` (邀请好友: 邀请码、统计、规则)
- [x] 新增 `CampaignsPage.tsx` (活动列表: 活动卡片、状态标签)
- [x] `renderPageContent()` 增加 case 'referrals' / 'campaigns' / 'campaigns-detail'
- [x] `previewApi.getReferralInfo()` / `getCampaigns()`
- [x] campaigns 点击条目跳转 campaigns-detail（占位页）
- [x] TypeScript 编译通过

**API 新增**:
```typescript
// GET /marketing/referrals/info
previewApi.getReferralInfo(): Promise<ReferralInfo>
interface ReferralInfo {
  inviteCode: string    // 邀请码
  invitedCount: number  // 已邀请人数
  earnedPoints: number  // 已获得积分
  pendingPoints: number // 待领取积分
  rewardPoints: number  // 每次邀请奖励积分
}

// GET /marketing/campaigns
previewApi.getCampaigns(): Promise<Campaign[]>
interface Campaign {
  id: string
  title: string
  description: string
  coverImage?: string
  startTime: string
  endTime: string
  status: 'upcoming' | 'ongoing' | 'ended'
}
```

---

#### 批次 D: campaigns-detail + coupons-available ✅

**验收点**:
- [x] 新增 `CampaignDetailPage.tsx` (活动详情: 封面、规则、奖励、参与按钮)
- [x] 新增 `CouponsAvailablePage.tsx` (可领取优惠券: 优惠券卡片、领取按钮)
- [x] 增加路由参数支持 (`pageParams` + `navigateToPage`)
- [x] `previewApi.getCampaignDetail(id)` / `getAvailableCoupons()`
- [x] campaigns-detail 无 id 时显示友好提示
- [x] TypeScript 编译通过

**路由参数机制**:
```typescript
// index.tsx 新增
const [pageParams, setPageParams] = useState<Record<string, string>>({})

const navigateToPage = (page: string, params?: Record<string, string>) => {
  setCurrentPage(page)
  setPageParams(params ?? {})
}

// CampaignsPage 调用
onNavigate?.('campaigns-detail', { id: campaign.id })

// CampaignDetailPage 接收
campaignId={pageParams.id}
```

**API 新增**:
```typescript
// GET /marketing/campaigns/:id
previewApi.getCampaignDetail(id): Promise<CampaignDetail>
interface CampaignDetail extends Campaign {
  rules?: string      // 活动规则
  rewards?: string[]  // 活动奖励列表
}

// GET /marketing/coupons/available
previewApi.getAvailableCoupons(): Promise<AvailableCoupon[]>
interface AvailableCoupon {
  id: string
  name: string
  description?: string
  amount: number
  minAmount: number
  remaining: number   // 剩余可领数量
}
```

---

### Step 10: 陪诊员公开页批次 A ✅

#### 批次 E: escort-list + escort-detail ✅

**验收点**:
- [x] 新增 `components/pages/escort/EscortListPage.tsx` (陪诊员卡片: 头像、等级、服务次数、好评率、状态)
- [x] 新增 `components/pages/escort/EscortDetailPage.tsx` (详情: 统计、简介、标签、服务区域、预约按钮)
- [x] 复用 Step 9 路由参数机制
- [x] `previewApi.getEscorts()` / `getEscortDetail(id)`（走 userRequest 公开通道）
- [x] escort-detail 无 id 时显示友好提示
- [x] 现有营销中心不回归
- [x] TypeScript 编译通过

**API 新增（公开接口，userRequest）**:
```typescript
// GET /escorts
previewApi.getEscorts(): Promise<EscortListItem[]>
interface EscortListItem {
  id: string
  name: string
  avatar?: string
  level?: string           // 金牌/银牌
  serviceCount: number
  rating: number           // 0-100
  tags?: string[]
  status: 'available' | 'offline'
}

// GET /escorts/:id
previewApi.getEscortDetail(id): Promise<EscortDetail>
interface EscortDetail extends EscortListItem {
  bio?: string             // 个人简介
  experience: number       // 从业年限
  serviceAreas?: string[]  // 服务区域
}
```

⚠️ **重要**: `/escorts` 是公开接口，后端不要强制 `escortToken`！

---

### Step 11: 陪诊员工作台最小闭环 ✅

#### 批次 F: workbench ✅

**验收点**:
- [x] 新增 `components/pages/workbench/WorkbenchPage.tsx`
- [x] `previewApi.getWorkbenchStats()`（走 escortRequest）
- [x] 非 escort 视角时显示权限提示，不发请求
- [x] DebugPanel 注入 mock escortToken 后可预览
- [x] TypeScript 编译通过

**权限校验机制**:
```typescript
// WorkbenchPage.tsx
const isEscort = effectiveViewerRole === 'escort'

// useQuery 只在 escort 视角发请求
const { data, isLoading } = useQuery({
  queryKey: ['preview', 'workbench', 'stats'],
  queryFn: () => previewApi.getWorkbenchStats(),
  enabled: isEscort, // ⚠️ 关键：非 escort 不发请求
})

// 非 escort 视角显示提示
if (!isEscort) {
  return <权限提示组件 />
}
```

**API 新增（escortRequest）**:
```typescript
// GET /escort-app/workbench/stats
previewApi.getWorkbenchStats(): Promise<WorkbenchStats>
interface WorkbenchStats {
  pendingOrders: number    // 待接单
  ongoingOrders: number    // 进行中
  completedOrders: number  // 已完成
  todayIncome: number      // 今日收入
  monthIncome: number      // 本月收入
  withdrawable: number     // 可提现
  isOnline: boolean        // 在线状态
}
```

⚠️ **这是第一个走 escortRequest 的页面！**

---

### Step 12: 双会话（Dual-Session）模型 ✅

**目标**: 建立统一的会话状态层，支持同时存在 userToken 与 escortToken。

**验收点**:
- [x] 新增 `session.ts` 统一会话状态管理
- [x] 实现 Token 持久化（localStorage）
- [x] 提供 token 有效性检查占位函数（支持异步校验扩展）
- [x] viewerRole 从 escortToken 有效性推导，不是存储字段
- [x] 废弃 role 字段，提供迁移函数
- [x] TypeScript 编译通过
- [x] 不影响现有营销中心页面预览

**Token 存储 Key**:
| Key | 说明 |
|-----|------|
| `terminalPreview.userToken` | 预览器用户 Token |
| `terminalPreview.escortToken` | 预览器陪诊员 Token |

**session.ts 导出函数**:
```typescript
// Token 读写
getPreviewUserToken(): string | null
setPreviewUserToken(token: string): void
clearPreviewUserToken(): void
getPreviewEscortToken(): string | null
setPreviewEscortToken(token: string): void
clearPreviewEscortToken(): void
clearAllPreviewTokens(): void

// Token 验证（v1 占位，支持异步）
validateUserToken(token): Promise<TokenValidationResult>
validateEscortToken(token): Promise<TokenValidationResult>

// viewerRole 推导
deriveViewerRole(escortToken, isValidated): PreviewViewerRole

// 废弃兼容
migrateRoleToViewerRole(role): PreviewViewerRole // @deprecated
```

**viewerRole 推导规则**:
```typescript
// escortToken 存在且有效 => 'escort'
// 否则 => 'user'
function deriveViewerRole(escortToken, isValidated) {
  if (escortToken?.startsWith('mock-')) return 'escort'
  if (escortToken && isValidated) return 'escort'
  return 'user'
}
```

---

### Step 2/7: 请求分流增强 + verifyEscortToken ✅

**目标**: 确保双通道请求机制完整，并增加 escort token 验证占位。

**验收点**:
- [x] userRequest 自动携带 `Authorization: Bearer ${userToken}`
- [x] escortRequest 自动携带 `Authorization: Bearer ${escortToken}`
- [x] 统一错误处理（401/403/500 不崩溃，返回可降级错误）
- [x] `previewApi.verifyEscortToken()` 占位实现
- [x] 现有营销中心 previewApi 请求不受影响
- [x] TypeScript 编译通过

**新增 API**:
```typescript
// 验证 escortToken 有效性
previewApi.verifyEscortToken(): Promise<boolean>
// - mock token (mock-*) 直接返回 true
// - 真实 token: v1 占位返回 true，TODO 后续接真实接口
// - 无 token 返回 false
// - 401 时清除 token 并返回 false
```

**请求通道规则回顾**:
```typescript
// User Channel: 用户端功能
userRequest<T>(endpoint, options?)
// 自动: Authorization: Bearer ${userToken}

// Escort Channel: 陪诊员工作台
escortRequest<T>(endpoint, options?)
// 自动: Authorization: Bearer ${escortToken}
// 仅用于: /escort-app/**
```

---

### Step 3/7: escortToken 有效性判定接入 viewerRole ✅

**目标**: viewerRole=escort 当且仅当 escortToken 存在且后端验证有效。

**验收点**:
- [x] TerminalPreview 打开时触发 `verifyEscortToken()` 验证
- [x] escortToken 变更时触发验证
- [x] 校验失败时清理 localStorage + state + 回落 user
- [x] 校验过程中先显示 user，通过后切 escort（避免闪烁）
- [x] 新增 `isCheckingEscortToken` 状态
- [x] TypeScript 编译通过

**viewerRole 推导规则（稳定版）**:
```typescript
// 1. 预览器模式 + 显式 viewerRole Props → 强制使用
if (isPreviewMode && forcedViewerRole) return forcedViewerRole

// 2. escortToken 验证有效 → escort
// ⚠️ 关键：只有验证通过才切换
if (isEscortTokenValid === true) return 'escort'

// 3. 其他情况（验证中、无 token、验证失败）→ user
return 'user'
```

**校验流程**:
```
1. TerminalPreview 打开 / escortToken 变更
   ↓
2. isCheckingEscortToken = true, effectiveViewerRole = 'user'
   ↓
3. 调用 previewApi.verifyEscortToken()
   ↓
4a. 验证成功 → isEscortTokenValid = true → effectiveViewerRole = 'escort'
4b. 验证失败 → 清理 token → isEscortTokenValid = false → 保持 'user'
```

**useViewerRole 返回值**:
```typescript
{
  effectiveViewerRole: 'user' | 'escort',
  isEscort: boolean,
  isUser: boolean,
  isCheckingEscortToken: boolean, // 新增：验证中状态
  isValidating: boolean,          // @deprecated 兼容旧 API
  revalidate: () => Promise<void>,
}
```

---

### Step 4/7: "我的页"陪诊员入口 + 二次登录流程 ✅

**目标**: 普通用户可点击入口触发二次登录，登录成功后写入 escortToken 并切换视角。

**验收点**:
- [x] ProfilePage 增加陪诊员入口卡片
- [x] 普通用户视角：显示"成为陪诊员"入口
- [x] 陪诊员视角：显示"进入工作台"入口
- [x] 新增 EscortLoginDialog 二次登录对话框
- [x] 登录成功后写入 escortToken 并触发校验闭环
- [x] userToken 不受影响
- [x] TypeScript 编译通过

**新增组件**:
```typescript
// components/EscortLoginDialog.tsx
interface EscortLoginDialogProps {
  open: boolean
  onClose: () => void
  onLoginSuccess: (escortToken: string) => void
  themeSettings: ThemeSettings
  isDarkMode?: boolean
}
```

**ProfilePage 新增 Props**:
```typescript
interface ProfilePageProps {
  // ...existing
  effectiveViewerRole?: PreviewViewerRole
  onEscortEntryClick?: () => void
  onWorkbenchClick?: () => void
}
```

**流程**:
```
1. 用户在"我的"页点击"成为陪诊员"
   ↓
2. 弹出 EscortLoginDialog
   ↓
3. 输入手机号 + 验证码
   ↓
4. 登录成功 → onLoginSuccess(escortToken)
   ↓
5. setPreviewEscortToken + setLocalEscortToken
   ↓
6. useViewerRole 自动验证 + effectiveViewerRole = 'escort'
   ↓
7. ProfilePage 显示"进入工作台"
```

**UI 状态**:
| 视角 | 入口文案 | 按钮文案 | 点击行为 |
|------|----------|----------|----------|
| user | 成为陪诊员 | 立即加入 | 打开登录对话框 |
| escort | 陪诊员工作台 | 进入工作台 | 跳转 workbench |

---

### Step 5/7: 退出陪诊员功能 ✅

**目标**: 在 escort 视角下提供退出入口，退出后回到 user 视角且不影响 user 登录态。

**验收点**:
- [x] ProfilePage 顶部显示"陪诊员模式"提示条 + 退出按钮
- [x] WorkbenchPage 标题栏显示退出按钮
- [x] 点击退出清理 escortToken (state + localStorage)
- [x] viewerRole 立刻回落为 user
- [x] userToken 保持不变
- [x] 退出后自动跳回"我的页"
- [x] TypeScript 编译通过

**退出入口位置**:
| 页面 | 位置 | UI |
|------|------|-----|
| ProfilePage | 头部顶部 | 陪诊员模式提示条 + [退出] 按钮 |
| WorkbenchPage | 标题栏右侧 | [退出] 按钮 |

**退出流程**:
```typescript
const handleExitEscortMode = useCallback(() => {
  clearPreviewEscortToken()    // 清除 localStorage
  setLocalEscortToken(null)    // 清除状态
  setCurrentPage('profile')    // 跳回我的页
  // useViewerRole 自动检测 token 清除 → effectiveViewerRole = 'user'
}, [])
```

**UI 变化**:
| 退出前 | 退出后 |
|--------|--------|
| effectiveViewerRole = 'escort' | effectiveViewerRole = 'user' |
| 显示"陪诊员模式"提示条 | 提示条消失 |
| 显示"陪诊员"标签 | 标签消失 |
| 入口显示"进入工作台" | 入口显示"成为陪诊员" |

---

### Step 6/7: 工作台 API（escortRequest 通道） ✅

**目标**: 新增工作台相关 API，全部走 escortRequest 通道，具备 mock 降级。

**验收点**:
- [x] `getWorkbenchSummary()` - 工作台汇总
- [x] `getWorkbenchOrdersPool()` - 订单池
- [x] `getWorkbenchEarnings()` - 收入明细
- [x] `getWorkbenchWithdrawInfo()` - 提现信息
- [x] 每个接口 404/500 时返回 mock 数据
- [x] TypeScript 编译通过

**新增类型**:
```typescript
// 工作台汇总
interface WorkbenchSummary {
  todayOrders, weekOrders, monthOrders, totalOrders,
  todayIncome, weekIncome, monthIncome, totalIncome,
  rating, satisfactionRate,
}

// 订单池
interface OrdersPoolResponse {
  items: PoolOrderItem[], total, hasMore,
}
interface PoolOrderItem {
  id, orderNo, serviceType, serviceName, appointmentTime,
  hospitalName, department?, amount, commission, distance?, createdAt,
}

// 收入明细
interface EarningsResponse {
  balance, totalEarned, totalWithdrawn, pendingSettlement,
  items: EarningsItem[], hasMore,
}
interface EarningsItem {
  id, type: 'order'|'bonus'|'withdraw'|'refund',
  title, amount, createdAt, orderNo?,
}

// 提现信息
interface WithdrawInfo {
  withdrawable, minWithdrawAmount, feeRate, estimatedHours,
  bankCards: { id, bankName, cardNo, isDefault }[],
}
```

**API 路径**:
| API | 路径 | 通道 |
|-----|------|------|
| `getWorkbenchSummary()` | `/escort-app/workbench/summary` | escortRequest |
| `getWorkbenchOrdersPool()` | `/escort-app/orders/pool` | escortRequest |
| `getWorkbenchEarnings()` | `/escort-app/earnings` | escortRequest |
| `getWorkbenchWithdrawInfo()` | `/escort-app/withdraw/info` | escortRequest |

---

### Step 7/7 批次 A: 工作台页面（workbench + orders-pool） ✅

**目标**: 接入工作台总览和订单池页面。

**验收点**:
- [x] WorkbenchPage 已存在，修复订单池导航路径
- [x] 新增 OrdersPoolPage.tsx（订单池列表）
- [x] renderPageContent() 增加 case 'workbench-orders-pool'
- [x] 仅 viewerRole=escort 时允许进入
- [x] loading / error / mock 降级齐全
- [x] 可从工作台总览跳到订单池
- [x] TypeScript 编译通过

**新增页面**:
| 页面 | 文件 | page key |
|------|------|----------|
| 订单池 | `OrdersPoolPage.tsx` | `workbench-orders-pool` |

**导航路径**:
```
workbench → 点击"订单池" → workbench-orders-pool
workbench-orders-pool → 点击返回 → workbench
```

**权限校验**:
- 非 escort 视角显示 🔒 提示
- 不发起 API 请求

---

### 工作台 API Mock Token 规则增强 ✅

**目标**: 所有 escortRequest 通道的 API 遵守 mock token 规则。

**规则**: token 以 `mock-` 开头时，直接返回静态 mock 数据，不请求真实后端。

**已更新 API**:
- [x] `getWorkbenchStats()` - 添加 mock token 检查
- [x] `getWorkbenchSummary()` - 添加 mock token 检查
- [x] `getWorkbenchOrdersPool()` - 添加 mock token 检查
- [x] `getWorkbenchEarnings()` - 添加 mock token 检查
- [x] `getWorkbenchWithdrawInfo()` - 添加 mock token 检查

**实现模式**:
```typescript
getWorkbenchXxx: async () => {
  const escortToken = getEscortToken()

  // mock token 直接返回 mock 数据，不请求真实后端
  if (escortToken?.startsWith('mock-')) {
    console.log('[previewApi.getWorkbenchXxx] mock token, 返回 mock 数据')
    return getMockXxx()
  }

  try {
    return await escortRequest<Xxx>('/escort-app/xxx')
  } catch (error) {
    // 404/500 降级
    if (error instanceof ApiError && (error.status === 404 || error.status === 500)) {
      return getMockXxx()
    }
    throw error
  }
}
```

**Mock 数据结构**:
```typescript
// Earnings
interface EarningsResponse {
  balance: number           // 可提现余额
  totalEarned: number       // 累计收入
  totalWithdrawn: number    // 累计提现
  pendingSettlement: number // 待结算
  items: EarningsItem[]     // 收入明细
  hasMore: boolean
}

// WithdrawInfo
interface WithdrawInfo {
  withdrawable: number      // 可提现金额
  minWithdrawAmount: number // 最低提现金额
  feeRate: number           // 手续费率
  estimatedHours: number    // 预计到账时间
  bankCards: {              // 已绑定银行卡
    id: string
    bankName: string
    cardNo: string
    isDefault: boolean
  }[]
}
```

---

### 工作台收入明细页面 ✅

**页面**: `workbench-earnings`
**文件**: `components/pages/workbench/EarningsPage.tsx`

**验收点**:
- [x] 仅 viewerRole=escort 时允许进入
- [x] 非 escort 显示 🔒 提示，不发起 API 请求
- [x] 调用 previewApi.getWorkbenchEarnings()
- [x] loading / error / empty / mock 降级
- [x] renderPageContent() 增加 case 'workbench-earnings'
- [x] TypeScript 编译通过

**UI 结构**:
| 区域 | 内容 |
|------|------|
| 标题栏 | ← 返回 + "收入明细" |
| 概览卡片 | 可提现余额 + 累计收入/提现/待结算 + [去提现] |
| 收支列表 | 图标 + 标题 + 时间 + 金额（+绿/-灰） |
| 加载更多 | hasMore 时显示 |

**收支类型图标**:
| type | 图标 |
|------|------|
| order | TrendingUp |
| bonus | Gift |
| withdraw | TrendingDown |
| refund | RefreshCw |

---

### 工作台提现页面 ✅

**页面**: `workbench-withdraw`
**文件**: `components/pages/workbench/WithdrawPage.tsx`

**验收点**:
- [x] 仅 viewerRole=escort 时允许进入
- [x] 非 escort 显示 🔒 提示，不发起 API 请求
- [x] 调用 previewApi.getWorkbenchWithdrawInfo()
- [x] loading / error / empty（无银行卡）/ mock 降级
- [x] renderPageContent() 增加 case 'workbench-withdraw'
- [x] TypeScript 编译通过

**UI 结构**:
| 区域 | 内容 |
|------|------|
| 标题栏 | ← 返回 + "提现" |
| 可提现金额 | 大字显示 |
| 金额输入 | ¥ + 输入框 + [全部提现] |
| 提现规则 | 最低金额 / 手续费 / 预计到账时间 |
| 银行卡选择 | 卡列表（可选中）/ 无卡时显示添加入口 |
| 到账预览 | 实际到账金额 + 手续费 |
| 提现按钮 | 满足条件时可用 |

**银行卡数据**:
| 字段 | 说明 |
|------|------|
| id | 银行卡ID |
| bankName | 银行名称 |
| cardNo | 卡号后4位 |
| isDefault | 是否默认 |

---

#### 批次 B: 工作台页面接入完成 ✅

---

#### 批次 E: workbench + workbench-orders-pool（待接入，需 escortRequest）

---

## 代码规范

### 请求规范

```typescript
// ✅ 正确：使用封装的 request
const data = await previewApi.getThemeSettings()

// ❌ 禁止：直接使用 fetch/axios
const data = await fetch('/api/xxx')
```

### Mock 数据规范

```typescript
// ✅ 正确：mock token 只用于预览器内部
escortSession={{ token: 'mock-escort-token', escortId: 'mock-id' }}

// ❌ 禁止：mock token 调真实后端
// mock token 开头为 'mock-'，会自动走静态数据
```

---

## 相关文档

- [终端预览器集成规格](../../../docs/终端预览器集成/01-TerminalPreview集成规格.md)
- [双身份会话与视角切换规格](../../../docs/终端预览器集成/02-双身份会话与视角切换规格.md)
- [模块页面接入清单与排期](../../../docs/终端预览器集成/03-模块页面接入清单与排期.md)

