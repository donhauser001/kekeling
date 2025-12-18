# 科科灵小程序宿主壳 (miniapp-shell)

> ⚠️ **重要声明**：这是一个"空壳"工程，仅负责小程序环境适配，不包含任何业务逻辑。

## 目录结构

```
miniapp-shell/
├── project.config.json       # 小程序配置
├── package.json              # 依赖配置
├── tsconfig.json             # TypeScript 配置
├── babel.config.js           # Babel 配置
├── config/                   # Taro 构建配置
│   ├── index.ts
│   ├── dev.ts
│   └── prod.ts
├── src/
│   ├── app.config.ts         # 小程序全局配置（仅路由）
│   ├── app.tsx               # 入口：环境检测 + runtime 注入
│   ├── app.scss              # 全局样式（最小化）
│   ├── pages/
│   │   └── main/             # 唯一页面容器
│   │       ├── index.config.ts
│   │       ├── index.tsx     # 挂载 TerminalPreviewApp
│   │       └── index.scss
│   └── runtime/
│       ├── index.ts          # runtime 入口
│       ├── env-inject.ts     # 环境注入逻辑
│       ├── bridge-impl.ts    # realWxBridge 完整实现
│       └── terminal-preview-app.tsx  # TerminalPreviewApp 占位
└── README.md
```

## 架构原则

### 四条红线（必须遵守）

1. **业务逻辑不得下沉到宿主**
   - 小程序里不允许出现任何订单/营销/工作台的业务判断
   - 宿主只负责：登录/支付/分享/定位/扫码/文件/存储/导航/提示

2. **桥接层是唯一宿主入口**
   - 小程序侧禁止直接调用 `wx.xxx`
   - 必须经 `WxBridge` 接口（`runtime/bridge-impl.ts`）
   - 页面侧对宿主能力零感知

3. **终端预览器是主干，宿主工程是薄壳**
   - 预览器代码为主仓主分支
   - 小程序工程只做集成与适配
   - 不允许出现"为了小程序更好用而改一套页面"的分叉

4. **API 通道不变**
   - `userRequest` / `escortRequest` 仍是数据入口
   - 小程序只替换底层 request 实现，不改变业务层调用方式

### 依赖关系

```
┌─────────────────────────────────────────────────────────────┐
│                    C. Host 宿主壳                           │
│  小程序启动、生命周期、权限授权、分享钩子、支付回调、环境注入    │
│  产物：miniapp-shell                                        │
├─────────────────────────────────────────────────────────────┤
│                    B. Platform 适配层                        │
│  WxBridge、网络 request 适配、存储适配、路由适配、媒体适配      │
│  产物：platform-adapter（唯一感知宿主）                       │
├─────────────────────────────────────────────────────────────┤
│                    A. Domain 业务层                          │
│  页面、组件、状态管理、请求封装、类型定义（禁止感知宿主）        │
│  产物：terminal-preview                                      │
└─────────────────────────────────────────────────────────────┘
```

## 快速开始

### 安装依赖

```bash
cd miniapp-shell
pnpm install
```

### 开发模式

```bash
# 微信小程序
pnpm dev:weapp

# H5
pnpm dev:h5
```

### 构建生产版本

```bash
# 微信小程序
pnpm build:weapp

# H5
pnpm build:h5
```

### 在微信开发者工具中打开

1. 打开微信开发者工具
2. 选择「导入项目」
3. 选择 `miniapp-shell` 目录
4. 确保 AppID 正确

## 边界约束

| 文件 | 允许 | 禁止 |
|-----|------|------|
| `app.tsx` | 环境检测、runtime 注入 | 业务逻辑、直接 `wx.xxx` |
| `pages/main/` | 挂载 TerminalPreviewApp | 业务组件、表单、列表 |
| `runtime/` | WxBridge 实现、环境适配 | 导入 domain 业务代码 |

## 代码扫描

确保代码符合架构规范：

```bash
# 检查是否有 wx.xxx 出现在 runtime 以外
grep -r "wx\." --include="*.ts" --include="*.tsx" src/ | grep -v "runtime/" | wc -l
# 预期结果：0

# 检查 runtime 是否导入了 domain 业务代码
grep -r "from.*domain" src/runtime/ | wc -l
# 预期结果：0
```

## 下一步

- [ ] 配置 monorepo 或发布 terminal-preview npm 包
- [ ] 从终端预览器主仓导入真实的 TerminalPreview 组件
- [ ] 实现 request 适配层（userRequest/escortRequest）
- [ ] 完成登录/支付/分享等原生能力对接

## 相关文档

- [全局终端预览器功能审计与迁移评估报告](../docs/终端预览器审计/全局终端预览器功能审计与迁移评估报告.md)
