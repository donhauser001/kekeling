# 后台陪诊员提现模块 - API 接口契约

> **版本**: v1.0  
> **适用范围**: Admin Console  
> **关联文档**: [01-资金域总设计图.md](./01-资金域总设计图.md) · [03-任务卡拆解.md](./03-任务卡拆解.md) · [04-P2审核打款设计.md](./04-P2审核打款设计.md)  
> **资金真源**: 后台（仅 Admin 可写状态）  
> **强约束**: 状态机 + 审计日志

---

## 1. 基础约定

### 1.1 统一前缀

```
/admin/escorts/**
```

### 1.2 权限 Header

```http
Authorization: Bearer <adminToken>
X-Admin-Role: finance | superadmin | ops
```

### 1.3 通用响应格式

```typescript
// 成功响应
interface SuccessResponse<T> {
  code: 0
  data: T
  message?: string
}

// 错误响应
interface ErrorResponse {
  code: number
  message: string
  details?: Record<string, string>  // 字段级错误
}
```

---

## 2. 提现记录列表（P0）

### 请求

```http
GET /admin/escorts/withdraw-records
```

### Query 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `page` | number | 否 | 默认 1 |
| `pageSize` | number | 否 | 默认 20，最大 100 |
| `status` | enum | 否 | `pending`/`approved`/`processing`/`completed`/`failed`/`rejected` |
| `dateRange` | enum | 否 | `7d`/`30d` |
| `startDate` | string | 否 | 自定义开始日期 YYYY-MM-DD |
| `endDate` | string | 否 | 自定义结束日期 YYYY-MM-DD |
| `escortId` | string | 否 | 精确匹配陪诊员 ID |
| `keyword` | string | 否 | 提现单号/手机号(脱敏)/交易号 |

### 响应

```typescript
interface WithdrawRecordListResponse {
  items: WithdrawRecordListItem[]
  total: number
  page: number
  pageSize: number
}

interface WithdrawRecordListItem {
  id: string                    // 提现记录 ID
  withdrawNo: string            // 提现单号 WD202412120001
  escortId: string              // 陪诊员 ID
  escortName: string            // 陪诊员姓名
  phone: string                 // 手机号（脱敏）138****8888
  amount: number                // 提现金额
  fee: number                   // 手续费
  netAmount: number             // 实际到账
  status: WithdrawStatus        // 状态
  accountType: 'bank' | 'alipay' | 'wechat'
  accountMasked: string         // 账户（脱敏）****6789
  createdAt: string             // 申请时间 ISO8601
  riskFlag?: 'normal' | 'manual_check'  // [P2 预留] 风险标记，用于审核时高亮
}
```

### 响应示例

```json
{
  "code": 0,
  "data": {
    "items": [
      {
        "id": "wd_123",
        "withdrawNo": "WD202412120001",
        "escortId": "esc_001",
        "escortName": "王小明",
        "phone": "138****8888",
        "amount": 500,
        "fee": 0,
        "netAmount": 500,
        "status": "processing",
        "accountType": "bank",
        "accountMasked": "****6789",
        "createdAt": "2024-12-12T10:30:00Z"
      }
    ],
    "total": 128,
    "page": 1,
    "pageSize": 20
  }
}
```

### 后端校验

| 校验项 | 规则 | 错误码 |
|--------|------|--------|
| `pageSize` | ≤ 100 | 422 |
| `keyword` | 长度 ≤ 50 | 422 |
| `status` | 必须在枚举内 | 422 |
| `dateRange` + 自定义日期 | 互斥 | 422 |

---

## 3. 提现记录详情（P1）

### 请求

```http
GET /admin/escorts/withdraw-records/:id
```

### 响应

```typescript
interface WithdrawRecordDetailResponse {
  id: string
  withdrawNo: string
  
  escort: {
    id: string
    name: string
    phone: string              // 脱敏
  }
  
  amount: number
  fee: number
  netAmount: number
  
  status: WithdrawStatus
  failReason?: string          // 仅 rejected/failed 时有值
  
  account: {
    type: 'bank' | 'alipay' | 'wechat'
    bankName?: string
    accountMasked: string      // 脱敏
  }
  
  transactionNo?: string       // 第三方交易号
  channelResponse?: string     // 渠道回执（脱敏）
  
  createdAt: string
  approvedAt?: string
  paidAt?: string
  
  logs: WithdrawLog[]          // 操作日志
}

interface WithdrawLog {
  action: 'CREATE' | 'APPROVE' | 'REJECT' | 'PAY_START' | 'PAY_SUCCESS' | 'PAY_FAIL'
  operatorType: 'system' | 'admin'
  operatorName: string
  message?: string
  createdAt: string
}
```

### 响应示例

```json
{
  "code": 0,
  "data": {
    "id": "wd_123",
    "withdrawNo": "WD202412120001",
    "escort": {
      "id": "esc_001",
      "name": "王小明",
      "phone": "138****8888"
    },
    "amount": 500,
    "fee": 0,
    "netAmount": 500,
    "status": "failed",
    "failReason": "银行卡信息不匹配",
    "account": {
      "type": "bank",
      "bankName": "招商银行",
      "accountMasked": "****6789"
    },
    "transactionNo": "TXN20241212XXXX",
    "createdAt": "2024-12-12T10:30:00Z",
    "approvedAt": "2024-12-12T11:00:00Z",
    "paidAt": null,
    "logs": [
      {
        "action": "CREATE",
        "operatorType": "system",
        "operatorName": "system",
        "message": "陪诊员提交提现申请",
        "createdAt": "2024-12-12T10:30:00Z"
      },
      {
        "action": "PAY_FAIL",
        "operatorType": "system",
        "operatorName": "system",
        "message": "银行卡信息不匹配",
        "createdAt": "2024-12-12T11:20:00Z"
      }
    ]
  }
}
```

---

## 4. 导出接口（P1）

### 请求

```http
GET /admin/escorts/withdraw-records/export?format=csv
```

### Query 参数

与列表接口完全一致，额外增加：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `format` | enum | 是 | `csv` / `xlsx` |

### 响应

- **Content-Type**: `text/csv; charset=utf-8` 或 `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **Content-Disposition**: `attachment; filename="withdraw_records_20241212.csv"`

### 导出字段

| 列名 | 字段 | 说明 |
|------|------|------|
| 提现单号 | withdrawNo | |
| 陪诊员姓名 | escortName | |
| 陪诊员ID | escortId | |
| 手机号 | phone | 脱敏 |
| 提现金额 | amount | |
| 手续费 | fee | |
| 实际到账 | netAmount | |
| 提现方式 | accountType | 中文：银行卡/支付宝/微信 |
| 账户 | accountMasked | 脱敏 |
| 状态 | status | 中文状态名 |
| 申请时间 | createdAt | |
| 打款时间 | paidAt | |

### 审计要求（强制）

每次导出**必须**写 `ADMIN_AUDIT_LOG`：

```typescript
{
  action: 'EXPORT_WITHDRAW_RECORDS',
  adminId: string,
  filters: object,      // 筛选条件
  exportCount: number,  // 导出条数
  format: 'csv' | 'xlsx',
  createdAt: string
}
```

---

## 5. 陪诊员详情页 Tab（P1）

### 请求

```http
GET /admin/escorts/:escortId/withdraw-records
```

### 说明

- 逻辑同列表接口
- **强制** `escortId` 过滤，不可移除
- 禁止跨 Escort 查询
- 响应格式与列表接口一致

---

## 6. 错误码规范

| HTTP 状态码 | 业务码 | 含义 |
|------------|--------|------|
| 401 | 10401 | 未登录 / Token 过期 |
| 403 | 10403 | 无权限（缺少 `withdraw.read` 等） |
| 404 | 10404 | 提现记录不存在 |
| 409 | 10409 | 状态冲突（非法状态机跳转） |
| 422 | 10422 | 参数校验失败 |
| 500 | 10500 | 系统错误 |

### 错误响应示例

```json
{
  "code": 10422,
  "message": "参数校验失败",
  "details": {
    "pageSize": "不能超过 100"
  }
}
```

---

## 7. 状态机规则

### 状态流转（后端强制校验）

```
pending
  ├── approved  (Admin 审核通过)
  │     └── processing  (Admin 发起打款)
  │           ├── completed  (渠道成功)
  │           └── failed     (渠道失败)
  ├── rejected  (Admin 驳回)
  └── cancelled (用户取消)
```

### 非法跳转（必须返回 409）

```typescript
// ❌ 禁止的跳转
pending → completed      // 必须经过 approved + processing
pending → processing     // 必须先 approved
approved → completed     // 必须先 processing
rejected → approved      // 终态不可逆
failed → completed       // 终态不可逆
completed → *            // 终态不可逆
```

---

## 8. Ledger 落账规则

### 类型枚举

```typescript
type LedgerType =
  | 'order_income'      // 订单收入
  | 'bonus'             // 奖励
  | 'withdraw_hold'     // 提现冻结
  | 'withdraw_done'     // 提现完成
  | 'withdraw_fail'     // 提现失败（释放）
```

### 落账时机

| 状态变更 | Ledger 操作 |
|----------|-------------|
| 提交申请 → `pending` | `withdraw_hold = -amount`（冻结） |
| 审核驳回 → `rejected` | 冲回 `withdraw_hold`（释放） |
| 打款成功 → `completed` | `withdraw_done`（确认扣减） |
| 打款失败 → `failed` | `withdraw_fail = +amount`（释放） |

---

## 9. 幂等与唯一约束

| 项目 | 约束 |
|------|------|
| `withdrawNo` | 唯一 |
| `transactionNo` | 唯一 |
| 状态变更 | `version` / `updatedAt` 乐观锁 |
| 打款请求 | `idempotencyKey` |

---

## 10. 红线规则

```typescript
/**
 * ⚠️ RED LINE - 资金安全红线
 * 
 * 1. Escort App 永远不能修改提现状态
 * 2. 仅 Admin 可写 withdraw.status
 * 3. 所有资金变化必须有 LedgerEntry
 * 4. 所有操作必须可审计
 * 5. 状态机跳转必须后端校验
 */
```

---

## 附录：任务拆分建议

### 后端任务

| 任务 | 内容 |
|------|------|
| ADMIN-WD-API-01 | 提现列表 + 详情接口 |
| ADMIN-WD-API-02 | 导出接口 + 审计日志 |
| ADMIN-WD-LEDGER-01 | 冻结/释放/确认落账 |

### 前端任务

| 任务 | 内容 | 优先级 |
|------|------|--------|
| ADMIN-WD-UI-01 | 提现记录列表页 | P0 ✅ |
| ADMIN-WD-UI-02 | 详情抽屉 | P1 |
| ADMIN-WD-UI-03 | 导出按钮 | P1 |
| ADMIN-WD-UI-04 | 陪诊员详情页 Tab | P1 |
