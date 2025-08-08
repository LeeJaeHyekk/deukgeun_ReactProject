import { Router } from "express";
import postRoutes from "./post";
import likeRoutes from "./like";
import commentRoutes from "./comment";
import schedulerRoutes from "./scheduler";
import authRoutes from "./auth";
import gymRoutes from "./gym";
import machineRoutes from "./machine";

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
if (!machineRoutes) {
  throw new Error("Machine routes not found.");
}

// API routes
router.use("/posts", postRoutes);
router.use("/likes", likeRoutes);
router.use("/comments", commentRoutes);
router.use("/scheduler", schedulerRoutes);
router.use("/auth", authRoutes);
router.use("/gyms", gymRoutes);
router.use("/machines", machineRoutes);

router.use("*", (req, res) => {
  res.status(404).json({ message: "API route not found" });
});
export default router;
