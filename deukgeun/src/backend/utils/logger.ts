import winston from "winston";

/**
 * Winston 로거 인스턴스 생성
 * 애플리케이션의 모든 로그를 중앙에서 관리합니다.
 * 파일과 콘솔에 로그를 출력하며, 환경에 따라 다른 설정을 적용합니다.
 */
const logger = winston.createLogger({
  /**
   * 로그 레벨 설정
   * info 레벨 이상의 모든 로그를 기록합니다.
   */
  level: "info",

  /**
   * 로그 포맷 설정
   * 타임스탬프, 에러 스택 트레이스, JSON 형태로 로그를 포맷팅합니다.
   */
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),

  /**
   * 기본 메타데이터 설정
   * 모든 로그에 서비스 이름을 추가합니다.
   */
  defaultMeta: { service: "backend-service" },

  /**
   * 로그 출력 대상 설정
   * 파일 시스템에 로그를 저장합니다.
   */
  transports: [
    // 에러 레벨 로그만 별도 파일에 저장
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    // 모든 레벨의 로그를 통합 파일에 저장
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});

/**
 * 개발 환경에서만 콘솔 출력 활성화
 * 프로덕션 환경에서는 파일 로그만 사용하여 성능을 최적화합니다.
 */
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

export { logger };
