# TerminalPreview 改造开发笔记

> **文档版本**: v3.2  
> **创建日期**: 2024-12-12  
> **最后更新**: 2024-12-13  
> **适用范围**: `src/components/terminal-preview/**`  
> **文档性质**: 📋 **唯一进度真源**（PR/Commit/需求卡片的 Step 唯一指代）

---

## 🎯 系统定位

**TerminalPreview** 是一个 **Terminal Behavior Simulator（终端行为模拟器）**，
用于在管理后台中以安全、可控的方式模拟真实终端行为。

### 它是什么

| 角色 | 说明 |
|------|------|
| 🖥️ 终端行为模拟系统 | 完整还原小程序/H5/App 的 UI 与交互逻辑 |
| 🔐 权限/通道/视角演练场 | 验证 user/escort 双身份下的数据隔离 |
| 🛡️ 真实端上线前的安全缓冲层 | 在不触碰真实 token 的情况下，提前暴露权限漏洞 |

### 它不是什么

| ❌ 不是 | 说明 |
|--------|------|
| 简单的 UI 预览 | 它验证的是行为，不仅仅是样式 |
| 真实终端的代码复用 | 预览器有 mock/debug 能力，真实端不可有 |
| 可随意扩展的组件库 | 每个扩展都必须遵循双通道规范 |

---

## 📊 当前进度总览

| 模块 | 状态 | Step 范围 | 说明 |
|------|------|-----------|------|
| **基础设施** | ✅ 完成 | Step 0-5 | 类型系统 + 双通道请求 + viewerRole 推导 + DebugPanel |
| **营销中心** | ✅ 完成 | Step 6-7 | 9 个页面 + 9 个 API + 路由参数机制 |
| **陪诊员公开页** | ✅ 完成 | Step 8 | escort-list + escort-detail |
| **双会话模型** | ✅ 完成 | Step 9 | session + verify + viewerRole 校验闭环 |
| **工作台** | ✅ 完成 | Step 10 | API + 页面批次（5 页面 + 7 API） |
| **分销中心** | ✅ 完成 | Step 11 | 5 个页面 + 5 个 API + PermissionPrompt |
| **管理后台集成** | ✅ 完成 | Step 12 | 积分/邀请/活动/陪诊员管理页面集成侧栏预览 |
| **工作台扩展** | ✅ 完成 | Step 13 | workbench-settings 设置页面 |
| **优化与测试** | ⏳ 进行中 | Step 14 | CI 守门脚本 ✅ + Mock/性能/测试 ⏳ |
| **真实端接入准备** | 📋 占位 | Step 15 | 未来真实终端接入的约束清单 |

### Step 编号体系（单线制，禁止跳号或多套并存）

```
Step 0-5   基础设施（类型 + 请求 + viewerRole + DebugPanel + 路由样板）
Step 6-7   营销中心（批次 A-D，9 页面）
Step 8     陪诊员公开页（escort-list/detail）
Step 9     双会话模型（session + verify + 登录/退出流程）
Step 10    工作台（API + 页面批次）
Step 11    分销中心（11.1 类型 → 11.2 API → 11.3-11.5 页面批次）✅
Step 12    管理后台预览器集成（积分/邀请/活动/陪诊员）✅
Step 13    工作台扩展（settings 页面）✅
Step 14    优化与测试（14.1-A/B/C + 14.2 CI 守门脚本 ✅）⏳
Step 15    真实终端接入准备（占位，未来实现）📋
```

### 下一阶段主战场

| 优先级 | 任务 | 说明 |
|--------|------|------|
| ~~**P1**~~ | ~~Step 12: 管理后台预览器集成~~ | ✅ 已完成 |
| ~~**P2**~~ | ~~Step 13: 工作台扩展~~ | ✅ 已完成 |
| **P2** | Step 14: 优化与测试 | 14.2 ✅ + 14.1-A/B/C ⏳ |
| **P3** | Step 15: 真实端接入 | 📋 占位，未来实现 |

---

## ⚠️ 重要声明

**本组件（TerminalPreview）仅用于管理后台的预览模拟，不代表真实终端逻辑。**

- `viewerRole` / `userSession` / `escortSession` 等字段仅用于后台预览调试
- 真实终端的视角切换由 token validate 结果推导，不允许手动写入
- 禁止将本组件的视角切换逻辑搬到真实终端，否则会导致越权风险

### 🔐 分销中心/工作台安全护栏（硬约束）

| 约束 | 说明 |
|------|------|
| **通道强制** | 分销中心/工作台所有 API **必须** `escortRequest`，即使后端暂时没验 token 也必须按私域通道走 |
| **禁止变通** | 禁止为了"方便预览"改成 `userRequest`，预览器的便利不能牺牲权限边界 |
| **Token 校验** | 真实 token 必须经过 `verifyEscortToken()` 校验，mock token 仅用于开发态 |

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

### Step 6: 营销中心批次 A-B ✅

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

### Step 7: 营销中心批次 C-D ✅

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

### Step 8: 陪诊员公开页 ✅

#### escort-list + escort-detail ✅

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

### Step 9: 双会话模型 + escortToken 校验闭环 ✅

> 本 Step 整合了原 Step 11-12 + Step 2/7-5/7 的内容，建立完整的双会话模型。

#### 9.1 工作台最小闭环 ✅

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

#### 9.2 双会话（Dual-Session）模型 ✅

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

#### 9.3 请求分流增强 + verifyEscortToken ✅

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

#### 9.4 escortToken 有效性判定接入 viewerRole ✅

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

#### 9.5 "我的页"陪诊员入口 + 二次登录流程 ✅

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

#### 9.6 退出陪诊员功能 ✅

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

### Step 10: 工作台（API + 页面批次） ✅

> 本 Step 整合了原 Step 6/7-7/7 + 工作台页面相关内容。

#### 10.1 工作台 API（escortRequest 通道） ✅

**目标**: 新增工作台相关 API，全部走 escortRequest 通道，具备 mock 降级。

**验收点**:
- [x] `getWorkbenchSummary()` - 工作台汇总
- [x] `getWorkbenchOrdersPool()` - 订单池
- [x] `getWorkbenchEarnings()` - 收入明细
- [x] `getWorkbenchWithdrawInfo()` - 提现信息
- [x] `getEarningsStats()` - 收入统计汇总（WorkbenchEarningsPage）
- [x] `getWithdrawStats()` - 提现统计汇总（WorkbenchWithdrawPage）
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
| `getEarningsStats()` | `/escort-app/earnings/stats` | escortRequest |
| `getWithdrawStats()` | `/escort-app/withdraw/stats` | escortRequest |

---

#### 10.2 工作台页面（workbench + orders-pool） ✅

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

#### 10.3 工作台 API Mock Token 规则增强 ✅

**目标**: 所有 escortRequest 通道的 API 遵守 mock token 规则。

**规则**: token 以 `mock-` 开头时，直接返回静态 mock 数据，不请求真实后端。

**已更新 API**:
- [x] `getWorkbenchStats()` - 添加 mock token 检查
- [x] `getWorkbenchSummary()` - 添加 mock token 检查
- [x] `getWorkbenchOrdersPool()` - 添加 mock token 检查
- [x] `getWorkbenchEarnings()` - 添加 mock token 检查
- [x] `getWorkbenchWithdrawInfo()` - 添加 mock token 检查
- [x] `getEarningsStats()` - 添加 mock token 检查
- [x] `getWithdrawStats()` - 添加 mock token 检查 + 无 token 降级

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

// EarningsStats（用于 WorkbenchEarningsPage）
interface EarningsStats {
  totalEarnings: number     // 总收入
  monthlyEarnings: number   // 本月收入
  withdrawable: number      // 可提现金额
  pendingWithdraw: number   // 提现中金额
  totalOrders: number       // 累计订单数
  monthlyOrders: number     // 本月订单数
  monthlyOrdersGrowth?: number // 环比增长率
  recentRecords: EarningsStatsRecord[] // 最近收入记录
}

interface EarningsStatsRecord {
  id: string
  type: 'order' | 'bonus' | 'withdraw' | 'refund'
  title: string
  amount: number
  orderNo?: string
  createdAt: string
  status: 'completed' | 'pending' | 'failed'
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

#### 10.4 getEarningsStats API ✅

**接口**: `GET /escort-app/earnings/stats`
**通道**: escortRequest（⚠️ 必须 escortToken，禁止 userRequest）

**调用方式**:
```typescript
const { data, isLoading, isError } = useQuery({
  queryKey: ['preview', 'workbench', 'earnings-stats'],
  queryFn: () => previewApi.getEarningsStats(),
  staleTime: 60 * 1000,
  enabled: isEscort,
})
```

**降级策略**:
1. 无 escortToken → 返回 mock 数据
2. mock token (mock-*) → 返回 mock 数据，不请求真实后端
3. 真实 token + 请求成功 → 返回真实数据
4. 真实 token + 404/500 → 降级到 mock 数据
5. 真实 token + 其他错误 → 降级到 mock 数据（保证预览器可用）

---

#### 10.5 工作台收入明细页面 ✅

**页面**: `workbench-earnings`

**文件**:
- `components/pages/workbench/EarningsPage.tsx` - 旧版 API 版本（调用 getWorkbenchEarnings）
- `components/pages/workbench/WorkbenchEarningsPage.tsx` - 新版（调用 getEarningsStats，支持 mock 降级）

**当前使用**: `WorkbenchEarningsPage.tsx`（使用 React Query + getEarningsStats API）

**验收点**:
- [x] 仅 viewerRole=escort 时允许进入
- [x] 非 escort 显示 🔒 提示，不发起 API 请求
- [x] 使用 React Query 调用 previewApi.getEarningsStats()
- [x] 有 escortToken 时走真实请求（escortRequest 通道）
- [x] 无 token 或请求失败时自动降级到 mock 数据
- [x] 5+ 指标卡片：总收入、本月收入、可提现、提现中、累计订单、本月订单
- [x] 最近 5 笔收入记录列表
- [x] renderPageContent() 增加 case 'workbench-earnings'
- [x] TypeScript 编译通过

**UI 结构**:
| 区域 | 内容 |
|------|------|
| 标题栏 | ← 返回 + "收入明细" |
| 概览卡片 | 渐变背景 + 可提现余额 + 提现中金额 + [立即提现] |
| 指标卡片 | 2x2 网格：总收入 / 本月收入 / 提现中 / 累计订单 |
| 本月订单行 | 本月完成订单数 + 环比增长 |
| 收支列表 | 图标 + 标题 + 时间 + 订单号 + 金额（+绿/-灰）+ 状态标签 |

**收支类型图标**:
| type | 图标 |
|------|------|
| order | ArrowUpRight |
| bonus | Gift |
| withdraw | ArrowDownRight |
| refund | RefreshCw |

**Mock 数据**:
```typescript
// 汇总数据
const MOCK_SUMMARY = {
  totalEarnings: 28650.00,     // 总收入
  monthlyEarnings: 4280.50,    // 本月收入
  withdrawable: 3650.00,       // 可提现
  pendingWithdraw: 500.00,     // 提现中
  totalOrders: 186,            // 累计订单
  monthlyOrders: 23,           // 本月订单
}

// 收入记录（5 条）
const MOCK_RECORDS = [
  { type: 'order', title: '全程陪诊服务', amount: 280.00, ... },
  { type: 'bonus', title: '好评奖励', amount: 20.00, ... },
  { type: 'order', title: '代问诊服务', amount: 150.00, ... },
  { type: 'withdraw', title: '提现至微信', amount: -500.00, status: 'pending', ... },
  { type: 'order', title: '检查陪同服务', amount: 200.00, ... },
]
```

---

#### 10.6 工作台提现页面 ✅

**页面**: `workbench-withdraw`

**文件**:
- `components/pages/workbench/WithdrawPage.tsx` - API 版本（调用 getWorkbenchWithdrawInfo）
- `components/pages/workbench/WorkbenchWithdrawPage.tsx` - API 版本（调用 getWithdrawStats）

**当前使用**: `WorkbenchWithdrawPage.tsx`（调用 `previewApi.getWithdrawStats()`）

**getWithdrawStats API**:
- 接口路径: `/escort-app/withdraw/stats`
- 数据通道: `escortRequest`（⚠️ 需要 escortToken）
- Mock Token 规则: token 以 `mock-` 开头时直接返回 mock 数据
- Fallback: 无 token / 接口 404/500 / 其他错误 均降级到 mock 数据

**Mock 数据结构**:
```typescript
interface WithdrawStats {
  withdrawable: number      // 可提现金额
  pendingAmount: number     // 处理中金额
  minAmount: number         // 最低提现
  maxAmount: number         // 单笔最高
  feeRate: number           // 手续费率
  estimatedHours: number    // 预计到账时间
  remainingTimes: number    // 今日剩余次数
  accounts: WithdrawAccount[]
  recentRecords: WithdrawRecord[]
}
```

**验收点**:
- [x] 仅 viewerRole=escort 时允许进入
- [x] 非 escort 显示 🔒 提示
- [x] 可提现余额展示
- [x] 提现账户信息（银行卡/支付宝等）
- [x] 提现表单（金额输入、提交按钮、禁用状态演示）
- [x] 最近提现记录列表（5 条 mock）
- [x] renderPageContent() 增加 case 'workbench-withdraw'
- [x] TypeScript 编译通过

**UI 结构**:
| 区域 | 内容 |
|------|------|
| 标题栏 | ← 返回 + "提现" |
| 可提现余额卡片 | 渐变背景 + 余额 + 处理中金额 |
| 金额输入 | ¥ + 输入框 + [全部提现] + 剩余次数 |
| 提现规则 | 最低/最高金额 / 手续费 / 预计到账时间 |
| 账户选择 | 银行卡/支付宝列表（可选中）+ 添加账户按钮 |
| 到账预览 | 实际到账金额 + 手续费 |
| 提现按钮 | 满足条件时可用，否则显示禁用原因 |
| 提现记录 | 最近 5 条提现记录 + 查看全部 |

**Mock 数据**:
```typescript
// 提现信息
const MOCK_WITHDRAW_INFO = {
  withdrawable: 3650.00,    // 可提现金额
  pendingAmount: 500.00,    // 处理中金额
  minAmount: 100,           // 最低提现
  maxAmount: 50000,         // 单笔最高
  feeRate: 0,               // 手续费率
  estimatedHours: 24,       // 预计到账时间
  remainingTimes: 3,        // 今日剩余次数
}

// 提现账户（3 个）
const MOCK_ACCOUNTS = [
  { type: 'bank', bankName: '招商银行', accountNo: '****6789', isDefault: true },
  { type: 'bank', bankName: '工商银行', accountNo: '****1234', isDefault: false },
  { type: 'alipay', name: '支付宝', accountNo: '138****8888', isDefault: false },
]

// 提现记录（5 条）
const MOCK_RECORDS = [
  { status: 'processing', amount: 500, accountName: '招商银行', ... },
  { status: 'completed', amount: 1000, accountName: '招商银行', ... },
  { status: 'completed', amount: 2000, accountName: '工商银行', ... },
  { status: 'completed', amount: 800, accountName: '支付宝', ... },
  { status: 'failed', amount: 500, accountName: '招商银行', ... },
]
```

---

#### 10.7 工作台订单详情页面 ✅

**页面**: `workbench-order-detail`
**文件**: `components/pages/workbench/OrderDetailPage.tsx`

**验收点**:
- [x] 仅 viewerRole=escort 时允许进入
- [x] 非 escort 显示 🔒 提示，不发起 API 请求
- [x] 调用 previewApi.getWorkbenchOrderDetail(orderId)
- [x] loading / error / mock 降级
- [x] renderPageContent() 增加 case 'workbench-order-detail'
- [x] TypeScript 编译通过

**UI 结构**:
| 区域 | 内容 |
|------|------|
| 标题栏 | ← 返回 + "订单详情" |
| 状态卡片 | 状态图标 + 状态文字 + 订单号 |
| 服务信息 | 服务类型 + 服务时长 |
| 预约信息 | 日期时间 + 医院 + 科室 + 地址 |
| 用户信息 | 姓名 + 电话（脱敏）+ 拨打按钮 |
| 金额信息 | 订单金额 + 预计佣金 + 打赏 |
| 订单备注 | remark 内容 |
| 底部操作 | 根据状态显示不同按钮 |

**订单状态**:
| status | 图标 | 操作 |
|--------|------|------|
| pending | ⏳ | 抢单 |
| accepted | ✅ | 取消接单 / 开始服务 |
| ongoing | 🚀 | 完成服务 |
| completed | 🎉 | 无 |
| cancelled | ❌ | 无 |

**API**:
| 方法 | 路径 | 通道 |
|------|------|------|
| `getWorkbenchOrderDetail(id)` | `/escort-app/orders/:id` | escortRequest |

---

#### 工作台页面接入完成 ✅

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

### PermissionPrompt 组件约束（强制复用）

**规则**: 分销中心/工作台所有私域页，非 escort 视角 **必须** 返回同一个 `<PermissionPrompt />`，**不允许每个页面自己写 Alert 或 Card**。

```typescript
// PermissionPrompt Props（固定接口，禁止随意扩展）
interface PermissionPromptProps {
  title: string              // 必填：提示标题
  description?: string       // 选填：提示描述
  onLogin?: () => void       // 选填：点击登录回调
  showDebugInject?: boolean  // 选填：开发环境显示"注入 token"按钮
}
```

**使用示例**:
```typescript
// ✅ 正确：使用统一组件
if (!isEscort) {
  return (
    <PermissionPrompt
      title="需要陪诊员身份"
      description="请先登录陪诊员账号"
      onLogin={() => setShowLoginDialog(true)}
      showDebugInject={process.env.NODE_ENV === 'development'}
    />
  )
}

// ❌ 禁止：每页自定义权限提示
if (!isEscort) {
  return (
    <Card className="m-4 p-4">
      <AlertCircle />
      <p>您没有权限访问此页面</p>
    </Card>
  )
}
```

**组件位置**: `src/components/terminal-preview/components/PermissionPrompt.tsx`（待创建）

---

## Step 11: 分销中心终端页面 ✅

> 已完成，遵循 Workbench 相同模式

### 🔐 分销中心安全护栏（硬约束）

| 约束 | 说明 |
|------|------|
| **通道强制** | 分销中心所有 API **必须** `escortRequest`，即使后端暂时没验 token 也必须按私域通道走 |
| **禁止变通** | 禁止为了"方便预览"改成 `userRequest`，预览器的便利不能牺牲权限边界 |
| **组件复用** | 非 escort 视角必须使用统一的 `<PermissionPrompt />` 组件，禁止每页自定义 |

### ⚡ 分销中心开工流水线（禁止跳步）

```
Step 11.1 types.ts + PreviewPage keys   ← 先锁编译，确保 page key 唯一
    ↓
Step 11.2 previewApi 五个方法            ← 先跑通 mock + escortRequest
    ↓
Step 11.3 distribution + distribution-members  ← 先跑通权限壳 + 两页骨架
    ↓
Step 11.4 distribution-records + distribution-invite
    ↓
Step 11.5 distribution-promotion
```

⚠️ **禁止跳步开发页面，必须先补 types + api，否则会出现"页面写完了才发现 PreviewPage 没加 key"**

---

### 🔒 分销中心 key 与 API 前缀对齐（锁定规范）

#### 页面 key 最终表

| 页面 | page key | 说明 |
|------|----------|------|
| 分销中心首页 | `distribution` | 入口页：统计卡片 + 快捷入口 |
| 团队成员列表 | `distribution-members` | 直属/间接成员 + 等级 + 订单数 |
| 分润记录 | `distribution-records` | 收入明细 + 时间筛选 |
| 邀请页面 | `distribution-invite` | 邀请码 + 海报 + 分享 |
| 晋升进度 | `distribution-promotion` | 当前等级 + 晋升条件 + 权益说明 |

⚠️ **命名约定**:
- 使用 `distribution-members` 而非 `distribution-team`（避免与 `team` controller 混淆）
- 使用 `distribution-promotion` 而非 `distribution-levels`（侧重"晋升进度"用户视角）

#### API 前缀最终规则

**规则**: 陪诊员私域接口统一前缀 `/escort-app/**`，与工作台保持一致。

| API | 路径 | 通道 |
|-----|------|------|
| `getDistributionStats()` | `/escort-app/distribution/stats` | escortRequest |
| `getDistributionMembers()` | `/escort-app/distribution/members` | escortRequest |
| `getDistributionRecords()` | `/escort-app/distribution/records` | escortRequest |
| `getDistributionInviteCode()` | `/escort-app/distribution/invite-code` | escortRequest |
| `getDistributionPromotion()` | `/escort-app/distribution/promotion` | escortRequest |

#### 🚫 禁止出现的 API 路径

| 禁止路径 | 原因 |
|----------|------|
| `/escort/distribution/*` | 缺少 `-app` 后缀，与现有命名规范不一致 |
| `/escort-app/team/*` | 避免与 `team` controller 混淆 |
| `/escort-app/distribution/team-members` | 冗余，使用 `members` 即可 |

⚠️ **API 禁止使用 `team` 前缀**，所有分销相关接口必须使用 `distribution` 前缀。

#### 路由参数规范（预留）

**约定**: 分销中心本阶段不做 detail 页，但 **保留 params 能力**。

**params key 命名约定**:
```typescript
// 推荐 params 命名（预留，后续扩展时直接使用）
'distribution-records': { 
  range?: '7d' | '30d' | 'all',    // 时间范围筛选
  status?: 'pending' | 'settled'   // 状态筛选
}
'distribution-members': { 
  relation?: 'direct' | 'indirect' // 关系类型筛选
}
```

#### 权限规则

| 规则 | 说明 |
|------|------|
| **视角限制** | 仅 `viewerRole=escort` 时允许进入 |
| **请求限制** | `enabled: isEscort`，非 escort 不发请求 |
| **UI 限制** | 非 escort 显示 🔒 权限提示 + "去登录"入口（开发环境显示"注入 token"） |

---

### Step 11.1: 分销中心类型定义

**目标**: 建立分销中心数据类型

**验收点**:
- [x] `types.ts` 增加分销中心相关类型
- [x] PreviewPage 增加 5 个 page key
- [x] TypeScript 编译通过

#### 字段规范（提前定死，避免前后端歧义）

| 字段 | 规范 | 说明 |
|------|------|------|
| `phone` | `138****8888` 格式（11 位手机号脱敏） | 前 3 位 + `****` + 后 4 位 |
| `promotionProgress` | `number \| undefined`，范围 `0-100` | `undefined` = 后端没算或不适用，`0` = 适用但完全没进度 |

⚠️ **禁止把 `promotionProgress: 0` 当成 falsy 显示成 "–"，0 表示适用但完全没进度**

**新增类型**:
```typescript
// 分销统计
interface DistributionStats {
  totalTeamSize: number        // 团队总人数
  directCount: number          // 直属人数
  indirectCount: number        // 间接人数
  totalDistribution: number    // 累计分润
  monthlyDistribution: number  // 本月分润
  pendingDistribution: number  // 待结算
  currentLevel: string         // 当前等级
  nextLevel?: string           // 下一等级
  promotionProgress?: number   // 晋升进度 0-100（undefined=不适用，0=适用但没进度）
}

// 团队成员
interface DistributionMember {
  id: string
  name: string
  avatar?: string
  phone: string               // 脱敏格式: 138****8888
  level: string
  relation: 'direct' | 'indirect'
  joinedAt: string
  totalOrders: number
  totalDistribution: number
}

// 分润记录
interface DistributionRecord {
  id: string
  type: 'order' | 'bonus' | 'invite'
  title: string
  amount: number
  status: 'pending' | 'settled' | 'cancelled'
  sourceEscortName?: string   // 来源成员
  orderNo?: string
  createdAt: string
  settledAt?: string
}

// 邀请信息
interface DistributionInvite {
  inviteCode: string
  inviteLink: string
  qrCodeUrl?: string
  totalInvited: number
  rewardPerInvite: number
}

// 晋升信息
interface DistributionPromotion {
  currentLevel: {
    code: string
    name: string
    commissionRate: number
    benefits: string[]
  }
  nextLevel?: {
    code: string
    name: string
    commissionRate: number
    benefits: string[]
    requirements: {
      type: 'team_size' | 'total_orders' | 'monthly_orders'
      current: number
      required: number
    }[]
  }
}
```

---

### Step 11.2: 分销中心 API（escortRequest 通道）

**目标**: 新增分销中心 API，全部走 escortRequest + mock 降级

**验收点**:
- [x] `getDistributionStats()` - 分销统计
- [x] `getDistributionMembers()` - 成员列表
- [x] `getDistributionRecords()` - 分润记录
- [x] `getDistributionInviteCode()` - 邀请信息
- [x] `getDistributionPromotion()` - 晋升信息
- [x] mock token 直接返回 mock 数据
- [x] 404/500 降级到 mock 数据
- [x] TypeScript 编译通过

**API 实现模式**（与工作台一致）:
```typescript
getDistributionStats: async () => {
  const escortToken = getEscortToken()

  // 无 token 直接返回 mock
  if (!escortToken) {
    console.log('[previewApi.getDistributionStats] 无 escortToken, 返回 mock')
    return getMockDistributionStats()
  }

  // mock token 直接返回 mock，不请求真实后端
  if (escortToken.startsWith('mock-')) {
    console.log('[previewApi.getDistributionStats] mock token, 返回 mock')
    return getMockDistributionStats()
  }

  try {
    return await escortRequest<DistributionStats>('/escort-app/distribution/stats')
  } catch (error) {
    if (error instanceof ApiError && [404, 500].includes(error.status)) {
      return getMockDistributionStats()
    }
    throw error
  }
}
```

---

### Step 11.3: 分销中心页面批次 A（distribution + distribution-members）

**目标**: 接入分销中心入口页和成员列表

**验收点**:
- [x] 新增 `DistributionPage.tsx`（入口页）
- [x] 新增 `DistributionMembersPage.tsx`（成员列表）
- [x] renderPageContent() 增加 case 'distribution' / 'distribution-members'
- [x] 仅 viewerRole=escort 时允许进入
- [x] 非 escort 显示 🔒 提示 + "去登录"入口（使用统一 `<PermissionPrompt />`）
- [x] loading / error / mock 降级齐全
- [x] TypeScript 编译通过

**权限校验（硬约束）**:
```typescript
// DistributionPage.tsx
const { isEscort } = useViewerRole(...)

// 非 escort 必须使用统一的 PermissionPrompt 组件
if (!isEscort) {
  return (
    <PermissionPrompt
      title="需要陪诊员身份"
      description="请先登录陪诊员账号"
      onLogin={() => setShowLoginDialog(true)}
      showDebugInject={isDev}  // 开发环境显示"注入 token"
    />
  )
}

// Query 必须 enabled: isEscort
const { data, isLoading } = useQuery({
  queryKey: ['preview', 'distribution', 'stats'],
  queryFn: () => previewApi.getDistributionStats(),
  enabled: isEscort, // ⚠️ 关键
})
```

---

### Step 11.4: 分销中心页面批次 B（distribution-records + distribution-invite）

**验收点**:
- [x] 新增 `DistributionRecordsPage.tsx`
- [x] 新增 `DistributionInvitePage.tsx`
- [x] renderPageContent() 增加 case
- [x] 非 escort 显示统一 `<PermissionPrompt />`
- [x] enabled: isEscort
- [x] TypeScript 编译通过

---

### Step 11.5: 分销中心页面批次 C（distribution-promotion）

**验收点**:
- [x] 新增 `DistributionPromotionPage.tsx`
- [x] renderPageContent() 增加 case
- [x] 非 escort 显示统一 `<PermissionPrompt />`
- [x] enabled: isEscort
- [x] TypeScript 编译通过

---

### 后端已完成

- ✅ 分润计算（decimal.js 精确计算）
- ✅ 团队统计（冗余字段 + 事件驱动更新）
- ✅ 邀请关系建立
- ✅ 分润记录查询（分页 + 筛选）

---

## Step 12: 管理后台预览器集成 ✅

> P1 优先级，在管理后台各模块页面集成侧栏终端预览器
> **完成时间**: 2024-12-13

### 12.1 已完成的集成

| 管理页面 | 路由 | 预览页面 | 状态 |
|---------|------|---------|------|
| 会员管理 | `/marketing/membership` | `membership`, `membership-plans` | ✅ 已集成 |
| 优惠券管理 | `/marketing/coupons` | `coupons`, `coupons-available` | ✅ 已集成 |

### 12.2 待集成任务

#### CARD 12.2-A: 积分管理页面集成 ✅

**目标**: 在积分管理页面添加侧栏终端预览器

**范围**:
- 管理页面路由: `/marketing/points`
- 对应预览页面: `points`, `points-records`

**验收点**:
- [x] 在积分规则编辑时可预览积分首页
- [x] TypeScript 编译通过

**完成时间**: 2024-12-13

---

#### CARD 12.2-B: 邀请奖励管理页面集成 ✅

**目标**: 在邀请奖励管理页面添加侧栏终端预览器

**范围**:
- 管理页面路由: `/marketing/referrals`
- 对应预览页面: `referrals`

**验收点**:
- [x] 在邀请规则编辑时可预览邀请页面
- [x] TypeScript 编译通过

**完成时间**: 2024-12-13

---

#### CARD 12.2-C: 活动管理页面集成 ✅

**目标**: 在活动管理页面添加侧栏终端预览器

**范围**:
- 管理页面路由: `/marketing/campaigns`
- 对应预览页面: `campaigns`, `campaigns-detail`

**验收点**:
- [x] 在活动编辑时可预览活动详情页（编辑模式用 campaigns-detail，新建用 campaigns）
- [x] TypeScript 编译通过

**完成时间**: 2024-12-13

---

#### CARD 12.2-D: 陪诊员管理页面集成 ✅

**目标**: 在陪诊员管理页面添加侧栏终端预览器

**范围**:
- 管理页面路由: `/escorts`
- 对应预览页面: `escort-list`, `escort-detail`

**验收点**:
- [x] 在陪诊员编辑时可预览陪诊员详情页（编辑模式用 escort-detail，新建用 escort-list）
- [x] TypeScript 编译通过

**完成时间**: 2024-12-13

---

### 12.3 集成模式参考

参考已完成的会员管理/优惠券管理页面集成方式：

```tsx
// 在管理页面组件中
import { TerminalPreview } from '@/components/terminal-preview'

// 在编辑弹窗或页面右侧
<div className="w-[375px] shrink-0">
  <TerminalPreview
    page="points"
    // 可选：数据覆盖
    marketingData={{
      points: {
        totalPoints: editForm.points,
        usedPoints: 0,
      }
    }}
  />
</div>
```

---

## Step 13: 工作台扩展 ✅

> P2 优先级，扩展工作台功能页面
> **完成时间**: 2024-12-13

### CARD 13.1-A: 工作台设置页面 ✅

**目标**: 新增工作台设置页面

**范围**:
- 页面文件: `WorkbenchSettingsPage.tsx`
- page key: `workbench-settings`
- 路径: `components/pages/workbench/`

**功能范围**:
- 接单开关（在线/离线状态）
- 接单偏好设置（服务区域、服务类型偏好）
- 通知设置
- 个人资料入口

**验收点**:
- [x] 新增 `WorkbenchSettingsPage.tsx`
- [x] PreviewPage 增加 `workbench-settings` key
- [x] previewApi 增加 `getWorkbenchSettings()` 方法（escortRequest）
- [x] renderPageContent() 增加 case
- [x] 非 escort 显示 `<PermissionPrompt />`
- [x] TypeScript 编译通过

**完成时间**: 2024-12-13

---

## Step 14: 优化与测试 ⏳

> P2 优先级，完善系统质量
> **当前状态**: 功能正确性已闭环，进入质量固化阶段

---

### CARD 14.1-A: Mock 数据模块化

**目标**: 将 26 个 `getMock*()` 函数从 `api.ts` 抽取到独立模块

**当前状态**:
- 26 个 mock 函数散落在 `api.ts`（约 800 行）
- 无空态/满态/边界值变体

---

#### 子任务 14.1-A.1: 创建 mocks 目录结构（30min）

**文件清单**:
```
src/components/terminal-preview/mocks/
├── index.ts              # 统一导出
├── marketing.ts          # 营销中心 mock
├── workbench.ts          # 工作台 mock
├── distribution.ts       # 分销中心 mock
├── escort.ts             # 陪诊员公开页 mock
└── _helpers.ts           # 通用辅助函数
```

**验收点**:
- [ ] 目录结构创建完成
- [ ] `index.ts` 导出所有 mock 函数
- [ ] TypeScript 编译通过

---

#### 子任务 14.1-A.2: 营销中心 mock 迁移（1h）

**迁移函数清单**（共 12 个）:
| 函数名 | 行号 | 对应页面 |
|--------|------|---------|
| `getMockMembershipData` | 406 | membership |
| `getMockMembershipPlans` | 423 | membership-plans |
| `getMockPointsData` | 495 | points |
| `getMockPointsRecords` | 507 | points-records |
| `getMockReferralInfo` | 590 | referrals |
| `getMockCampaigns` | 603 | campaigns |
| `getMockCampaignDetail` | 662 | campaigns-detail |
| `getMockAvailableCoupons` | 690 | coupons-available |
| `getMockCouponsData` | 1369 | coupons |
| `getMockEscorts` | 743 | escort-list |
| `getMockEscortDetail` | 751 | escort-detail |

**验收点**:
- [ ] 12 个函数迁移到 `mocks/marketing.ts` + `mocks/escort.ts`
- [ ] `api.ts` 改为 `import { getMock* } from './mocks'`
- [ ] 现有预览器功能不受影响

---

#### 子任务 14.1-A.3: 工作台 mock 迁移（45min）

**迁移函数清单**（共 8 个）:
| 函数名 | 行号 | 对应页面 |
|--------|------|---------|
| `getMockWorkbenchStats` | 782 | workbench |
| `getMockWorkbenchSummary` | 1120 | workbench |
| `getMockOrdersPool` | 1135 | workbench-orders-pool |
| `getMockEarnings` | 1182 | workbench-earnings |
| `getMockEarningsStats` | 1203 | workbench-earnings |
| `getMockWithdrawInfo` | 1261 | workbench-withdraw |
| `getMockWithdrawStats` | 1278 | workbench-withdraw |
| `getMockWorkbenchOrderDetail` | 2145 | workbench-order-detail |
| `getMockWorkbenchSettings` | 2186 | workbench-settings |

**验收点**:
- [ ] 9 个函数迁移到 `mocks/workbench.ts`
- [ ] 现有预览器功能不受影响

---

#### 子任务 14.1-A.4: 分销中心 mock 迁移（30min）

**迁移函数清单**（共 6 个）:
| 函数名 | 行号 | 对应页面 |
|--------|------|---------|
| `getMockDistributionStats` | 2224 | distribution |
| `getMockDistributionMembers` | 2242 | distribution-members |
| `getMockDistributionRecords` | 2309 | distribution-records |
| `getMockDistributionInvite` | 2385 | distribution-invite |
| `getMockDistributionPromotion` | 2401 | distribution-promotion |
| `getMockDistributionPromotionMaxLevel` | 2444 | distribution-promotion |

**验收点**:
- [ ] 6 个函数迁移到 `mocks/distribution.ts`
- [ ] 现有预览器功能不受影响

---

#### 子任务 14.1-A.5: 边界值变体函数（1h）

**新增辅助函数**:
```typescript
// mocks/_helpers.ts
export function getMockEmpty<T extends { items: unknown[]; total: number }>(
  baseMock: T
): T {
  return { ...baseMock, items: [], total: 0, hasMore: false }
}

export function getMockWithAmount(amount: number): { amount: number } {
  return { amount }
}
```

**新增变体函数**（按模块）:
| 模块 | 变体函数 | 覆盖场景 |
|------|---------|---------|
| distribution | `getMockDistributionStatsZeroProgress()` | promotionProgress: 0 |
| distribution | `getMockDistributionMembersEmpty()` | items: [] |
| workbench | `getMockEarningsEmpty()` | 无收入记录 |
| workbench | `getMockWithdrawLargeAmount()` | amount: 100000+ |

**验收点**:
- [ ] 4+ 个边界值变体函数
- [ ] 通用 `getMockEmpty()` 辅助函数

---

#### 子任务 14.1-A.6: api.ts 清理（30min）

**清理内容**:
- [ ] 删除 `api.ts` 中已迁移的 mock 函数定义
- [ ] 改为从 `./mocks` 导入
- [ ] 预计减少 ~800 行代码

**验收点**:
- [ ] `api.ts` 行数从 ~2400 降至 ~1600
- [ ] `npm run lint:preview-guard` 通过
- [ ] TypeScript 编译通过

---

**14.1-A 总预估**: 4h（6 个子任务）

---

### CARD 14.1-B: 性能优化

**目标**: 预览器加载流畅，不阻塞管理后台首屏

**当前状态**:
- 27 个页面组件同步加载
- React Query staleTime 不统一（10s ~ 60s）
- 无统一 Loading 骨架屏

---

#### 子任务 14.1-B.1: 页面组件懒加载（1.5h）

**修改文件**: `src/components/terminal-preview/components/pages/index.ts`

**当前代码**:
```typescript
export { WorkbenchPage } from './workbench'
export { DistributionPage } from './distribution'
// ... 27 个同步导出
```

**目标代码**:
```typescript
import { lazy } from 'react'

export const WorkbenchPage = lazy(() => 
  import('./workbench').then(m => ({ default: m.WorkbenchPage }))
)
export const DistributionPage = lazy(() =>
  import('./distribution').then(m => ({ default: m.DistributionPage }))
)
// ... 27 个懒加载导出
```

**懒加载清单**（按优先级分批）:

| 批次 | 页面组件 | 数量 |
|------|---------|------|
| Batch 1 | 分销中心（5 个） | 5 |
| Batch 2 | 工作台（9 个） | 9 |
| Batch 3 | 营销中心（10 个） | 10 |
| Batch 4 | 基础页面（3 个） | 3 |

**验收点**:
- [ ] 27 个页面组件全部懒加载
- [ ] 首屏不加载未使用的页面代码
- [ ] DevTools Network 可观察到按需加载

---

#### 子任务 14.1-B.2: Suspense 包裹 + 统一 Loading（45min）

**修改文件**: `src/components/terminal-preview/index.tsx`

**当前代码**:
```typescript
const renderPageContent = () => {
  switch (currentPage) {
    case 'workbench':
      return <WorkbenchPage ... />
```

**目标代码**:
```typescript
import { Suspense } from 'react'
import { PageLoadingSkeleton } from './components/PageLoadingSkeleton'

const renderPageContent = () => {
  return (
    <Suspense fallback={<PageLoadingSkeleton isDarkMode={isDarkMode} />}>
      {renderPageSwitch()}
    </Suspense>
  )
}
```

**新增文件**: `components/PageLoadingSkeleton.tsx`
```typescript
// 统一的页面加载骨架屏
// - 高度与页面内容区一致，防止抖动
// - 支持 dark mode
// - 显示加载动画
```

**验收点**:
- [ ] 新增 `PageLoadingSkeleton.tsx` 组件
- [ ] `renderPageContent` 包裹 `Suspense`
- [ ] 切页无高度抖动

---

#### 子任务 14.1-B.3: React Query 缓存策略统一（1h）

**修改文件**: 各页面组件中的 `useQuery` 调用

**统一规范**:
| 数据类型 | staleTime | gcTime | 适用页面 |
|---------|-----------|--------|---------|
| 配置类 | 5min | 30min | themeSettings, homeSettings |
| 列表类 | 1min | 10min | escorts, campaigns, coupons, members |
| 详情类 | 30s | 5min | escort-detail, campaign-detail |
| 统计类 | 30s | 2min | workbench stats, distribution stats |
| 记录类 | 1min | 5min | earnings, records, withdraw |

**需修改的 useQuery 调用**:

| 文件 | 当前 staleTime | 目标 staleTime |
|------|---------------|----------------|
| `WorkbenchPage.tsx` | 60s | 30s |
| `WorkbenchEarningsPage.tsx` | 60s | 60s (保持) |
| `DistributionPage.tsx` | 60s | 30s |
| `DistributionMembersPage.tsx` | 60s | 60s (保持) |
| `EscortListPage.tsx` | 30s | 60s |
| ... | ... | ... |

**验收点**:
- [ ] 所有 useQuery 调用遵循统一规范
- [ ] 新增 `QUERY_CONFIG` 常量导出

---

#### 子任务 14.1-B.4: queryKey 命名规范固化（30min）

**新增文件**: `src/components/terminal-preview/queryKeys.ts`

```typescript
export const previewQueryKeys = {
  // 工作台
  workbench: {
    stats: ['preview', 'workbench', 'stats'] as const,
    settings: ['preview', 'workbench', 'settings'] as const,
    earnings: ['preview', 'workbench', 'earnings'] as const,
    withdraw: ['preview', 'workbench', 'withdraw'] as const,
    ordersPool: ['preview', 'workbench', 'orders-pool'] as const,
    orderDetail: (id: string) => ['preview', 'workbench', 'order', id] as const,
  },
  // 分销中心
  distribution: {
    stats: ['preview', 'distribution', 'stats'] as const,
    members: (params?: { relation?: string }) => 
      ['preview', 'distribution', 'members', params] as const,
    records: (params?: { range?: string }) =>
      ['preview', 'distribution', 'records', params] as const,
    invite: ['preview', 'distribution', 'invite'] as const,
    promotion: ['preview', 'distribution', 'promotion'] as const,
  },
  // 营销中心
  marketing: {
    membership: ['preview', 'marketing', 'membership'] as const,
    membershipPlans: ['preview', 'marketing', 'membership-plans'] as const,
    points: ['preview', 'marketing', 'points'] as const,
    coupons: ['preview', 'marketing', 'coupons'] as const,
    campaigns: ['preview', 'marketing', 'campaigns'] as const,
    campaignDetail: (id: string) => ['preview', 'marketing', 'campaign', id] as const,
  },
} as const
```

**验收点**:
- [ ] 新增 `queryKeys.ts` 文件
- [ ] 所有 useQuery 改用 `previewQueryKeys.*`
- [ ] TypeScript 类型安全

---

**14.1-B 总预估**: 4h（4 个子任务）

---

### CARD 14.1-C: 全面测试

**目标**: 建立可重复执行的回归测试体系

**当前状态**:
- 无自动化测试
- 无手工测试清单
- 护栏检查脚本已完成（14.2）

---

#### 子任务 14.1-C.1: 页面渲染手工测试（2h）

**测试环境准备**:
```bash
# 1. 启动前端开发服务器
cd /Users/mac/Documents/app/kekeling && pnpm dev

# 2. 打开浏览器访问管理后台
# 3. 进入任意带有 TerminalPreview 的页面
```

**测试矩阵**（27 个 page key）:

| # | page key | 视角 | 测试项 | 结果 |
|---|----------|------|--------|------|
| 1 | home | any | 正常渲染 | ⬜ |
| 2 | services | any | 正常渲染 | ⬜ |
| 3 | cases | any | 正常渲染 | ⬜ |
| 4 | profile | any | 正常渲染 | ⬜ |
| 5 | membership | user | 正常渲染 | ⬜ |
| 6 | membership-plans | user | 正常渲染 | ⬜ |
| 7 | coupons | user | 正常渲染 | ⬜ |
| 8 | coupons-available | user | 正常渲染 | ⬜ |
| 9 | points | user | 正常渲染 | ⬜ |
| 10 | points-records | user | 正常渲染 | ⬜ |
| 11 | referrals | user | 正常渲染 | ⬜ |
| 12 | campaigns | user | 正常渲染 | ⬜ |
| 13 | campaigns-detail | user | 无 id 显示提示 | ⬜ |
| 14 | escort-list | any | 正常渲染 | ⬜ |
| 15 | escort-detail | any | 无 id 显示提示 | ⬜ |
| 16 | workbench | escort | user 视角显示 🔒 | ⬜ |
| 17 | workbench-orders-pool | escort | user 视角显示 🔒 | ⬜ |
| 18 | workbench-order-detail | escort | user 视角显示 🔒 | ⬜ |
| 19 | workbench-earnings | escort | user 视角显示 🔒 | ⬜ |
| 20 | workbench-withdraw | escort | user 视角显示 🔒 | ⬜ |
| 21 | workbench-settings | escort | user 视角显示 🔒 | ⬜ |
| 22 | distribution | escort | user 视角显示 🔒 | ⬜ |
| 23 | distribution-members | escort | user 视角显示 🔒 | ⬜ |
| 24 | distribution-records | escort | user 视角显示 🔒 | ⬜ |
| 25 | distribution-invite | escort | user 视角显示 🔒 | ⬜ |
| 26 | distribution-promotion | escort | user 视角显示 🔒 | ⬜ |
| 27 | workbench-settings | escort | escort 视角正常 | ⬜ |

**验收点**:
- [ ] 27 个 page key 全部测试
- [ ] 无 JS 控制台错误
- [ ] 无白屏或崩溃

---

#### 子任务 14.1-C.2: 视角切换测试（1h）

**测试流程**:

| 步骤 | 操作 | 预期结果 | 结果 |
|------|------|---------|------|
| 1 | 打开预览器（无 escortToken） | effectiveViewerRole = user | ⬜ |
| 2 | 切换到 workbench | 显示 🔒 权限提示 | ⬜ |
| 3 | DebugPanel 点击"注入 mock escortToken" | effectiveViewerRole = escort | ⬜ |
| 4 | 切换到 workbench | 正常显示工作台 | ⬜ |
| 5 | 切换到 distribution | 正常显示分销中心 | ⬜ |
| 6 | DebugPanel 点击"清除 escortToken" | effectiveViewerRole = user | ⬜ |
| 7 | 切换到 workbench | 显示 🔒 权限提示 | ⬜ |
| 8 | 切换到 membership | 正常显示（user 页面） | ⬜ |

**验收点**:
- [ ] 8 个步骤全部通过
- [ ] 视角切换即时生效
- [ ] token 状态在 DebugPanel 正确显示

---

#### 子任务 14.1-C.3: Token 状态矩阵测试（1h）

| # | Token 状态 | 测试页面 | 预期 viewerRole | 预期请求行为 | 结果 |
|---|-----------|---------|----------------|-------------|------|
| 1 | 无 token | membership | user | 发 userRequest | ⬜ |
| 2 | 无 token | workbench | user | 不发请求，显示 🔒 | ⬜ |
| 3 | mock-xxx | workbench | escort | 返回 mock 数据，不请求后端 | ⬜ |
| 4 | mock-xxx | distribution | escort | 返回 mock 数据，不请求后端 | ⬜ |

**验收点**:
- [ ] 4 个场景全部通过
- [ ] Network 面板无意外请求

---

#### 子任务 14.1-C.4: 边界值 UI 测试（2h）

**测试场景**:

| # | 场景 | 测试页面 | 测试数据 | 预期 UI | 结果 |
|---|------|---------|---------|---------|------|
| 1 | 空列表 | distribution-members | items: [] | 显示空态提示 | ⬜ |
| 2 | 零进度 | distribution-promotion | promotionProgress: 0 | 显示 0% 进度条 | ⬜ |
| 3 | 无进度 | distribution-promotion | promotionProgress: undefined | 不显示进度条 | ⬜ |
| 4 | 大金额 | workbench-earnings | totalEarnings: 100000 | 格式化显示 ¥100,000.00 | ⬜ |
| 5 | 零金额 | workbench-withdraw | withdrawable: 0 | 提现按钮禁用 | ⬜ |

**验收点**:
- [ ] 5 个边界场景全部通过
- [ ] UI 显示符合预期

---

#### 子任务 14.1-C.5: TypeScript 编译检查（30min）

**检查命令**:
```bash
cd /Users/mac/Documents/app/kekeling
pnpm tsc --noEmit
```

**验收点**:
- [ ] 无 TypeScript 错误
- [ ] 无 TypeScript 警告（或记录已知警告）

---

#### 子任务 14.1-C.6: 护栏脚本 CI 集成（30min）

**当前状态**: `npm run lint:preview-guard` 已完成

**CI 集成**（`.github/workflows/ci.yml`）:
```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install dependencies
        run: pnpm install
      - name: Preview Guardrails Check
        run: npm run lint:preview-guard
```

**验收点**:
- [ ] CI 配置文件更新
- [ ] PR 触发护栏检查
- [ ] 护栏检查失败时 CI 红灯

---

#### 子任务 14.1-C.7: 测试报告生成（1h）

**新增文件**: `docs/终端预览器集成/测试报告-YYYY-MM-DD.md`

**报告模板**:
```markdown
# TerminalPreview 测试报告

**测试日期**: YYYY-MM-DD
**测试人员**: xxx
**版本**: v3.2

## 测试结果汇总

| 测试类型 | 通过 | 失败 | 跳过 |
|---------|------|------|------|
| 页面渲染 | 27 | 0 | 0 |
| 视角切换 | 8 | 0 | 0 |
| Token 矩阵 | 4 | 0 | 0 |
| 边界值 | 5 | 0 | 0 |
| TypeScript | ✅ | - | - |
| 护栏脚本 | ✅ | - | - |

## 发现的问题

（无 / 列表）

## 结论

✅ 测试通过，可发布
```

**验收点**:
- [ ] 生成测试报告
- [ ] 记录测试结果

---

**14.1-C 总预估**: 8h（7 个子任务）

---

### CARD 14.2: CI 守门脚本 ✅

**目标**: 把护栏约束从文档变成可执行规则

**范围**:
- 脚本文件: `scripts/check-preview-guardrails.sh`
- NPM 命令: `npm run lint:preview-guard`

**检查项**:
| # | 检查内容 | 失败行为 |
|---|----------|---------|
| 1 | 分销中心页面必须使用 PermissionPrompt | ❌ Error |
| 2 | 分销中心页面必须有 enabled: isEscort | ❌ Error |
| 3 | 分销 API 禁止使用 userRequest | ❌ Error |
| 4 | 工作台页面必须检查 effectiveViewerRole | ⚠️ Warning |
| 5 | 营销中心页面禁止 escortRequest | ❌ Error |
| 6 | mock token 检测逻辑存在 | ⚠️ Warning |
| 7 | PreviewPage 类型与 renderPageContent 一致 | ⚠️ Warning |

**使用方式**:
```bash
# 本地运行
npm run lint:preview-guard

# CI 集成（在 .github/workflows/ci.yml 中添加）
- name: Preview Guardrails Check
  run: npm run lint:preview-guard
```

**验收点**:
- [x] 脚本创建并可执行
- [x] package.json 添加 `lint:preview-guard` 命令
- [x] 所有检查项通过
- [x] 错误时返回非零退出码（CI 会失败）

**完成时间**: 2024-12-13

---

### 14.3 完成标准

Step 14 整体完成标准（17 个子任务）：

| 卡片 | 子任务 | 验收方式 | 状态 |
|------|--------|---------|------|
| **14.1-A** | A.1 创建 mocks 目录结构 | `ls src/components/terminal-preview/mocks/` | ⏳ |
| | A.2 营销中心 mock 迁移 | 12 个函数迁移 | ⏳ |
| | A.3 工作台 mock 迁移 | 9 个函数迁移 | ⏳ |
| | A.4 分销中心 mock 迁移 | 6 个函数迁移 | ⏳ |
| | A.5 边界值变体函数 | 4+ 个变体函数 | ⏳ |
| | A.6 api.ts 清理 | 行数从 ~2400 降至 ~1600 | ⏳ |
| **14.1-B** | B.1 页面组件懒加载 | 27 个 lazy 导出 | ⏳ |
| | B.2 Suspense + Loading | PageLoadingSkeleton 组件 | ⏳ |
| | B.3 React Query 缓存统一 | staleTime/gcTime 规范化 | ⏳ |
| | B.4 queryKey 命名固化 | queryKeys.ts 文件 | ⏳ |
| **14.1-C** | C.1 页面渲染测试 | 27 个 page key 全通过 | ⏳ |
| | C.2 视角切换测试 | 8 步流程全通过 | ⏳ |
| | C.3 Token 矩阵测试 | 4 个场景全通过 | ⏳ |
| | C.4 边界值 UI 测试 | 5 个场景全通过 | ⏳ |
| | C.5 TypeScript 检查 | `pnpm tsc --noEmit` 无错误 | ⏳ |
| | C.6 护栏脚本 CI 集成 | CI 配置更新 | ⏳ |
| | C.7 测试报告生成 | 测试报告文档 | ⏳ |
| **14.2** | CI 守门脚本 | `npm run lint:preview-guard` | ✅ |
| **14.4** | 反模式清单 | 文档更新 | ✅ |

**总预估工时**: 16h（4h + 4h + 8h）

---

### 14.4 常见反模式（Anti-Patterns）

> 以下是开发过程中**曾经可能犯的错**，专门列出作为"踩坑保险"。

| ❌ 反模式 | ✅ 正确做法 | 为什么 |
|----------|-----------|--------|
| 在页面内直接判断 `escortToken` 存在就发请求 | 必须使用 `useViewerRole` + `enabled: isEscort` | Token 存在不代表有效，必须经过 viewerRole 推导 |
| 为了方便预览，把 escort API 改成 `userRequest` | 坚持使用 `escortRequest`，mock token 自动返回假数据 | 这是权限漏洞，不是开发技巧 |
| 在真实端复用 `DebugPanel` | DebugPanel 仅限 `process.env.NODE_ENV === 'development'` | 会导致用户越权切换视角 |
| 把 `promotionProgress === 0` 当成 falsy | `0` 表示"适用但未达成"，`undefined` 表示"不适用" | 0 是有意义的进度值，不是"无数据" |
| 在 `renderPageContent` 中遗漏新增的 page key | 新增 page key 必须同步添加 case | `lint:preview-guard` 会检测一致性 |
| 把 mock 数据散落在各页面组件里 | mock 数据统一放 `mocks/*.ts` | 后期无法统一管理和覆盖测试 |
| 非 escort 视角时仍发起 escort 请求 | 所有 escort 请求必须 `enabled: isEscort` | 浪费请求 + 可能暴露接口结构 |
| 手动在 Props 中传入 `viewerRole` 给真实端 | 真实端 viewerRole 只能由 token 推导 | Props 覆盖是预览器特权，真实端禁止 |

---

## Step 15: 真实终端接入准备（占位） 📋

> ⚠️ **本 Step 不在本阶段实现**，仅作为未来接入真实终端的约束清单。
> 
> 当前 TerminalPreview 是管理后台的预览模拟器，若未来需要在真实终端（小程序/H5/App）复用相同组件逻辑，
> 必须遵循以下清单完成对齐。

---

### 15.1 Token 来源替换

| 当前（预览器） | 目标（真实端） | 说明 |
|---------------|---------------|------|
| `getEscortToken()` 读 localStorage | 小程序: `wx.getStorageSync('escortToken')` | Token 存储位置对齐 |
| `getUserToken()` 读 Cookie | 小程序: `wx.getStorageSync('userToken')` | Token 存储位置对齐 |
| `validateEscortToken()` 占位实现 | 接真实 `POST /escort/verify` 接口 | 后端验证 |
| `setPreviewEscortToken()` 写 localStorage | 小程序: `wx.setStorageSync('escortToken')` | 登录成功后写入 |

**Token 存储 Key 规范**:
| 环境 | userToken | escortToken |
|------|-----------|-------------|
| 预览器 | `terminalPreview.userToken` | `terminalPreview.escortToken` |
| 小程序 | `kekeling_userToken` | `kekeling_escortToken` |
| H5 | `localStorage: kekeling_userToken` | `localStorage: kekeling_escortToken` |

---

### 15.2 禁止行为（硬约束）

| 禁止项 | 原因 | 检测方式 |
|--------|------|---------|
| 真实端使用 `mock-*` token | 会绕过后端权限校验 | CI grep 检查 |
| 真实端暴露 `DebugPanel` | 用户可手动切换视角，造成越权 | 条件渲染 `shouldShowDebugPanel()` |
| 真实端手动写入 `viewerRole` | 视角必须由 token 推导 | 代码审计 |
| 真实端调用 `setPreviewEscortToken()` | 这是预览器专用 API | 函数命名 + 注释 |

**DebugPanel 显示条件**:
```typescript
function shouldShowDebugPanel(): boolean {
  // ⚠️ 仅开发环境 + 预览器模式才显示
  return process.env.NODE_ENV === 'development' && isPreviewMode
}
```

---

### 15.3 必须保持的约束

| 约束 | 说明 | 检测方式 |
|------|------|---------|
| `escortRequest` / `userRequest` 分离 | 双通道不可混用 | `lint:preview-guard` |
| `viewerRole` 只由 token 推导 | 禁止手动覆盖 | 代码审计 |
| 非 escort 不发 escort 请求 | `enabled: isEscort` | `lint:preview-guard` |
| 401 时清除对应 token | 防止无效 token 循环 | 错误处理逻辑 |

**viewerRole 推导规则（预览器 vs 真实端）**:

| 场景 | 预览器 | 真实端 |
|------|--------|--------|
| 无 escortToken | user | user |
| mock token | escort（模拟） | ❌ 禁止 |
| 真实 token + 验证成功 | escort | escort |
| 真实 token + 验证失败 | user（清除 token） | user（清除 token） |
| Props 强制 viewerRole | 允许（调试用） | ❌ 禁止 |

---

### 15.4 代码迁移清单

当真实端需要复用预览器逻辑时，需迁移以下模块：

| 模块 | 预览器路径 | 迁移动作 |
|------|-----------|---------|
| 类型定义 | `terminal-preview/types.ts` | 提取到 shared-types |
| API 通道 | `terminal-preview/api.ts` | 提取 userRequest/escortRequest |
| 页面组件 | `terminal-preview/components/pages/**` | 按需复用 UI 结构 |
| Session 管理 | `terminal-preview/session.ts` | 替换 Token 存储实现 |
| viewerRole Hook | `terminal-preview/hooks/useViewerRole.ts` | 移除 mock 支持 |

**不可迁移**:
- `DebugPanel.tsx` - 仅预览器使用
- `setPreviewEscortToken()` - 预览器专用
- 任何 `mock-` 相关逻辑

---

### 15.5 真实端接入验收清单

| # | 检查项 | 验收方式 |
|---|--------|---------|
| 1 | Token 存储位置正确 | 代码审计 |
| 2 | 无 `mock-` token 出现 | `grep -r "mock-" src/` |
| 3 | 无 DebugPanel 暴露 | 条件渲染检查 |
| 4 | viewerRole 只由 token 推导 | 无 Props.viewerRole 使用 |
| 5 | escortRequest 携带正确 Authorization | 网络请求检查 |
| 6 | 401 时正确清除 token | 错误流程测试 |
| 7 | 非 escort 视角不发 escort 请求 | 网络请求检查 |

---

### 15.6 数据一致性声明

> ⚠️ 真实端接入后，以下字段在预览器与真实端**必须保持语义一致**。
> 
> 否则会出现："预览器看着对，真实端却怪怪的"。

| 字段类型 | 一致性约束 | 示例 |
|---------|-----------|------|
| **金额字段** | 单位（元）、精度（2 位小数）、符号（正负） | `amount: 299.00` |
| **时间字段** | 时区（服务器 UTC+8）、格式（ISO 8601 或 YYYY-MM-DD HH:mm:ss） | `createdAt: "2024-12-13T10:30:00+08:00"` |
| **状态字段** | 枚举值不可漂移，预览器与后端必须使用相同枚举 | `status: 'pending' \| 'completed'` |
| **空值语义** | `null` / `undefined` / `0` / `""` 的含义不可改变 | `promotionProgress: 0` ≠ `undefined` |
| **脱敏格式** | 手机号 `138****8888`（前3后4）、银行卡 `****6789`（后4位） | |
| **列表结构** | `items` + `total` + `hasMore`，空态为 `items: [], total: 0` | |

**跨端数据格式示例**:

```typescript
// ✅ 正确：预览器与真实端返回格式一致
interface DistributionStats {
  totalDistribution: number  // 单位：元，保留 2 位小数
  promotionProgress?: number // 0-100 或 undefined
  currentLevel: string       // 枚举值，不可自造
}

// ❌ 错误：预览器用 "pending"，真实端用 "PENDING"
// 会导致前端状态判断失效
```

---

## 📋 任务卡总览

### 已完成

| Step | 卡片 | 内容 | 预估 | 状态 |
|------|------|------|------|------|
| 12.2-A | 积分管理集成 | 积分管理页面侧栏预览 | 2h | ✅ |
| 12.2-B | 邀请奖励集成 | 邀请管理页面侧栏预览 | 1.5h | ✅ |
| 12.2-C | 活动管理集成 | 活动管理页面侧栏预览 | 2h | ✅ |
| 12.2-D | 陪诊员管理集成 | 陪诊员管理页面侧栏预览 | 2h | ✅ |
| 13.1-A | 工作台设置 | workbench-settings 页面 | 4h | ✅ |
| 14.2 | CI 守门脚本 | lint:preview-guard | 1h | ✅ |
| 14.4 | 反模式清单 | Anti-Patterns 文档 | 0.5h | ✅ |

---

### 待完成（Step 14 质量固化）

#### CARD 14.1-A: Mock 数据模块化（4h）

| 子任务 | 内容 | 预估 | 状态 |
|--------|------|------|------|
| A.1 | 创建 mocks 目录结构 | 30min | ⏳ |
| A.2 | 营销中心 mock 迁移（12 个函数） | 1h | ⏳ |
| A.3 | 工作台 mock 迁移（9 个函数） | 45min | ⏳ |
| A.4 | 分销中心 mock 迁移（6 个函数） | 30min | ⏳ |
| A.5 | 边界值变体函数（4+ 个） | 1h | ⏳ |
| A.6 | api.ts 清理（减少 ~800 行） | 30min | ⏳ |

#### CARD 14.1-B: 性能优化（4h）

| 子任务 | 内容 | 预估 | 状态 |
|--------|------|------|------|
| B.1 | 页面组件懒加载（27 个 lazy） | 1.5h | ⏳ |
| B.2 | Suspense + PageLoadingSkeleton | 45min | ⏳ |
| B.3 | React Query 缓存策略统一 | 1h | ⏳ |
| B.4 | queryKey 命名固化（queryKeys.ts） | 30min | ⏳ |

#### CARD 14.1-C: 全面测试（8h）

| 子任务 | 内容 | 预估 | 状态 |
|--------|------|------|------|
| C.1 | 页面渲染手工测试（27 个 page key） | 2h | ⏳ |
| C.2 | 视角切换测试（8 步流程） | 1h | ⏳ |
| C.3 | Token 状态矩阵测试（4 场景） | 1h | ⏳ |
| C.4 | 边界值 UI 测试（5 场景） | 2h | ⏳ |
| C.5 | TypeScript 编译检查 | 30min | ⏳ |
| C.6 | 护栏脚本 CI 集成 | 30min | ⏳ |
| C.7 | 测试报告生成 | 1h | ⏳ |

---

### 工时汇总

| 类别 | 卡片数 | 子任务数 | 预估工时 | 状态 |
|------|--------|---------|---------|------|
| 已完成 | 7 | - | 13h | ✅ |
| **待完成** | 3 | 17 | **16h** | ⏳ |
| 合计 | 10 | 17 | 29h | - |

---

## 相关文档

- [终端预览器集成规格](./01-TerminalPreview集成规格.md)
- [双身份会话与视角切换规格](./02-双身份会话与视角切换规格.md)
- [模块页面接入清单与排期](./03-模块页面接入清单与排期.md)（计划表，进度以本文档为准）
