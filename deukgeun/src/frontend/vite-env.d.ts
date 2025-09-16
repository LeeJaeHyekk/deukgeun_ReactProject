/// <reference types="vite/client" />
/// <reference types="node" />

declare module '*.module.css' {
  const classes: { [key: string]: string }
  export default classes
}

// Node.js 환경 변수 타입 정의
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test'
    VITE_API_BASE_URL?: string
    VITE_APP_TITLE?: string
    [key: string]: string | undefined
  }
}
