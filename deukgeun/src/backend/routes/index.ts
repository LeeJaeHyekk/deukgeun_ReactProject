import { Router } from "express";
import postRoutes from "./post";
import schedulerRoutes from "./scheduler";
import authRoutes from "./auth";
import gymRoutes from "./gym";

const router = Router();

if (!postRoutes) {
  throw new Error("Post routes not found.");
}
if (!schedulerRoutes) {
  throw new Error("Scheduler routes not found.");
}
if (!authRoutes) {
  throw new Error("Auth routes not found.");
}
if (!gymRoutes) {
  throw new Error("Gym routes not found.");
}
// API routes
router.use("/posts", postRoutes);
router.use("/scheduler", schedulerRoutes);
router.use("/auth", authRoutes);
router.use("/gyms", gymRoutes);

router.use("*", (req, res) => {
  res.status(404).json({ message: "API route not found" });
});
export default router;
