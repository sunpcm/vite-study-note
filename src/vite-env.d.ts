/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_ENV: 'development' | 'production';
  // ✅ 添加更多环境变量
  readonly MODE: string;
  readonly BASE_URL: string;
  readonly PROD: boolean;
  readonly DEV: boolean;
  readonly SSR: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
  // ✅ 添加 hot 类型支持
  readonly hot?: {
    accept: (cb?: (mod: any) => void) => void;
    dispose: (cb: (data: any) => void) => void;
    invalidate: () => void;
    data: any;
  }
}