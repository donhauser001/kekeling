# Terminal-Preview 小程序页面全面审计报告

> **审计日期**：2024-12-22  
> **审计范围**：`src/components/terminal-preview/components/pages/` (154 个文件，1.8MB)  
> **审计依据**：`docs/功能模块改造指南/小程序页面改造规范.md`

---

## 📊 审计概览

| 维度 | 总数 | 问题数 | 严重程度 |
|------|------|--------|----------|
| 页面组件 | 154个 | - | - |
| **规则违规** | - | **22+** | 🔴 高 |
| **架构问题** | - | **8** | 🟠 中 |
| **性能隐患** | - | **5** | 🟡 低 |
| **代码质量** | - | **6** | 🟡 低 |

---

## 🔴 严重问题（P0 - 必须修复）

### 问题 1：22 个页面仍在使用 useQuery（规则 4 违规）

**问题描述**：根据《小程序页面改造规范》规则 4，应使用 `useState + useEffect` 替代 `useQuery`，但发现 **22 个文件** 仍存在 `useQuery` 引用。

**影响文件列表**：

```
src/components/terminal-preview/components/pages/workbench/OrderDetailPage.tsx
src/components/terminal-preview/components/pages/workbench/OrdersPoolPage.tsx
src/components/terminal-preview/components/pages/workbench/MyOrdersPage.tsx
src/components/terminal-preview/components/pages/workbench/WorkbenchPage.tsx
src/components/terminal-preview/components/pages/workbench/index.ts
src/components/terminal-preview/components/pages/ServicesPage.tsx
src/components/terminal-preview/components/pages/AddressListPage.tsx
src/components/terminal-preview/components/pages/address-edit/AddressEditPage.tsx
src/components/terminal-preview/components/pages/membership/MembershipPage.tsx
src/components/terminal-preview/components/pages/points/PointsPage.tsx
src/components/terminal-preview/components/pages/marketing/referrals/ReferralsPage.tsx
src/components/terminal-preview/components/pages/marketing/points/PointsPage.tsx
src/components/terminal-preview/components/pages/marketing/coupons/CouponsPage.tsx
src/components/terminal-preview/components/pages/distribution/distribution-promotion/DistributionPromotionPage.tsx
src/components/terminal-preview/components/pages/distribution/distribution-records/DistributionRecordsPage.tsx
src/components/terminal-preview/components/pages/distribution/distribution-members/DistributionMembersPage.tsx
src/components/terminal-preview/components/pages/distribution/distribution-invite/DistributionInvitePage.tsx
src/components/terminal-preview/components/pages/distribution/distribution-main/DistributionPage.tsx
src/components/terminal-preview/components/pages/workbench/escort-profile-edit/EscortProfileEditPage.tsx
src/components/terminal-preview/components/pages/workbench/workbench-settings/WorkbenchSettingsPage.tsx
src/components/terminal-preview/components/pages/workbench/ServiceTypesPage.tsx
src/components/terminal-preview/components/pages/service-detail/hooks/useServiceDetailData.ts
```

**影响**：React Query 在小程序环境中存在兼容性问题，会导致数据获取失败。

**修复方案**：将 `useQuery` 改为 `useState + useEffect` 模式，参考已改造页面的实现。

---

### 问题 2：15+ 个大文件未拆分（规则 12 违规）

**问题描述**：发现 **15+ 个文件超过 500 行**，违反规则 12（大文件拆分）。

**影响文件列表**：

| 文件 | 行数 | 严重程度 |
|------|------|----------|
| `workbench/OrderDetailPage.tsx` | **1542行** | 🔴 严重超标 |
| `workbench/WorkbenchWithdrawPage.tsx` | **1074行** | 🔴 严重超标 |
| `workbench/WorkbenchEarningsPage.tsx` | **994行** | 🔴 严重超标 |
| `ServicesPage.tsx` | **879行** | 🔴 超标 |
| `UserOrderDetailPage.tsx` | **836行** | 🔴 超标 |
| `workbench/EscortOrderDetailPage.tsx` | **819行** | 🔴 超标 |
| `address-edit/AddressEditPage.tsx` | **733行** | 🟠 超标 |
| `workbench/OrdersPoolPage.tsx` | **680行** | 🟠 超标 |
| `workbench/MyOrdersPage.tsx` | **641行** | 🟠 超标 |
| `OrderComplaintPage.tsx` | **638行** | 🟠 超标 |
| `create-order/CreateOrderPage.tsx` | **636行** | 🟠 超标 |
| `create-order/components/FormSection.tsx` | **631行** | 🟠 超标 |
| `distribution/distribution-invite/DistributionInvitePage.tsx` | **600行** | 🟠 超标 |
| `workbench/EarningsPage.tsx` | **586行** | 🟠 超标 |
| `UserOrdersPage.tsx` | **586行** | 🟠 超标 |
| `workbench/ServiceTypesPage.tsx` | **581行** | 🟠 超标 |

**影响**：大文件难以维护、测试和复用，且会影响构建性能。

**修复方案**：按照已有模式（如 `distribution-main/`、`points/`）进行模块化拆分：
- 创建 `types.ts` - 类型定义
- 创建 `constants.ts` - 常量定义
- 创建 `components/` - 子组件目录
- 创建 `index.ts` - 模块导出

---

### 问题 3：输入事件处理不兼容小程序

**问题描述**：`WorkbenchWithdrawPage.tsx` 第 457 行使用了 `e.target.value` 获取输入值：

```typescript
onChange={(e) => setAmount(e.target.value)}
```

**影响**：小程序中应使用 `e.detail.value`，当前写法在小程序中无法获取输入值。

**修复方案**：封装统一的输入处理函数：

```typescript
// 在 utils.ts 中添加
export const getInputValue = (e: any): string => {
  return e.detail?.value ?? e.target?.value ?? ''
}

// 使用
onChange={(e) => setAmount(getInputValue(e))}
```

---

### 问题 4：ServicesPage 严重的样式规则违规

**问题描述**：`ServicesPage.tsx` 中大量使用 `className` 定义布局属性，违反规则 1/2。

**违规示例**（共 20+ 处）：

```tsx
className='flex items-center gap-2 rounded-full px-4 py-2.5 cursor-pointer'
className='flex gap-2'
className='flex items-center justify-between px-3 py-2'
className='flex items-center gap-1.5 text-xs px-2 py-1 rounded transition-colors'
```

**影响**：这些 Tailwind 类名在小程序中不生效，导致布局错乱。

**修复方案**：将所有布局属性移至 `style` 中：

```tsx
// 错误
<Box className='flex items-center gap-2'>

// 正确
<Box style={{ display: 'flex', alignItems: 'center', gap: 8 * wxScale }}>
```

---

## 🟠 中等问题（P1 - 应该修复）

### 问题 5：`<style>` 标签在小程序中不生效

**问题描述**：7 个文件使用了内联 `<style>` 标签：

| 文件 | 用途 |
|------|------|
| `ArticleDetailPage.tsx` | 隐藏滚动条 |
| `CmsPageDetailPage.tsx` | 隐藏滚动条 |
| `CasesPage.tsx` | Tab 滚动条样式 |
| `service-detail/components/ServiceRichContent.tsx` | 富文本样式 |
| `service-detail/components/ServiceInfoTabs.tsx` | 隐藏滚动条 |
| `service-detail/components/EscortInfoSection.tsx` | 隐藏滚动条 |
| `service-detail/components/RecommendedServices.tsx` | 隐藏滚动条 |

**示例代码**：
```tsx
<style>{`div[class*="overflow-x-auto"]::-webkit-scrollbar { display: none; }`}</style>
```

**影响**：`<style>` 标签在小程序中不被解析，样式不会生效。

**修复方案**：
1. 对于隐藏滚动条需求，小程序默认不显示滚动条，可直接删除
2. 对于富文本样式，使用 RichText 组件的内置样式支持

---

### 问题 6：未处理的 TODO 注释（技术债务）

**问题描述**：代码中存在 7 个 TODO 注释未处理：

| 文件 | TODO 内容 | 优先级 |
|------|-----------|--------|
| `marketing/points/PointsPage.tsx:273` | 签到功能 | 🟡 中 |
| `workbench/OrderDetailPage.tsx:275` | 调用确认到达接口 | 🔴 高 |
| `workbench/OrderDetailPage.tsx:289` | 调用开始服务接口 | 🔴 高 |
| `workbench/OrderDetailPage.tsx:303` | 调用完成服务接口 | 🔴 高 |
| `workbench/EscortOrderDetailPage.tsx:224` | 调用拍照功能 | 🟡 中 |
| `ServicesPage.tsx:67` | 排查 React Query 兼容性问题 | 🔴 高 |
| `create-order/components/FormSection.tsx:495` | 打开自定义字段输入弹窗 | 🟢 低 |

**修复方案**：创建 Issue 跟踪，按优先级逐步实现。

---

### 问题 7：className 中使用 overflow 类名

**问题描述**：10 处使用了 `className="... overflow-..."` 定义滚动行为：

| 文件 | 出现次数 |
|------|----------|
| `ServiceInfoTabs.tsx` | 2处 |
| `ServiceImageCarousel.tsx` | 1处 |
| `ServicesPage.tsx` | 2处 |
| `RecommendedServices.tsx` | 3处 |
| `EscortInfoSection.tsx` | 2处 |

**影响**：`overflow-x-auto` 等 Tailwind 类在小程序中不生效。

**修复方案**：改为 `style={{ overflow: 'auto', overflowX: 'auto' }}`。

---

### 问题 8：Image 组件缺少 mode 属性

**问题描述**：共检测到 22 处 `<Image>` 使用，但只有 18 处指定了 `mode` 属性。

**影响**：未指定 `mode` 时，小程序默认使用 `scaleToFill`，可能导致图片变形。

**修复方案**：所有 `<Image>` 组件都应明确指定 `mode="aspectFill"` 或 `mode="aspectFit"`。

---

## 🟡 性能隐患（P2 - 持续优化）

### 问题 9：缺少 React.memo 优化

**问题描述**：

| 优化手段 | 使用次数 | 评估 |
|---------|---------|------|
| `useMemo` | 10处 | 偏少 |
| `useCallback` | ~18处 | 合理 |
| `React.memo` | **0处** | 🔴 严重缺失 |

**影响**：154 个组件中 **没有一个使用 `React.memo`**，可能导致不必要的重渲染。

**修复方案**：对复杂子组件（如卡片、列表项）使用 `React.memo` 包裹：

```tsx
// 优化前
export function MemberCard({ member, ... }) { ... }

// 优化后
export const MemberCard = React.memo(function MemberCard({ member, ... }) { ... })
```

---

### 问题 10：错误处理仅打印日志

**问题描述**：66 处 `console.error` 调用，但多数只是打印日志，没有用户反馈。

**示例**：
```typescript
.catch(err => console.error('[ServicesPage] 轮播图加载失败:', err))
```

**影响**：用户无法感知错误发生，体验差。

**修复方案**：结合 `showToast` 或错误状态显示：

```typescript
.catch(err => {
  console.error('[ServicesPage] 轮播图加载失败:', err)
  showToast({ title: '加载失败，请重试', icon: 'none' })
})
```

---

### 问题 11：position: sticky 兼容性风险

**问题描述**：77 处使用 `position: 'sticky'`。

**注意**：小程序对 `sticky` 支持有限，在部分机型/版本上可能不生效。

**修复方案**：
1. 在真机上充分测试
2. 准备 `position: fixed` 作为降级方案
3. 考虑使用小程序原生的 `sticky` 组件

---

### 问题 12：动画/过渡效果较少

**问题描述**：仅 19 处使用了 `animation` 或 `transition`。

**影响**：页面交互缺乏反馈，用户体验生硬。

**修复方案**：为关键交互添加动画：
- 按钮点击反馈
- 列表项展开/收起
- 页面切换过渡
- 加载状态动画

---

## ✅ 良好实践（无需修改）

| 检查项 | 状态 | 说明 |
|--------|------|------|
| 无可访问性属性 | ✅ | 小程序不支持 `aria-*`，未使用是正确的 |
| lucide-compat 使用正确 | ✅ | 除 `PhoneFrame.tsx` 外都正确 |
| 跨平台原语使用正确 | ✅ | 未直接使用 HTML 元素 |
| 骨架屏覆盖良好 | ✅ | 61 个文件包含 Skeleton |
| 错误处理链路完整 | ✅ | 87 处 catch，27 处 finally |
| wxScale 使用规范 | ✅ | 视觉尺寸统一缩放 |
| 主题色使用规范 | ✅ | 787 处使用 primaryColor |

---

## 📈 技术债务统计

| 类型 | 数量 | 预估工时 | 优先级 |
|------|------|----------|--------|
| useQuery 替换 | 22处 | 8h | P0 |
| 大文件拆分（>1000行） | 3个 | 12h | P0 |
| 大文件拆分（500-1000行） | 12个 | 24h | P1 |
| className 布局违规 | 50+处 | 8h | P0 |
| `<style>` 标签移除 | 7处 | 2h | P1 |
| Image mode 补全 | 4处 | 0.5h | P1 |
| TODO 清理 | 7个 | 4h | P1 |
| React.memo 优化 | 20+处 | 4h | P2 |
| **合计** | - | **~62.5h** | - |

---

## 📋 审计结论

项目整体架构良好，跨平台适配框架完善，但存在 **规则执行不一致** 的问题：

1. **已完成的模块**（如新拆分的 `coupons/`、`points/`、`referrals/`）遵循规范良好
2. **早期开发的页面**（如 `ServicesPage`、`OrderDetailPage`）存在较多规范违规
3. **核心工作台页面**（如 `WorkbenchWithdrawPage`、`WorkbenchEarningsPage`）体量大，需要拆分

**建议**：制定系统性的技术债务清理计划，分批次修复。

---

*审计人：AI Assistant*  
*审计工具：代码静态分析 + grep 扫描*

