import dotenv from "dotenv";
/**
 * 환경 변수 로드
 * .env 파일에서 환경 변수를 읽어와 process.env에 설정합니다.
 */
dotenv.config();

/**
 * 애플리케이션 설정 객체
 * 환경 변수에서 값을 읽어와 타입 안전한 설정 객체로 제공합니다.
 * 각 설정값에 대한 기본값을 제공하여 개발 환경에서의 편의성을 높입니다.
 */
export const config = {
  /**
   * Node.js 실행 환경
   * development, production, test 등의 값을 가질 수 있습니다.
   */
  NODE_ENV: process.env.NODE_ENV || "development",

  /**
   * 서버가 리스닝할 포트 번호
   * 기본값은 3001번 포트입니다.
   */
  PORT: process.env.PORT || 3001,

  // MySQL Database 설정
  /**
   * MySQL 데이터베이스 호스트 주소
   * 기본값은 localhost입니다.
   */
  DB_HOST: process.env.DB_HOST || "localhost",

  /**
   * MySQL 데이터베이스 포트 번호
   * 기본값은 3306번 포트입니다.
   */
  DB_PORT: parseInt(process.env.DB_PORT || "3306"),

  /**
   * MySQL 데이터베이스 사용자명
   * 기본값은 root입니다.
   */
  DB_USERNAME: process.env.DB_USERNAME || "root",

  /**
   * MySQL 데이터베이스 비밀번호
   * 기본값은 빈 문자열입니다.
   */
  DB_PASSWORD: process.env.DB_PASSWORD || "",

  /**
   * MySQL 데이터베이스 이름
   * 기본값은 deukgeun_db입니다.
   */
  DB_NAME: process.env.DB_NAME || "deukgeun_db",

  // JWT 설정
  /**
   * JWT 토큰 서명에 사용할 비밀키
   * 프로덕션 환경에서는 반드시 강력한 비밀키로 설정해야 합니다.
   */
  JWT_SECRET: process.env.JWT_SECRET || "your-secret-key",

  /**
   * JWT 토큰의 만료 기간
   * 기본값은 7일입니다.
   */
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",

  // CORS 설정
  /**
   * CORS 허용할 오리진 주소
   * 프론트엔드 애플리케이션의 주소를 설정합니다.
   */
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",

  // 카카오맵 API 설정
  /**
   * 카카오맵 REST API 키
   * 카카오 개발자 센터에서 발급받은 REST API 키를 설정합니다.
   */
  KAKAO_API_KEY: process.env.KAKAO_REST_MAP_API_KEY,

  // 네이버 API 설정
  /**
   * 네이버 검색 API 클라이언트 ID
   * 네이버 개발자 센터에서 발급받은 클라이언트 ID를 설정합니다.
   */
  NAVER_CLIENT_ID: process.env.NAVER_CLIENT_ID,

  /**
   * 네이버 검색 API 클라이언트 시크릿
   * 네이버 개발자 센터에서 발급받은 클라이언트 시크릿을 설정합니다.
   */
  NAVER_CLIENT_SECRET: process.env.NAVER_CLIENT_SECRET,

  // 구글 플레이스 API 설정
  /**
   * 구글 플레이스 API 키
   * Google Cloud Console에서 발급받은 Places API 키를 설정합니다.
   */
  GOOGLE_PLACES_API_KEY: process.env.GOOGLE_PLACES_API_KEY,

  // 서울시 공공데이터 API 설정
  /**
   * 서울시 공공데이터 API 키
   * 서울시 공공데이터 포털에서 발급받은 API 키를 설정합니다.
   */
  SEOUL_OPENAPI_KEY: process.env.SEOUL_OPENAPI_KEY,

  // 자동 업데이트 스케줄러 설정
  /**
   * 자동 업데이트 실행 시간 (24시간 형식)
   * 기본값은 오전 6시입니다.
   */
  AUTO_UPDATE_HOUR: parseInt(process.env.AUTO_UPDATE_HOUR || "6"),

  /**
   * 자동 업데이트 실행 분
   * 기본값은 0분입니다.
   */
  AUTO_UPDATE_MINUTE: parseInt(process.env.AUTO_UPDATE_MINUTE || "0"),

  /**
   * 자동 업데이트 타입
   * enhanced, basic, multisource, advanced 중 선택
   */
  AUTO_UPDATE_TYPE: process.env.AUTO_UPDATE_TYPE || "enhanced",

  /**
   * 자동 업데이트 활성화 여부
   * true 또는 false
   */
  AUTO_UPDATE_ENABLED: process.env.AUTO_UPDATE_ENABLED === "true",
};
