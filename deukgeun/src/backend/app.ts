import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import "reflect-metadata";
import { errorHandler } from "./middlewares/errorHandler";
import routes from "./routes";
import cookieParser from "cookie-parser";

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: "http://localhost:5173", // 프론트엔드 주소
    credentials: true, // 쿠키/인증 정보 전달 허용
  })
);
app.use(morgan("combined"));
app.use(cookieParser());

// Request body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use("/api", routes);

// Global error handler middleware
app.use(errorHandler);

export default app;
