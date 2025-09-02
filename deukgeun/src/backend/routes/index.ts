import { Router } from "express"
import authRoutes from "./auth.js"
import gymRoutes from "./gym.js"
import machineRoutes from "./machine.js"
import postRoutes from "./post.js"
import commentRoutes from "./comment.js"
import likeRoutes from "./like.js"
import levelRoutes from "./level.js"
import statsRoutes from "./stats.js"
import schedulerRoutes from "./scheduler.js"
import workoutRoutes from "./workout.js"
import logsRoutes from "./logs.js"

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
