# 陪诊员短信验证码登录

> **创建日期**: 2024-12-12  
> **状态**: ✅ 已实现  
> **模块**: `server/src/modules/escort-auth`

---

## 1. 功能概述

陪诊员通过手机号 + 短信验证码登录，获取独立的 `escortToken`，与用户 `userToken` 完全隔离。

### 1.1 核心特性

- ✅ 短信验证码发送与验证
- ✅ Redis 存储验证码（TTL 5 分钟）
- ✅ 多维度频控（60秒/IP/每日）
- ✅ 阿里云短信服务对接
- ✅ 开发模式支持（固定验证码 123456）
- ✅ 完整错误码体系

---

## 2. API 接口

### 2.1 发送短信验证码

```
POST /api/escort-auth/sms/send
```

**请求体**
```json
{
  "phone": "13800138000"
}
```

**成功响应**
```json
{
  "code": 0,
  "data": {
    "success": true,
    "message": "验证码已发送"
  }
}
```

**开发模式响应**（`SMS_DEV_MODE=true`）
```json
{
  "code": 0,
  "data": {
    "success": true,
    "message": "验证码已发送",
    "code": "123456"
  }
}
```

### 2.2 短信验证码登录

```
POST /api/escort-auth/sms/login
```

**请求体**
```json
{
  "phone": "13800138000",
  "code": "123456"
}
```

**成功响应**
```json
{
  "code": 0,
  "data": {
    "escortToken": "eyJhbGciOiJIUzI1NiIs...",
    "escortProfile": {
      "id": "clx...",
      "name": "张三",
      "phone": "13800138000",
      "avatar": "https://...",
      "gender": "male",
      "status": "active",
      "workStatus": "working",
      "level": {
        "code": "senior",
        "name": "资深"
      },
      "rating": 4.8,
      "orderCount": 156
    }
  }
}
```

---

## 3. 错误码

| 错误码 | HTTP 状态码 | 说明 |
|--------|------------|------|
| `ESCORT_PHONE_NOT_FOUND` | 400 | 手机号未注册为陪诊员 |
| `ESCORT_SMS_RATE_LIMIT_60S` | 400 | 60秒内已发送 |
| `ESCORT_SMS_RATE_LIMIT_IP` | 400 | IP 每小时限流 |
| `ESCORT_SMS_RATE_LIMIT_DAY` | 400 | 每日发送上限 |
| `ESCORT_CODE_INVALID` | 401 | 验证码错误 |
| `ESCORT_CODE_EXPIRED` | 401 | 验证码已过期 |
| `ESCORT_INACTIVE` | 403 | 陪诊员未激活/审核中 |
| `ESCORT_SUSPENDED` | 403 | 陪诊员被封禁 |

**错误响应示例**
```json
{
  "statusCode": 400,
  "message": {
    "code": "ESCORT_PHONE_NOT_FOUND",
    "message": "该手机号未注册为陪诊员"
  }
}
```

---

## 4. 频控规则

| 维度 | 限制 | TTL |
|------|------|-----|
| 同手机号 | 60秒 1次 | 60s |
| 同 IP | 每小时 20次 | 3600s |
| 同手机号 | 每日 10次 | 86400s |

---

## 5. 验证码规则

- **长度**: 6 位数字
- **有效期**: 5 分钟
- **存储**: Redis（key: `escort_sms_code:{phone}`）
- **使用后**: 立即销毁

---

## 6. 环境变量配置

```env
# ==========================================
# 陪诊员短信登录配置
# ==========================================

# 开发模式：不调用真实短信接口，验证码固定为 123456
SMS_DEV_MODE=true

# 陪诊员 Token 有效期（默认 30 天）
JWT_ESCORT_EXPIRES_IN=30d

# ==========================================
# 阿里云短信配置
# ==========================================
ALIYUN_ACCESS_KEY_ID=your-access-key-id
ALIYUN_ACCESS_KEY_SECRET=your-access-key-secret
ALIYUN_SMS_SIGN_NAME=科科灵
ALIYUN_SMS_TEMPLATE_CODE=SMS_123456789
```

### 6.1 阿里云短信模板

模板内容示例：
```
您的登录验证码为：${code}，有效期5分钟，请勿泄露给他人。
```

模板变量：
- `code`: 6位数字验证码

---

## 7. 文件结构

```
server/src/modules/escort-auth/
├── escort-auth.module.ts       # 模块定义
├── escort-auth.controller.ts   # 接口控制器
├── escort-auth.service.ts      # 核心业务逻辑
├── sms.service.ts              # 阿里云短信服务
└── dto/
    ├── send-sms.dto.ts         # 发送验证码 DTO
    └── sms-login.dto.ts        # 登录 DTO
```

---

## 8. Token 说明

### 8.1 escortToken vs userToken

| 特性 | escortToken | userToken |
|------|-------------|-----------|
| 签发场景 | 陪诊员短信登录 | 用户微信登录 |
| payload.type | `escort` | 无此字段 |
| payload.sub | escortId | userId |
| 有效期 | 30天（可配置） | 7天（可配置） |
| 使用接口 | `/escort-app/**` | 其他用户接口 |

### 8.2 Token Payload 结构

```typescript
// escortToken
{
  sub: "escort-uuid",
  phone: "13800138000",
  type: "escort",
  iat: 1702345678,
  exp: 1704937678
}
```

---

## 9. 本地测试

### 9.1 开发环境

1. 确保 `.env` 配置 `SMS_DEV_MODE=true`
2. 启动后端服务

### 9.2 测试流程

```bash
# 1. 发送验证码
curl -X POST http://localhost:3000/api/escort-auth/sms/send \
  -H "Content-Type: application/json" \
  -d '{"phone": "13800138000"}'

# 开发模式下，控制台会打印验证码

# 2. 登录（开发模式验证码固定 123456）
curl -X POST http://localhost:3000/api/escort-auth/sms/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "13800138000", "code": "123456"}'
```

### 9.3 前置条件

- 手机号必须已存在于 `escorts` 表
- 陪诊员状态必须为 `active`

---

## 10. 安全考虑

1. **验证码安全**
   - 验证成功后立即销毁
   - 不可重复使用

2. **频控防护**
   - 防止短信轰炸
   - IP 级别限流

3. **状态校验**
   - 未激活陪诊员无法登录
   - 被封禁陪诊员无法登录

4. **审计日志**
   - 每次登录记录到 `IdentityAuditLog`

---

## 11. 相关文档

- [陪诊员模块审计报告](../审计报告/audit-escort-admin.md)
- [双身份会话规格](../终端预览器集成/02-双身份会话与视角切换规格.md)
