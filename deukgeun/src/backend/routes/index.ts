import { Router } from "express";
import postRoutes from "./post";
import schedulerRoutes from "./scheduler";
import authRoutes from "./auth";

const router = Router();

// API routes
router.use("/posts", postRoutes);
router.use("/scheduler", schedulerRoutes);
router.use("/auth", authRoutes);

export default router;
