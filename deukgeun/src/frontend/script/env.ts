import { config } from "dotenv";
import path from "path";

// 프로젝트 루트의 .env 파일 로드
config({ path: path.resolve(process.cwd(), "../../.env") });

// 환경변수 타입 정의
interface ScriptEnv {
  VITE_BACKEND_URL: string;
  VITE_LOCATION_JAVASCRIPT_MAP_API_KEY: string;
  VITE_LOCATION_REST_MAP_API_KEY: string;
  VITE_GYM_API_KEY: string;
  VITE_RECAPTCHA_SITE_KEY: string;
}

// 환경변수 기본값 설정
export const scriptEnv: ScriptEnv = {
  VITE_BACKEND_URL: process.env.VITE_BACKEND_URL || "http://localhost:5000",
  VITE_LOCATION_JAVASCRIPT_MAP_API_KEY:
    process.env.VITE_LOCATION_JAVASCRIPT_MAP_API_KEY || "",
  VITE_LOCATION_REST_MAP_API_KEY:
    process.env.VITE_LOCATION_REST_MAP_API_KEY || "",
  VITE_GYM_API_KEY: process.env.VITE_GYM_API_KEY || "",
  VITE_RECAPTCHA_SITE_KEY: process.env.VITE_RECAPTCHA_SITE_KEY || "",
};

// 스크립트용 환경변수 유틸리티
export const getScriptEnvVar = (
  key: keyof ScriptEnv,
  fallback?: string
): string => {
  const value = scriptEnv[key];
  if (!value && fallback === undefined) {
    console.warn(`Environment variable ${key} is not set`);
    return "";
  }
  return value || fallback || "";
};

// 스크립트용 설정 객체들
export const SCRIPT_KAKAO_CONFIG = {
  JAVASCRIPT_API_KEY: getScriptEnvVar("VITE_LOCATION_JAVASCRIPT_MAP_API_KEY"),
  REST_API_KEY: getScriptEnvVar("VITE_LOCATION_REST_MAP_API_KEY"),
} as const;

export const SCRIPT_GYM_CONFIG = {
  API_KEY: getScriptEnvVar("VITE_GYM_API_KEY"),
} as const;

export const SCRIPT_BACKEND_CONFIG = {
  URL: getScriptEnvVar("VITE_BACKEND_URL", "http://localhost:5000"),
} as const;

// 환경변수 검증
export function validateEnv() {
  const requiredVars = [
    "VITE_LOCATION_JAVASCRIPT_MAP_API_KEY",
    "VITE_LOCATION_REST_MAP_API_KEY",
    "VITE_GYM_API_KEY",
  ];

  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    console.warn("⚠️  다음 환경변수가 설정되지 않았습니다:", missingVars);
    console.warn("스크립트 실행에 문제가 있을 수 있습니다.");
  }
}
