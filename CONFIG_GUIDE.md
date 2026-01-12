# Vite + React + TypeScript 配置详解

本文档详细解释项目中各配置文件的作用和最佳实践。

---

## 📦 package.json

```json
{
  "name": "vite-study-note",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "dev": "vite",                           // 启动开发服务器
    "build": "tsc && vite build",            // 先类型检查，再构建
    "build:analyze": "vite build --mode analyze",  // 构建并生成分析报告
    "preview": "vite preview",               // 预览生产构建
    "type-check": "tsc --noEmit"             // 仅类型检查，不输出文件
  },
  "packageManager": "pnpm@10.26.0",          // 锁定包管理器版本
  "devDependencies": {
    "@tailwindcss/vite": "^4.1.18",          // Tailwind CSS Vite 插件
    "@types/react": "^19.2.7",               // React 类型定义
    "@types/react-dom": "^19.2.3",           // React DOM 类型定义
    "@vitejs/plugin-react": "^5.1.2",        // Vite React 插件
    "rollup-plugin-visualizer": "^6.0.5",   // 构建分析可视化
    "tailwindcss": "^4.1.18",                // Tailwind CSS
    "typescript": "^5.9.3",                  // TypeScript 编译器
    "vite": "^7.3.0"                         // Vite 构建工具
  },
  "dependencies": {
    "clsx": "^2.1.1",                        // 条件类名工具
    "react": "^19.2.3",                      // React 核心
    "react-dom": "^19.2.3",                  // React DOM
    "tailwind-merge": "^3.4.0"               // Tailwind 类名合并
  }
}
```

### 脚本说明

| 脚本 | 用途 | 使用场景 |
|------|------|----------|
| `dev` | 启动开发服务器，支持 HMR | 日常开发 |
| `build` | 类型检查 + 生产构建 | 发布前构建 |
| `build:analyze` | 构建并生成 bundle 分析 | 优化打包体积 |
| `preview` | 本地预览生产构建 | 验证构建结果 |
| `type-check` | 仅类型检查 | CI/CD 或快速检查 |

### 依赖分类原则

- **devDependencies**: 仅在开发/构建时需要，不会打包到生产环境
- **dependencies**: 运行时需要，会被打包到生产环境

---

## ⚙️ vite.config.ts

### 完整配置解析

```typescript
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  // 加载环境变量
  // loadEnv(mode, root, prefix)
  // - mode: 当前模式 (development/production/analyze)
  // - root: 项目根目录
  // - prefix: 变量前缀，'' 表示加载所有
  const env = loadEnv(mode, process.cwd(), "");
  const isDev = mode === "development";

  return {
    // ... 配置项
  };
});
```

### 1. 插件配置 (plugins)

```typescript
plugins: [
  // React 插件：提供 Fast Refresh（热更新）和 JSX 转换
  react(),
  
  // Tailwind CSS 插件：处理 CSS 原子类
  tailwindcss(),
  
  // 条件插件：仅在 analyze 模式下启用
  // 使用 mode === "analyze" && plugin 模式
  mode === "analyze" &&
    visualizer({
      open: false,       // 不自动打开浏览器
      gzipSize: true,    // 显示 gzip 压缩后大小
      brotliSize: true,  // 显示 brotli 压缩后大小
      filename: "dist/stats.html",  // 输出文件路径
    }),
].filter(Boolean)  // 过滤掉 false 值
```

**为什么用 `.filter(Boolean)`？**

```typescript
// 当 mode !== "analyze" 时
[react(), tailwindcss(), false].filter(Boolean)
// 结果: [react(), tailwindcss()]

// 当 mode === "analyze" 时
[react(), tailwindcss(), visualizer()].filter(Boolean)
// 结果: [react(), tailwindcss(), visualizer()]
```

### 2. 开发服务器配置 (server)

```typescript
server: {
  port: 3000,        // 开发服务器端口
  open: true,        // 启动后自动打开浏览器
  
  // HMR (Hot Module Replacement) 配置
  hmr: {
    overlay: true,   // 错误时显示全屏覆盖层
  },
  
  // 🔥 预热配置：提前编译常用文件，加速首次加载
  warmup: {
    clientFiles: ["./src/App.tsx", "./src/index.tsx"],
  },
  
  // 代理配置：解决开发环境跨域问题
  proxy: {
    // 规则 1：/api/dataset/* → localhost:8080
    "/api/dataset": {
      target: "http://localhost:8080",
      changeOrigin: true,  // 修改请求头中的 Host
      rewrite: (path) => path.replace(/^\/api/, ""),
      // 调试日志
      configure: (proxy, _options) => {
        proxy.on("proxyReq", (proxyReq, req, _res) => {
          console.log("Proxying:", req.method, req.url, "→", proxyReq.path);
        });
      },
    },
    
    // 规则 2：/api/experiments/* → localhost:8081
    "/api/experiments": {
      target: "http://localhost:8081",
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ""),
    },
    
    // 规则 3：其他 /api/* → localhost:3000（兜底）
    // 使用正则表达式匹配
    "^/api/.*": {
      target: "http://localhost:3000",
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ""),
    },
  },
}
```

**代理匹配顺序：**
1. 具体路径优先：`/api/dataset` > `^/api/.*`
2. 先定义的优先

**代理示例：**

| 请求路径 | 代理目标 | 最终路径 |
|----------|----------|----------|
| `/api/dataset/list` | `localhost:8080` | `/dataset/list` |
| `/api/experiments/1` | `localhost:8081` | `/experiments/1` |
| `/api/users` | `localhost:3000` | `/users` |

### 3. 依赖预构建 (optimizeDeps)

```typescript
optimizeDeps: {
  // 预构建这些依赖，加速开发环境首次加载
  include: ["react", "react-dom", "react/jsx-runtime"],
  
  // 排除的依赖（不进行预构建）
  exclude: [],
}
```

**为什么需要预构建？**
- 将 CommonJS/UMD 转换为 ESM
- 合并小模块，减少 HTTP 请求
- 缓存编译结果，加速后续启动

### 4. 路径别名 (resolve.alias)

```typescript
resolve: {
  alias: {
    "@": path.resolve(__dirname, "src"),
  },
}
```

**使用效果：**

```typescript
// 之前
import { Button } from "../../../components/Button";

// 之后
import { Button } from "@/components/Button";
```

### 5. 构建配置 (build)

```typescript
build: {
  outDir: "dist",           // 输出目录
  minify: "esbuild",        // 压缩工具（esbuild 比 terser 快 20-40 倍）
  target: "es2015",         // 构建目标（决定 JS 语法兼容性）
  sourcemap: isDev,         // 开发环境生成 sourcemap
  chunkSizeWarningLimit: 1000,  // chunk 超过 1000kb 时警告
  reportCompressedSize: true,   // 显示 gzip 压缩后大小
  
  // esbuild 优化配置
  esbuild: {
    // 生产环境移除所有 console 和 debugger
    drop: isDev ? [] : ["console", "debugger"],
    // 移除特定函数调用（作为纯函数处理）
    pure: isDev ? [] : ["console.log", "console.info"],
  },
  
  // Rollup 配置
  rollupOptions: {
    output: {
      // 代码分割策略
      manualChunks: (id) => {
        // React 相关打包到 react-vendor
        if (
          id.includes("node_modules/react") ||
          id.includes("node_modules/react-dom")
        ) {
          return "react-vendor";
        }
        // 其他第三方库打包到 vendor
        if (id.includes("node_modules")) {
          return "vendor";
        }
        // 返回 undefined 则使用默认分割
      },
      
      // 文件命名规则
      chunkFileNames: "js/[name]-[hash].js",     // 分割的 chunk
      entryFileNames: "js/[name]-[hash].js",     // 入口文件
      
      // 资源文件分类
      assetFileNames: (assetInfo) => {
        const info = assetInfo.name.split(".");
        const ext = info[info.length - 1];
        
        // 图片 → images/
        if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
          return `images/[name]-[hash][extname]`;
        }
        // 字体 → fonts/
        if (/woff2?|eot|ttf|otf/i.test(ext)) {
          return `fonts/[name]-[hash][extname]`;
        }
        // 其他 → assets/
        return `assets/[name]-[hash][extname]`;
      },
    },
  },
}
```

**构建输出结构：**

```
dist/
├── index.html
├── js/
│   ├── index-[hash].js      # 入口文件
│   ├── react-vendor-[hash].js   # React 相关
│   └── vendor-[hash].js     # 其他第三方库
├── images/
│   └── logo-[hash].png
├── fonts/
│   └── inter-[hash].woff2
└── assets/
    └── index-[hash].css
```

### 6. 预览服务器 (preview)

```typescript
preview: {
  port: 4173,   // 预览服务器端口
  open: true,   // 自动打开浏览器
}
```

---

## 📝 tsconfig.json

### 完整配置解析

```json
{
  "compilerOptions": {
    // === 编译目标 ===
    "target": "ES2020",           // 输出的 JS 版本
    "lib": ["ES2020", "DOM", "DOM.Iterable"],  // 可用的类型库
    "module": "ESNext",           // 模块系统
    
    // === Bundler 模式（Vite 推荐）===
    "moduleResolution": "bundler",      // 模块解析策略
    "allowImportingTsExtensions": true, // 允许导入 .ts/.tsx 文件
    "resolveJsonModule": true,          // 允许导入 JSON 文件
    "isolatedModules": true,            // 每个文件作为独立模块
    "noEmit": true,                     // 不输出编译结果（Vite 负责）
    "jsx": "react-jsx",                 // JSX 转换方式（React 17+）
    
    // === 类型检查 ===
    "strict": true,                     // 启用所有严格检查
    "noUnusedLocals": true,             // 检查未使用的局部变量
    "noUnusedParameters": true,         // 检查未使用的参数
    "noFallthroughCasesInSwitch": true, // 防止 switch 穿透
    "forceConsistentCasingInFileNames": true,  // 文件名大小写一致
    
    // === 性能优化 ===
    "skipLibCheck": true,               // 跳过 .d.ts 文件检查
    "incremental": true,                // 增量编译
    
    // === 模块互操作 ===
    "esModuleInterop": true,            // ES/CommonJS 互操作
    "allowSyntheticDefaultImports": true, // 允许默认导入
    
    // === 路径别名 ===
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    
    // === Class 字段 ===
    "useDefineForClassFields": true     // 使用标准的类字段定义
  },
  
  // 包含的文件
  "include": ["src"],
  
  // 项目引用（分离浏览器端和 Node 端配置）
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 关键配置详解

#### 1. `target` vs `lib`

```typescript
// target: 决定输出的 JS 语法
"target": "ES2020"  // 输出 ES2020 语法

// lib: 决定可用的类型定义
"lib": ["ES2020", "DOM", "DOM.Iterable"]
// - ES2020: Promise, Array.prototype.flatMap 等
// - DOM: document, window, HTMLElement 等
// - DOM.Iterable: NodeList 可迭代
```

#### 2. `moduleResolution: "bundler"`

```typescript
// bundler 模式特性：
// ✅ 支持 exports/imports 字段
// ✅ 支持条件导出
// ✅ 更好的路径解析
// ✅ 专为打包工具优化

// 对比其他模式：
// "node" - 传统 Node.js 解析
// "nodenext" - Node.js ESM 解析
// "bundler" - 打包工具解析（推荐）
```

#### 3. `isolatedModules: true`

```typescript
// 必须启用！Vite 使用 esbuild 编译
// esbuild 单文件编译，不支持跨文件类型操作

// ❌ 以下语法在 isolatedModules 模式下会报错：
// 1. const enum（跨文件内联）
const enum Colors { Red, Green, Blue }

// 2. 纯类型的重导出
export { SomeType } from './types';  // 需要用 export type

// ✅ 正确写法：
export type { SomeType } from './types';
```

#### 4. `jsx: "react-jsx"`

```typescript
// react-jsx: React 17+ 新转换
// 无需手动 import React
function App() {
  return <div>Hello</div>;  // ✅ 无需 import React
}

// react: 传统转换
// 需要 import React from 'react';
```

#### 5. 严格模式选项

```typescript
"strict": true  // 等同于启用以下所有选项：

// strictNullChecks - null/undefined 检查
let name: string;
name = null;  // ❌ Error

// strictFunctionTypes - 函数参数双变检查
// strictBindCallApply - bind/call/apply 类型检查
// strictPropertyInitialization - 属性初始化检查
// noImplicitAny - 禁止隐式 any
// noImplicitThis - 禁止隐式 this
// alwaysStrict - 输出 "use strict"
```

---

## 📝 tsconfig.node.json

### 为什么需要单独配置？

```json
{
  "compilerOptions": {
    "composite": true,                  // 启用项目引用
    "skipLibCheck": true,               // 跳过类型库检查
    "module": "ESNext",                 // ESM 模块
    "moduleResolution": "bundler",      // 打包工具解析
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

### 分离配置的原因

| 环境 | 需要的类型 | 配置文件 |
|------|-----------|----------|
| 浏览器端（src/） | DOM, React | tsconfig.json |
| Node 端（vite.config.ts） | Node.js | tsconfig.node.json |

```typescript
// vite.config.ts 需要 Node.js 类型
import path from "path";  // Node.js 内置模块
import { defineConfig } from "vite";

// src/App.tsx 需要 DOM 类型
document.getElementById("root");  // DOM API
```

**如果不分离会怎样？**

```typescript
// 类型冲突示例
// Node.js 的 global vs 浏览器的 window
// Node.js 的 process vs 浏览器没有 process
```

### `composite: true` 的作用

```json
"composite": true
```

1. **启用项目引用**：允许 `tsconfig.json` 通过 `references` 引用
2. **生成 `.tsbuildinfo`**：增量构建信息
3. **强制 `declaration: true`**：生成类型声明

---

## 🎨 Tailwind CSS 配置

### 在 CSS 中使用

```css
/* src/styles/index.css */
@import "tailwindcss";

/* 自定义组件样式 */
@layer components {
  .btn-primary {
    @apply bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600;
  }
}

/* 自定义工具类 */
@layer utilities {
  .text-shadow {
    text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
  }
}
```

### Tailwind v4 特性

```typescript
// Tailwind v4 使用 @tailwindcss/vite 插件
// 不再需要 tailwind.config.js
// 配置直接在 CSS 中进行

@import "tailwindcss";

@theme {
  --color-primary: #007bff;
  --font-sans: "Inter", sans-serif;
}
```

---

## 🔧 工具函数：clsx + tailwind-merge

### clsx - 条件类名

```typescript
import clsx from 'clsx';

// 条件组合类名
clsx('btn', isActive && 'btn-active', isDisabled && 'btn-disabled');
// 结果：'btn btn-active'（假设 isActive=true, isDisabled=false）

// 对象语法
clsx({ 'btn-active': isActive, 'btn-disabled': isDisabled });
```

### tailwind-merge - 智能合并

```typescript
import { twMerge } from 'tailwind-merge';

// 解决 Tailwind 类冲突
twMerge('px-2 py-1', 'px-4');
// 结果：'py-1 px-4'（px-4 覆盖 px-2）

// 普通字符串拼接的问题
'px-2 py-1 ' + 'px-4';
// 结果：'px-2 py-1 px-4'（冲突！px-2 和 px-4 都存在）
```

### 推荐：cn 工具函数

```typescript
// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 使用
import { cn } from '@/lib/utils';

function Button({ className, variant }) {
  return (
    <button
      className={cn(
        'px-4 py-2 rounded',
        variant === 'primary' && 'bg-blue-500 text-white',
        variant === 'secondary' && 'bg-gray-200 text-gray-800',
        className  // 外部传入的类可以覆盖默认样式
      )}
    />
  );
}
```

---

## 📊 构建分析

### 运行分析

```bash
pnpm run build:analyze
```

### 查看报告

构建完成后，打开 `dist/stats.html`：

```
dist/
└── stats.html    # 可视化分析报告
```

### 报告内容

- **Stat**: 原始大小
- **Parsed**: 解析后大小
- **Gzip**: Gzip 压缩后大小
- **Brotli**: Brotli 压缩后大小

### 优化建议

| 问题 | 解决方案 |
|------|----------|
| 单个 chunk 过大 | 调整 `manualChunks` 策略 |
| 重复依赖 | 检查 `pnpm-lock.yaml` |
| 未使用的代码 | 检查 Tree Shaking |
| 大型依赖 | 考虑替代方案或按需导入 |

---

## 🚀 最佳实践总结

### 1. 开发体验优化

- ✅ 启用 `warmup` 预热常用文件
- ✅ 配置路径别名 `@/`
- ✅ 使用 HMR overlay 快速定位错误

### 2. 构建优化

- ✅ 合理的代码分割策略
- ✅ 生产环境移除 console
- ✅ 资源文件分类存放

### 3. 类型安全

- ✅ 启用严格模式
- ✅ 分离浏览器/Node 配置
- ✅ 检查未使用的变量

### 4. 样式管理

- ✅ 使用 Tailwind CSS
- ✅ cn() 工具函数处理类名
- ✅ 组件级样式封装

---

## 📚 参考链接

- [Vite 官方文档](https://vitejs.dev/)
- [TypeScript 配置参考](https://www.typescriptlang.org/tsconfig)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [Rollup 代码分割](https://rollupjs.org/guide/en/#code-splitting)
