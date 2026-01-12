# Vite Study Note

> 🚀 一个基于 Vite 7 + React 19 + TypeScript 5 的现代化前端项目模板，包含最佳实践配置。

## ✨ 特性

- ⚡️ **Vite 7** - 极速的开发体验和构建速度
- ⚛️ **React 19** - 最新版本的 React
- 🔷 **TypeScript 5** - 完整的类型支持
- 🎨 **Tailwind CSS 4** - 原子化 CSS 框架
- 📦 **pnpm** - 快速、节省磁盘空间的包管理器
- 🔍 **构建分析** - 内置 bundle 可视化分析
- 🛠️ **最佳实践** - 代码分割、预构建优化、资源分类

## 📁 项目结构

```
vite-study-note/
├── src/
│   ├── App.tsx           # 主应用组件
│   ├── index.tsx         # 应用入口
│   ├── vite-env.d.ts     # Vite 环境类型定义
│   ├── lib/
│   │   └── utils.js      # 工具函数 (cn)
│   └── styles/
│       └── index.css     # 全局样式 (Tailwind)
├── index.html            # HTML 模板
├── vite.config.ts        # Vite 配置
├── tsconfig.json         # TypeScript 配置 (浏览器端)
├── tsconfig.node.json    # TypeScript 配置 (Node 端)
├── package.json          # 项目配置
├── .env.development      # 开发环境变量
├── .env.production       # 生产环境变量
└── CONFIG_GUIDE.md       # 配置详细说明
```

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- pnpm >= 10

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
pnpm build
```

### 预览生产构建

```bash
pnpm preview
```

访问 http://localhost:4173

## 📜 可用脚本

| 脚本 | 描述 |
| --- | --- |
| `pnpm dev` | 启动开发服务器 (HMR) |
| `pnpm build` | 类型检查 + 生产构建 |
| `pnpm build:analyze` | 构建并生成 bundle 分析报告 |
| `pnpm preview` | 本地预览生产构建 |
| `pnpm type-check` | 仅运行 TypeScript 类型检查 |

## 🔧 技术栈

### 核心

| 技术 | 版本 | 用途 |
| --- | --- | --- |
| Vite | ^7.3.0 | 构建工具 |
| React | ^19.2.3 | UI 框架 |
| TypeScript | ^5.9.3 | 类型系统 |

### 样式

| 技术 | 版本 | 用途 |
| --- | --- | --- |
| Tailwind CSS | ^4.1.18 | 原子化 CSS |
| clsx | ^2.1.1 | 条件类名 |
| tailwind-merge | ^3.4.0 | 类名合并 |

### 开发工具

| 技术 | 版本 | 用途 |
| --- | --- | --- |
| @vitejs/plugin-react | ^5.1.2 | React Fast Refresh |
| @tailwindcss/vite | ^4.1.18 | Tailwind Vite 插件 |
| rollup-plugin-visualizer | ^6.0.5 | 构建分析 |

## 🎯 核心功能

### 1. 环境变量

```bash
# .env.development
VITE_API_URL=/api

# .env.production
VITE_API_URL=https://prod.api.com
```

在代码中使用：

```typescript
console.log(import.meta.env.VITE_API_URL);
```

### 2. 路径别名

```typescript
// 使用 @ 代替 src/
import { cn } from '@/lib/utils';
```

### 3. 代理配置

开发环境自动代理 API 请求：

```typescript
// /api/dataset/* → localhost:8080
// /api/experiments/* → localhost:8081
// /api/* → localhost:3000 (兜底)
```

### 4. 代码分割

构建输出自动分割：

```
dist/
├── js/
│   ├── index-[hash].js      # 业务代码
│   ├── react-vendor-[hash].js   # React 相关
│   └── vendor-[hash].js     # 其他第三方库
├── images/                  # 图片资源
├── fonts/                   # 字体资源
└── assets/                  # 其他资源
```

### 5. 工具函数

`cn()` - 智能合并 Tailwind 类名：

```typescript
import { cn } from '@/lib/utils';

// 条件类名 + 冲突处理
<div className={cn(
  'px-4 py-2',
  isActive && 'bg-blue-500',
  className  // 外部类可覆盖
)} />
```

## 📊 构建分析

运行以下命令生成 bundle 分析报告：

```bash
pnpm build:analyze
```

分析报告位于 `dist/stats.html`，包含：

- 各模块大小占比
- Gzip/Brotli 压缩后大小
- 依赖关系可视化

## ⚙️ 配置说明

详细配置说明请参阅 [CONFIG_GUIDE.md](./CONFIG_GUIDE.md)，包含：

- `vite.config.ts` 完整解析
- `tsconfig.json` 配置详解
- Tailwind CSS 最佳实践
- 构建优化策略

## 📝 开发规范

### TypeScript

- 启用严格模式 (`strict: true`)
- 检查未使用的变量和参数
- 使用 `bundler` 模块解析

### 样式

- 使用 Tailwind CSS 原子类
- 复杂组件使用 `cn()` 函数
- 避免内联样式

### 代码组织

- 组件放在 `src/components/`
- 工具函数放在 `src/lib/`
- 类型定义放在 `src/types/`

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 License

ISC
