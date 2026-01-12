import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ""); // 加载环境变量
  const isDev = mode === "development";
  return {
    // 插件
    plugins: [
      react(), // 提供 Fast Refresh 和 JSX 环境
      tailwindcss(),
      // ✅ 只在需要时打开 visualizer
      mode === "analyze" &&
        visualizer({
          open: false, // 构建完自动打开
          gzipSize: true, // 显示 gzip 大小
          brotliSize: true, // 显示 brotli 大小
          filename: "dist/stats.html", // 生成的文件位置
        }),
    ].filter(Boolean),
    server: {
      port: 3000,
      open: true, // 启动后自动打开浏览器
      hmr: {
        overlay: true,
      },
      // ✅ 添加 warmup 预热
      warmup: {
        clientFiles: ["./src/App.tsx", "./src/index.tsx"],
      },
      proxy: {
        // === 代理规则 1：Dataset 服务 (localhost:8080) ===
        "/api/dataset": {
          target: "http://localhost:8080",
          changeOrigin: true,
          // ⚠️ 注意区别：Vite 这里是函数！
          rewrite: (path) => path.replace(/^\/api/, ""),
          // 结果：/api/dataset/list -> /dataset/list
          // ✅ 添加日志
          configure: (proxy, _options) => {
            proxy.on("proxyReq", (proxyReq, req, _res) => {
              console.log("Proxying:", req.method, req.url, "→", proxyReq.path);
            });
          },
        },

        // === 代理规则 2：Experiments 服务 (localhost:8081) ===
        "/api/experiments": {
          target: "http://localhost:8081",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
        // === 代理规则 3：通用/兜底 (localhost:3000) ===
        // 使用正则匹配：匹配所有其他以 /api 开头的
        // 注意：这就要求把具体的规则写在上面，正则写在下面，
        // 或者依靠 key 的特定性（Vite 也是优先匹配更具体的字符串）
        "^/api/.*": {
          target: "http://localhost:3000",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
    // ✅ 优化依赖预构建
    optimizeDeps: {
      include: ["react", "react-dom", "react/jsx-runtime"],
      exclude: [],
    },
    // 解析
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },

    base: env.VITE_ENV === "production" ? "/" : "/",

    //构建 - 对应 Webpack 的 output
    build: {
      outDir: "dist",
      minify: "esbuild",
      target: "es2015",
      sourcemap: isDev,
      // CSS 代码分割, 默认行为
      // cssCodeSplit: true,
      // 设置 chunk 大小警告限制
      chunkSizeWarningLimit: 1000,
      // 启用 gzip 压缩提示
      reportCompressedSize: true,
      esbuild: {
        drop: isDev ? [] : ["console", "debugger"], // 生产环境移除 console
        pure: isDev ? [] : ["console.log", "console.info"], // 移除特定调用
      },
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // React 全家桶
            if (
              id.includes("node_modules/react") ||
              id.includes("node_modules/react-dom")
            ) {
              return "react-vendor";
            }
            // 其他 node_modules
            if (id.includes("node_modules")) {
              return "vendor";
            }
          },
          // 优化 chunk 文件名
          chunkFileNames: "js/[name]-[hash].js",
          entryFileNames: "js/[name]-[hash].js",
          assetFileNames: (assetInfo) => {
            // ✅ 根据文件类型分类
            const info = assetInfo.name.split(".");
            const ext = info[info.length - 1];
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
              return `images/[name]-[hash][extname]`;
            }
            if (/woff2?|eot|ttf|otf/i.test(ext)) {
              return `fonts/[name]-[hash][extname]`;
            }
            return `assets/[name]-[hash][extname]`;
          },
        },
      },
    },
    preview: {
      port: 4173,
      open: true,
    },
  };
});
