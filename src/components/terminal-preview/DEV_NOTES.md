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

#### 批次 D: escort-list + escort-detail（待接入）

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

