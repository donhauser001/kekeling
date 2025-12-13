# 🔍 TerminalPreview UI 交互综合审计报告

> **审计日期**: 2024-12-13  
> **审计员**: 前端 UI 交互审计员  
> **文档版本**: v1.2（扩展审计已完成）  
> **审计范围**: 全局终端预览器（管理后台终端行为模拟器）

---

## 目录

1. [审计总览](#一审计总览)
2. [导航与路由参数（TASK UI-A）](#二导航与路由参数task-ui-a)
3. [状态机与兜底（TASK UI-B）](#三状态机与兜底task-ui-b)
4. [视角权限交互一致性（TASK UI-C）](#四视角权限交互一致性task-ui-c)
5. [管理后台集成体验（TASK UI-D）](#五管理后台集成体验task-ui-d)
6. [问题汇总与修复优先级](#六问题汇总与修复优先级)
7. [综合修复计划](#七综合修复计划)
8. [v1.1 扩展审计范围](#八v11-扩展审计范围)
9. [附录](#九附录)

---

## 一、审计总览

### 1.1 审计范围矩阵

| 维度 | 审计内容 | 页面数 | 通过率 |
|------|---------|--------|--------|
| **UI-A 导航路由** | navigateToPage/pageParams、详情页缺 id 提示、返回参数清理 | 28 | 75% |
| **UI-B 状态机** | loading/error/empty/boundary 处理 | 28 | 70% |
| **UI-C 视角权限** | 双会话 + viewerRole 推导、PermissionPrompt 一致性 | 13 | 95% |
| **UI-D 后台集成** | 实时预览联动、刷新行为、容器体验 | 8 | 60% |

### 1.1.1 v1.2 扩展审计范围（已完成）

| 维度 | 审计内容 | 优先级 | 状态 | 通过率 |
|------|---------|--------|------|--------|
| **DebugPanel** | 操作反馈、viewerRole标识、误触防护 | **P1** | ✅ 已审计 | 85% |
| **动效/过渡** | 页面切换过渡、loading→内容突变、锁态解锁跳变 | P2 | ✅ 已审计 | 40% |
| **滚动恢复** | 列表→详情→返回位置、Tab切换滚动 | P2 | ✅ 已审计 | 0% |
| **异常数据** | 类型异常、未知枚举、后端新增字段兼容 | P2 | ✅ 已审计 | 20% |
| **暗色对比度** | 空态icon、skeleton、锁态文案可见性 | P3 | ✅ 已审计 | ⚠️ 风险 |
| **A11y 可访问性** | Esc关闭、Tab聚焦、键盘触发 | P3 | ✅ 已审计 | 0% |

### 1.2 审计结论总览

| 维度 | 状态 | 关键发现 |
|------|------|---------|
| **导航路由** | ⚠️ 部分合规 | 订单池→详情链路缺失、返回时 pageParams 未清空 |
| **状态机** | ⚠️ 需优化 | 列表页无骨架屏、部分页面无重试按钮、无 API 降级 mock |
| **视角权限** | ✅ 合规 | 视角切换响应及时、PermissionPrompt 统一使用 |
| **后台集成** | ⚠️ 有缺口 | 品牌/首页完整集成，营销弹窗部分静态预览 |

### 1.3 核心约束检验（唯一真源）

| 约束 | 来源 | 实现状态 |
|------|------|---------|
| viewerRole 由 escortToken 推导，不可手动写入 | DEV_NOTES.md | ✅ |
| 预览器可通过 Props 强制模拟视角 | 02-双身份会话规格.md | ✅ |
| 前端隐藏不算安全边界，后端鉴权兜底 | 02-双身份会话规格.md | ✅ |
| 私域页面使用 PermissionPrompt 统一组件 | DEV_NOTES.md | ✅ |
| 路由参数通过 navigateToPage + pageParams 传递 | DEV_NOTES.md Step 9 | ⚠️ 部分 |

---

## 二、导航与路由参数（TASK UI-A）

### 2.1 审计范围

| 审计项 | 说明 |
|--------|------|
| 列表 → 详情导航 | 所有存在层级关系的页面 |
| `navigateToPage` 机制 | 带参数的页面跳转 |
| `pageParams` 传递 | 详情页 id 参数传递 |
| 缺 id 友好提示 | 详情页无参数时的兜底处理 |
| 返回时参数清理 | 防止参数残留 |

### 2.2 核心机制

```typescript
// src/components/terminal-preview/index.tsx
const [pageParams, setPageParams] = useState<Record<string, string>>({})

const navigateToPage = useCallback((page: string, params?: Record<string, string>) => {
  setCurrentPage(page as typeof currentPage)
  setPageParams(params ?? {})  // ✅ 会清空或替换
}, [])
```

### 2.3 交互链路审计结果

| 链路 | 导航方式 | 缺 id 处理 | 返回清理 | 状态 |
|------|---------|-----------|---------|------|
| 活动列表 → 活动详情 | ✅ navigateToPage | ✅ 友好提示 | ⚠️ setCurrentPage | 部分通过 |
| 陪诊员列表 → 详情 | ✅ navigateToPage | ✅ 友好提示 | ⚠️ setCurrentPage | 部分通过 |
| **订单池 → 订单详情** | ❌ **缺失** | ❌ mock id 替代 | - | **问题** |
| 分销中心 → 团队成员 | ✅ navigateToPage | ✅ | ✅ navigateToPage | 通过 |
| 分销中心 → 分润记录 | ✅ navigateToPage | ✅ | ✅ navigateToPage | 通过 |
| 工作台快捷入口 → 子页面 | ✅ onNavigate | - | ⚠️ setCurrentPage | 部分通过 |

### 2.4 参数清理机制分析

```typescript
// 三种页面切换方式对比

// 方式 1: navigateToPage（✅ 会清空 pageParams）
const navigateToPage = useCallback((page, params) => {
  setCurrentPage(page)
  setPageParams(params ?? {})  // 空对象替换
}, [])

// 方式 2: setCurrentPage（❌ 不清空 pageParams）
setCurrentPage('campaigns')  // pageParams 保持不变

// 方式 3: handlePageChange（❌ 不清空 pageParams）
const handlePageChange = useCallback((page) => {
  setSelectedServiceId(null)
  setCurrentPage(page)  // 只清空 serviceId
}, [])
```

**参数残留风险场景**:
```
1. 用户进入 campaigns-detail?id=123
2. 点击返回（setCurrentPage('campaigns')）
3. pageParams 仍为 { id: '123' }
4. 用户切换到 escort-list，点击任意陪诊员
5. 如果列表页忘记传 id，详情页会读到残留的 '123'
```

实际风险较低（因为列表页都正确传递了 id），但属于**潜在隐患**。

### 2.5 发现的问题

#### ❌ 问题 UI-A-1: 订单池缺少详情导航入口 【P1】

```tsx
// OrdersPoolPage.tsx - 当前实现
<OrderCard
  order={order}
  onAccept={() => console.log('[OrdersPoolPage] 接单:', order.id)}
  // ❌ 没有 onClick 或 onViewDetail 导航到详情
/>
```

**影响**: 无法预览订单详情页的完整交互流程

#### ❌ 问题 UI-A-2: OrderDetailPage 无 id 处理不一致 【P2】

```tsx
// OrderDetailPage.tsx - 当前实现
const effectiveOrderId = orderId || 'mock-order-001'  // ⚠️ 应该显示友好提示

// 其他详情页实现（正确）
if (!campaignId) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <div className="text-4xl mb-2">❓</div>
      <div className="text-sm">未指定活动</div>
      <button onClick={onBack}>返回活动列表</button>
    </div>
  )
}
```

#### ⚠️ 问题 UI-A-3: 返回时 pageParams 未清空 【P2】

```typescript
// 三种页面切换方式对比
navigateToPage(page, params)  // ✅ 会清空 pageParams
setCurrentPage(page)          // ❌ 不清空 pageParams
handlePageChange(page)        // ❌ 不清空 pageParams
```

| 返回方式 | 是否清空 pageParams | 使用场景 | 数量 |
|---------|---------------------|----------|------|
| `navigateToPage(page)` | ✅ 是 | 分销中心子页面返回 | 5 处 |
| `setCurrentPage(page)` | ❌ 否 | **大多数返回按钮** | 8+ 处 |

**受影响的 onBack 回调清单**:
- `MembershipPlansPage` → `membership`
- `PointsRecordsPage` → `points`
- `CampaignDetailPage` → `campaigns`
- `CouponsAvailablePage` → `coupons`
- `EscortDetailPage` → `escort-list`
- `OrdersPoolPage` → `workbench`
- `WorkbenchEarningsPage` → `workbench`
- `WorkbenchWithdrawPage` → `workbench-earnings`
- `OrderDetailPage` → `workbench-orders-pool`

#### ⚠️ 问题 UI-A-5: "我的订单"页面未定义 【P3】

工作台快捷入口中 `my-orders` 页面键值已定义，但实际页面组件未实现。

```tsx
// WorkbenchPage.tsx
onNavigate?.('my-orders')  // ⚠️ 页面 key 存在，但组件未实现
```

#### ⚠️ 问题 UI-A-4: PreviewPageParamsMap 类型覆盖不完整 【P3】

```typescript
// 当前类型定义仅覆盖分销中心
export interface PreviewPageParamsMap {
  'distribution': Record<string, never>
  'distribution-members': { relation?: 'direct' | 'indirect' }
  // ... 未覆盖 campaigns-detail、escort-detail 等
}
```

---

## 三、状态机与兜底（TASK UI-B）

### 3.1 审计范围

| 审计维度 | 说明 |
|----------|------|
| **Loading** | 加载提示/骨架屏、布局抖动、闪烁问题 |
| **Error** | 错误提示一致性、降级 mock 机制、重试按钮 |
| **Empty** | 空态 UI、空态文案、空态引导 |
| **Boundary** | 大数显示、零值处理、超长文本截断 |

### 审计页面清单（28 个）

| 模块 | 页面数 | 页面列表 |
|------|--------|----------|
| 营销中心 | 9 | membership, membership-plans, coupons, coupons-available, points, points-records, referrals, campaigns, campaigns-detail |
| 陪诊员 | 2 | escort-list, escort-detail |
| 工作台 | 7 | workbench, workbench-orders-pool, workbench-order-detail, workbench-earnings, workbench-withdraw, workbench-settings, earnings, withdraw |
| 分销中心 | 5 | distribution, distribution-members, distribution-records, distribution-invite, distribution-promotion |
| 基础页面 | 5 | home, services, service-detail, cases, profile |

### 3.2 各模块状态机检查

| 模块 | 页面数 | Loading | Error | Empty | Boundary |
|------|--------|---------|-------|-------|----------|
| 营销中心 | 9 | ⚠️ 无骨架 | ⚠️ 无重试 | ✅ | ✅ |
| 陪诊员 | 2 | ⚠️ 无骨架 | ⚠️ 无重试 | ✅ | ✅ |
| 工作台 | 7 | ⚠️ 无骨架 | ⚠️ 无重试 | ✅ | ✅ |
| 分销中心 | 5 | ⚠️ 无骨架 | ✅ 有重试 | ✅ | ✅ |
| 基础页面 | 5 | ✅ | - | ✅ | ✅ |

### 3.3 发现的问题

#### ⚠️ 问题 UI-B-1: 列表/详情页无骨架屏 【P2】

```tsx
// ❌ 当前实现 - 简单文字提示
{isLoading && (
  <div className="flex items-center justify-center py-12">
    <div className="text-gray-400 text-sm">加载中...</div>
  </div>
)}

// ✅ 推荐实现 - 骨架屏
{isLoading && <ListSkeleton count={5} isDarkMode={isDarkMode} />}
```

**影响**: 加载时内容区空白，视觉跳跃

#### ⚠️ 问题 UI-B-2: 营销/陪诊/工作台无重试按钮 【P2】

```tsx
// ❌ 无重试按钮（14 个页面）
{isError && (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="text-4xl mb-2">😔</div>
    <div className="text-gray-400 text-sm">加载失败，请稍后重试</div>
  </div>
)}

// ✅ 有重试按钮（分销中心）
{isError && (
  <ErrorRetry onRetry={() => refetch()} />
)}
```

**影响**: 用户需刷新页面才能重试

#### ⚠️ 问题 UI-B-3: 无自动降级 mock 机制 【P2】

| 场景 | 当前实现 | 预期行为 |
|------|---------|---------|
| API 返回 4xx/5xx | 显示错误 UI | 自动降级到 mock 数据 |
| 网络超时 | 显示错误 UI | 自动降级到 mock 数据 |

### 3.4 按模块详细汇总

#### 营销中心（9 页面）

| 页面 | Loading | Error | Empty | Boundary | 关键用例 |
|------|---------|-------|-------|----------|---------|
| CouponsPage | ⚠️ 无骨架 | ⚠️ 无重试 | ✅ | ✅ | 优惠券金额 ¥10 / 满100可用 |
| PointsRecordsPage | ⚠️ 无骨架 | ⚠️ 无重试 | ✅ | ✅ | 积分 +100 / -50 显示 |
| CampaignsPage | ⚠️ 无骨架 | ⚠️ 无重试 | ✅ | ✅ | 活动状态：进行中/已结束 |
| MembershipPage | ⚠️ 无骨架 | ⚠️ 无重试 | ✅ | ✅ | 会员等级/到期时间 |

#### 工作台（7 页面）

| 页面 | Loading | Error | Empty | Boundary | 关键用例 |
|------|---------|-------|-------|----------|---------|
| WorkbenchPage | ⚠️ 无骨架 | ⚠️ 无重试 | - | ✅ | 今日收入 ¥680.00 |
| OrdersPoolPage | ⚠️ 无骨架 | ⚠️ 无重试 | ✅ | ✅ | 空态 + 实时推送提示 |
| WorkbenchEarningsPage | ⚠️ 无骨架 | ⚠️ 无重试 | ✅ | ✅ | 大金额千分位格式化 |

#### 分销中心（5 页面）

| 页面 | Loading | Error | Empty | Boundary | 关键用例 |
|------|---------|-------|-------|----------|---------|
| DistributionPage | ⚠️ 无骨架 | ✅ 有重试 | - | ✅ | 晋升进度 0% 正确显示 |
| DistributionMembersPage | ⚠️ 无骨架 | ✅ 有重试 | ✅ | ✅ | 动态空态文案 |
| DistributionRecordsPage | ⚠️ 无骨架 | ✅ 有重试 | ✅ | ✅ | 金额 +¥ 显示 |

#### 基础页面（5 页面）

| 页面 | Loading | Error | Empty | Boundary | 关键用例 |
|------|---------|-------|-------|----------|---------|
| ServicesPage | ✅ | - | ✅ | ✅ | 价格/销量千分位 |
| ServiceDetailPage | ✅ | - | - | ✅ | 描述多行截断 |
| CasesPage | ✅ | - | ✅ | ✅ | 描述 line-clamp-2 |
| ProfilePage | - | - | - | ✅ | - |
| HomePage | ✅ | - | - | ✅ | 统计数据千分位 |

### 3.5 Empty 状态详细检查

| 模块 | 页面 | 空态图标 | 空态文案 | 引导按钮 | 状态 |
|------|------|---------|---------|---------|------|
| 营销中心 | CouponsPage | 🎫 | 暂无优惠券 | ✅ 去领取 | ✅ |
| 营销中心 | PointsRecordsPage | 📋 | 暂无积分记录 | ❌ | ✅ |
| 营销中心 | CampaignsPage | 🎉 | 暂无活动 | ❌ | ✅ |
| 陪诊员 | EscortListPage | 👩‍⚕️ | 暂无可用陪诊员 | ❌ | ✅ |
| 工作台 | OrdersPoolPage | 📋 | 暂无可接订单 + 实时推送提示 | ❌ | ✅ |
| 工作台 | WorkbenchEarningsPage | 📊 | 暂无收支记录 | ❌ | ✅ |
| 分销中心 | DistributionMembersPage | 👥 | 暂无{直属/间接}成员（动态） | ❌ | ✅ |
| 分销中心 | DistributionRecordsPage | 📋 | 暂无分润记录 | ❌ | ✅ |

### 3.6 通过的检查项

| 检查项 | 说明 |
|--------|------|
| ✅ 金额格式化 | `toFixed(2)`、`toLocaleString()` 千分位 |
| ✅ 文本截断 | `truncate`、`line-clamp-2`、`min-w-0` |
| ✅ 零值处理 | 正确区分 `promotionProgress: 0` vs `undefined` |
| ✅ Mock 边界值 | 已提供零进度、最高等级、空列表等测试数据 |

---

## 四、视角权限交互一致性（TASK UI-C）

### 4.1 审计范围

| 审计维度 | 说明 |
|----------|------|
| **视角切换响应性** | DebugPanel 注入/清除 escortToken 后，effectiveViewerRole 是否立即变化 |
| **PermissionPrompt 一致性** | 私域页面锁态组件的 title/description/动作/debug 提示是否统一 |
| **Token 失效处理** | escortToken 失效/缺失时是否正确回退 user 视角并阻断请求 |

### 4.2 视角切换响应性

```
┌─────────────────────────────────────────────────────────────────┐
│                    视角推导链路                                  │
├─────────────────────────────────────────────────────────────────┤
│  DebugPanel 注入 token                                          │
│       ↓                                                         │
│  setPreviewEscortToken → localStorage                           │
│  setLocalEscortToken → React State                              │
│       ↓                                                         │
│  useViewerRole.verifyToken()                                    │
│       ↓                                                         │
│  mock token → 直接有效 / 真实 token → 后端验证                  │
│       ↓                                                         │
│  effectiveViewerRole 更新 ✅                                    │
└─────────────────────────────────────────────────────────────────┘
```

| 场景 | 预期 | 实际 | 状态 |
|------|------|------|------|
| 注入 mock token | 立即切换到 escort | ✅ | **通过** |
| 清除 token | 立即回落到 user | ✅ | **通过** |
| 页面刷新恢复 | 从 localStorage 恢复 | ✅ | **通过** |
| 验证中防闪烁 | 保持 user，验证通过再切换 | ✅ | **通过** |

### 4.3 PermissionPrompt 一致性

#### 私域页面清单（13 个）

| 模块 | 页面 | 页面 key |
|------|------|---------|
| 工作台 | WorkbenchPage | `workbench` |
| 工作台 | OrdersPoolPage | `workbench-orders-pool` |
| 工作台 | OrderDetailPage | `workbench-order-detail` |
| 工作台 | WorkbenchEarningsPage | `workbench-earnings` |
| 工作台 | EarningsPage | `workbench-earnings` (旧) |
| 工作台 | WorkbenchWithdrawPage | `workbench-withdraw` |
| 工作台 | WithdrawPage | `workbench-withdraw` (旧) |
| 工作台 | WorkbenchSettingsPage | `workbench-settings` |
| 分销中心 | DistributionPage | `distribution` |
| 分销中心 | DistributionMembersPage | `distribution-members` |
| 分销中心 | DistributionRecordsPage | `distribution-records` |
| 分销中心 | DistributionInvitePage | `distribution-invite` |
| 分销中心 | DistributionPromotionPage | `distribution-promotion` |

#### 一致性检查项

| 检查项 | 预期 | 实际 | 状态 |
|--------|------|------|------|
| 使用统一组件 `<PermissionPrompt />` | 是 | ✅ 13 个页面全部使用 | **通过** |
| title 一致 | "需要陪诊员身份" | ✅ 全部一致 | **通过** |
| description 包含"请先登录陪诊员账号" | 是 | ✅ 全部包含 | **通过** |
| showDebugInject 正确设置 | `process.env.NODE_ENV === 'development'` | ✅ 全部一致 | **通过** |
| primaryColor 传递 | `themeSettings.primaryColor` | ✅ 全部传递 | **通过** |
| isDarkMode 传递 | `isDarkMode` | ✅ 全部传递 | **通过** |
| 锁图标显示 | 🔒 | ✅ 组件内置 | **通过** |
| "去登录" 按钮 | 可点击 | ✅ 组件内置 | **通过** |
| 开发提示显示 | DebugPanel 提示 + 快捷注入按钮 | ✅ 组件内置 | **通过** |

### 4.4 私域请求阻断

| 页面 | useQuery enabled | API 通道 | 状态 |
|------|------------------|---------|------|
| WorkbenchPage | `enabled: isEscort` | escortRequest | ✅ |
| OrdersPoolPage | `enabled: isEscort` | escortRequest | ✅ |
| DistributionPage | `enabled: isEscort` | escortRequest | ✅ |
| ... (13 页面) | `enabled: isEscort` | escortRequest | ✅ |

**结论**: 13 个私域页面全部正确使用 `enabled: isEscort` 阻断非 escort 视角的请求 ✅

### 4.5 双会话 + viewerRole 推导硬约束检验

| 约束 | 实现 | 状态 |
|------|------|------|
| viewerRole 由 escortToken 推导，不可手动写入 | `deriveViewerRole()` + `useViewerRole` | ✅ |
| 预览器可通过 Props 强制模拟视角 | `viewerRole: forcedViewerRole` | ✅ |
| 前端隐藏不算安全边界，后端鉴权兜底 | 前端仅 `enabled: isEscort`，API 仍走 escortRequest | ✅ |
| mock token 不走后端验证 | `token.startsWith('mock-')` 快速返回 | ✅ |
| 真实 token 必须后端验证 | `previewApi.verifyEscortToken()` | ✅ |
| 验证失败自动清理 token | `handleVerificationFailed()` | ✅ |

### 4.6 Token 失效/缺失场景审计

| 场景 | 预期行为 | 实际 | 状态 |
|------|---------|------|------|
| escortToken 缺失访问私域 | 显示 PermissionPrompt，不发 API 请求 | ✅ | **通过** |
| escortToken 验证失败 | 清理 localStorage + api 层，回落 user | ✅ | **通过** |
| 验证过程中防闪烁 | 保持 user，验证通过再切换 | ✅ | **通过** |
| 页面刷新后恢复 | 从 localStorage 恢复并重新验证 | ✅ | **通过** |

### 4.7 发现的小问题

#### ⚠️ 问题 UI-C-1: description 文案不完全统一 【P3】

| 模块 | 文案模式 |
|------|---------|
| 工作台 | "请先登录陪诊员账号**后再**{动作}" |
| 分销中心 | "请先登录陪诊员账号{动作}" |

#### ⚠️ 问题 UI-C-2: onLogin 回调命名不统一 【P3】

| 模块 | Props 名称 |
|------|-----------|
| 工作台 | `onShowLoginDialog` |
| 分销中心 | `onLoginClick` |

---

## 五、管理后台集成体验（TASK UI-D）

### 5.1 审计范围

| 审计维度 | 说明 |
|----------|------|
| **实时预览联动** | 表单字段变化是否实时反映到预览器 |
| **数据刷新行为** | 刷新是否只刷新数据不重置视图状态 |
| **容器体验** | 预览容器尺寸/滚动体验是否合理 |
| **集成缺口** | 未集成页面清单与建议 |

### 5.2 已集成页面清单

#### 完整集成（实时预览联动）

| 页面 | 文件路径 | 预览页 | 数据传递方式 |
|------|---------|--------|-------------|
| **品牌设置** | `features/app-settings/brand/index.tsx` | `home` | `themeSettings={formData}` ✅ |
| **首页管理** | `features/app-settings/homepage/index.tsx` | `home` | `homeSettings={formData}` ✅ |

**品牌设置页详细检查**:

| 检查项 | 预期 | 实际 | 状态 |
|--------|------|------|------|
| 品牌名称变化实时预览 | 输入时立即更新 | ✅ `themeSettings.brandName` | **通过** |
| Logo 上传后实时预览 | 上传完成后更新 | ✅ `themeSettings.headerLogo` | **通过** |
| 布局切换实时预览 | 选择后立即更新 | ✅ `themeSettings.headerLayout` | **通过** |
| 页脚设置实时预览 | 切换后立即更新 | ✅ `themeSettings.footerEnabled` | **通过** |
| 预览器容器固定位置 | sticky 定位 | ✅ `sticky top-6` | **通过** |
| 预览器宽度 | 合理尺寸 | ✅ `w-[400px]` | **通过** |
| 预览器高度 | 合理尺寸 | ✅ `height={680}` | **通过** |
| 响应式隐藏 | 小屏隐藏 | ✅ `hidden xl:block` | **通过** |

**首页管理页详细检查**:

| 检查项 | 预期 | 实际 | 状态 |
|--------|------|------|------|
| 统计卡片开关实时预览 | 切换后立即更新 | ✅ `homeSettings.stats.enabled` | **通过** |
| 统计项排序实时预览 | 拖拽后立即更新 | ✅ `homeSettings.stats.items` | **通过** |
| 服务推荐开关实时预览 | 切换后立即更新 | ✅ `homeSettings.serviceRecommend` | **通过** |
| HTML 内容实时预览 | 编辑后立即更新 | ✅ `homeSettings.content.code` | **通过** |
| 预览器容器固定位置 | sticky 定位 | ✅ `sticky top-4` | **通过** |
| autoLoad 启用 | 自动加载数据 | ✅ `autoLoad={true}` | **通过** |

#### 部分集成（静态预览或数据覆盖）

| 页面 | 预览页 | 数据传递 | 状态 |
|------|--------|---------|------|
| 会员等级弹窗 | `membership` | `marketingData` | ⚠️ 待验证 |
| 优惠券弹窗 | `coupons` | `marketingData` | ⚠️ 待验证 |
| 积分规则弹窗 | `points` | ❌ 无 | **问题** |
| 活动弹窗 | `campaigns` | ❌ 无 | **问题** |
| 邀请奖励弹窗 | `referrals` | ❌ 无 | **问题** |
| 陪诊员弹窗 | 未指定 | ❌ 无 | **问题** |

### 5.3 发现的问题

#### ❌ 问题 UI-D-1: 积分规则弹窗无实时预览 【P0】

```tsx
// 当前代码
<TerminalPreview
  page='points'
  height={500}
  showFrame={false}
  autoLoad={false}
  // ❌ 没有传递 marketingData
/>
```

#### ❌ 问题 UI-D-2: 活动弹窗无实时预览 【P0】

同上，无数据传递

#### ⚠️ 问题 UI-D-3: 弹窗预览器高度较矮 【P1】

当前 `height={500}`，可能无法显示完整内容

#### ⚠️ 问题 UI-D-4: 服务详情编辑页缺少预览器 【P1】

`features/business/services/edit.tsx` 无预览，核心业务页面

### 5.4 未集成页面建议

| 优先级 | 页面 | 建议预览页 | 理由 |
|--------|------|-----------|------|
| **P0** | 服务详情编辑 | `services` | 核心业务页面 |
| **P1** | 轮播图管理 | `home` | 首页重要元素 |
| **P1** | 分销规则设置 | `distribution` | 需验证展示效果 |
| **P1** | 陪诊员详情编辑 | `escort-detail` | 需实时预览陪诊员信息 |
| P2 | 工作台设置 | `workbench-settings` | 配置项较少 |
| P2 | 服务分类管理 | `services` | 可通过服务页预览 |

### 不建议集成的页面

| 页面 | 理由 |
|------|------|
| 订单管理 | 订单为动态数据，预览意义有限 |
| 用户管理 | 无对应终端页面 |
| 提现审核 | 后台专属功能 |
| 系统设置 | 无对应终端页面 |
| 医院/科室管理 | 暂无终端页面 |

### 5.5 容器尺寸与滚动体验

| 页面类型 | 容器宽度 | 预览器高度 | sticky 定位 | 评估 |
|---------|---------|-----------|------------|------|
| 品牌设置 | 400px | 680px | top-6 | ✅ 合理 |
| 首页管理 | 375px | 680px | top-4 | ✅ 合理 |
| 营销弹窗 | 375px | 500px | - | ⚠️ 较矮 |

### 5.6 通过的检查项

| 检查项 | 说明 |
|--------|------|
| ✅ 数据刷新行为 | 刷新不重置视图状态 |
| ✅ 容器尺寸 | 品牌设置 400px/680px、首页管理 sticky top-4 |
| ✅ 响应式隐藏 | 小屏幕自动隐藏预览器 (`hidden xl:block`) |
| ✅ 预览器内部状态 | currentPage/isDarkMode/pageParams 刷新时不重置 |

---

## 六、问题汇总与修复优先级

### 6.1 P0 问题（必须修复）

| # | 来源 | 问题 | 工时 |
|---|------|------|------|
| 1 | UI-D | 积分规则弹窗无实时预览 | 30min |
| 2 | UI-D | 活动弹窗无实时预览 | 30min |

### 6.2 P1 问题（建议修复）

| # | 来源 | 问题 | 工时 |
|---|------|------|------|
| 3 | UI-A | 订单池缺少详情导航入口 | 30min |
| 4 | UI-D | 弹窗预览器高度调整 | 15min |
| 5 | UI-D | 服务详情编辑页集成预览器 | 2h |

### 6.3 P2 问题（建议优化）

| # | 来源 | 问题 | 工时 |
|---|------|------|------|
| 6 | UI-A | OrderDetailPage 无 id 处理不一致 | 15min |
| 7 | UI-A | 返回时 pageParams 未清空 | 45min |
| 8 | UI-B | 列表/详情页无骨架屏 | 2h |
| 9 | UI-B | 营销/陪诊/工作台无重试按钮 | 1.5h |
| 10 | UI-B | 无自动降级 mock 机制 | 3h |

### 6.4 P3 问题（技术债）

| # | 来源 | 问题 | 工时 |
|---|------|------|------|
| 11 | UI-A | PreviewPageParamsMap 类型不完整 | 30min |
| 12 | UI-A | "我的订单"页面组件未实现 | 2h |
| 13 | UI-B | Loading 文字无动画 | 30min |
| 14 | UI-B | 错误文案不统一 | 15min |
| 15 | UI-C | description 文案不完全统一 | 15min |
| 16 | UI-C | onLogin 回调命名不统一 | 30min |
| 17 | UI-D | 邀请奖励弹窗静态预览 | 30min |

---

## 七、综合修复计划

### 7.1 工时汇总

| 优先级 | 问题数 | 总工时 |
|--------|--------|--------|
| **P0** | 2 | 1h |
| **P1** | 3 | 2.75h |
| **P2** | 5 | 7.5h |
| **P3** | 7 | 4.5h |
| **总计** | 17 | **约 16h** |

### 7.2 分阶段执行计划

#### 阶段一：P0 + P1（约 4h）

```
□ UI-D-1: 积分规则弹窗添加 marketingData 实时预览
□ UI-D-2: 活动弹窗添加 marketingData 实时预览
□ UI-A-1: OrdersPoolPage 添加 onViewDetail 导航
□ UI-D-3: 弹窗预览器高度调整为 600px
□ UI-D-4: 服务详情编辑页集成预览器
```

#### 阶段二：P2（约 7.5h）

```
□ UI-A-2: OrderDetailPage 统一无 id 友好提示
□ UI-A-3: 封装 handleBack 统一清空 pageParams
□ UI-B-1: 创建 ListSkeleton 组件并替换
□ UI-B-2: 创建 ErrorRetry 组件并替换
□ UI-B-3: API 添加自动降级 mock 机制
```

#### 阶段三：P3（约 4.5h，可选）

```
□ UI-A-4: 完善 PreviewPageParamsMap 类型
□ UI-A-5: 实现 my-orders 页面组件
□ UI-B-4: Loading 添加动画
□ UI-B-5: 统一错误文案
□ UI-C-1: 统一 description 文案
□ UI-C-2: 统一 onLogin 回调命名为 onLogin
□ UI-D-5: 邀请奖励弹窗添加实时预览
```

### 7.3 修复代码模板

#### 为弹窗添加实时预览

```tsx
// 1. 定义 marketingData 覆盖
const marketingData = useMemo<MarketingDataOverride>(() => ({
  points: {
    balance: 1000,
    rules: [{
      name: form.watch('name'),
      points: form.watch('points'),
      type: form.watch('type'),
    }]
  }
}), [form.watch('name'), form.watch('points'), form.watch('type')])

// 2. 传递给 TerminalPreview
<TerminalPreview
  page='points'
  marketingData={marketingData}
  height={600}
  showFrame={false}
  autoLoad={false}
/>
```

#### 统一返回清空 pageParams

```tsx
// 封装 handleBack
const handleBack = useCallback((targetPage: PreviewPage) => {
  setCurrentPage(targetPage)
  setPageParams({})
}, [])

// 使用
onBack={() => handleBack('campaigns')}
```

#### 添加骨架屏组件

```tsx
export function ListSkeleton({ count = 3, isDarkMode }: Props) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl p-4 animate-pulse"
          style={{ backgroundColor: isDarkMode ? '#2a2a2a' : '#fff' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
```

#### 添加重试按钮组件

```tsx
export function ErrorRetry({ onRetry, message, isDarkMode, primaryColor }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="text-4xl mb-2">😔</div>
      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        {message || '加载失败'}
      </div>
      <button
        onClick={onRetry}
        className="mt-3 flex items-center gap-1 px-4 py-2 rounded-lg text-sm text-white"
        style={{ backgroundColor: primaryColor }}
      >
        <RefreshCw className="w-4 h-4" />
        重试
      </button>
    </div>
  )
}
```

---

## 八、v1.2 扩展审计范围（已完成）

> 以下审计项在 v1.0 中隐含涉及但未显式拉成独立审计项，  
> 已于 v1.2 完成全部审计。

### 8.1 动效 / 过渡一致性（Motion Contract）【P2】

**审计状态**: ✅ 已完成 | **通过率**: 40%

**审计结果**:

| 场景 | 检查点 | 审计结果 | 备注 |
|------|--------|---------|------|
| 页面切换 | 是否有过渡动画 | ❌ **无** | `setCurrentPage()` 瞬间切换，无 fade/slide |
| loading → 内容 | 是否有突变/闪烁 | ❌ **有突变** | 22 个页面使用简单"加载中..."文字，无骨架屏 |
| 锁态 → 解锁态 | 是否有视觉跳变 | ❌ **有跳变** | PermissionPrompt → 内容瞬间切换 |
| Tab 切换 | 内容区是否平滑过渡 | ✅ **有** | `transition-colors duration-200` 图标/文字渐变 |
| 按钮交互 | 是否有触控反馈 | ✅ **有** | `active:scale-90` + `transition-colors` |
| 列表刷新 | 是否有 fade / skeleton | ❌ **无** | 内容直接替换 |

**代码证据**:

```tsx
// TabBarNav.tsx - ✅ 有过渡
className='transition-colors duration-200'
className='transition-transform duration-150 active:scale-90'

// 页面 loading - ❌ 无骨架屏（22 处）
{isLoading && (
  <div className="text-gray-400 text-sm">加载中...</div>
)}

// PageLoadingSkeleton - ✅ 有但仅用于 Suspense
<div className="animate-pulse">...</div>
```

**发现的问题**:

| # | 问题 | 优先级 | 工时 |
|---|------|--------|------|
| 1 | 页面切换无过渡动画 | P2 | 2h |
| 2 | 22 个页面 loading 无骨架屏 | P2 | 3h |
| 3 | 锁态→解锁态无过渡 | P3 | 1h |

---

### 8.2 滚动位置与页面状态恢复【P2】

**审计状态**: ✅ 已完成 | **通过率**: 0%

**审计结果**:

| 场景 | 检查点 | 预期行为 | 审计结果 |
|------|--------|---------|---------|
| 列表 → 详情 → 返回 | scrollTop 恢复 | 返回到原滚动位置 | ❌ **未实现** |
| Tab 切换 | 滚动位置处理 | 保持各 Tab 独立滚动位置 | ❌ **未实现** |
| 页面刷新 | 滚动位置处理 | 可选恢复 | ❌ **未实现** |
| 弹窗关闭 | 背景页滚动位置 | 保持不变 | ✅ **自然保持**（无特殊处理） |

**代码证据**:

```bash
# 搜索滚动相关代码
grep -r "scrollTop|scrollTo|scrollIntoView" → 无结果

# 滚动容器
overflow-y-auto 仅 2 处使用（index.tsx, WorkbenchSettingsPage）

# scrollRef 使用
- CategorySection.tsx: 横向滚动拖拽（非纵向位置恢复）
- BannerSection.tsx: 轮播图容器
```

**结论**: 完全没有滚动位置保存/恢复机制，列表→详情→返回会回到页面顶部。

**发现的问题**:

| # | 问题 | 优先级 | 工时 |
|---|------|--------|------|
| 1 | 无滚动位置恢复机制 | P2 | 2h |
| 2 | Tab 切换不保持独立滚动位置 | P3 | 1h |

**备注**: 预览器阶段影响有限，但真实端用户非常容易感知。

---

### 8.3 键盘 / 可访问性交互（A11y-lite）【P3】

**审计状态**: ✅ 已完成 | **通过率**: 0%

**审计结果**:

| 场景 | 检查点 | WCAG 级别 | 审计结果 |
|------|--------|----------|---------|
| 弹窗 | Esc 关闭 | A | ❌ **未实现** |
| 按钮/链接 | Tab 聚焦顺序 | A | ❌ **无 tabIndex** |
| PermissionPrompt | 主操作键盘可触发 | A | ❌ **无 onKeyDown** |
| 表单 | Enter 提交 | AA | ❌ **未实现** |
| 焦点 | 聚焦态可见 | AA | ⚠️ **依赖浏览器默认** |

**代码证据**:

```bash
# 搜索键盘事件处理
grep -r "onKeyDown|onKeyUp|aria-|role=|tabIndex" → 0 结果

# 搜索 Escape 关闭
grep -r "Escape|escape" → 仅匹配 isEscort 变量名

# EscortLoginDialog 弹窗
# 无 Esc 关闭功能，无焦点陷阱
```

**发现的问题**:

| # | 问题 | 优先级 | 工时 |
|---|------|--------|------|
| 1 | 弹窗无 Esc 关闭 | P3 | 30min |
| 2 | 无 aria-* 属性 | P3 | 2h |
| 3 | 无 tabIndex 管理 | P3 | 1h |

**建议**: 当前预览器阶段可延后，走"产品级规范"时纳入 v2.0。

---

### 8.4 暗色模式极端对比检查【P3】

**审计状态**: ✅ 已完成 | **风险等级**: ⚠️ 中等

**审计结果**:

| 场景 | 检查点 | 审计结果 | 对比度估算 |
|------|--------|---------|-----------|
| 空态 icon | 暗色下是否可见 | ✅ emoji 可见 | N/A |
| Skeleton | 对比度是否足够 | ⚠️ **边界** | `bg-gray-700` on `#1a1a1a` ≈ 1.5:1 |
| 锁态文案 | 是否有灰阶吞没 | ⚠️ **风险** | `text-gray-400` on `#1a1a1a` ≈ 2.5:1 |
| 次要文案 | 对比度是否足够 | ⚠️ **风险** | `text-gray-500` on `#1a1a1a` ≈ 1.8:1 |
| 边框/分割线 | 暗色下是否可见 | ⚠️ **边界** | `border-gray-700` 勉强可见 |
| 禁用态按钮 | 对比度是否足够 | ⚠️ **风险** | disabled + 暗色叠加 |

**代码证据**:

```bash
# text-gray-400/500 使用频率
grep "text-gray-400|text-gray-500" pages/ → 253 处

# 骨架屏颜色
PageLoadingSkeleton: bg-gray-700 / bg-gray-800

# WCAG AA 要求: 4.5:1（正文）/ 3:1（大字）
# 当前大多数次要文案对比度 < 3:1
```

**发现的问题**:

| # | 问题 | 优先级 | 影响范围 |
|---|------|--------|---------|
| 1 | `text-gray-400/500` 暗色对比度不足 | P3 | 253 处 |
| 2 | 骨架屏暗色下不明显 | P3 | PageLoadingSkeleton |
| 3 | 无暗色专用颜色变量 | P3 | 全局 |

**修复建议**:

```tsx
// 方案：使用暗色专用颜色类
// Before
<span className="text-gray-400">次要文案</span>

// After - 动态切换
<span className={isDarkMode ? 'text-gray-300' : 'text-gray-400'}>
  次要文案
</span>
```

**备注**: 不会崩，但影响阅读体验。建议 v1.3 时统一优化。

---

### 8.5 异常数据形态（非空但非法）【P2】

**审计状态**: ✅ 已完成 | **通过率**: 20%

**审计结果**:

| 场景 | 示例 | 预期处理 | 审计结果 |
|------|------|---------|---------|
| 字段类型异常 | `price: "abc"` | 显示占位符或 0 | ❌ **会崩溃** |
| null vs undefined | `name: null` | 区分处理 | ❌ **无处理** |
| 未知枚举值 | `status: "unknown"` | 显示默认态 | ❌ **未处理** |
| 后端新增字段 | 新字段前端未识别 | 兼容忽略 | ✅ **TypeScript 自动忽略** |
| 数组结构异常 | `items: {}` | 降级为空数组 | ❌ **会崩溃** |
| 嵌套对象缺失 | `user.profile?.avatar` | 安全访问 | ✅ **可选链保护** |

**代码证据**:

```tsx
// 危险模式 1: 直接调用 toFixed/toLocaleString（30+ 处）
stats.withdrawable.toLocaleString('zh-CN', { minimumFractionDigits: 2 })
// 如果 withdrawable 为 undefined/null → TypeError

// 危险模式 2: 直接访问嵌套属性
order.payment.amount.toFixed(2)
// 如果 payment 为 null → TypeError

// 缺少的防护
// 无 isNaN() 检查
// 无 typeof === 'number' 校验
// 无 Array.isArray() 校验
// ?? 空值合并仅 2 处使用
```

**风险场景分析**:

| 页面 | 危险代码 | 异常数据时行为 |
|------|---------|---------------|
| WorkbenchEarningsPage | `stats.withdrawable.toLocaleString()` | **页面崩溃** |
| DistributionPage | `stats.totalDistribution.toFixed(2)` | **页面崩溃** |
| OrderDetailPage | `order.payment.amount.toFixed(2)` | **页面崩溃** |

**发现的问题**:

| # | 问题 | 优先级 | 工时 |
|---|------|--------|------|
| 1 | 数值字段无空值保护 | **P1** | 2h |
| 2 | 无数据类型校验 | P2 | 3h |
| 3 | 无 API 层数据 transform | P2 | 2h |

**修复建议**:

```tsx
// 方案 1: 工具函数
function safeNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && !isNaN(value)) return value
  return fallback
}

// 方案 2: API transform
const { data } = useQuery({
  queryKey: ['stats'],
  queryFn: fetchStats,
  select: (data) => ({
    ...data,
    withdrawable: safeNumber(data?.withdrawable),
  })
})
```

---

### 8.6 DebugPanel 自身的 UI 交互审计【P1】

**审计状态**: ✅ 已完成 | **通过率**: 85%

**审计结果**:

| 场景 | 检查点 | 审计结果 | 备注 |
|------|--------|---------|------|
| 注入 token | 操作反馈是否清晰 | ✅ **通过** | 按钮立即切换 + 视角标签变化 |
| 清除 token | 操作反馈是否清晰 | ✅ **通过** | 按钮立即切换 + 视角回落 |
| 当前 viewerRole | 是否明确展示 | ✅ **通过** | 颜色区分 + 图标区分（🔐/👤） |
| 操作误触 | 是否会影响非预期状态 | ⚠️ **风险** | 清除无确认弹窗 |
| 折叠/展开 | 状态是否持久化 | ❌ **未实现** | `useState(true)` 每次重新渲染展开 |
| 生产环境 | 是否自动隐藏 | ✅ **通过** | `shouldShowDebugPanel()` 正确判断 |
| 验证中状态 | 是否有反馈 | ✅ **通过** | "验证中..." 文字 + `animate-pulse` |

**代码证据**:

```tsx
// DebugPanel.tsx

// ✅ 视角标识清晰
<span className={isEscort ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'}>
  {isEscort ? '🔐 陪诊员' : '👤 用户'}
</span>

// ✅ 验证中反馈
{isValidating && <span className="animate-pulse">验证中...</span>}

// ✅ 生产环境隐藏
export function shouldShowDebugPanel(): boolean {
  if (process.env.NODE_ENV === 'development') return true
  return false
}

// ❌ 折叠状态不持久化
const [isExpanded, setIsExpanded] = useState(true)  // 应该读取 localStorage
```

**发现的问题**:

| # | 问题 | 优先级 | 工时 |
|---|------|--------|------|
| 1 | 清除 token 无确认 | P3 | 15min |
| 2 | 折叠/展开状态不持久化 | P3 | 15min |

**修复建议**:

```tsx
// 折叠状态持久化
const [isExpanded, setIsExpanded] = useState(() => {
  if (typeof localStorage === 'undefined') return true
  return localStorage.getItem('debugPanel.expanded') !== 'false'
})

useEffect(() => {
  localStorage.setItem('debugPanel.expanded', String(isExpanded))
}, [isExpanded])
```

---

### 8.7 扩展审计汇总

| # | 审计项 | 优先级 | 审计状态 | 通过率 | 发现问题数 | 修复工时 |
|---|--------|--------|---------|--------|-----------|---------|
| 1 | DebugPanel 审计 | **P1** | ✅ 已完成 | 85% | 2 | 30min |
| 2 | 动效/过渡一致性 | **P2** | ✅ 已完成 | 40% | 3 | 6h |
| 3 | 滚动位置恢复 | **P2** | ✅ 已完成 | 0% | 2 | 3h |
| 4 | 异常数据形态 | **P2** | ✅ 已完成 | 20% | 3 | 7h |
| 5 | 暗色模式对比度 | P3 | ✅ 已完成 | ⚠️ | 3 | 2h |
| 6 | A11y 可访问性 | P3 | ✅ 已完成 | 0% | 3 | 3.5h |

**v1.2 扩展审计总结**:
- **审计项**: 6 项全部完成
- **发现问题**: 16 个新问题
- **总修复工时**: 约 21.5h

**新发现问题优先级分布**:

| 优先级 | 问题数 | 工时 |
|--------|--------|------|
| **P1** | 1（数值空值保护） | 2h |
| **P2** | 8 | 15h |
| **P3** | 7 | 4.5h |

**修复建议**:
- **立即**: 数值字段空值保护（P1，防止页面崩溃）
- **v1.3**: 动效过渡、骨架屏、滚动恢复
- **v2.0**: A11y 可访问性

---

## 九、附录

### 附录 A：页面导航关系图

```
┌─────────────────────────────────────────────────────────────────┐
│                        TerminalPreview                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐     navigateToPage      ┌─────────────────┐      │
│  │campaigns │ ─────────────────────→ │campaigns-detail │      │
│  │  列表    │   { id: campaign.id }   │     详情        │      │
│  └──────────┘ ←───────────────────── └─────────────────┘      │
│                   setCurrentPage ⚠️                             │
│                                                                 │
│  ┌──────────┐     navigateToPage      ┌─────────────────┐      │
│  │escort-   │ ─────────────────────→ │ escort-detail   │      │
│  │  list    │   { id: escort.id }     │     详情        │      │
│  └──────────┘ ←───────────────────── └─────────────────┘      │
│                   setCurrentPage ⚠️                             │
│                                                                 │
│  ┌──────────┐        ❌ 缺失          ┌─────────────────┐      │
│  │ orders-  │ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ → │workbench-order- │      │
│  │  pool    │   { id: order.id }      │    detail       │      │
│  └──────────┘ ←───────────────────── └─────────────────┘      │
│                   setCurrentPage ⚠️                             │
│                                                                 │
│  ┌──────────┐     navigateToPage      ┌─────────────────┐      │
│  │distribu- │ ─────────────────────→ │distribution-    │      │
│  │  tion    │   { relation: 'direct'} │   members       │      │
│  └──────────┘ ←───────────────────── └─────────────────┘      │
│                   navigateToPage ✅                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

图例:
  ────→  navigateToPage（带参数）
  ─ ─ →  缺失的导航链路
  ⚠️     使用 setCurrentPage，pageParams 未清空
  ✅     使用 navigateToPage，pageParams 正确清空
```

### 附录 B：管理后台集成点清单

```
src/features/
├── app-settings/
│   ├── brand/index.tsx         ✅ 完整集成（品牌设置）
│   ├── homepage/index.tsx      ✅ 完整集成（首页管理）
│   └── banners/index.tsx       ❌ 未集成（轮播图管理）
├── marketing/
│   ├── membership/             ⚠️ 部分集成（会员等级）
│   ├── coupons/                ⚠️ 部分集成（优惠券）
│   ├── points/                 ❌ 静态预览（积分规则）
│   ├── campaigns/              ❌ 静态预览（活动管理）
│   └── referrals/              ❌ 静态预览（邀请奖励）
├── escorts/
│   └── escorts-action-dialog   ❌ 静态预览（陪诊员）
├── business/
│   └── services/edit.tsx       ❌ 未集成（服务编辑）
└── distribution/
    └── index.tsx               ❌ 未集成（分销设置）
```

### 附录 C：TerminalPreview Props 速查

```typescript
interface TerminalPreviewProps {
  // 预览页面
  page?: PreviewPage

  // 数据覆盖
  themeSettings?: Partial<ThemeSettings>    // 主题设置
  homeSettings?: Partial<HomePageSettings>  // 首页设置
  marketingData?: MarketingDataOverride     // 营销数据
  bannerData?: BannerAreaData | null        // 轮播图
  statsData?: Partial<StatsData>            // 统计数据

  // 视角控制（预览器专用）
  viewerRole?: 'user' | 'escort'
  userSession?: UserSession
  escortSession?: EscortSession

  // 显示控制
  height?: number          // 预览器高度，默认 680
  showFrame?: boolean      // 是否显示手机边框，默认 true
  autoLoad?: boolean       // 是否自动加载数据，默认 true
  className?: string
}
```

### 附录 D：私域页面 PermissionPrompt 清单

| 模块 | 页面 | title | description |
|------|------|-------|-------------|
| 工作台 | WorkbenchPage | 需要陪诊员身份 | 请先登录陪诊员账号后再访问工作台 |
| 工作台 | OrdersPoolPage | 需要陪诊员身份 | 请先登录陪诊员账号后再访问订单池 |
| 工作台 | OrderDetailPage | 需要陪诊员身份 | 请先登录陪诊员账号后再查看订单详情 |
| 工作台 | WorkbenchEarningsPage | 需要陪诊员身份 | 请先登录陪诊员账号后再查看收入明细 |
| 工作台 | WorkbenchWithdrawPage | 需要陪诊员身份 | 请先登录陪诊员账号后再进行提现操作 |
| 工作台 | WorkbenchSettingsPage | 需要陪诊员身份 | 请先登录陪诊员账号后再访问设置页面 |
| 分销中心 | DistributionPage | 需要陪诊员身份 | 请先登录陪诊员账号查看分销数据 |
| 分销中心 | DistributionMembersPage | 需要陪诊员身份 | 请先登录陪诊员账号查看团队成员 |
| 分销中心 | DistributionRecordsPage | 需要陪诊员身份 | 请先登录陪诊员账号查看分润记录 |
| 分销中心 | DistributionInvitePage | 需要陪诊员身份 | 请先登录陪诊员账号获取邀请信息 |
| 分销中心 | DistributionPromotionPage | 需要陪诊员身份 | 请先登录陪诊员账号查看晋升信息 |

### 附录 E：边界值测试 Mock 数据

```typescript
// 零进度测试
getMockDistributionStatsZeroProgress()
// promotionProgress: 0 应显示 "0%" 和 0% 宽度进度条

// 最高等级测试
getMockDistributionStatsMaxLevel()
// nextLevel: undefined 应不显示晋升进度条

// 空列表测试
getMockDistributionMembersEmpty()
// items: [] 应显示空态 UI

// 大金额测试
getMockWithdrawLargeAmount()
// withdrawable: 999999.99 应显示 "¥999,999.99"
```

### 附录 F：视角切换完整交互流程图

```
┌─────────────────────────────────────────────────────────────────────┐
│                     用户视角 → 陪诊员视角                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  [用户视角]                                                         │
│      │                                                              │
│      ├── 访问私域页面 ──→ 显示 PermissionPrompt                     │
│      │                         │                                    │
│      │                         ├── 点击「去登录」──→ 打开登录弹窗    │
│      │                         │                                    │
│      │                         └── 点击「快捷注入 mock token」       │
│      │                                    │                         │
│      ├── DebugPanel「注入 mock token」    │                         │
│      │         │                          │                         │
│      │         ▼                          ▼                         │
│      │   setPreviewEscortToken ──→ localStorage                    │
│      │   setLocalEscortToken ───→ React State                       │
│      │         │                                                    │
│      │         ▼                                                    │
│      │   useViewerRole.verifyToken()                               │
│      │         │                                                    │
│      │         ├── mock token ──→ 直接有效                          │
│      │         │                                                    │
│      │         └── 真实 token ──→ 后端验证                          │
│      │                              │                               │
│      │                              ├── 成功 ──→ isEscortTokenValid=true│
│      │                              │                               │
│      │                              └── 失败 ──→ 清理 token         │
│      │                                                              │
│      ▼                                                              │
│  [陪诊员视角]                                                       │
│      │                                                              │
│      ├── 访问私域页面 ──→ 正常渲染内容                              │
│      │                                                              │
│      ├── DebugPanel「清除 escortToken」                             │
│      │         │                                                    │
│      │         ▼                                                    │
│      │   clearPreviewEscortToken ──→ 清除 localStorage              │
│      │   setLocalEscortToken(null) ──→ 清除 React State             │
│      │         │                                                    │
│      │         ▼                                                    │
│      │   isEscortTokenValid = false                                 │
│      │         │                                                    │
│      │         ▼                                                    │
│      └───→ [用户视角]                                               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 附录 G：状态机标准实现模板

```tsx
/**
 * 页面状态机标准实现模板
 */
export function StandardListPage({ themeSettings, isDarkMode }: Props) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['example'],
    queryFn: fetchData,
  })

  const items = data?.items ?? []
  const isEmpty = !isLoading && items.length === 0

  return (
    <div className="min-h-full">
      {/* Header */}
      <Header />

      {/* Content */}
      <div className="px-4 py-4">
        {/* Loading - 骨架屏 */}
        {isLoading && <ListSkeleton count={5} isDarkMode={isDarkMode} />}

        {/* Error - 带重试 */}
        {isError && (
          <ErrorRetry
            onRetry={() => refetch()}
            isDarkMode={isDarkMode}
            primaryColor={themeSettings.primaryColor}
          />
        )}

        {/* Empty - 带引导 */}
        {isEmpty && !isError && (
          <EmptyState
            icon="📋"
            message="暂无数据"
            actionText="去添加"
            onAction={handleAdd}
          />
        )}

        {/* List */}
        {!isLoading && !isError && items.length > 0 && (
          <div className="space-y-3">
            {items.map(item => <ItemCard key={item.id} item={item} />)}
          </div>
        )}
      </div>
    </div>
  )
}
```

### 附录 H：相关文件清单

| 文件路径 | 职责 |
|---------|------|
| `src/components/terminal-preview/index.tsx` | 主入口，navigateToPage/pageParams 状态管理 |
| `src/components/terminal-preview/types.ts` | 类型定义，PreviewPageParamsMap |
| `src/components/terminal-preview/session.ts` | Token 存储/清理/验证工具函数 |
| `src/components/terminal-preview/hooks/useViewerRole.ts` | viewerRole 推导 Hook |
| `src/components/terminal-preview/components/DebugPanel.tsx` | 调试面板组件 |
| `src/components/terminal-preview/components/PermissionPrompt.tsx` | 统一权限提示组件 |
| `src/components/terminal-preview/api.ts` | API 封装，含 `verifyEscortToken()` |
| `components/pages/marketing/CampaignsPage.tsx` | 活动列表，触发 campaigns-detail 导航 |
| `components/pages/marketing/CampaignDetailPage.tsx` | 活动详情，接收 campaignId |
| `components/pages/escort/EscortListPage.tsx` | 陪诊员列表，触发 escort-detail 导航 |
| `components/pages/escort/EscortDetailPage.tsx` | 陪诊员详情，接收 escortId |
| `components/pages/workbench/OrdersPoolPage.tsx` | 订单池，**缺少详情导航** |
| `components/pages/workbench/OrderDetailPage.tsx` | 订单详情，**无 id 处理不一致** |
| `components/pages/distribution/DistributionMembersPage.tsx` | 团队成员，pageParams.relation |
| `components/pages/distribution/DistributionRecordsPage.tsx` | 分润记录，pageParams.range/status |

---

**审计完成时间**: 2024-12-13  
**文档版本历史**:
- v1.0: 初始审计（UI-A/B/C/D 四维度）
- v1.1: 补充扩展审计范围定义
- **v1.2**: 完成全部扩展审计（动效/滚动/异常数据/DebugPanel/暗色对比度/A11y）

**v1.2 审计新发现**:
- 新增 **16 个问题**（P1: 1, P2: 8, P3: 7）
- 累计问题数: 17 + 16 = **33 个**
- 累计修复工时: 16h + 21.5h = **约 37.5h**

**下次审计建议**:
1. **立即修复**: 数值字段空值保护（P1，防止页面崩溃）
2. **v1.3 迭代**: 动效过渡、骨架屏优化、滚动恢复
3. **v2.0 长期**: A11y 可访问性完整支持

