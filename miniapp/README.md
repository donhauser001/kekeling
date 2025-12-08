# Kekeling 陪诊服务小程序

> 基于 Taro 3.x + React 18 的微信小程序

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Taro 4.x |
| UI 框架 | React 18 |
| 类型系统 | TypeScript |
| 组件库 | NutUI-React (待集成) |
| 状态管理 | Zustand |
| 样式 | Sass + CSS Variables |

## 项目结构

```
src/
├── app.tsx              # 入口组件
├── app.config.ts        # 全局配置（TabBar、pages）
├── app.scss             # 全局样式
├── pages/               # 页面
│   ├── index/           # 首页 (TabBar)
│   ├── services/        # 服务 (TabBar)
│   ├── orders/          # 订单 (TabBar)
│   ├── user/            # 我的 (TabBar)
│   ├── booking/         # 预约下单
│   ├── hospital/        # 医院
│   ├── escort/          # 陪诊员
│   └── auth/            # 登录
├── components/          # 通用组件
├── services/            # API 服务
├── stores/              # 状态管理
├── hooks/               # 自定义 Hooks
├── utils/               # 工具函数
└── assets/              # 静态资源
```

## 开发

```bash
# 安装依赖
pnpm install

# 开发模式（微信小程序）
pnpm dev:weapp

# 构建（微信小程序）
pnpm build:weapp

# H5 开发
pnpm dev:h5
```

## 页面说明

### TabBar 页面

| 页面 | 路径 | 说明 |
|------|------|------|
| 首页 | `/pages/index/index` | Banner、服务入口、热门服务、推荐陪诊员 |
| 服务 | `/pages/services/index` | 服务分类、服务列表 |
| 订单 | `/pages/orders/index` | 订单列表（分 Tab） |
| 我的 | `/pages/user/index` | 个人中心 |

### 功能页面

| 页面 | 路径 | 说明 |
|------|------|------|
| 服务详情 | `/pages/services/detail` | 服务介绍、价格、预约入口 |
| 预约下单 | `/pages/booking/index` | 选择医院→陪诊员→就诊人→时间 |
| 订单详情 | `/pages/orders/detail` | 订单状态、就诊信息、陪诊员联系 |
| 就诊人管理 | `/pages/user/patients` | 添加/编辑就诊人 |
| 医院列表 | `/pages/hospital/list` | 医院搜索、排序 |
| 陪诊员列表 | `/pages/escort/list` | 陪诊员筛选 |
| 登录 | `/pages/auth/login` | 微信一键登录 |

## 开发进度

- [x] 项目初始化
- [x] 首页 UI
- [x] 服务列表/详情
- [x] 订单列表/详情
- [x] 个人中心
- [x] 预约下单流程
- [x] 医院/陪诊员列表
- [x] 登录页面
- [ ] API 对接
- [ ] 微信支付对接
- [ ] NutUI 组件集成
- [ ] 测试优化

## 注意事项

1. **AppID 配置**：在 `project.config.json` 中填写真实的小程序 AppID
2. **服务器域名**：在微信小程序后台配置 request 合法域名
3. **支付对接**：需要商户号和 API 密钥

## 相关文档

- [用户端产品规划文档](../docs/用户端产品规划文档.md)
- [API 接口规范文档](../docs/API接口规范文档.md)
- [MVP 紧急上线执行计划](../docs/MVP紧急上线执行计划.md)

