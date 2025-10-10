const { Router  } = require('express');
const authRoutes = require('./auth');
const gymRoutes = require('./gym');
const machineRoutes = require('./machine');
const postRoutes = require('./post');
const commentRoutes = require('./comment');
const likeRoutes = require('./like');
const levelRoutes = require('./level');
const statsRoutes = require('./stats');
const schedulerRoutes = require('./scheduler');
const workoutRoutes = require('./workout');
const logsRoutes = require('./logs');
const recaptchaRoutes = require('./recaptcha');
const homePageRoutes = require('./homePage');
const router = Router();
// Health check endpoint
router.get("/health", (req, res) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
});
// API routes
router.use("/auth", authRoutes);
router.use("/gyms", gymRoutes);
router.use("/machines", machineRoutes);
router.use("/posts", postRoutes);
router.use("/comments", commentRoutes);
router.use("/likes", likeRoutes);
router.use("/level", levelRoutes);
router.use("/stats", statsRoutes);
router.use("/scheduler", schedulerRoutes);
router.use("/workouts", workoutRoutes);
router.use("/logs", logsRoutes);
router.use("/recaptcha", recaptchaRoutes);
router.use("/homepage", homePageRoutes);
router.use("*", (req, res) => {
    res.status(404).json({ message: "API endpoint not found" });
});
module.exports = router;
