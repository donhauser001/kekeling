# Step 11 任务卡拆解（v3.0 唯一真源对齐）

> **对齐文档**: `DEV_NOTES.md` v3.0  
> **执行顺序**: 11.0-G → 11.1 → 11.2 → 11.3 → 11.4 → 11.5（禁止跳步）  
> **安全护栏**: 分销中心所有 API 必须 `escortRequest`，禁止 `userRequest`

---

## 开工流水线（禁止跳步）

```
CARD 11.0-G  护栏脚本（可选但推荐）        ← 把安全护栏变成可执行约束
     ↓
CARD 11.1-A  types.ts + PreviewPage keys   ← 先锁编译
     ↓
CARD 11.2-A  previewApi 五个方法           ← 先跑通 mock + escortRequest
     ↓
CARD 11.3-A  distribution + distribution-members  ← 权限壳 + 两页骨架
     ↓
CARD 11.4-A  distribution-records + distribution-invite
     ↓
CARD 11.5-A  distribution-promotion
```

---

## CARD 11.0-G: Distribution 模块护栏与回归检查（可选）

### 目标

把散落在 Review Checklist 里的 grep 收敛成可复用脚本，避免每个 PR 都手动敲命令。

### 范围

**1. 新增脚本 `scripts/check-distribution-guardrails.sh`**

```bash
#!/bin/bash
set -e

echo "🔍 检查分销中心护栏..."

# 1. 禁用路径检查
echo "  [1/4] 检查禁用路径..."
if grep -r "escort/distribution" --include="*.ts" --include="*.tsx" src/; then
  echo "❌ 发现禁用路径: escort/distribution（应为 escort-app/distribution）"
  exit 1
fi
if grep -r "escort-app/team" --include="*.ts" --include="*.tsx" src/; then
  echo "❌ 发现禁用路径: escort-app/team"
  exit 1
fi
if grep -r "distribution/team-members" --include="*.ts" --include="*.tsx" src/; then
  echo "❌ 发现禁用路径: distribution/team-members（应为 distribution/members）"
  exit 1
fi
echo "  ✅ 禁用路径检查通过"

# 2. 通道检查
echo "  [2/4] 检查 userRequest 误用..."
if grep -r "userRequest" --include="*distribution*.ts" --include="*Distribution*.tsx" src/; then
  echo "❌ 分销相关文件中发现 userRequest（应为 escortRequest）"
  exit 1
fi
echo "  ✅ 通道检查通过"

# 3. promotionProgress 误用检查
echo "  [3/4] 检查 promotionProgress 误用..."
if grep -r "!promotionProgress" --include="*.tsx" src/; then
  echo "❌ 发现 !promotionProgress 误用（0 会被当 falsy）"
  exit 1
fi
echo "  ✅ promotionProgress 检查通过"

# 4. PermissionPrompt 一致性（仅提示，不阻断）
echo "  [4/4] 检查 PermissionPrompt 使用情况..."
grep -r "PermissionPrompt" --include="*Distribution*.tsx" src/ || echo "  ⚠️ 未找到 PermissionPrompt 使用"

echo ""
echo "✅ 所有护栏检查通过！"
```

**2. package.json 增加 script**

```json
{
  "scripts": {
    "check:distribution": "bash scripts/check-distribution-guardrails.sh"
  }
}
```

### 验收标准（DoD）

- [x] 脚本存在且可执行
- [x] `npm run check:distribution` 能一键跑并给出明确失败原因
- [x] 违规时 exit 1，通过时 exit 0

---

## CARD 11.1-A: types.ts 增量与 PreviewPage keys 上锁

### 目标

先锁编译，确保 page key 唯一，避免"页面写完才发现 key 没加"的返工。

### 范围

**1. PreviewPage 增加 5 个 page key**

```typescript
// types.ts - PreviewPage 联合类型增量
| 'distribution'
| 'distribution-members'
| 'distribution-records'
| 'distribution-invite'
| 'distribution-promotion'
```

**2. 新增分销中心类型**

| 类型 | 说明 |
|------|------|
| `DistributionStats` | 分销统计 |
| `DistributionMember` | 团队成员 |
| `DistributionRecord` | 分润记录 |
| `DistributionInvite` | 邀请信息 |
| `DistributionPromotion` | 晋升信息 |

**3. 字段规范硬约束**

| 字段 | 规范 | 说明 |
|------|------|------|
| `phone` | `138****8888` | 11 位手机号脱敏格式 |
| `promotionProgress` | `number \| undefined` | `undefined` = 不适用，`0` = 适用但没进度 |
| `amount` / `totalDistribution` 等金额字段 | `number` | **单位：元，保留两位小数** |

⚠️ **金额单位约定**：所有金额字段统一使用 **元（保留两位小数）**，前后端必须对齐，避免"一个分一个元"的事故。

**4. 路由参数类型化（PreviewPageParamsMap）**

```typescript
// types.ts - 路由参数强约束
export interface PreviewPageParamsMap {
  'distribution': {}
  'distribution-members': { relation?: 'direct' | 'indirect' }
  'distribution-records': { range?: '7d' | '30d' | 'all'; status?: 'pending' | 'settled' }
  'distribution-invite': {}
  'distribution-promotion': {}
}

// navigateToPage 泛型签名（减少写错 key / 写错 params）
function navigateToPage<P extends keyof PreviewPageParamsMap>(
  page: P,
  params?: PreviewPageParamsMap[P]
): void
```

### 验收标准（DoD）

- [x] TypeScript 编译通过
- [x] 5 个 page key 在 `PreviewPage` 联合类型中可用
- [x] `PreviewPageParamsMap` 定义完成
- [x] `navigateToPage` 支持泛型约束
- [x] 任意 UI 使用 `promotionProgress` 时不得写 `if (!promotionProgress)` 这类会吞掉 0 的逻辑

### 🔍 Review Checklist

```bash
# promotionProgress 误用检查
grep -r "!promotionProgress" --include="*.tsx"
grep -r "promotionProgress ?" --include="*.tsx"
```

---

## CARD 11.2-A: previewApi 分销中心 5 个方法

### 目标

先跑通"mock + escortRequest"的 API 闭环，保证预览器可用且权限边界不被破坏。

### 硬约束

| 约束 | 说明 |
|------|------|
| **路径前缀** | 必须是 `/escort-app/distribution/**` |
| **通道强制** | 必须 `escortRequest`，禁止 `userRequest` |

**🚫 禁止出现的路径**

```
/escort/distribution/*           ← 缺少 -app 后缀
/escort-app/team/*               ← 避免与 team controller 混淆
/escort-app/distribution/team-members  ← 冗余命名
```

### 需要实现的方法（含参数签名）

| 方法 | 路径 | 参数签名 |
|------|------|----------|
| `getDistributionStats()` | `/escort-app/distribution/stats` | 无参数 |
| `getDistributionMembers(params?)` | `/escort-app/distribution/members` | `{ relation?, page?, pageSize? }` |
| `getDistributionRecords(params?)` | `/escort-app/distribution/records` | `{ range?, status?, page?, pageSize? }` |
| `getDistributionInviteCode()` | `/escort-app/distribution/invite-code` | 无参数 |
| `getDistributionPromotion()` | `/escort-app/distribution/promotion` | 无参数 |

**分页与筛选参数约定（先锁签名，后续扩展不破坏调用方）**

```typescript
interface DistributionMembersParams {
  relation?: 'direct' | 'indirect'
  page?: number      // 默认 1
  pageSize?: number  // 默认 20
}

interface DistributionRecordsParams {
  range?: '7d' | '30d' | 'all'       // 默认 'all'
  status?: 'pending' | 'settled'     // 默认全部
  page?: number
  pageSize?: number
}
```

### 实现模式（必须对齐工作台）

```typescript
getDistributionXxx: async (params?) => {
  const escortToken = getEscortToken()

  // 1. 无 token → 返回 mock
  if (!escortToken) {
    return getMockDistributionXxx()
  }

  // 2. mock token → 直接 mock，不打后端
  if (escortToken.startsWith('mock-')) {
    return getMockDistributionXxx()
  }

  // 3. 真实 token
  try {
    return await escortRequest<DistributionXxx>('/escort-app/distribution/xxx', { params })
  } catch (error) {
    // 404/500 → 降级 mock
    if (error instanceof ApiError && [404, 500].includes(error.status)) {
      return getMockDistributionXxx()
    }
    // 其他错误 → 抛出（按现有 ApiError 体系处理）
    throw error
  }
}
```

### 验收标准（DoD）

- [x] TypeScript 编译通过
- [x] 5 个方法均满足 mock token 规则
- [x] 任意方法都不出现 `fetch/axios` 直调（必须走 `escortRequest`）
- [x] `getDistributionMembers` / `getDistributionRecords` 参数签名已锁定

### 🔍 Review Checklist

```bash
# API 路径黑名单
grep -r "escort/distribution" --include="*.ts" --include="*.tsx"
grep -r "escort-app/team" --include="*.ts" --include="*.tsx"
grep -r "distribution/team-members" --include="*.ts" --include="*.tsx"

# 通道黑名单
grep -r "userRequest" --include="*distribution*.ts"
```

---

## CARD 11.3-A: 分销中心页面批次 A

### 目标

先做入口页和成员列表，跑通权限壳 + 两页骨架 + 查询 enabled gating。

### 页面

| 页面 | 文件 | page key |
|------|------|----------|
| 分销中心首页 | `DistributionPage.tsx` | `distribution` |
| 团队成员列表 | `DistributionMembersPage.tsx` | `distribution-members` |

### 权限与组件规范（强制）

**1. PermissionPrompt 强制复用**

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

// ❌ 禁止：每页自定义提示 UI
```

**2. Query enabled gating 强制**

```typescript
const { data, isLoading } = useQuery({
  queryKey: ['preview', 'distribution', 'stats'],
  queryFn: () => previewApi.getDistributionStats(),
  enabled: isEscort, // ⚠️ 关键：非 escort 不发请求
})
```

### 页面级一致性约束（照搬工作台）

| 约束 | 说明 |
|------|------|
| **标题栏** | 必须有返回按钮，回到 `distribution` 或上一页 |
| **空态** | 无数据时不报错，显示空态组件 |
| **错误态** | 非 404/500 的 `ApiError` 也要可视化（提示 + 重试按钮） |

### 验收标准（DoD）

- [x] `renderPageContent()` 增加 `distribution` / `distribution-members` case
- [x] 非 escort 视角：只渲染 `PermissionPrompt`，不触发任何分销 API
- [x] escort 视角：能加载 mock 或真实数据并正常展示列表/空态/错误态
- [x] `distribution-members` 支持 `relation` 筛选（`direct` / `indirect`）
- [x] 标题栏有返回按钮
- [x] 空态组件存在且可用
- [x] 错误态有提示 + 重试按钮

### 🔍 Review Checklist

```bash
# 权限提示一致性
grep -r "PermissionPrompt" --include="*Distribution*.tsx"

# 通道黑名单
grep -r "userRequest" --include="*Distribution*.tsx"
```

---

## CARD 11.4-A: 分销中心页面批次 B

### 页面

| 页面 | 文件 | page key |
|------|------|----------|
| 分润记录 | `DistributionRecordsPage.tsx` | `distribution-records` |
| 邀请页面 | `DistributionInvitePage.tsx` | `distribution-invite` |

### 路由参数规范（已类型化）

```typescript
// 使用 navigateToPage 泛型，TS 会自动校验 params
navigateToPage('distribution-records', { range: '7d', status: 'pending' })
```

### DistributionRecordsPage 要点

- 支持路由参数：`range`, `status`
- 筛选参数变化触发 `queryKey` 变化（避免手动 `refetch` 乱飞）
- 金额显示单位：元（保留两位小数）

### DistributionInvitePage 要点

- 展示字段：邀请码、链接、二维码（如有）、累计邀请数、每次奖励

### 页面级一致性约束

| 约束 | 说明 |
|------|------|
| **标题栏** | 必须有返回按钮 |
| **空态** | 无数据时显示空态组件 |
| **错误态** | 提示 + 重试按钮 |

### 验收标准（DoD）

- [x] `renderPageContent()` 增加 `distribution-records` / `distribution-invite` case
- [x] 非 escort：`PermissionPrompt` + 不发请求
- [x] escort：`records` 支持筛选参数变化触发 `queryKey` 变化
- [x] 标题栏有返回按钮
- [x] 空态组件存在且可用
- [x] 错误态有提示 + 重试按钮

### 🔍 Review Checklist

```bash
# 权限提示一致性
grep -r "PermissionPrompt" --include="*DistributionRecords*.tsx" --include="*DistributionInvite*.tsx"

# 通道黑名单
grep -r "userRequest" --include="*DistributionRecords*.tsx" --include="*DistributionInvite*.tsx"
```

---

## CARD 11.5-A: 分销中心页面批次 C

### 页面

| 页面 | 文件 | page key |
|------|------|----------|
| 晋升进度 | `DistributionPromotionPage.tsx` | `distribution-promotion` |

### DistributionPromotionPage 要点

- 展示字段：`currentLevel`, `nextLevel`, `requirements`, `benefits`, `commissionRate`
- **进度条必须正确处理**：
  - `promotionProgress = 0`：显示 0% 进度条
  - `promotionProgress = undefined`：不显示进度条或显示"不适用"
- 支持"无 nextLevel"场景（已达最高级）

### 页面级一致性约束

| 约束 | 说明 |
|------|------|
| **标题栏** | 必须有返回按钮 |
| **空态** | 无 nextLevel 时显示"已达最高级"提示 |
| **错误态** | 提示 + 重试按钮 |

### 验收标准（DoD）

- [x] `renderPageContent()` 增加 `distribution-promotion` case
- [x] 非 escort：`PermissionPrompt` + 不发请求
- [x] escort：能展示"无 nextLevel"场景（已达最高级）与"requirements 列表"场景
- [x] 进度条正确区分 `0` 与 `undefined`
- [x] 标题栏有返回按钮
- [x] 错误态有提示 + 重试按钮

### 🔍 Review Checklist

```bash
# 权限提示一致性
grep -r "PermissionPrompt" --include="*DistributionPromotion*.tsx"

# 通道黑名单
grep -r "userRequest" --include="*DistributionPromotion*.tsx"

# promotionProgress 误用检查
grep -r "!promotionProgress" --include="*DistributionPromotion*.tsx"
grep -r "promotionProgress ?" --include="*DistributionPromotion*.tsx"
```

---

## 📊 Mock 数据覆盖矩阵

确保 mock 数据覆盖关键分支，减少"页面写完但没法验证分支"的调试成本。

### Stats

| 场景 | `promotionProgress` | 覆盖 |
|------|---------------------|------|
| 有进度 | `42` | ✅ 必须 |
| 零进度 | `0` | ✅ 必须 |
| 不适用 | `undefined` | 可选 |

### Members

| 场景 | 数量 | 覆盖 |
|------|------|------|
| 直属成员 | 2 条 | ✅ 必须 |
| 间接成员 | 2 条 | ✅ 必须 |

### Records

| 场景 | 数量 | 覆盖 |
|------|------|------|
| `status: 'pending'` | 2 条 | ✅ 必须 |
| `status: 'settled'` | 2 条 | ✅ 必须 |
| 有 `orderNo` | 2 条 | ✅ 必须 |
| 无 `orderNo` | 1 条 | ✅ 必须 |

### Promotion

| 场景 | `nextLevel` | 覆盖 |
|------|-------------|------|
| 可晋升 | 有值 + requirements | ✅ 必须 |
| 已达最高级 | `undefined` | ✅ 必须 |

---

## 📋 任务卡总览

| 卡片 | 内容 | 依赖 | 预估 |
|------|------|------|------|
| **11.0-G** | 护栏脚本 | 无 | 0.5h |
| **11.1-A** | types.ts + PreviewPage keys + ParamsMap | 无 | 1h |
| **11.2-A** | previewApi 5 个方法 | 11.1-A | 1.5h |
| **11.3-A** | distribution + distribution-members | 11.2-A | 2h |
| **11.4-A** | distribution-records + distribution-invite | 11.3-A | 2h |
| **11.5-A** | distribution-promotion | 11.4-A | 1.5h |

**总预估**: 8.5h（不含 Review 和 QA）
