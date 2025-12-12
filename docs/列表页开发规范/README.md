# 列表页开发规范文档

本文档定义了后台管理系统列表页的统一开发规范，确保所有列表页在布局、交互和代码结构上保持一致。

## 目录

### 基础架构

- [01-文件结构](./01-文件结构.md) - 模块目录结构、命名规范
- [02-页面布局](./02-页面布局.md) - Header + Main 布局、标题区

### 表格开发

- [03-表格组件](./03-表格组件.md) - useReactTable 配置、渲染模板、Skeleton 加载
- [04-列定义](./04-列定义.md) - 常用列类型、长文本、数字、日期格式化
- [05-状态标签样式](./05-状态标签样式.md) - 颜色映射、语义规范
- [06-操作列菜单](./06-操作列菜单.md) - 查看/编辑/删除标配、交互规范

### 辅助组件

- [07-翻页组件](./07-翻页组件.md) - DataTablePagination 使用
- [08-工具栏配置](./08-工具栏配置.md) - 搜索、筛选、列显隐
- [09-弹窗组件](./09-弹窗组件.md) - 弹窗规范引用、文件拆分

### 附录

- [10-完整示例](./10-完整示例.md) - 参考文件列表
- [11-检查清单](./11-检查清单.md) - 开发确认要点

---

## 快速参考

### 文件结构

```
src/features/{module-name}/
├── index.tsx                      # 主页面
└── components/
    ├── {module}-columns.tsx       # 列定义
    ├── {module}-table.tsx         # 表格组件
    ├── {module}-action-dialog.tsx # 新建/编辑弹窗
    ├── {module}-detail-sheet.tsx  # 查看详情抽屉
    └── {module}-delete-dialog.tsx # 删除确认弹窗
```

### 操作列标配

| 顺序 | 操作 | 组件 | 说明 |
|------|------|------|------|
| 1 | 查看 | Sheet | 详情抽屉 |
| 2 | 编辑 | Dialog | 编辑弹窗 |
| 3 | 业务操作 | - | 视业务而定 |
| - | 分割线 | Separator | 危险操作前 |
| 4 | 删除 | ConfirmDialog | 红色警示 |

### 状态颜色语义

| 语义 | 颜色 | 适用状态 |
|------|------|---------|
| 成功/启用 | `teal` (青绿) | active, enabled, running |
| 禁用/结束 | `neutral` (灰色) | inactive, disabled, ended |
| 等待/待处理 | `sky` (天蓝) | pending, waiting |
| 警告/暂停 | `amber` (琥珀) | warning, paused |
| 错误/取消 | `destructive` (红色) | error, cancelled |

### 核心规范

- ❌ 不使用 Card 包裹表格
- ✅ 加载状态使用 Skeleton 骨架屏
- ✅ 长文本列添加 `truncate` + `max-w`
- ✅ 金额列右对齐 + `font-mono`
- ✅ 日期时间必须格式化
- ✅ **每列必须添加 `meta: { title: '中文名称' }`**

### 列定义模板

```tsx
{
  accessorKey: 'type',
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title='类型' />
  ),
  cell: ({ row }) => <Badge>{row.getValue('type')}</Badge>,
  meta: { title: '类型' },  // 必须：显示列菜单显示中文
}
```
