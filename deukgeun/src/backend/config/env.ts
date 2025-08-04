import dotenv from "dotenv";

dotenv.config();

export const config = {
  // Server configuration
  PORT: parseInt(process.env.PORT || "3001"),
  NODE_ENV: process.env.NODE_ENV || "development",

  // MySQL Database configuration
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_PORT: parseInt(process.env.DB_PORT || "3306"),
  DB_USERNAME: process.env.DB_USERNAME || "root",
  DB_PASSWORD: process.env.DB_PASSWORD || "",
  DB_NAME: process.env.DB_NAME || "gym_db",

  // reCAPTCHA configuration
  RECAPTCHA_SECRET: process.env.RECAPTCHA_SECRET || "your-secret-key",

  // JWT configuration
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "your-access-secret-key",
  JWT_REFRESH_SECRET:
    process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key",
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "7d",

  // CORS configuration
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173",

  // Kakao Map API configuration
  KAKAO_API_KEY:
    process.env.KAKAO_REST_MAP_API_KEY || "your_kakao_api_key_here",

  // Naver API configuration (commented out)
  // NAVER_CLIENT_ID: process.env.NAVER_CLIENT_ID || "your_naver_client_id_here",
  // NAVER_CLIENT_SECRET:
  //   process.env.NAVER_CLIENT_SECRET || "your_naver_client_secret_here",

  // Google Places API configuration
  GOOGLE_PLACES_API_KEY:
    process.env.GOOGLE_PLACES_API_KEY || "your_google_places_api_key_here",

  // Seoul Open Data API configuration
  SEOUL_OPENAPI_KEY:
    process.env.SEOUL_OPENAPI_KEY || "your_seoul_openapi_key_here",

  // Auto-update scheduler configuration
  AUTO_UPDATE_HOUR: parseInt(process.env.AUTO_UPDATE_HOUR || "6"),
  AUTO_UPDATE_MINUTE: parseInt(process.env.AUTO_UPDATE_MINUTE || "0"),
  AUTO_UPDATE_TYPE: process.env.AUTO_UPDATE_TYPE || "enhanced",
  AUTO_UPDATE_ENABLED: process.env.AUTO_UPDATE_ENABLED === "true",
};
