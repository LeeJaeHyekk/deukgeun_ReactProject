import { Router } from "express";
import { schedulerAPI } from "../services/autoUpdateScheduler";

const router = Router();

// Get current scheduler status
router.get("/status", (req, res) => {
  try {
    const status = schedulerAPI.status();
    res.json({ success: true, data: status });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Failed to get scheduler status" });
  }
});

// Start scheduler with optional configuration
router.post("/start", (req, res) => {
  try {
    const config = req.body;
    const scheduler = schedulerAPI.start(config);
    res.json({ success: true, message: "Scheduler started successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Failed to start scheduler" });
  }
});

// Stop scheduler
router.post("/stop", (req, res) => {
  try {
    schedulerAPI.stop();
    res.json({ success: true, message: "Scheduler stopped successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to stop scheduler" });
  }
});

// Update scheduler configuration
router.put("/config", (req, res) => {
  try {
    const config = req.body;
    schedulerAPI.updateConfig(config);
    res.json({ success: true, message: "Scheduler configuration updated" });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        error: "Failed to update scheduler configuration",
      });
  }
});

// Manually trigger update with specified type
router.post("/manual-update", async (req, res) => {
  try {
    const { updateType } = req.body;
    await schedulerAPI.manualUpdate(updateType);
    res.json({
      success: true,
      message: "Manual update completed successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Failed to run manual update" });
  }
});

// Specific endpoints for each update type
router.post("/update/enhanced", async (req, res) => {
  try {
    await schedulerAPI.manualUpdate("enhanced");
    res.json({ success: true, message: "Enhanced update completed" });
  } catch (error) {
    res.status(500).json({ success: false, error: "Enhanced update failed" });
  }
});

router.post("/update/basic", async (req, res) => {
  try {
    await schedulerAPI.manualUpdate("basic");
    res.json({ success: true, message: "Basic update completed" });
  } catch (error) {
    res.status(500).json({ success: false, error: "Basic update failed" });
  }
});

router.post("/update/multisource", async (req, res) => {
  try {
    await schedulerAPI.manualUpdate("multisource");
    res.json({ success: true, message: "Multi-source update completed" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Multi-source update failed" });
  }
});

router.post("/update/advanced", async (req, res) => {
  try {
    await schedulerAPI.manualUpdate("advanced");
    res.json({ success: true, message: "Advanced update completed" });
  } catch (error) {
    res.status(500).json({ success: false, error: "Advanced update failed" });
  }
});

export default router;
