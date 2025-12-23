# Terminal-Preview 技术债务修复计划

> **关联审计**：`terminal-preview-全面审计报告-2024-12-22.md`  
> **计划制定日期**：2024-12-22  
> **预计总工时**：62.5h（约 8 个工作日）

---

## 📅 修复排期

### 阶段一：P0 紧急修复（第 1-2 天）

**目标**：修复阻塞小程序运行的关键问题

#### 任务 1.1：修复 ServicesPage className 违规（4h）

**负责文件**：`src/components/terminal-preview/components/pages/ServicesPage.tsx`

**修复内容**：
- [ ] 将所有 `className` 中的布局属性移至 `style`
- [ ] 移除 Tailwind 布局类（flex、gap、px、py 等）
- [ ] 保留仅用于 Web 优化的 className

**验收标准**：
- 无 `flex`、`gap`、`items-`、`justify-` 等布局类在 className 中
- 所有布局通过 `style` 实现
- Web 端视觉效果不变

---

#### 任务 1.2：修复输入事件兼容性（1h）

**负责文件**：`src/components/terminal-preview/components/pages/workbench/WorkbenchWithdrawPage.tsx`

**修复内容**：
- [ ] 创建 `getInputValue` 工具函数
- [ ] 替换所有 `e.target.value` 为兼容写法

**工具函数**：

```typescript
// src/components/terminal-preview/utils/input.ts
export const getInputValue = (e: any): string => {
  return e.detail?.value ?? e.target?.value ?? ''
}
```

---

#### 任务 1.3：拆分超大文件 - OrderDetailPage（6h）

**负责文件**：`src/components/terminal-preview/components/pages/workbench/OrderDetailPage.tsx` (1542行)

**拆分结构**：

```
workbench/order-detail/
├── types.ts                    # 类型定义
├── constants.ts                # 状态颜色、步骤配置
├── OrderDetailPage.tsx         # 主组件（目标 <400行）
├── index.ts                    # 导出
└── components/
    ├── index.ts
    ├── OrderDetailSkeleton.tsx # 骨架屏
    ├── OrderHeader.tsx         # 订单头部（状态、基础信息）
    ├── ServiceSteps.tsx        # 服务流程步骤
    ├── PatientInfo.tsx         # 就诊人信息
    ├── OrderInfo.tsx           # 订单详情（时间、费用等）
    ├── ActionButtons.tsx       # 底部操作按钮
    └── PoolOrderActions.tsx    # 订单池专用操作
```

---

### 阶段二：P0 继续 + P1 开始（第 3-4 天）

#### 任务 2.1：拆分超大文件 - WorkbenchWithdrawPage（4h）

**负责文件**：`src/components/terminal-preview/components/pages/workbench/WorkbenchWithdrawPage.tsx` (1074行)

**拆分结构**：

```
workbench/workbench-withdraw/
├── types.ts
├── constants.ts
├── WorkbenchWithdrawPage.tsx   # 主组件（目标 <400行）
├── index.ts
└── components/
    ├── index.ts
    ├── WithdrawSkeleton.tsx
    ├── BalanceCard.tsx         # 余额卡片
    ├── AccountInfo.tsx         # 提现账户信息
    ├── WithdrawForm.tsx        # 提现表单
    └── RecentRecords.tsx       # 最近提现记录
```

---

#### 任务 2.2：拆分超大文件 - WorkbenchEarningsPage（4h）

**负责文件**：`src/components/terminal-preview/components/pages/workbench/WorkbenchEarningsPage.tsx` (994行)

**拆分结构**：

```
workbench/workbench-earnings/
├── types.ts
├── constants.ts
├── WorkbenchEarningsPage.tsx   # 主组件（目标 <400行）
├── index.ts
└── components/
    ├── index.ts
    ├── EarningsSkeleton.tsx
    ├── StatsOverview.tsx       # 收入统计概览
    ├── FrozenBalance.tsx       # 冻结余额（含倒计时）
    ├── WithdrawableCard.tsx    # 可提现余额卡片
    └── EarningsChart.tsx       # 收入趋势图
```

---

#### 任务 2.3：移除 `<style>` 标签（2h）

**负责文件**：

| 文件 | 修复方案 |
|------|----------|
| `ArticleDetailPage.tsx` | 删除隐藏滚动条样式 |
| `CmsPageDetailPage.tsx` | 删除隐藏滚动条样式 |
| `CasesPage.tsx` | 使用 inline style 或删除 |
| `ServiceRichContent.tsx` | 使用 RichText 内置样式 |
| `ServiceInfoTabs.tsx` | 删除隐藏滚动条样式 |
| `EscortInfoSection.tsx` | 删除隐藏滚动条样式 |
| `RecommendedServices.tsx` | 删除隐藏滚动条样式 |

---

### 阶段三：P1 批量修复（第 5-6 天）

#### 任务 3.1：拆分中等文件（12h，每个约 1h）

**优先级排序**：

| 序号 | 文件 | 行数 | 复杂度 |
|------|------|------|--------|
| 1 | `ServicesPage.tsx` | 879 | 高 |
| 2 | `UserOrderDetailPage.tsx` | 836 | 中 |
| 3 | `EscortOrderDetailPage.tsx` | 819 | 中 |
| 4 | `AddressEditPage.tsx` | 733 | 中 |
| 5 | `OrdersPoolPage.tsx` | 680 | 中 |
| 6 | `MyOrdersPage.tsx` | 641 | 中 |
| 7 | `OrderComplaintPage.tsx` | 638 | 低 |
| 8 | `CreateOrderPage.tsx` | 636 | 高 |
| 9 | `FormSection.tsx` | 631 | 高 |
| 10 | `DistributionInvitePage.tsx` | 600 | 低 |
| 11 | `EarningsPage.tsx` | 586 | 低 |
| 12 | `UserOrdersPage.tsx` | 586 | 低 |

---

#### 任务 3.2：补全 Image mode 属性（0.5h）

**修复方式**：全局搜索 `<Image` 未指定 `mode` 的地方，添加默认值。

```tsx
// 默认规则
// 头像、封面图 → mode="aspectFill"
// 二维码、图标 → mode="aspectFit"
```

---

### 阶段四：useQuery 批量替换（第 7 天）

#### 任务 4.1：替换 useQuery 为 useState + useEffect（8h）

**替换模板**：

```typescript
// 替换前
const { data, isLoading, error } = useQuery({
  queryKey: ['xxx'],
  queryFn: () => api.getXxx(),
})

// 替换后
const [data, setData] = useState<XxxType | null>(null)
const [isLoading, setIsLoading] = useState(true)
const [isError, setIsError] = useState(false)

useEffect(() => {
  setIsLoading(true)
  setIsError(false)
  
  api.getXxx()
    .then(setData)
    .catch((err) => {
      console.error('[XxxPage] 加载失败:', err)
      setIsError(true)
    })
    .finally(() => setIsLoading(false))
}, [依赖项])
```

**待替换文件清单**（22个）：

- [ ] `workbench/OrderDetailPage.tsx`
- [ ] `workbench/OrdersPoolPage.tsx`
- [ ] `workbench/MyOrdersPage.tsx`
- [ ] `workbench/WorkbenchPage.tsx`
- [ ] `ServicesPage.tsx`
- [ ] `AddressListPage.tsx`
- [ ] `address-edit/AddressEditPage.tsx`
- [ ] `membership/MembershipPage.tsx`
- [ ] `points/PointsPage.tsx`
- [ ] `marketing/referrals/ReferralsPage.tsx`
- [ ] `marketing/points/PointsPage.tsx`
- [ ] `marketing/coupons/CouponsPage.tsx`
- [ ] `distribution/distribution-promotion/DistributionPromotionPage.tsx`
- [ ] `distribution/distribution-records/DistributionRecordsPage.tsx`
- [ ] `distribution/distribution-members/DistributionMembersPage.tsx`
- [ ] `distribution/distribution-invite/DistributionInvitePage.tsx`
- [ ] `distribution/distribution-main/DistributionPage.tsx`
- [ ] `workbench/escort-profile-edit/EscortProfileEditPage.tsx`
- [ ] `workbench/workbench-settings/WorkbenchSettingsPage.tsx`
- [ ] `workbench/ServiceTypesPage.tsx`
- [ ] `service-detail/hooks/useServiceDetailData.ts`
- [ ] `workbench/index.ts`（检查是否有导出）

---

### 阶段五：P2 性能优化（第 8 天）

#### 任务 5.1：添加 React.memo 优化（4h）

**优先优化组件**：

```
components/
├── distribution/
│   ├── distribution-members/components/MemberCard.tsx
│   ├── distribution-records/components/RecordCard.tsx
│   └── distribution-main/components/StatCard.tsx
├── workbench/
│   ├── components/ProfileCard.tsx
│   └── components/QuickEntries.tsx
├── marketing/
│   ├── coupons/components/CouponCard.tsx
│   └── points/components/TaskItem.tsx
└── service-detail/
    └── components/RecommendedServices.tsx
```

---

#### 任务 5.2：处理 TODO 注释（4h）

| TODO | 处理方案 |
|------|----------|
| 签到功能 | 创建 Issue 跟踪 |
| 确认到达/开始服务/完成服务接口 | 需要后端配合，创建 Issue |
| 拍照功能 | 调用小程序 wx.chooseImage API |
| React Query 兼容性 | 已有替代方案，删除 TODO |
| 自定义字段输入弹窗 | 评估需求优先级 |

---

## 📊 进度跟踪表

| 阶段 | 任务 | 预估工时 | 状态 | 完成日期 |
|------|------|----------|------|----------|
| 阶段一 | 1.1 ServicesPage 修复 | 4h | ✅ 完成 | 2024-12-22 |
| 阶段一 | 1.2 输入事件兼容 | 1h | ✅ 完成 | 2024-12-22 |
| 阶段一 | 1.3 OrderDetailPage 拆分 | 6h | ✅ 完成 | 2024-12-22 |
| 阶段二 | 2.1 WorkbenchWithdrawPage 拆分 | 4h | ⏳ 待开始 | - |
| 阶段二 | 2.2 WorkbenchEarningsPage 拆分 | 4h | ⏳ 待开始 | - |
| 阶段二 | 2.3 移除 style 标签 | 2h | ⏳ 待开始 | - |
| 阶段三 | 3.1 中等文件拆分 | 12h | ⏳ 待开始 | - |
| 阶段三 | 3.2 Image mode 补全 | 0.5h | ⏳ 待开始 | - |
| 阶段四 | 4.1 useQuery 替换 | 8h | ⏳ 待开始 | - |
| 阶段五 | 5.1 React.memo 优化 | 4h | ⏳ 待开始 | - |
| 阶段五 | 5.2 TODO 清理 | 4h | ⏳ 待开始 | - |
| **合计** | - | **49.5h** | - | - |

---

## 🔧 修复工具

### 批量替换脚本

```bash
# 查找所有 useQuery 使用
grep -rn "useQuery" src/components/terminal-preview/components/pages --include="*.tsx"

# 查找 className 中的布局类
grep -rE "className=['\"][^'\"]*flex[^'\"]*['\"]" src/components/terminal-preview/components/pages --include="*.tsx"

# 查找缺少 mode 的 Image
grep -rE "<Image[^>]*src=" src/components/terminal-preview/components/pages --include="*.tsx" | grep -v "mode="

# 统计文件行数
find src/components/terminal-preview/components/pages -name "*.tsx" -exec wc -l {} \; | sort -rn
```

### 代码片段模板

```typescript
// 1. useState + useEffect 数据获取模板
const [data, setData] = useState<DataType | null>(null)
const [isLoading, setIsLoading] = useState(true)
const [isError, setIsError] = useState(false)

useEffect(() => {
  let isMounted = true
  
  setIsLoading(true)
  setIsError(false)
  
  api.getData()
    .then((res) => {
      if (isMounted) setData(res)
    })
    .catch((err) => {
      console.error('[Component] 加载失败:', err)
      if (isMounted) setIsError(true)
    })
    .finally(() => {
      if (isMounted) setIsLoading(false)
    })
  
  return () => { isMounted = false }
}, [])

// 2. 重试函数模板
const handleRetry = () => {
  setIsLoading(true)
  setIsError(false)
  
  api.getData()
    .then(setData)
    .catch((err) => {
      console.error('[Component] 重试失败:', err)
      setIsError(true)
    })
    .finally(() => setIsLoading(false))
}
```

---

## ✅ 完成标准

### 阶段一完成标准

- [x] `ServicesPage.tsx` 无 className 布局违规
- [x] 输入事件在小程序中正常工作
- [x] `OrderDetailPage.tsx` 拆分后主文件 418 行（模块化）

### 阶段二完成标准

- [ ] `WorkbenchWithdrawPage.tsx` 拆分后主文件 <400 行
- [ ] `WorkbenchEarningsPage.tsx` 拆分后主文件 <400 行
- [ ] 无 `<style>` 标签残留

### 阶段三完成标准

- [ ] 所有 500+ 行文件已拆分
- [ ] 所有 Image 组件有 mode 属性

### 阶段四完成标准

- [ ] 无 useQuery 使用
- [ ] 所有页面使用 useState + useEffect 获取数据

### 阶段五完成标准

- [ ] 关键列表项组件使用 React.memo
- [ ] 所有 TODO 已处理或转为 Issue

---

## 📝 注意事项

1. **每个任务完成后运行测试**：确保 Web 端功能正常
2. **真机测试优先**：特别是拆分后的页面，需在小程序真机上验证
3. **保持向后兼容**：原有导出路径保持不变（通过重导出实现）
4. **代码审查**：每个阶段完成后进行代码审查

---

*计划制定人：AI Assistant*  
*最后更新：2024-12-22*

