# Kekeling 陪诊服务 API 接口规范文档

> 版本：v1.0  
> 更新日期：2024年12月  
> 文档状态：MVP 阶段

---

## 一、概述

### 1.1 基础信息

| 项目 | 说明 |
|------|------|
| 基础地址 | `https://api.kekeling.com/v1` |
| 协议 | HTTPS（必须） |
| 数据格式 | JSON |
| 字符编码 | UTF-8 |

### 1.2 认证方式

小程序端使用 JWT Token 认证：

```http
Authorization: Bearer <token>
```

### 1.3 通用响应格式

**成功响应：**

```json
{
  "code": 0,
  "message": "success",
  "data": { ... },
  "timestamp": 1702012800000
}
```

**错误响应：**

```json
{
  "code": 40001,
  "message": "参数验证失败",
  "errors": [
    { "field": "phone", "message": "手机号格式不正确" }
  ],
  "timestamp": 1702012800000
}
```

### 1.4 状态码说明

| code | 说明 |
|------|------|
| 0 | 成功 |
| 40001 | 参数验证失败 |
| 40101 | 未登录/Token 无效 |
| 40102 | Token 已过期 |
| 40301 | 无权限 |
| 40401 | 资源不存在 |
| 50001 | 服务器内部错误 |

### 1.5 分页格式

**请求参数：**

```json
{
  "page": 1,
  "pageSize": 20
}
```

**响应格式：**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [...],
    "pagination": {
      "current": 1,
      "pageSize": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

---

## 二、MVP 核心接口清单

### 2.1 认证模块 `/auth`

| 接口 | 方法 | 说明 | 优先级 |
|------|------|------|--------|
| `/auth/wechat/login` | POST | 微信登录 | P0 |
| `/auth/wechat/phone` | POST | 绑定手机号 | P0 |
| `/auth/refresh` | POST | 刷新 Token | P0 |

### 2.2 用户模块 `/user`

| 接口 | 方法 | 说明 | 优先级 |
|------|------|------|--------|
| `/user/profile` | GET | 获取用户信息 | P0 |
| `/user/profile` | PUT | 更新用户信息 | P1 |
| `/user/patients` | GET | 就诊人列表 | P0 |
| `/user/patients` | POST | 添加就诊人 | P0 |
| `/user/patients/:id` | PUT | 更新就诊人 | P0 |
| `/user/patients/:id` | DELETE | 删除就诊人 | P1 |

### 2.3 首页配置 `/app`

| 接口 | 方法 | 说明 | 优先级 |
|------|------|------|--------|
| `/app/home` | GET | 首页配置数据 | P0 |
| `/app/banners` | GET | 轮播图列表 | P0 |
| `/app/hot-search` | GET | 热门搜索词 | P1 |

### 2.4 服务模块 `/services`

| 接口 | 方法 | 说明 | 优先级 |
|------|------|------|--------|
| `/services` | GET | 服务列表 | P0 |
| `/services/:id` | GET | 服务详情 | P0 |
| `/services/categories` | GET | 服务分类 | P0 |

### 2.5 医院模块 `/hospitals`

| 接口 | 方法 | 说明 | 优先级 |
|------|------|------|--------|
| `/hospitals` | GET | 医院列表 | P0 |
| `/hospitals/:id` | GET | 医院详情 | P0 |
| `/hospitals/:id/departments` | GET | 医院科室 | P1 |

### 2.6 陪诊员模块 `/escorts`

| 接口 | 方法 | 说明 | 优先级 |
|------|------|------|--------|
| `/escorts` | GET | 陪诊员列表 | P0 |
| `/escorts/:id` | GET | 陪诊员详情 | P0 |

### 2.7 订单模块 `/orders`

| 接口 | 方法 | 说明 | 优先级 |
|------|------|------|--------|
| `/orders` | POST | 创建订单 | P0 |
| `/orders` | GET | 订单列表 | P0 |
| `/orders/:id` | GET | 订单详情 | P0 |
| `/orders/:id/cancel` | POST | 取消订单 | P0 |
| `/orders/:id/pay` | POST | 发起支付 | P0 |
| `/orders/:id/review` | POST | 评价订单 | P1 |

### 2.8 支付模块 `/payment`

| 接口 | 方法 | 说明 | 优先级 |
|------|------|------|--------|
| `/payment/wechat/prepay` | POST | 微信预支付 | P0 |
| `/payment/wechat/notify` | POST | 微信支付回调 | P0 |

---

## 三、接口详细说明

### 3.1 微信登录

**POST** `/auth/wechat/login`

**请求参数：**

```json
{
  "code": "wx_login_code_xxx"
}
```

**响应数据：**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 7200,
    "user": {
      "id": "user_001",
      "openid": "oXXXX",
      "nickname": "微信用户",
      "avatar": "https://...",
      "phone": null,
      "status": "active"
    },
    "isNewUser": true,
    "needBindPhone": true
  }
}
```

### 3.2 绑定手机号

**POST** `/auth/wechat/phone`

**请求参数：**

```json
{
  "code": "phone_code_xxx"
}
```

> 说明：使用微信 `getPhoneNumber` 获取的 code

**响应数据：**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "phone": "138****8888"
  }
}
```

### 3.3 获取首页配置

**GET** `/app/home`

**响应数据：**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "banners": [
      {
        "id": "banner_001",
        "image": "https://cdn.kekeling.com/banners/1.jpg",
        "link": "/pages/services/detail?id=service_001",
        "linkType": "page"
      }
    ],
    "serviceEntries": [
      {
        "id": "entry_001",
        "name": "全程陪诊",
        "icon": "https://cdn.kekeling.com/icons/escort.png",
        "link": "/pages/services/index?category=escort"
      },
      {
        "id": "entry_002",
        "name": "代办挂号",
        "icon": "https://cdn.kekeling.com/icons/register.png",
        "link": "/pages/services/index?category=register"
      }
    ],
    "hotServices": [
      {
        "id": "service_001",
        "name": "门诊陪诊",
        "price": 299,
        "coverImage": "https://cdn.kekeling.com/services/1.jpg",
        "orderCount": 12580
      }
    ],
    "recommendEscorts": [
      {
        "id": "escort_001",
        "name": "张护士",
        "avatar": "https://cdn.kekeling.com/avatars/1.jpg",
        "level": "senior",
        "rating": 98.5,
        "orderCount": 568
      }
    ],
    "popup": {
      "id": "popup_001",
      "image": "https://cdn.kekeling.com/popups/activity.jpg",
      "link": "/pages/activity/detail?id=act_001"
    }
  }
}
```

### 3.4 获取服务列表

**GET** `/services`

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| categoryId | string | 否 | 分类ID |
| keyword | string | 否 | 搜索关键词 |
| isHot | boolean | 否 | 是否热门 |
| page | number | 否 | 页码，默认 1 |
| pageSize | number | 否 | 每页数量，默认 20 |

**响应数据：**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "service_001",
        "name": "门诊陪诊",
        "categoryId": "cat_001",
        "categoryName": "陪诊服务",
        "description": "全程陪同就医，协助挂号、取号、缴费、取药等",
        "price": 299,
        "originalPrice": 399,
        "unit": "次",
        "duration": "4小时",
        "coverImage": "https://cdn.kekeling.com/services/1.jpg",
        "orderCount": 12580,
        "rating": 98.5,
        "isHot": true,
        "status": "active"
      }
    ],
    "pagination": {
      "current": 1,
      "pageSize": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

### 3.5 获取医院列表

**GET** `/hospitals`

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| keyword | string | 否 | 搜索关键词 |
| level | string | 否 | 医院等级 |
| city | string | 否 | 城市 |
| latitude | number | 否 | 纬度（用于计算距离） |
| longitude | number | 否 | 经度 |
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页数量 |

**响应数据：**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "hospital_001",
        "name": "上海市第一人民医院",
        "shortName": "市一医院",
        "level": "tertiary_a",
        "type": "general",
        "address": "上海市虹口区武进路85号",
        "logo": "https://cdn.kekeling.com/hospitals/1.jpg",
        "distance": 2500,
        "orderCount": 5680
      }
    ],
    "pagination": { ... }
  }
}
```

### 3.6 获取陪诊员列表

**GET** `/escorts`

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| hospitalId | string | 否 | 医院ID |
| serviceCategoryId | string | 否 | 服务分类ID |
| level | string | 否 | 等级筛选 |
| isOnline | boolean | 否 | 是否在线 |
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页数量 |

**响应数据：**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "escort_001",
        "name": "张护士",
        "avatar": "https://cdn.kekeling.com/avatars/1.jpg",
        "gender": "female",
        "level": "senior",
        "introduction": "从事护理工作10年，熟悉各大医院就诊流程",
        "specialties": ["门诊陪诊", "住院陪护"],
        "orderCount": 568,
        "rating": 98.5,
        "isOnline": true
      }
    ],
    "pagination": { ... }
  }
}
```

### 3.7 创建订单

**POST** `/orders`

**请求参数：**

```json
{
  "serviceId": "service_001",
  "hospitalId": "hospital_001",
  "departmentId": "dept_001",
  "escortId": "escort_001",
  "patientId": "patient_001",
  "appointmentDate": "2024-12-20",
  "appointmentTime": "09:00",
  "couponId": "coupon_001",
  "userRemark": "需要轮椅"
}
```

**响应数据：**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "orderId": "order_001",
    "orderNo": "KKL202412180001",
    "totalAmount": 299,
    "discountAmount": 50,
    "paidAmount": 249,
    "status": "pending"
  }
}
```

### 3.8 发起微信支付

**POST** `/payment/wechat/prepay`

**请求参数：**

```json
{
  "orderId": "order_001"
}
```

**响应数据：**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "appId": "wx1234567890",
    "timeStamp": "1702012800",
    "nonceStr": "random_string",
    "package": "prepay_id=wx...",
    "signType": "RSA",
    "paySign": "signature..."
  }
}
```

> 返回数据可直接用于 `wx.requestPayment`

### 3.9 获取订单列表

**GET** `/orders`

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | string | 否 | 订单状态筛选 |
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页数量 |

**响应数据：**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "order_001",
        "orderNo": "KKL202412180001",
        "serviceName": "门诊陪诊",
        "serviceCategory": "陪诊服务",
        "hospitalName": "上海市第一人民医院",
        "escortName": "张护士",
        "escortAvatar": "https://...",
        "appointmentDate": "2024-12-20",
        "appointmentTime": "09:00",
        "status": "confirmed",
        "paidAmount": 249,
        "createdAt": "2024-12-18T10:00:00Z"
      }
    ],
    "pagination": { ... }
  }
}
```

### 3.10 就诊人列表

**GET** `/user/patients`

**响应数据：**

```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": "patient_001",
      "name": "张三",
      "phone": "13812345678",
      "idCard": "310***********1234",
      "gender": "male",
      "relation": "本人",
      "isDefault": true
    }
  ]
}
```

### 3.11 添加就诊人

**POST** `/user/patients`

**请求参数：**

```json
{
  "name": "李四",
  "phone": "13912345678",
  "idCard": "310123199001011234",
  "gender": "female",
  "relation": "配偶",
  "isDefault": false
}
```

---

## 四、管理后台专用接口

> 以下接口供管理后台调用，需要管理员权限

### 4.1 订单管理

| 接口 | 方法 | 说明 |
|------|------|------|
| `/admin/orders` | GET | 订单列表（支持高级筛选） |
| `/admin/orders/:id` | GET | 订单详情 |
| `/admin/orders/:id/assign` | POST | 分配陪诊员 |
| `/admin/orders/:id/status` | PUT | 更新订单状态 |
| `/admin/orders/:id/refund` | POST | 处理退款 |

### 4.2 陪诊员管理

| 接口 | 方法 | 说明 |
|------|------|------|
| `/admin/escorts` | GET/POST | 陪诊员列表/添加 |
| `/admin/escorts/:id` | GET/PUT/DELETE | 陪诊员详情/编辑/删除 |
| `/admin/escorts/:id/status` | PUT | 更新状态 |

### 4.3 配置管理

| 接口 | 方法 | 说明 |
|------|------|------|
| `/admin/banners` | GET/POST | 轮播图管理 |
| `/admin/services` | GET/POST | 服务管理 |
| `/admin/hospitals` | GET/POST | 医院管理 |

---

## 五、WebSocket 接口（后续版本）

### 5.1 消息推送

**连接地址：** `wss://api.kekeling.com/ws`

**连接参数：**

```
wss://api.kekeling.com/ws?token=xxx
```

**消息类型：**

```json
{
  "type": "order_status",
  "data": {
    "orderId": "order_001",
    "status": "assigned",
    "escortName": "张护士"
  }
}
```

---

## 六、附录

### 6.1 订单状态流转

```
pending → paid → confirmed → assigned → in_progress → completed
    │               │                                      │
    └── cancelled ──┴──────── refunding → refunded ────────┘
```

### 6.2 陪诊员等级

| 值 | 说明 |
|------|------|
| trainee | 实习 |
| junior | 初级 |
| intermediate | 中级 |
| senior | 高级 |
| expert | 专家 |

### 6.3 医院等级

| 值 | 说明 |
|------|------|
| tertiary_a | 三级甲等 |
| tertiary_b | 三级乙等 |
| tertiary_c | 三级丙等 |
| secondary_a | 二级甲等 |
| secondary_b | 二级乙等 |
| primary | 一级 |

---

**文档维护人：** Kekeling 技术团队  
**最后更新：** 2024-12-08

