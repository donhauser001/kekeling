# 云数据库集合设计

> 在微信开发者工具的云开发控制台中创建以下集合

## 集合列表

| 集合名 | 说明 | 权限 |
|--------|------|------|
| users | 用户信息 | 仅创建者可读写 |
| patients | 就诊人 | 仅创建者可读写 |
| services | 服务项目 | 所有用户可读 |
| service_categories | 服务分类 | 所有用户可读 |
| hospitals | 医院 | 所有用户可读 |
| departments | 科室 | 所有用户可读 |
| escorts | 陪诊员 | 所有用户可读 |
| orders | 订单 | 仅创建者可读写 |
| banners | 轮播图 | 所有用户可读 |
| app_config | 应用配置 | 所有用户可读 |

---

## 集合结构

### users (用户)

```json
{
  "_id": "自动生成",
  "_openid": "微信openid",
  "unionid": "微信unionid",
  "phone": "手机号",
  "nickname": "昵称",
  "avatar": "头像URL",
  "gender": "male/female/unknown",
  "status": "active/inactive/suspended",
  "memberLevel": "会员等级",
  "points": 0,
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### patients (就诊人)

```json
{
  "_id": "自动生成",
  "_openid": "所属用户openid",
  "name": "姓名",
  "phone": "手机号",
  "idCard": "身份证号",
  "gender": "male/female",
  "birthday": "生日",
  "relation": "与用户关系：本人/父母/配偶/子女/其他",
  "medicalCardNo": "就诊卡号",
  "isDefault": true,
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### services (服务)

```json
{
  "_id": "自动生成",
  "name": "服务名称",
  "categoryId": "分类ID",
  "categoryName": "分类名称",
  "description": "服务描述",
  "detailContent": "详情富文本",
  "price": 299,
  "originalPrice": 399,
  "unit": "次/天/小时",
  "duration": "4小时",
  "coverImage": "封面图URL",
  "images": ["详情图URL"],
  "tags": ["标签"],
  "serviceProcess": ["流程步骤"],
  "orderCount": 0,
  "rating": 100,
  "status": "active/inactive",
  "sort": 0,
  "isHot": false,
  "isRecommend": false,
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### hospitals (医院)

```json
{
  "_id": "自动生成",
  "name": "医院名称",
  "shortName": "简称",
  "level": "tertiary_a/tertiary_b/secondary_a/secondary_b/primary",
  "type": "general/specialized/tcm/maternal",
  "province": "省",
  "city": "市",
  "district": "区",
  "address": "详细地址",
  "latitude": 31.23,
  "longitude": 121.47,
  "phone": "联系电话",
  "logo": "Logo URL",
  "images": ["图片URL"],
  "introduction": "简介",
  "features": ["特色科室"],
  "orderCount": 0,
  "status": "active/inactive",
  "sort": 0,
  "isHot": false,
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### escorts (陪诊员)

```json
{
  "_id": "自动生成",
  "name": "姓名",
  "phone": "手机号",
  "gender": "male/female",
  "avatar": "头像URL",
  "idCard": "身份证号",
  "level": "trainee/junior/intermediate/senior/expert",
  "introduction": "个人简介",
  "specialties": ["擅长领域"],
  "certificates": ["证书URL"],
  "serviceHospitals": ["服务医院ID"],
  "serviceCategories": ["服务类型ID"],
  "orderCount": 0,
  "completedCount": 0,
  "rating": 100,
  "reviewCount": 0,
  "status": "active/inactive/pending/suspended",
  "certificationStatus": "pending/approved/rejected",
  "isOnline": true,
  "workDays": [1, 2, 3, 4, 5],
  "workTimeStart": "08:00",
  "workTimeEnd": "18:00",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### orders (订单)

```json
{
  "_id": "自动生成",
  "_openid": "用户openid",
  "orderNo": "订单编号",
  
  "serviceId": "服务ID",
  "serviceName": "服务名称",
  "serviceCategory": "服务分类",
  
  "hospitalId": "医院ID",
  "hospitalName": "医院名称",
  "departmentId": "科室ID",
  "departmentName": "科室名称",
  
  "appointmentDate": "预约日期",
  "appointmentTime": "预约时间",
  
  "patientId": "就诊人ID",
  "patientName": "就诊人姓名",
  "patientPhone": "就诊人电话",
  "patientIdCard": "身份证号",
  
  "escortId": "陪诊员ID",
  "escortName": "陪诊员姓名",
  "escortPhone": "陪诊员电话",
  
  "totalAmount": 299,
  "discountAmount": 0,
  "paidAmount": 299,
  
  "couponId": "优惠券ID",
  "couponAmount": 0,
  
  "paymentMethod": "wechat",
  "paymentTime": "Date",
  "transactionId": "微信支付流水号",
  
  "status": "pending/paid/confirmed/assigned/in_progress/completed/cancelled/refunding/refunded",
  "source": "miniprogram",
  
  "userRemark": "用户备注",
  "adminRemark": "管理员备注",
  
  "rating": 5,
  "review": "评价内容",
  "reviewTime": "Date",
  
  "cancelReason": "取消原因",
  "cancelTime": "Date",
  "refundAmount": 0,
  "refundTime": "Date",
  
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### banners (轮播图)

```json
{
  "_id": "自动生成",
  "image": "图片URL",
  "link": "跳转链接",
  "linkType": "none/page/service/url",
  "sort": 0,
  "status": "active/inactive",
  "startTime": "Date",
  "endTime": "Date",
  "createdAt": "Date"
}
```

### app_config (应用配置)

```json
{
  "_id": "home_config",
  "serviceEntries": [
    { "id": "1", "name": "全程陪诊", "icon": "URL", "link": "/pages/services/detail?id=1" }
  ],
  "hotSearchWords": ["挂号", "陪诊", "体检"],
  "contactPhone": "400-123-4567",
  "serviceAgreement": "URL",
  "privacyPolicy": "URL",
  "updatedAt": "Date"
}
```

---

## 索引建议

### orders 集合
- `_openid` (升序) - 查询用户订单
- `status` (升序) - 按状态筛选
- `createdAt` (降序) - 按时间排序
- 组合索引: `_openid` + `status` + `createdAt`

### services 集合
- `categoryId` (升序)
- `status` (升序)
- `sort` (升序)
- `isHot` (升序)

### hospitals 集合
- `city` (升序)
- `status` (升序)
- 地理位置索引: `latitude`, `longitude`

### escorts 集合
- `status` (升序)
- `isOnline` (升序)
- `level` (升序)

---

## 权限规则

在云开发控制台设置权限：

### 仅创建者可读写
适用于: `users`, `patients`, `orders`
```json
{
  "read": "doc._openid == auth.openid",
  "write": "doc._openid == auth.openid"
}
```

### 所有用户可读
适用于: `services`, `hospitals`, `escorts`, `banners`, `app_config`
```json
{
  "read": true,
  "write": false
}
```

