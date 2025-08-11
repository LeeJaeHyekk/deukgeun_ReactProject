import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import "reflect-metadata"
import { errorHandler } from "./middlewares/errorHandler"
import routes from "./routes"
import cookieParser from "cookie-parser"
import path from "path"

const app = express()

// Security middleware
app.use(helmet())
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true, // 쿠키/인증 정보 전달 허용
  })
)
app.use(morgan("combined"))
app.use(cookieParser())

// Request body parsing middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Static files serving
app.use("/img", express.static(path.join(__dirname, "../../public/img")))
app.use("/public", express.static(path.join(__dirname, "../../public")))

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Deukgeun Backend API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  })
})

// API routes
app.use("/api", routes)

// Global error handler middleware
app.use(errorHandler)

export default app
