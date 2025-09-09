import { Router } from "express"
import authRoutes from "./auth"
import gymRoutes from "./gym"
import machineRoutes from "./machine"
import postRoutes from "./post"
import commentRoutes from "./comment"
import likeRoutes from "./like"
import levelRoutes from "./level"
import statsRoutes from "./stats"
import schedulerRoutes from "./scheduler"
import workoutRoutes from "./workout"
import logsRoutes from "./logs"

const router = Router()

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() })
})

// API routes
router.use("/auth", authRoutes)
router.use("/gyms", gymRoutes)
router.use("/machines", machineRoutes)
router.use("/posts", postRoutes)
router.use("/comments", commentRoutes)
router.use("/likes", likeRoutes)
router.use("/level", levelRoutes)
router.use("/stats", statsRoutes)
router.use("/scheduler", schedulerRoutes)
router.use("/workouts", workoutRoutes)
router.use("/logs", logsRoutes)

router.use("*", (req, res) => {
  res.status(404).json({ message: "API endpoint not found" })
})

export default router
