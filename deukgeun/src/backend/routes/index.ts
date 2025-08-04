import { Router } from "express";
import postRoutes from "./post";
import schedulerRoutes from "./scheduler";

const router = Router();

// API routes
router.use("/posts", postRoutes);
router.use("/scheduler", schedulerRoutes);

export default router;
