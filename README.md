# 德润万联教育平台

一个连接家长和老师的教育资源匹配平台，旨在为家长找到合适的老师，为老师提供展示教学能力的机会。

## 功能特点

- **多角色支持**：管理员、家长和老师三种用户角色
- **任务发布**：家长可以发布教学任务，包括孩子年级、辅导学科和价格
- **老师匹配**：根据学科和年级匹配合适的老师
- **价格机制**：家长发布价格自动加价20%展示给老师，老师价格同样加价20%展示给家长
- **安全支付**：家长支付给管理员，确保交易安全
- **实名认证**：所有用户需完成实名认证才能使用平台功能

## 技术栈

- **前端框架**：React 18+
- **编程语言**：TypeScript
- **构建工具**：Vite
- **样式框架**：Tailwind CSS
- **状态管理**：Context API
- **路由管理**：React Router v7
- **UI组件**：Font Awesome图标

## 项目结构

```
src/
├── components/    # 可复用组件
├── contexts/      # React Context
├── hooks/         # 自定义Hooks
├── lib/           # 工具函数
├── models/        # 数据模型定义
└── pages/         # 页面组件
    ├── admin/     # 管理员页面
    ├── parent/    # 家长页面
    └── teacher/   # 老师页面
```

## 安装与使用

### 前提条件

- Node.js 16+
- npm 7+ 或 yarn 1.22+

### 安装依赖

```bash
npm install
# 或
yarn install
```

### 开发环境

```bash
npm run dev
# 或
yarn dev
```

### 构建生产版本

```bash
npm run build
# 或
yarn build
```

### 预览生产版本

```bash
npm run preview
# 或
yarn preview
```

## 许可证

本项目采用MIT许可证 - 详情参见LICENSE文件