import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    // 插件
    plugins: [
        react() // 提供 Fast Refresh 和 JSX 环境
    ],

    // 解析
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src')
        }
    },

    // css 预处理
    // 不用配loader，如果想注入全局 scss变量，可以在这里配置
    css: {
        preprocessorOptions: {
            scss: {
                // additionalData: `@import "@/styles/variables.scss";`
            }
        }
    },

    //构建 - 对应 Webpack 的 output
    build: {
        outDir: 'dist',
        minify: 'esbuild', // 默认使用 esbuild，速度快
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom']
                }
            }
        }
    }
})