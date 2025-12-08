# Kekeling 云开发后端

## 快速开始

### 1. 开通云开发

1. 打开微信开发者工具
2. 点击左上角「云开发」按钮
3. 开通云开发，创建环境（建议命名：`kekeling-prod`）
4. 记录环境 ID

### 2. 创建数据库集合

在云开发控制台 → 数据库 中创建以下集合：

| 集合名 | 权限 |
|--------|------|
| users | 仅创建者可读写 |
| patients | 仅创建者可读写 |
| orders | 仅创建者可读写 |
| services | 所有用户可读 |
| service_categories | 所有用户可读 |
| hospitals | 所有用户可读 |
| departments | 所有用户可读 |
| escorts | 所有用户可读 |
| banners | 所有用户可读 |
| app_config | 所有用户可读 |

详细字段说明见 `database/collections.md`

### 3. 上传云函数

在微信开发者工具中：

1. 右键点击 `cloud/functions` 目录下的每个云函数文件夹
2. 选择「上传并部署：云端安装依赖」

需要上传的云函数：
- `login` - 用户登录
- `bindPhone` - 绑定手机号
- `getHomeConfig` - 首页配置
- `getServices` - 服务列表
- `getHospitals` - 医院列表
- `getEscorts` - 陪诊员列表
- `createOrder` - 创建订单
- `getOrders` - 订单列表/详情
- `cancelOrder` - 取消订单
- `getPatients` - 就诊人列表
- `savePatient` - 保存就诊人
- `deletePatient` - 删除就诊人
- `wxpay` - 微信支付

### 4. 初始化测试数据

在云开发控制台导入测试数据：

#### services 集合示例数据

```json
{
  "_id": "service_001",
  "name": "门诊陪诊",
  "categoryId": "cat_001",
  "categoryName": "陪诊服务",
  "description": "全程陪同就医，协助挂号、取号、缴费、取药等",
  "price": 299,
  "originalPrice": 399,
  "unit": "次",
  "duration": "4小时",
  "coverImage": "",
  "tags": ["热门"],
  "serviceProcess": ["预约服务", "确认订单", "匹配陪诊员", "上门服务", "服务完成"],
  "orderCount": 12580,
  "rating": 98.5,
  "status": "active",
  "sort": 1,
  "isHot": true,
  "isRecommend": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### hospitals 集合示例数据

```json
{
  "_id": "hospital_001",
  "name": "上海市第一人民医院",
  "shortName": "市一医院",
  "level": "tertiary_a",
  "type": "general",
  "province": "上海市",
  "city": "上海市",
  "district": "虹口区",
  "address": "武进路85号",
  "latitude": 31.2642,
  "longitude": 121.4897,
  "phone": "021-63240090",
  "logo": "",
  "introduction": "上海市第一人民医院是一所集医疗、教学、科研于一体的大型综合性三级甲等医院。",
  "features": ["心内科", "骨科", "神经内科"],
  "orderCount": 5680,
  "status": "active",
  "sort": 1,
  "isHot": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### escorts 集合示例数据

```json
{
  "_id": "escort_001",
  "name": "张护士",
  "phone": "13800138001",
  "gender": "female",
  "avatar": "",
  "idCard": "310000199001011234",
  "level": "senior",
  "introduction": "从事护理工作10年，熟悉各大医院就诊流程",
  "specialties": ["门诊陪诊", "老年陪护", "检查陪同"],
  "serviceHospitals": ["hospital_001"],
  "orderCount": 568,
  "completedCount": 550,
  "rating": 98.5,
  "reviewCount": 420,
  "status": "active",
  "certificationStatus": "approved",
  "isOnline": true,
  "workDays": [1, 2, 3, 4, 5],
  "workTimeStart": "08:00",
  "workTimeEnd": "18:00",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### 5. 配置微信支付（可选）

在 `wxpay/index.js` 中配置商户号：

```javascript
subMchId: '你的商户号',
```

并在云开发控制台开通微信支付能力。

---

## 云函数说明

| 云函数 | 说明 | 参数 |
|--------|------|------|
| login | 用户登录 | - |
| bindPhone | 绑定手机号 | cloudID |
| getHomeConfig | 首页配置 | - |
| getServices | 服务列表 | categoryId, keyword, isHot, page, pageSize |
| getHospitals | 医院列表 | keyword, city, level, page, pageSize |
| getEscorts | 陪诊员列表 | hospitalId, level, isOnline, keyword, page, pageSize |
| createOrder | 创建订单 | serviceId, hospitalId, patientId, appointmentDate, appointmentTime, ... |
| getOrders | 订单列表/详情 | status, orderId, page, pageSize |
| cancelOrder | 取消订单 | orderId, reason |
| getPatients | 就诊人列表 | - |
| savePatient | 保存就诊人 | id?, name, phone, idCard, gender, relation, isDefault |
| deletePatient | 删除就诊人 | id |
| wxpay | 微信支付 | orderId, action(prepay/callback) |

---

## 迁移到 Node.js

备案通过后，可以迁移到自有后端：

1. 云函数逻辑可直接复用到 Nest.js Controller
2. 云数据库数据可导出为 JSON，导入到 MySQL/PostgreSQL
3. 小程序端只需修改 API 调用方式（云函数 → HTTP 请求）

建议保留云开发环境作为备用。

