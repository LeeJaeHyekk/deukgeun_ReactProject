import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import "reflect-metadata";
import { errorHandler } from "./middlewares/errorHandler";
import routes from "./routes";
import { AppDataSource } from "./config/database";

/**
 * Express 애플리케이션 인스턴스 생성
 * 웹 서버의 핵심 객체로, 미들웨어와 라우트를 설정합니다.
 */
const app = express();

/**
 * 데이터베이스 연결 초기화
 * TypeORM을 사용하여 MySQL 데이터베이스에 연결을 시도합니다.
 * 연결 성공/실패 여부를 콘솔에 출력합니다.
 */
AppDataSource.then((connection: any) => {
  console.log("Database connected successfully");
}).catch((error: any) => {
  console.error("Database connection failed:", error);
});

/**
 * 보안 미들웨어 설정
 * helmet: HTTP 헤더를 설정하여 보안 취약점을 방지합니다.
 * cors: Cross-Origin Resource Sharing을 허용하여 프론트엔드와의 통신을 가능하게 합니다.
 * morgan: HTTP 요청 로깅을 위한 미들웨어입니다.
 */
app.use(helmet());
app.use(cors());
app.use(morgan("combined"));

/**
 * 요청 본문 파싱 미들웨어 설정
 * express.json(): JSON 형태의 요청 본문을 파싱합니다.
 * express.urlencoded(): URL-encoded 형태의 요청 본문을 파싱합니다.
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * API 라우트 설정
 * /api 경로로 들어오는 모든 요청을 routes 모듈로 전달합니다.
 */
app.use("/api", routes);

/**
 * 전역 에러 핸들러 미들웨어
 * 애플리케이션에서 발생하는 모든 에러를 처리합니다.
 * 반드시 다른 미들웨어들보다 나중에 등록되어야 합니다.
 */
app.use(errorHandler);

export default app;
