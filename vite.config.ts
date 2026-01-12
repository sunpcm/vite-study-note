import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) =>  {
    const env = loadEnv(mode, process.cwd(), '');  // 加载环境变量
    return {
        // 插件
        plugins: [
            react(), // 提供 Fast Refresh 和 JSX 环境
            tailwindcss(),
            visualizer({
                open: false,  // 构建完自动打开
                gzipSize: true, // 显示 gzip 大小
                brotliSize: true, // 显示 brotli 大小
                filename: 'dist/stats.html', // 生成的文件位置
            }),
        ],
        server: {
            port: 3000,
            open: true, // 启动后自动打开浏览器
            hmr: {
                overlay: true
            },
            proxy: {
            // === 代理规则 1：Dataset 服务 (localhost:8080) ===
            '/api/dataset': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                // ⚠️ 注意区别：Vite 这里是函数！
                rewrite: (path) => path.replace(/^\/api/, '') 
                // 结果：/api/dataset/list -> /dataset/list
            },

            // === 代理规则 2：Experiments 服务 (localhost:8081) ===
            '/api/experiments': {
                target: 'http://localhost:8081',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '')
            },
            // === 代理规则 3：通用/兜底 (localhost:3000) ===
            // 使用正则匹配：匹配所有其他以 /api 开头的
            // 注意：这就要求把具体的规则写在上面，正则写在下面，
            // 或者依靠 key 的特定性（Vite 也是优先匹配更具体的字符串）
            '^/api/.*': {
                target: 'http://localhost:3000',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '')
            }
            }
        },
        // 解析
        resolve: {
            alias: {
                '@': path.resolve(__dirname, 'src')
            }
        },

        base: env.VITE_ENV === 'production' ? '/' : '/',

        //构建 - 对应 Webpack 的 output
        build: {
            outDir: 'dist',
            minify: 'esbuild',
            target: 'es2015',
            // ✅ 修复：英文逗号
            sourcemap: false,
            // 启用 CSS 代码分割
            cssCodeSplit: true,
            // 设置 chunk 大小警告限制
            chunkSizeWarningLimit: 1000,
            // 启用 gzip 压缩提示
            reportCompressedSize: true,
            rollupOptions: {
                output: {
                    manualChunks: {
                        'react-vendor': ['react', 'react-dom'],
                        'react-core': ['react/jsx-runtime']
                    },
                    // 优化 chunk 文件名
                    chunkFileNames: 'js/[name]-[hash].js',
                    entryFileNames: 'js/[name]-[hash].js',
                    assetFileNames: '[ext]/[name]-[hash].[ext]'
                }
            },
        }
    }
});