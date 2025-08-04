import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import "reflect-metadata";
import { errorHandler } from "./middlewares/errorHandler";
import routes from "./routes";

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(morgan("combined"));

// Request body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use("/api", routes);

// Global error handler middleware
app.use(errorHandler);

export default app;
