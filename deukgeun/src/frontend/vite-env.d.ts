/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_URL: string
  readonly VITE_LOCATION_JAVASCRIPT_MAP_API_KEY: string
  readonly VITE_LOCATION_REST_MAP_API_KEY: string
  readonly VITE_GYM_API_KEY: string
  readonly VITE_RECAPTCHA_SITE_KEY: string
  readonly VITE_KAKAO_API_KEY: string
  readonly VITE_SEOUL_OPENAPI_KEY: string
  readonly VITE_ENABLE_RECAPTCHA: string
  readonly VITE_ENABLE_ANALYTICS: string
  readonly VITE_ENABLE_NOTIFICATIONS: string
  readonly VITE_FRONTEND_URL: string
  readonly VITE_DATABASE_URL: string
  readonly VITE_REDIS_URL: string
  readonly VITE_JWT_SECRET: string
  readonly VITE_RECAPTCHA_SECRET_KEY: string
  readonly VITE_GOOGLE_API_KEY: string
  readonly VITE_SMTP_HOST: string
  readonly VITE_SMTP_PORT: string
  readonly VITE_SMTP_USER: string
  readonly VITE_SMTP_PASS: string
  readonly VITE_UPLOAD_PATH: string
  readonly VITE_MAX_FILE_SIZE: string
  readonly VITE_RATE_LIMIT_WINDOW: string
  readonly VITE_RATE_LIMIT_MAX: string
  readonly VITE_CORS_ORIGIN: string
  readonly VITE_LOG_LEVEL: string
  readonly VITE_LOG_FILE: string
  readonly VITE_ENABLE_MONITORING: string
  readonly VITE_MONITORING_PORT: string
  readonly MODE: string
  readonly DEV: boolean
  readonly PROD: boolean
  readonly SSR: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module "*.module.css" {
  const classes: { [key: string]: string }
  export default classes
}
