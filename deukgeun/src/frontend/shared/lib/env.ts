// Environment Variables Utility
export const getEnvVar = (key: string, fallback?: string): string => {
  const value = import.meta.env[key]
  if (!value && fallback === undefined) {
    console.warn(`Environment variable ${key} is not set`)
    return ""
  }
  return value || fallback || ""
}

// Kakao Maps Environment Variables
export const KAKAO_CONFIG = {
  JAVASCRIPT_API_KEY: getEnvVar("VITE_LOCATION_JAVASCRIPT_MAP_API_KEY"),
  REST_API_KEY: getEnvVar("VITE_LOCATION_REST_MAP_API_KEY"),
} as const

// Gym API Environment Variables
export const GYM_CONFIG = {
  API_KEY: getEnvVar("VITE_GYM_API_KEY"),
} as const

// Backend Configuration
export const BACKEND_CONFIG = {
  URL: getEnvVar("VITE_BACKEND_URL", "http://localhost:5000"),
} as const

// reCAPTCHA Configuration
export const RECAPTCHA_CONFIG = {
  SITE_KEY: getEnvVar(
    "VITE_RECAPTCHA_SITE_KEY",
    "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
  ),
} as const

// Environment validation
export const validateEnvironment = (): boolean => {
  const requiredVars = [
    "VITE_LOCATION_JAVASCRIPT_MAP_API_KEY",
    "VITE_LOCATION_REST_MAP_API_KEY",
  ]

  const missingVars = requiredVars.filter(key => !getEnvVar(key))

  if (missingVars.length > 0) {
    console.error("Missing required environment variables:", missingVars)
    console.error("Please check your .env file in src/frontend/ directory")
    return false
  }

  return true
}
