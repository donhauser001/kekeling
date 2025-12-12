# 陪诊员后台模块结构化审计报告

> **审计日期**: 2024-12-12  
> **审计范围**: 管理后台陪诊员模块（列表、详情、审核、等级、标签、分类）+ 分销模块  
> **状态**: ✅ P0 + P1 全部完成  
> **更新**: 2024-12-12 P0 完成（软删除 + 订单快照 + level 适配器）

---

## 1. 模块结构图

### 1.1 路由结构

```
/escorts                          # 陪诊员列表（主入口）
├── /$escortId                    # 陪诊员详情页
/escort-levels                    # 陪诊员等级管理
/escort-tags                      # 陪诊员标签管理
/escort-categories                # 陪诊员分类管理（如有）
```

### 1.2 页面组件

| 路由 | 组件文件 | 功能 |
|------|---------|------|
| `/escorts` | `features/escorts/index.tsx` | 列表、筛选、卡片/表格视图切换、CRUD 入口 |
| `/escorts/$escortId` | `features/escorts/detail.tsx` | 详情、接单记录、分销信息、结算信息 |
| `/escort-levels` | `features/escort-levels/index.tsx` | 等级 CRUD、分成比例、派单权重 |
| `/escort-tags` | `features/escort-tags/index.tsx` | 标签 CRUD、分类管理（客户端 Mock 数据） |
| `/escort-categories` | `features/escort-categories/index.tsx` | 分类 CRUD（如有独立页面） |

### 1.3 弹窗/抽屉组件

| 组件 | 文件 | 触发场景 |
|------|------|----------|
| `EscortFormDialog` | `escort-form-dialog.tsx` | 新建/编辑陪诊员 |
| `EscortReviewDialog` | `escort-review-dialog.tsx` | 审核待入驻陪诊员 |
| `BindEscortDialog` | `bind-escort-dialog.tsx` | 绑定/解绑用户 |
| `EscortsDetailSheet` | `escorts-detail-sheet.tsx` | 快速查看详情（列表页） |
| `EscortsDeleteDialog` | `escorts-delete-dialog.tsx` | 删除确认 |

---

## 2. API 清单与权限边界

### 2.1 后台管理 API（需 adminToken）

| 方法 | 端点 | 用途 | Token 类型 | 风险评估 |
|------|------|------|-----------|----------|
| `escortApi.getList` | `GET /admin/escorts` | 获取陪诊员列表 | adminToken | ✅ 正常 |
| `escortApi.getStats` | `GET /admin/escorts/stats` | 获取统计数据 | adminToken | ✅ 正常 |
| `escortApi.getById` | `GET /admin/escorts/:id` | 获取陪诊员详情 | adminToken | ✅ 正常 |
| `escortApi.getAvailable` | `GET /admin/escorts/available` | 获取可派单列表 | adminToken | ✅ 正常 |
| `escortApi.create` | `POST /admin/escorts` | 创建陪诊员 | adminToken | ✅ 正常 |
| `escortApi.update` | `PUT /admin/escorts/:id` | 更新陪诊员信息 | adminToken | ✅ 正常 |
| `escortApi.delete` | `DELETE /admin/escorts/:id` | 删除陪诊员 | adminToken | ⚠️ 需检查软删除 |
| `escortApi.updateStatus` | `PUT /admin/escorts/:id/status` | 更新状态（激活/停用/封禁） | adminToken | ✅ 正常 |
| `escortApi.updateWorkStatus` | `PUT /admin/escorts/:id/work-status` | 更新接单状态 | adminToken | ⚠️ 见下方风险点 |
| `escortApi.review` | `PUT /admin/escorts/:id/review` | 审核（通过/拒绝） | adminToken | ✅ 正常 |
| `escortApi.bind` | `POST /admin/escorts/:id/bind` | 绑定用户 | adminToken | ⚠️ 需验证目标用户存在 |
| `escortApi.unbind` | `POST /admin/escorts/:id/unbind` | 解绑用户 | adminToken | ✅ 正常 |
| `escortApi.associateHospital` | `POST /admin/escorts/:id/hospitals` | 关联医院 | adminToken | ✅ 正常 |
| `escortApi.dissociateHospital` | `DELETE /admin/escorts/:id/hospitals/:hospitalId` | 解除医院关联 | adminToken | ✅ 正常 |
| `escortApi.updateHospitals` | `PUT /admin/escorts/:id/hospitals` | 批量更新医院 | adminToken | ✅ 正常 |
| `escortApi.getAuditLogs` | `GET /admin/escorts/:id/audit-logs` | 获取审计日志 | adminToken | ✅ 正常 |

### 2.2 等级管理 API

| 方法 | 端点 | 用途 | Token 类型 |
|------|------|------|-----------|
| `escortLevelApi.getList` | `GET /admin/escort-levels` | 获取等级列表 | adminToken |
| `escortLevelApi.getById` | `GET /admin/escort-levels/:id` | 获取等级详情 | adminToken |
| `escortLevelApi.create` | `POST /admin/escort-levels` | 创建等级 | adminToken |
| `escortLevelApi.update` | `PUT /admin/escort-levels/:id` | 更新等级 | adminToken |
| `escortLevelApi.delete` | `DELETE /admin/escort-levels/:id` | 删除等级 | adminToken |

### 2.3 标签管理 API

| 方法 | 端点 | 用途 | Token 类型 | 状态 |
|------|------|------|-----------|------|
| `escortTagApi.getList` | `GET /admin/escort-tags` | 获取标签列表 | adminToken | ⚠️ 前端使用 Mock |

### 2.4 陪诊员认证 API（新增 ✅）

| 方法 | 端点 | 用途 | Token 类型 | 状态 |
|------|------|------|-----------|------|
| POST | `/escort-auth/sms/send` | 发送短信验证码 | 无需认证 | ✅ 已实现 |
| POST | `/escort-auth/sms/login` | 短信验证码登录 | 无需认证 | ✅ 已实现 |

> 详细文档：[陪诊员短信登录](../陪诊员中心/escort-sms-login.md)

### 2.5 分销模块 API（需 escortToken）

| 方法 | 端点 | 用途 | DTO | 状态 |
|------|------|------|-----|------|
| GET | `/escort/distribution/invite-code` | 获取/生成邀请码 | - | ✅ 已实现 |
| POST | `/escort/distribution/invite` | 使用邀请码建立关系 | `{ inviteCode }` | ✅ 已重构（事件驱动） |
| GET | `/escort/distribution/records` | 获取分润记录 | `QueryRecordsDto` | ✅ 已重构（DTO 规范化） |
| GET | `/escort/team/members` | 获取团队成员列表 | `QueryRecordsDto` | ✅ 已重构（DTO 规范化） |
| GET | `/escort/team/stats` | 获取团队统计数据 | - | ✅ 已实现 |

### 2.6 陪诊员端 API（需 escortToken）

> 以下 API 用于终端预览器（陪诊员工作台），**不应**出现在后台管理模块中

| 端点前缀 | 用途 | Token 类型 |
|---------|------|-----------|
| `/escort-app/**` | 陪诊员工作台功能 | escortToken |

---

## 3. 权限边界风险点

### 3.1 ⚠️ 潜在越权风险

| 风险项 | 描述 | 当前状态 | 建议 |
|--------|------|----------|------|
| **workStatus 可被管理员修改** | `PUT /admin/escorts/:id/work-status` 允许管理员直接切换陪诊员接单状态 | 功能正常但可能不符合业务预期 | 确认业务需求：管理员是否应有此权限？如是紧急调度可保留 |
| **标签管理使用客户端 Mock** | `escort-tags/index.tsx` 使用前端硬编码数据，未对接后端 | 功能可用但数据不持久 | P1: 对接后端 API |
| **删除陪诊员需检查关联** | 删除有历史订单的陪诊员时需确保软删除 | 前端有警告，后端需确认 | 确认后端实现软删除逻辑 |
| **绑定用户无前端校验** | `bind` 接口依赖后端校验目标 userId 是否存在 | 后端校验 | ✅ 可接受，前端可增加搜索选择 |

### 3.2 ✅ 已正确隔离

| 项目 | 说明 |
|------|------|
| 后台 API 路径 | 统一使用 `/admin/**` 前缀 |
| 陪诊员端 API | 使用 `/escort-app/**` 前缀，由 `escortRequest` 调用 |
| Token 隔离 | 预览器 `escortRequest` 使用独立 escortToken，不与 adminToken 混用 |

---

## 4. 数据口径表

### 4.1 陪诊员状态（status）

| 值 | 中文 | 前端配色 | 业务含义 |
|----|------|---------|----------|
| `pending` | 待审核 | 黄色 | 新申请，等待管理员审核 |
| `active` | 已激活 | 绿色 | 正常服务中 |
| `inactive` | 已停用 | 灰色 | 管理员手动停用 |
| `suspended` | 已封禁 | 红色 | 因违规被封禁 |

### 4.2 接单状态（workStatus）

| 值 | 中文 | 前端配色 | 业务含义 |
|----|------|---------|----------|
| `resting` | 休息中 | 灰色 | 不接单 |
| `working` | 接单中 | 绿色 | 可接受新订单 |
| `busy` | 服务中 | 蓝色 | 正在执行订单 |

### 4.3 等级（level）

| 值 | 中文 | 前端配色 | 说明 |
|----|------|---------|------|
| `senior` | 资深 | 紫色 | 高级陪诊员 |
| `intermediate` | 中级 | 蓝色 | 中级陪诊员 |
| `junior` | 初级 | 绿色 | 初级陪诊员 |
| `trainee` | 实习 | 灰色 | 实习期 |

> ⚠️ 注意：`escort.level` 字段可能是字符串或对象 `{ code, name }`，前端已做兼容处理

### 4.4 列表/详情字段一致性检查

| 字段 | 列表接口 | 详情接口 | 一致性 |
|------|---------|---------|--------|
| `id` | ✅ | ✅ | ✅ |
| `name` | ✅ | ✅ | ✅ |
| `phone` | ✅ | ✅ | ✅ |
| `avatar` | ✅ | ✅ | ✅ |
| `status` | ✅ | ✅ | ✅ |
| `workStatus` | ✅ | ✅ | ✅ |
| `level` | ✅ (可能为字符串/对象) | ✅ (可能为字符串/对象) | ⚠️ 类型不一致 |
| `rating` | ✅ | ✅ | ✅ |
| `orderCount` | ✅ | ✅ | ✅ |
| `hospitals` | ✅ | ✅ | ✅ |
| `tags` | ✅ | ✅ | ✅ |
| `cityCode` | ✅ | ✅ | ✅ |
| `gender` | ✅ | ✅ | ✅ |
| `idCard` | ❌ (列表不返回) | ✅ | ✅ 合理（敏感信息） |
| `introduction` | ❌ (列表不返回) | ✅ | ✅ 合理（长文本） |
| `experience` | ✅ | ✅ | ✅ |

---

## 5. 整改项清单

### 5.1 P0 - 必须修复 ✅ 全部完成

| # | 改动点 | 影响面 | 验收标准 | 状态 |
|---|--------|--------|----------|------|
| 1 | **`level` 字段类型规范** | 所有陪诊员相关页面 | 前端适配器 + 后端返回对象 | ✅ 已完成 |
| 2 | **软删除逻辑** | 陪诊员删除功能 | Prisma Extension 软删除 + 订单快照 | ✅ 已完成 |

#### 5.1.1 `level` 字段类型规范 - 技术方案

**问题**：前后端协议模糊，有时返回字符串（`'senior'`），有时返回对象（`{ code, name }`）。

**方案：读写分离，对象优先**

```typescript
// ✅ 后端响应标准（GET 接口）
interface EscortLevelVO {
  code: string;       // 'senior' - 用于逻辑判断
  name: string;       // '资深陪诊员' - 用于直接展示
  sortOrder?: number; // 排序权重
  badgeColor?: string; // 颜色: '#722ED1'
}

// ✅ 前端提交标准（POST/PUT 接口）
{ "level": "senior" } // 仅传 code
```

**过渡期兼容方案（前端适配器）**：

```typescript
// src/lib/utils/normalize-level.ts
const normalizeLevel = (level: string | EscortLevelObj): EscortLevelObj => {
  if (typeof level === 'string') {
    const map = { senior: '资深', intermediate: '中级', junior: '初级', trainee: '实习' };
    return { code: level, name: map[level] || level };
  }
  return level;
};
```

#### 5.1.2 软删除逻辑 - 技术方案

**问题**：陪诊员涉及订单历史、分销关系和资金结算，物理删除会导致引用完整性问题。

**方案：Prisma Middleware 软删除 + 订单快照**

**Step 1: Schema 变更**

```prisma
model Escort {
  // ... 其他字段
  deletedAt DateTime? @map("deleted_at") // 空为正常，有值为已删除
  
  // 唯一索引处理：仅未删除的 phone 唯一
  @@unique([phone, deletedAt])
}
```

**Step 2: Prisma Extension**

```typescript
// prisma.service.ts
this.prisma.$extends({
  query: {
    escort: {
      async findMany({ args, query }) {
        args.where = { ...args.where, deletedAt: null };
        return query(args);
      },
      async delete({ args, query }) {
        // 拦截 delete 变为 update
        return this.prisma.escort.update({
          where: args.where,
          data: { deletedAt: new Date(), status: 'inactive' }
        });
      }
    }
  }
});
```

**Step 3: 订单快照**

在 `Order` 表创建时，将陪诊员关键信息冗余存储：

```prisma
model Order {
  // ... 其他字段
  escortSnapshot Json? @map("escort_snapshot") // { name, phone, avatar, levelCode }
}
```

### 5.2 P1 - 建议修复

| # | 改动点 | 影响面 | 验收标准 | 状态 |
|---|--------|--------|----------|------|
| 1 | **workStatus 非对称权限** | 管理员操作陪诊员接单状态 | 管理员只能强制下线，不能强制上线 | ✅ 已完成 |
| 2 | **分类管理正名为等级管理** | `escort-categories` 页面 | 对接 EscortLevel 表 | ✅ 已完成 |
| 3 | **标签管理对接后端 API** | `escort-tags` 页面 | 对接 EscortTag 表 | ✅ 已完成 |
| 4 | **绑定用户增加搜索选择** | `BindEscortDialog` | 绑定用户时可搜索选择 | ✅ 已完成 |

#### 5.2.1 workStatus 非对称权限 - 技术方案

**核心矛盾**：
- `workStatus`（接单状态：休息/接单中/服务中）反映陪诊员的**实时履约能力和主观意愿**
- 管理员强制上线 (`resting` → `working`)：**高风险**，若陪诊员实际无法接单会导致客诉
- 管理员强制下线 (`working` → `resting`)：**合理**，用于处理违规、投诉调查或账号异常

**方案：非对称权限设计**

**后端接口限制**：

```typescript
// PUT /admin/escorts/:id/work-status
// 禁止设置为 working，只允许 resting
@Put(':id/work-status')
async updateWorkStatus(
  @Param('id') id: string,
  @Body() dto: UpdateWorkStatusDto,
) {
  // ❌ 禁止管理员将陪诊员设置为"接单中"
  if (dto.workStatus === 'working') {
    throw new BadRequestException(
      '管理员不能强制上线陪诊员，需由陪诊员在端侧自行操作'
    );
  }
  // ✅ 允许设置为 resting（强制下线）
  // ✅ busy 状态仅在手动指派订单时由系统自动触发
  return this.escortService.updateWorkStatus(id, dto.workStatus);
}
```

**前端交互优化**：

| 当前状态 | 显示按钮 | 说明 |
|---------|---------|------|
| `working` | "强制下线"（红色警告） | 点击后弹出确认框 |
| `resting` | 不显示 / 置灰"上线" | 提示"需陪诊员自行操作" |
| `busy` | 不显示 | 正在执行订单，不可操作 |

**特殊场景兜底**：

如确需"管理员代操作"（如陪诊员不懂操作 App），建议：
1. 增加独立特权接口 `POST /admin/escorts/:id/force-online`
2. 强制填写"操作原因"
3. 记录 `IdentityAuditLog` 审计日志

#### 5.2.2 分类管理正名 - 技术方案

**问题发现**：
- 前端 `escort-categories` 的 Mock 数据（"高级陪诊员", "中级陪诊员"）实际是**等级概念**
- Prisma 中已有完善的 `EscortLevel` 模型，包含 `commissionRate`（分成比例）、`dispatchWeight`（派单权重）

**概念对齐**：

| 前端页面 | Mock 数据示例 | 对应 Model | 改动建议 |
|---------|--------------|-----------|---------|
| `escort-categories` | "高级陪诊员", "中级陪诊员" | `EscortLevel` | 重命名为"等级管理"，对接 `escort_levels` 表 |
| `escort-tags` | "急救技能", "英语流利" | `EscortTag` | 对接 `escort_tags` 表 |

**前端改造要点**：
1. 将 `escort-categories/index.tsx` 重命名为等级管理
2. 表单字段扩展：除名称/描述外，增加"分成比例"和"派单权重"
3. 废弃 Mock 中的 `abilities` 数组，改用关联标签

#### 5.2.3 标签管理落地 - 技术方案

**后端 Schema**（已存在）：

```prisma
model EscortTag {
  id        String   @id @default(cuid())
  name      String
  category  String   // 'skill' | 'feature' | 'region'
  color     String?
  // ...
}
```

**标签分类枚举**：

| 值 | 中文 | 前端 Mock 对应 | 示例 |
|----|------|---------------|------|
| `skill` | 技能 | "技能标签" | 急救、驾驶 |
| `feature` | 特点 | "表现标签" | 耐心、准时 |
| `region` | 区域 | "区域标签" | 朝阳区、海淀区 |

**数据流向**：

```
管理员 → [EscortLevel API] → EscortLevel 表 → 决定分润比例 & 派单权重
管理员 → [EscortTag API]   → EscortTag 表   → 用于用户筛选 & 匹配

陪诊员 ← 关联 → EscortLevel (1:N)
陪诊员 ← 关联 → EscortTag (M:N)
```

### 5.3 P2 - 优化建议 ✅ 全部完成

| # | 改动点 | 影响面 | 验收标准 | 状态 |
|---|--------|--------|----------|------|
| 1 | **详情页接单记录分页** | `detail.tsx` Orders Tab | 大量订单时分页加载正常 | ✅ 已完成 |
| 2 | **详情页结算信息完善** | `detail.tsx` Settlement Tab | 显示收入明细和提现记录 | ✅ 已完成 |
| 3 | **等级删除校验优化** | `escort-levels` 页面 | 删除有陪诊员关联的等级时，提示并阻止删除 | ✅ 已完成 |

---

## 6. 分销模块架构重构（2024-12-12 ✅）

### 6.1 金额计算精度优化

| 改进项 | Before | After | 状态 |
|--------|--------|-------|------|
| 金额计算库 | 原生 JS `*`, `/` | `decimal.js` | ✅ 已完成 |
| 舍入策略 | `Math.round()` | `ROUND_HALF_UP` | ✅ 已完成 |
| 精度位数 | 不确定 | 固定 2 位小数 | ✅ 已完成 |

**涉及方法**：
- `calculateDistribution` - 分润计算
- `grantDirectInviteBonus` - 直推奖励
- `settleDistributionRecords` - 结算分润
- `cancelDistributionRecords` - 取消分润

**单元测试覆盖**（`distribution.service.spec.ts`）：

| 场景 | 输入 | 预期结果 | 状态 |
|------|------|---------|------|
| 标准场景 | 100元, 10% | 10.00 | ✅ |
| 精度陷阱 | 0.3元, 100% | 0.30 | ✅ |
| 极小金额（舍） | 0.01元, 1% | 0.00 | ✅ |
| 极小金额（入） | 0.05元, 10% | 0.01 | ✅ |
| 零费率 | 100元, 0% | 0.00 | ✅ |
| 全额费率 | 99.99元, 100% | 99.99 | ✅ |
| 大金额 | 9999.99元, 2.5% | 250.00 | ✅ |

### 6.2 事件驱动架构

| 组件 | 文件 | 职责 |
|------|------|------|
| 事件定义 | `events/escort-relation.events.ts` | `ESCORT_RELATION_EVENTS.CREATED` |
| 事件监听器 | `listeners/distribution.listener.ts` | 异步更新团队统计 |
| 事件触发点 | `distribution.service.ts` | `processInvitation` 事务后触发 |

**架构改进**：

```
Before (同步阻塞):
┌─────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ processInvitation │ → │ updateTeamStats │ → │ 递归更新上级... │
└─────────────┘    └─────────────────┘    └─────────────────┘
                   ↑ 同步等待，阻塞响应

After (事件驱动):
┌─────────────┐    ┌──────────────┐
│ processInvitation │ → │ emit(event) │ → HTTP 响应
└─────────────┘    └──────────────┘
                          ↓ 异步
                   ┌─────────────────────────┐
                   │ DistributionListener    │
                   │ 更新团队统计（带深度保护）│
                   └─────────────────────────┘
```

**递归深度保护**：
- 最大深度：30 层
- 超过深度自动停止并记录 WARN 日志

### 6.3 DTO 规范化

**新增 DTO**：`dto/query-records.dto.ts`

```typescript
export class QueryRecordsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)  // 强制上限
  pageSize?: number = 20;
}
```

**改进效果**：

| 改进项 | Before | After |
|--------|--------|-------|
| 类型转换 | `Number(query.page)` 手动转换 | `ValidationPipe` 自动处理 |
| 参数校验 | 无校验 | `class-validator` 校验 |
| pageSize 上限 | 无限制 | 最大 100 |
| Swagger 文档 | 无类型提示 | 自动生成 |

---

## 7. 前端安全检查清单

| 检查项 | 状态 | 说明 |
|--------|------|------|
| 敏感信息脱敏显示 | ✅ | 身份证号显示为 `123456****1234` |
| 删除操作二次确认 | ✅ | 使用 `ConfirmDialog` |
| 表单提交防重复 | ✅ | 使用 `isPending` 禁用按钮 |
| 越权操作前端校验 | ⚠️ | 主要依赖后端校验，前端无角色权限控制 |
| XSS 防护 | ✅ | React 默认转义，未使用 dangerouslySetInnerHTML |

---

## 8. 下一步行动

### 8.1 P0 执行计划（必须上线前完成） ✅ 全部完成

| 任务 | 负责方 | 预估工时 | 状态 |
|------|--------|---------|------|
| 后端 `include: { level: true }` 返回对象 | 后端 | - | ✅ 已实现（原有） |
| 前端 `normalizeLevel` 适配器（兼容字符串/对象） | 前端 | 1h | ✅ 已完成 |
| Escort 表 `deletedAt` 字段 | 后端 | - | ✅ 已存在 |
| Prisma Extension 软删除 | 后端 | 2h | ✅ 已完成 |
| Order 表 `escortSnapshot` 字段 | 后端 | 0.5h | ✅ 已完成 |
| 派单/抢单时填充 `escortSnapshot` | 后端 | 1h | ✅ 已完成 |

**迁移命令**（需手动执行）：

```bash
cd server && npx prisma migrate dev --name add_escort_snapshot
```

### 8.2 P1 执行计划（建议修复） ✅ 全部完成

| 任务 | 负责方 | 预估工时 | 状态 |
|------|--------|---------|------|
| workStatus 非对称权限（后端） | 后端 | 1h | ✅ 已完成 |
| workStatus 非对称权限（前端） | 前端 | 1h | ✅ 已完成 |
| 分类管理重定向到等级管理 | 前端 | 0.5h | ✅ 已完成 |
| 标签管理对接后端 API | 前端 | 3h | ✅ 已完成 |
| 绑定用户增加搜索选择 | 前端 | 2h | ✅ 已完成 |

### 8.3 已完成工作（2024-12-12）

#### ✅ `normalizeLevel` 适配器

**文件**：`src/lib/utils.ts`

**已应用到以下文件**：
- `features/escorts/detail.tsx`
- `features/escorts/index.tsx`
- `features/escorts/components/escorts-detail-sheet.tsx`
- `features/escorts/components/escorts-columns-new.tsx`

#### ✅ workStatus 非对称权限

**后端**：`server/src/modules/admin/services/admin-escorts.service.ts`

- 禁止管理员将陪诊员设置为 `working`（接单中）
- 允许设置为 `resting`（强制下线）
- `busy` 状态由系统在指派订单时自动触发

**前端**：`src/features/escorts/detail.tsx`

- 当状态为 `working` 时，显示"强制下线"按钮（红色警告）
- 当状态为 `resting` 时，按钮置灰并提示"需陪诊员自行操作"
- 当状态为 `busy` 时，不可操作

#### ✅ 分类管理重定向

**文件**：`src/components/layout/data/sidebar-data.ts`

- 侧边栏"人员分类"已改为"等级管理"
- URL 从 `/escort-categories` 改为 `/escort-levels`
- `escort-levels` 页面已对接 `EscortLevel` 表，包含分成比例、派单权重等字段

#### ✅ 标签管理对接后端 API

**后端改动**：`server/src/modules/admin/services/admin-escort-tags.service.ts`

- 扩展 category 枚举：`'skill' | 'feature' | 'cert' | 'region'`

**前端改动**：

| 文件 | 改动内容 |
|------|---------|
| `features/escort-tags/index.tsx` | 使用 React Query 对接 `escortTagApi`，移除 Mock 数据 |
| `features/escort-tags/components/escort-tags-columns.tsx` | 更新类型定义，使用 API 类型 |
| `features/escort-tags/components/escort-tags-detail-sheet.tsx` | 更新详情展示，适配 API 字段 |

**标签分类配置**：

| 值 | 中文 | 说明 |
|----|------|------|
| `skill` | 技能标签 | 急救、驾驶、护理 |
| `feature` | 特点标签 | 耐心、准时、细心 |
| `cert` | 资质标签 | 护士证、急救证 |
| `region` | 区域标签 | 朝阳区、海淀区 |

#### ✅ 绑定用户搜索选择

**文件**：`src/features/escorts/components/bind-escort-dialog.tsx`

**功能改进**：

| Before | After |
|--------|-------|
| 手动输入用户 ID | 搜索下拉选择用户 |
| 无校验 | 实时搜索 + 已是陪诊员提示 |
| 易出错 | 显示昵称、手机号便于确认 |

**实现细节**：

- 使用 `userApi.getList({ keyword })` 搜索用户
- 300ms 防抖避免频繁请求
- 输入至少 2 个字符触发搜索
- 显示搜索结果列表（昵称 + 手机号）
- 已是陪诊员的用户显示提示并禁用选择
- 选择后显示已选用户卡片，支持清除重选

#### ✅ P0: 软删除逻辑 + 订单快照

**Schema 改动**：`server/prisma/schema.prisma`

```prisma
model Order {
  // ... 其他字段
  escortSnapshot   Json?     @map("escort_snapshot")  // 陪诊员快照
}
```

**Prisma Service 扩展**：`server/src/prisma/prisma.service.ts`

```typescript
// 软删除扩展
get softDelete() {
  return this.$extends({
    query: {
      escort: {
        findMany({ args, query }) {
          args.where = { ...args.where, deletedAt: null };
          return query(args);
        },
        delete({ args }) {
          return (this as any).escort.update({
            where: args.where,
            data: { deletedAt: new Date(), status: 'inactive', workStatus: 'resting' },
          });
        },
        // ... deleteMany 类似
      },
    },
  });
}
```

**派单时保存陪诊员快照**：

| 文件 | 方法 |
|------|------|
| `server/src/modules/admin/services/admin-orders.service.ts` | `assignEscort()` |
| `server/src/modules/escort-app/escort-app.service.ts` | `grabOrder()` |

**快照结构**：

```json
{
  "id": "escort-uuid",
  "name": "张三",
  "phone": "13800138000",
  "avatar": "https://...",
  "levelCode": "senior",
  "levelName": "资深陪诊员",
  "rating": 4.8
}
```

**效果**：陪诊员被软删除后，历史订单仍可通过 `escortSnapshot` 展示陪诊员信息。

---

## 附录：文件清单

```
src/routes/_authenticated/
├── escorts/
│   ├── index.tsx              # 列表路由
│   └── $escortId.tsx          # 详情路由
├── escort-levels/
│   └── index.tsx              # 等级管理路由
├── escort-tags/
│   └── index.tsx              # 标签管理路由
└── escort-categories/
    └── index.tsx              # 分类管理路由

src/features/
├── escorts/
│   ├── index.tsx              # 列表页主组件
│   ├── detail.tsx             # 详情页组件
│   ├── data/
│   │   ├── data.ts            # 静态数据
│   │   ├── schema.ts          # 数据校验 schema
│   │   └── escorts.ts         # 类型定义
│   └── components/
│       ├── escort-form-dialog.tsx
│       ├── escort-review-dialog.tsx
│       ├── bind-escort-dialog.tsx
│       ├── escorts-detail-sheet.tsx
│       ├── escorts-table.tsx
│       ├── escorts-table-new.tsx
│       ├── escorts-columns.tsx
│       ├── escorts-columns-new.tsx
│       └── ...
├── escort-levels/
│   └── index.tsx              # 等级管理组件
├── escort-tags/
│   ├── index.tsx              # 标签管理组件
│   └── components/
│       └── ...
└── escort-categories/
    ├── index.tsx              # 分类管理组件
    └── components/
        └── ...

src/lib/api.ts                 # API 定义
src/hooks/use-api.ts           # API hooks

server/src/modules/distribution/
├── distribution.module.ts     # 模块注册
├── distribution.service.ts    # 分润核心服务
├── distribution.service.spec.ts # 单元测试（19 测试用例）
├── distribution.controller.ts # 分润 API
├── team.service.ts            # 团队服务
├── team.controller.ts         # 团队 API
├── promotion.service.ts       # 晋升服务
├── promotion.controller.ts    # 晋升 API
├── dto/
│   └── query-records.dto.ts   # 分页查询 DTO
├── events/
│   └── escort-relation.events.ts  # 事件定义
└── listeners/
    └── distribution.listener.ts   # 事件监听器
```
