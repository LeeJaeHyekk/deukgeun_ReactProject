// ============================================================================
// 최적화된 메인 모듈 인덱스
// ============================================================================

// 핵심 기능 모듈들 (명시적 re-export로 중복 방지)
export * from "./auth"
export * from "./gym" 
export * from "./user"
export * from "./workout"
export * from "./social"
export * from "./machine"
export * from "./homepage"

// 공통 유틸리티 모듈
export * from "./utils"

// 서버 관리 모듈
export * from "./server"

// 크롤링 모듈 (필요시에만 로드)
export * from "./crawling"
