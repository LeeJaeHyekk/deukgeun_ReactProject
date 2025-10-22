const getEnvVar
module.exports.getEnvVar = getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue
  if (!value) {
    throw new Error(`Environment variable ${key} is not defined`)
  }
  return value
}

const env
module.exports.env = env = {
  // Backend
  BACKEND_URL: getEnvVar('VITE_BACKEND_URL', ''),

  // Kakao Maps
  KAKAO_MAP_API_KEY: getEnvVar('VITE_LOCATION_JAVASCRIPT_MAP_API_KEY'),
  KAKAO_REST_API_KEY: getEnvVar('VITE_LOCATION_REST_MAP_API_KEY'),

  // Gym API
  GYM_API_KEY: getEnvVar('VITE_GYM_API_KEY'),

  // reCAPTCHA
  RECAPTCHA_SITE_KEY: getEnvVar('VITE_RECAPTCHA_SITE_KEY'),

  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_DEVELOPMENT: (process.env.NODE_ENV || 'development') === 'development',
  IS_PRODUCTION: (process.env.NODE_ENV || 'development') === 'production',
} as const

// Kakao Maps Configuration
const KAKAO_CONFIG
module.exports.KAKAO_CONFIG = KAKAO_CONFIG = {
  JAVASCRIPT_API_KEY: getEnvVar('VITE_LOCATION_JAVASCRIPT_MAP_API_KEY'),
  REST_API_KEY: getEnvVar('VITE_LOCATION_REST_MAP_API_KEY'),
} as const

// Gym API Configuration
const GYM_CONFIG
module.exports.GYM_CONFIG = GYM_CONFIG = {
  API_KEY: getEnvVar('VITE_GYM_API_KEY'),
} as const