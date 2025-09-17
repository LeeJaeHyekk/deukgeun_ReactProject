export const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = import.meta.env[key] || defaultValue
  if (!value) {
    throw new Error(`Environment variable ${key} is not defined`)
  }
  return value
}

export const env = {
  // Backend
  BACKEND_URL: getEnvVar('VITE_BACKEND_URL', 'http://localhost:5000'),

  // Kakao Maps
  KAKAO_MAP_API_KEY: getEnvVar('VITE_LOCATION_JAVASCRIPT_MAP_API_KEY'),
  KAKAO_REST_API_KEY: getEnvVar('VITE_LOCATION_REST_MAP_API_KEY'),

  // Gym API
  GYM_API_KEY: getEnvVar('VITE_GYM_API_KEY'),

  // reCAPTCHA
  RECAPTCHA_SITE_KEY: getEnvVar('VITE_RECAPTCHA_SITE_KEY'),

  // Environment
  NODE_ENV: import.meta.env.MODE || 'development',
  IS_DEVELOPMENT: (import.meta.env.MODE || 'development') === 'development',
  IS_PRODUCTION: (import.meta.env.MODE || 'development') === 'production',
  IS_PROD: import.meta.env.PROD || false,
} as const

// Kakao Maps Configuration
export const KAKAO_CONFIG = {
  JAVASCRIPT_API_KEY: getEnvVar('VITE_LOCATION_JAVASCRIPT_MAP_API_KEY'),
  REST_API_KEY: getEnvVar('VITE_LOCATION_REST_MAP_API_KEY'),
} as const

// Gym API Configuration
export const GYM_CONFIG = {
  API_KEY: getEnvVar('VITE_GYM_API_KEY'),
} as const
