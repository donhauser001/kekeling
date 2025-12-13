# TerminalPreview 系统行为审计报告

> **文档版本**: v1.2  
> **审计日期**: 2024-12-13  
> **修复日期**: 2024-12-13  
> **审计员**: AI 工程审计员  
> **审计类型**: 系统级行为审计（非 UI 交互审计）
> **修复状态**: ✅ P1/P2/P3 问题已全部修复

---

## 审计目标

本任务不是 UI 交互审计，而是对 TerminalPreview 作为"系统级行为模拟器"的**一致性、可解释性与工程语义**进行审计。

核心问题：
> 当前 TerminalPreview 的行为，是否在任何复杂使用路径下仍然是"可理解、可预测、可解释"的？

---

## 审计基准（唯一真源）

| 文档 | 用途 |
|------|------|
| DEV_NOTES.md | 系统定位与工程约束 |
| 01-TerminalPreview集成规格.md | 路由注册表与数据覆盖机制 |
| 02-双身份会话与视角切换规格.md | 双会话模型与 viewerRole 推导 |
| TerminalPreview-UI交互综合审计报告 | 前置结论（不重复 UI 维度） |

---

## SYSTEM 审计总览

| 审计项 | 结论 | 风险等级 | 是否需要治理 | 修复状态 |
|--------|------|----------|--------------|----------|
| SYSTEM-1: 状态 × 路由历史一致性 | ✅ 已修复 | P2 | ~~Later~~ | ✅ 2024-12-13 |
| SYSTEM-2: 页面作为初始 Page 的语义合法性 | ✅ 已修复 | P2 | ~~Later~~ | ✅ 2024-12-13 |
| SYSTEM-3: 数据覆盖优先级 | ✅ 已文档化 | P3 | ~~No（仅文档化）~~ | ✅ 2024-12-13 |
| SYSTEM-4: TerminalPreview 错误边界 | ✅ 已修复 | P1 | ~~Yes~~ | ✅ 2024-12-13 |

**总体判断**: ✅ 当前 TerminalPreview **已具备长期内核稳定性**。P1/P2/P3 治理项已全部完成。

---

## SYSTEM-1｜状态 × 路由的历史一致性

### 核心状态矩阵

```typescript
// index.tsx 状态组成
currentPage: useState(initialPage)           // 当前页面
pageParams: useState({})                     // 路由参数（id 等）
selectedServiceId: useState(null)            // 服务详情页状态
localEscortToken: useState + localStorage    // escortToken（持久化）
effectiveViewerRole: useViewerRole 派生      // 视角角色
showEscortLoginDialog: useState(false)       // 登录弹窗
```

### 两种页面切换方式对比

| 方法 | pageParams 行为 | 使用场景 |
|------|----------------|----------|
| `navigateToPage(page, params)` | **替换/清空** `setPageParams(params ?? {})` | 列表 → 详情 |
| `setCurrentPage(page)` | **不触发** - 参数残留 | onBack、TabBar |

### 审计路径分析

#### 路径 1: 列表 → 详情 → 返回 → 切换模块 → 再进入详情

| 步骤 | 操作 | pageParams 状态 | 判定 |
|------|------|-----------------|------|
| 1 | campaigns → campaigns-detail | `{id: '123'}` | ✅ navigateToPage |
| 2 | campaigns-detail → campaigns (onBack) | `{id: '123'}` ⚠️ | 残留 |
| 3 | campaigns → workbench (TabBar) | `{id: '123'}` ⚠️ | 残留 |
| 4 | workbench → order-detail | `{id: 'abc'}` | ✅ 被覆盖 |

**结论**: 虽然存在 pageParams 残留，但由于 `navigateToPage` 总是覆盖参数，**实际不会导致功能 bug**。

#### 路径 2: 详情页停留状态下切换 viewerRole

| 步骤 | 操作 | effectiveViewerRole | 页面响应 |
|------|------|---------------------|----------|
| 1 | 进入 workbench-order-detail | escort | 显示订单内容 |
| 2 | DebugPanel 清除 escortToken | user | PermissionPrompt |
| 3 | DebugPanel 注入 escortToken | escort | 恢复订单内容 |

**结论**: ✅ effectiveViewerRole 是响应式的，页面状态正确切换。

#### 路径 3: 注入/清除 escortToken 前后跨模块跳转

| 步骤 | 操作 | 状态变化 |
|------|------|----------|
| 1 | distribution → distribution-records | pageParams 更新 |
| 2 | 清除 escortToken | effectiveViewerRole → user |
| 3 | TabBar 切换到 profile | pageParams **残留** |

**结论**: handleExitEscortMode 调用 `setCurrentPage('profile')` 时，pageParams 不被清除。这是**设计缺口**而非**实现缺陷**。

### SYSTEM-1 风险点

| 问题 | 风险等级 | 类型 | 修复状态 |
|------|----------|------|----------|
| onBack 不清理 pageParams | P2 | 设计缺口 | ✅ 已修复 |
| TabBar 切换不清理 pageParams | P2 | 设计缺口 | ✅ 已修复 |
| pageParams 类型无运行时校验 | P3 | 边界情况 | ✅ 2024-12-13 |

### 是否需要治理

**✅ 已完成** - 2024-12-13 修复内容：
- 所有 `onBack` 回调改为使用 `navigateToPage(page)` 替代 `setCurrentPage(page)`
- `handlePageChange`（TabBar 切换）改为使用 `navigateToPage(page)`
- `handleWorkbenchClick` 和 `handleExitEscortMode` 改为使用 `navigateToPage(page)`

修复后，任何页面切换都会自动清空 `pageParams`，消除参数残留风险。

---

## SYSTEM-2｜页面作为"初始 Page"的语义合法性

### 页面分类

| 分类 | 定义 | 示例 |
|------|------|------|
| **entry pages** | 可作为 `page={xxx}` 初始入口 | home, services, membership, workbench |
| **leaf-only pages** | 仅允许导航进入（依赖 pageParams） | campaigns-detail, escort-detail, order-detail |

### 详情页现状审计

| 页面 | 依赖 pageParams | 当前缺 id 处理 | 是否一致 | 修复状态 |
|------|----------------|----------------|----------|----------|
| `campaigns-detail` | `pageParams.id` | ✅ 友好提示 "未指定活动" | 一致 | - |
| `escort-detail` | `pageParams.id` | ✅ 友好提示 "未指定陪诊员" | 一致 | - |
| `workbench-order-detail` | `pageParams?.id` | ✅ 友好提示 "未指定订单" | 一致 | ✅ 2024-12-13 |

### 管理后台使用审计

| 文件 | 用法 | 问题 |
|------|------|------|
| `escorts-action-dialog.tsx` | `page={isEdit ? 'escort-detail' : 'escort-list'}` | 无 pageParams |
| `campaigns-action-dialog.tsx` | `page={isEdit ? 'campaigns-detail' : 'campaigns'}` | 无 pageParams |

**分析**: 这些对话框用 `escort-detail` / `campaigns-detail` 作为初始页面，但不传 `id`。页面会显示"未指定 xxx"的友好提示。这是**可接受的权宜之计**，因为：
1. 对话框场景下，预览器主要展示 UI 结构而非真实数据
2. 友好提示已存在，不会造成白屏

### SYSTEM-2 风险点

| 问题 | 风险等级 | 类型 | 修复状态 |
|------|----------|------|----------|
| OrderDetailPage 使用 mock id 而非友好提示 | P2 | 实现不一致 | ✅ 已修复 |
| 无系统级页面分类元数据 | P3 | 设计缺失 | ✅ 2024-12-13 |

### 是否需要治理

**✅ 已完成** - 2024-12-13 修复内容：
1. `OrderDetailPage` 移除 `mock-order-001` 兜底逻辑
2. 添加与 `CampaignDetailPage` / `EscortDetailPage` 一致的友好提示
3. 无 id 时显示「未指定订单」+ 返回按钮，不发 API 请求

所有详情页现在行为一致：缺 id 时显示友好提示，不使用 mock 数据。

---

## SYSTEM-3｜数据覆盖与数据来源的优先级规则

### 当前隐含优先级

```typescript
// 合并逻辑（01-TerminalPreview集成规格.md 4.2 节）
const finalData = { ...defaultSettings, ...fetchedSettings, ...override }

// 优先级：
// 1. Props Override（最高）- themeSettingsOverride, marketingData 等
// 2. API 返回数据（中）- previewApi.* 获取
// 3. 默认值（最低）- defaultThemeSettings 等
```

### API Mock 降级规则

| 通道 | 条件 | 行为 |
|------|------|------|
| userRequest | API 返回 404/500 | 降级到 mock 数据 |
| escortRequest | `escortToken?.startsWith('mock-')` | **直接返回 mock，不调真实 API** |
| escortRequest | 真实 token + API 404/500 | 降级到 mock 数据 |
| escortRequest | 无 token | 部分函数返回 mock，部分抛错 |

### autoLoad 行为

| autoLoad | API 数据 | 最终数据源 |
|----------|----------|------------|
| `true` | 尝试获取 | override > fetched > default |
| `false` | 不获取 | override > default |

### SYSTEM-3 风险点

| 问题 | 风险等级 | 影响 | 修复状态 |
|------|----------|------|----------|
| autoLoad=false 时只有 default，可能与真实端不一致 | P3 | 预览偏差 | ✅ 已文档化 |
| 数据优先级规则分散在代码各处，无统一文档 | P3 | 可维护性 | ✅ 已文档化 |

### 是否需要治理

**✅ 已完成** - 2024-12-13 文档化内容：
- 在 DEV_NOTES.md 新增「数据覆盖优先级规则」章节
- 明确三层优先级：Props Override > API 返回 > 默认值
- 说明 6 种数据类型的覆盖规则
- 明确 `autoLoad=true/false` 的预期使用场景
- 添加 Mock 降级规则说明

---

## SYSTEM-4｜TerminalPreview 自身的错误边界

### 异常场景审计

| 场景 | 当前行为 | 风险等级 |
|------|----------|----------|
| page key 不存在 | `default: return renderHomePage()` - 静默降级 | P3 |
| pageParams 缺失 | 各页面自行处理（不统一） | P2 |
| pageParams 类型错误 | 无运行时校验，透传给子组件 | P3 |
| viewerRole 不匹配 | PermissionPrompt 阻断 | ✅ |
| 页面组件抛出错误 | **无 ErrorBoundary - 整个预览器崩溃** | P1 |
| Suspense lazy 加载失败 | 仅有 fallback，无错误恢复 | P2 |

### 代码证据

```typescript
// index.tsx - ✅ 已添加 ErrorBoundary 包裹
<PreviewErrorBoundary
  onReset={() => navigateToPage('home')}
  themeSettings={themeSettings}
  isDarkMode={isDarkMode}
>
  <Suspense fallback={<PageLoadingSkeleton isDarkMode={isDarkMode} />}>
    {renderPageContent()}
  </Suspense>
</PreviewErrorBoundary>

// switch 语句 - 静默降级到首页
switch (currentPage) {
  // ... cases ...
  case 'home':
  default:
    return renderHomePage()
}
```

### SYSTEM-4 风险点

| 问题 | 风险等级 | 影响 | 修复状态 |
|------|----------|------|----------|
| 无系统级 ErrorBoundary | **P1** | 单页面错误导致整个预览器白屏 | ✅ 已修复 |
| 未知 page key 无警告 | P3 | 开发调试困难 | ✅ 2024-12-13 |
| pageParams 处理不统一 | P2 | 代码一致性 | ✅ 已修复 |

### 是否需要治理

**✅ 已完成** - 2024-12-13 实现内容：

新增 `PreviewErrorBoundary` 组件（`src/components/terminal-preview/components/PreviewErrorBoundary.tsx`）：
1. ✅ 捕获渲染错误，显示友好错误 UI
2. ✅ 提供「重试」按钮（重置错误状态）
3. ✅ 提供「返回首页」按钮（调用 `onReset` 回调）
4. ✅ 开发环境下显示完整错误堆栈（`componentDidCatch` 输出）

同时修复了 14 个页面的 42 处数值调用，防止 `toFixed` / `toLocaleString` 因 null/undefined 导致崩溃。

---

## 总体判断

### 当前 TerminalPreview 是否已具备"长期内核稳定性"？

**✅ 是，P1/P2 问题已全部修复**

| 维度 | 评估 |
|------|------|
| 状态可预测性 | ✅ 完全可预测，pageParams 在任何页面切换时自动清空 |
| 数据一致性 | ✅ 优先级规则合理，需文档化 |
| 错误恢复 | ✅ 已添加 PreviewErrorBoundary，单页面错误不会击穿整个预览器 |
| 可扩展性 | ✅ 页面分类清晰，路由机制成熟 |

### 治理建议优先级

| 优先级 | 建议 | 类型 | 预估工时 | 修复状态 |
|--------|------|------|----------|----------|
| **P1** | 添加系统级 ErrorBoundary | 实现 | 2h | ✅ 2024-12-13 |
| P2 | 统一详情页缺 id 处理 | 实现 | 1h | ✅ 2024-12-13 |
| P2 | navigateToPage 重构为清理旧 params | 实现 | 1h | ✅ 2024-12-13 |
| P3 | 文档化数据优先级规则 | 规范 | 0.5h | ✅ 2024-12-13 |
| P3 | 开发环境未知 page key 警告 | 实现 | 0.5h | ✅ 2024-12-13 |

---

## 附录 A：状态自洽路径示例

### ✅ 自洽路径 1：正常列表-详情-返回流程

```
home → campaigns (TabBar)
     → campaigns-detail (navigateToPage, id='123')
     → campaigns (onBack)
     → home (TabBar)
```

状态变化：
- currentPage: home → campaigns → campaigns-detail → campaigns → home
- pageParams: {} → {} → {id:'123'} → {id:'123'} → {id:'123'}（残留但无害）
- effectiveViewerRole: user（始终）

**结论**: 用户操作路径可线性解释。

### ✅ 自洽路径 2：viewerRole 切换场景

```
profile → workbench (点击工作台入口)
        → (DebugPanel 注入 escortToken)
        → effectiveViewerRole: user → escort
        → workbench 显示完整内容
        → (DebugPanel 清除 escortToken)
        → effectiveViewerRole: escort → user
        → profile (handleExitEscortMode 自动跳转)
```

**结论**: viewerRole 变化与页面响应一致，状态变化可追溯。

### ⚠️ 依赖隐含假设的路径：跨模块 pageParams 残留

```
campaigns → campaigns-detail (id='123')
          → home (TabBar)
          → escort-list
          → escort-detail (navigateToPage, id='abc')
```

此时 pageParams 从 `{id:'123'}` 变为 `{id:'abc'}`。

如果某个不期望 pageParams 的页面（如 home）意外读取 `pageParams.id`，会得到残留值。

**当前实际风险**: 低。因为：
1. 现有代码中只有详情页读取 pageParams
2. 详情页都通过 navigateToPage 设置新值

**潜在风险**: 如果未来添加新页面时误用 pageParams，可能产生难以追踪的 bug。

---

## 附录 B：相关代码引用

### navigateToPage 定义

```209:212:src/components/terminal-preview/index.tsx
const navigateToPage = useCallback((page: string, params?: Record<string, string>) => {
  setCurrentPage(page as typeof currentPage)
  setPageParams(params ?? {})
}, [])
```

### onBack 示例（不清理 pageParams）

```516:517:src/components/terminal-preview/index.tsx
campaignId={pageParams.id}
onBack={() => setCurrentPage('campaigns')}
```

### default case 降级

```680:683:src/components/terminal-preview/index.tsx
case 'home':
default:
  return renderHomePage()
```

---

**审计完成时间**: 2024-12-13  
**修复完成时间**: 2024-12-13  
**修复验收**: ✅ P1/P2 治理项已全部完成

### 修复清单（2024-12-13）

| 类别 | 修复项 | 修改文件 |
|------|--------|---------|
| **SYSTEM-4** | 添加 PreviewErrorBoundary 组件 | `components/PreviewErrorBoundary.tsx` (新增) |
| **SYSTEM-4** | 集成 ErrorBoundary 到主入口 | `index.tsx` |
| **SYSTEM-4** | 添加数值安全工具函数 | `utils.ts` |
| **SYSTEM-4** | 修复 14 个页面的 42 处数值调用 | 见下方详细清单 |
| **SYSTEM-1** | 统一所有 onBack 使用 navigateToPage | `index.tsx` |
| **SYSTEM-1** | handlePageChange 改用 navigateToPage | `index.tsx` |
| **SYSTEM-2** | OrderDetailPage 缺 id 友好提示 | `OrderDetailPage.tsx` |
| **SYSTEM-2** | OrdersPool → OrderDetail 导航入口 | `OrdersPoolPage.tsx` |

**数值安全修复详细清单**:
- `WorkbenchEarningsPage.tsx` (4处)
- `WorkbenchPage.tsx` (3处)
- `OrderDetailPage.tsx` (3处)
- `EarningsPage.tsx` (6处)
- `WorkbenchWithdrawPage.tsx` (7处)
- `WithdrawPage.tsx` (4处)
- `DistributionPage.tsx` (3处)
- `DistributionMembersPage.tsx` (1处)
- `DistributionInvitePage.tsx` (2处)
- `DistributionPromotionPage.tsx` (3处)
- `DistributionRecordsPage.tsx` (1处)
- `ServicesPage.tsx` (2处)
- `ServiceDetailPage.tsx` (2处)

### P3 修复清单（2024-12-13 Batch 1）

| 类别 | 修复项 | 修改文件 |
|------|--------|---------|
| **SYSTEM-3** | 文档化数据优先级规则 | `DEV_NOTES.md` (新增章节) |
| **SYSTEM-4** | 开发环境未知 page key 警告 | `types.ts` + `index.tsx` |
| **SYSTEM-4** | 文档化开发调试功能 | `DEV_NOTES.md` (新增章节) |

**具体修改**:
- `types.ts`: 新增 `VALID_PAGE_KEYS` 常量数组（27 个 page key）
- `index.tsx`: `renderPageContent()` 添加开发环境校验
- `DEV_NOTES.md`: 新增「数据覆盖优先级规则」章节
- `DEV_NOTES.md`: 新增「开发环境调试功能」章节

### P3 修复清单（2024-12-13 Batch 2）

| 类别 | 修复项 | 修改文件 |
|------|--------|---------|
| **SYSTEM-1** | pageParams 类型运行时校验 | `types.ts` + `utils.ts` + `index.tsx` |
| **SYSTEM-2** | 页面分类元数据 PAGE_METADATA | `types.ts` + `utils.ts` + `index.tsx` |

**具体修改**:
- `types.ts`: 扩展 `PreviewPageParamsMap` 接口（27 个页面参数类型）
- `types.ts`: 新增 `PAGES_REQUIRING_PARAMS` 常量（需要必填参数的页面）
- `types.ts`: 新增 `PageMetadata` 接口和 `PAGE_METADATA` 常量（27 个页面元数据）
- `utils.ts`: 新增 `validatePageParams()` 函数（校验 navigateToPage 参数）
- `utils.ts`: 新增 `validateInitialPage()` 函数（校验初始页面入口）
- `index.tsx`: `navigateToPage` 集成参数校验
- `index.tsx`: 组件初始化时校验初始页面
- `DEV_NOTES.md`: 新增「类型安全与运行时校验」章节
