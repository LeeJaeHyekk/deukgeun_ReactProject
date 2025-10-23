export const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = import.meta.env[key] || defaultValue
  if (!value) {
    throw new Error(`Environment variable ${key} is not defined`)
  }
  return value
}

export const env = {
  // Backend
  BACKEND_URL: getEnvVar('VITE_BACKEND_URL', ''),

  // Gym API (로컬 데이터 사용)
  GYM_API_KEY: getEnvVar('VITE_GYM_API_KEY'),

  // reCAPTCHA
  RECAPTCHA_SITE_KEY: getEnvVar('VITE_RECAPTCHA_SITE_KEY'),

  // Environment
  NODE_ENV: import.meta.env.MODE || 'development',
  IS_DEVELOPMENT: (import.meta.env.MODE || 'development') === 'development',
  IS_PRODUCTION: (import.meta.env.MODE || 'development') === 'production',
} as const

// Gym API Configuration (로컬 데이터 사용)
export const GYM_CONFIG = {
  API_KEY: getEnvVar('VITE_GYM_API_KEY'),
} as const
