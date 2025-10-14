import { Router } from "express"
import { schedulerAPI } from "../services/autoUpdateScheduler"
import { DataReferenceService } from "../services/dataReferenceService"
import { ErrorHandlingService } from "../services/errorHandlingService"
import { BatchProcessingService } from "../services/batchProcessingService"
import { connectDatabase } from "../config/database"
import { Gym } from "../entities/Gym"

const router = Router()

// Get current scheduler status
router.get("/status", (req, res) => {
  try {
    const status = schedulerAPI.status()
    res.json({ success: true, data: status })
  } catch {
    res
      .status(500)
      .json({ success: false, error: "Failed to get scheduler status" })
  }
})

// Get data reference statistics
router.get("/data-reference-stats", async (req, res) => {
  try {
    const connection = await connectDatabase()
    const gymRepo = connection.getRepository(Gym)

    const stats =
      await DataReferenceService.checkAllGymsReferenceStatus(gymRepo)
    await connection.close()

    res.json({ success: true, data: stats })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to get data reference statistics",
      details: error instanceof Error ? error.message : "Unknown error",
    })
  }
})

// Get specific gym data reference status
router.get("/gym/:id/data-reference", async (req, res) => {
  try {
    const gymId = parseInt(req.params.id)
    if (isNaN(gymId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid gym ID",
      })
    }

    const connection = await connectDatabase()
    const gymRepo = connection.getRepository(Gym)

    const status = await DataReferenceService.checkDataReferenceStatus(
      gymRepo,
      gymId
    )
    await connection.close()

    res.json({ success: true, data: status })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to get gym data reference status",
      details: error instanceof Error ? error.message : "Unknown error",
    })
  }
})

// Get gyms needing update
router.get("/gyms-needing-update", async (req, res) => {
  try {
    const connection = await connectDatabase()
    const gymRepo = connection.getRepository(Gym)

    const gymsNeedingUpdate =
      await DataReferenceService.getGymsNeedingUpdate(gymRepo)
    await connection.close()

    res.json({
      success: true,
      data: {
        count: gymsNeedingUpdate.length,
        gyms: gymsNeedingUpdate.map(gym => ({
          id: gym.id,
          name: gym.name,
          lastUpdated: gym.updatedAt || gym.createdAt,
        })),
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to get gyms needing update",
      details: error instanceof Error ? error.message : "Unknown error",
    })
  }
})

// Start scheduler with optional configuration
router.post("/start", (req, res) => {
  try {
    const config = req.body
    schedulerAPI.start(config)
    res.json({ success: true, message: "Scheduler started successfully" })
  } catch {
    res.status(500).json({ success: false, error: "Failed to start scheduler" })
  }
})

// Stop scheduler
router.post("/stop", (req, res) => {
  try {
    schedulerAPI.stop()
    res.json({ success: true, message: "Scheduler stopped successfully" })
  } catch {
    res.status(500).json({ success: false, error: "Failed to stop scheduler" })
  }
})

// Update scheduler configuration
router.put("/config", (req, res) => {
  try {
    const config = req.body
    schedulerAPI.updateConfig(config)
    res.json({ success: true, message: "Scheduler configuration updated" })
  } catch {
    res.status(500).json({
      success: false,
      error: "Failed to update scheduler configuration",
    })
  }
})

// Manually trigger update with specified type
router.post("/manual-update", async (req, res) => {
  try {
    const { updateType } = req.body
    await schedulerAPI.manualUpdate(updateType)
    res.json({
      success: true,
      message: "Manual update completed successfully",
    })
  } catch {
    res
      .status(500)
      .json({ success: false, error: "Failed to run manual update" })
  }
})

// Specific endpoints for each update type
router.post("/update/enhanced", async (req, res) => {
  try {
    await schedulerAPI.manualUpdate("enhanced")
    res.json({ success: true, message: "Enhanced update completed" })
  } catch {
    res.status(500).json({ success: false, error: "Enhanced update failed" })
  }
})

router.post("/update/basic", async (req, res) => {
  try {
    await schedulerAPI.manualUpdate("basic")
    res.json({ success: true, message: "Basic update completed" })
  } catch {
    res.status(500).json({ success: false, error: "Basic update failed" })
  }
})

router.post("/update/multisource", async (req, res) => {
  try {
    await schedulerAPI.manualUpdate("multisource")
    res.json({ success: true, message: "Multi-source update completed" })
  } catch {
    res
      .status(500)
      .json({ success: false, error: "Multi-source update failed" })
  }
})

router.post("/update/advanced", async (req, res) => {
  try {
    await schedulerAPI.manualUpdate("advanced")
    res.json({ success: true, message: "Advanced update completed" })
  } catch {
    res.status(500).json({ success: false, error: "Advanced update failed" })
  }
})

// Get error statistics
router.get("/error-stats", async (req, res) => {
  try {
    const stats = ErrorHandlingService.getErrorStatistics()
    const patterns = ErrorHandlingService.analyzeErrorPatterns()

    res.json({
      success: true,
      data: {
        statistics: stats,
        patterns: patterns,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to get error statistics",
      details: error instanceof Error ? error.message : "Unknown error",
    })
  }
})

// Clear error history
router.delete("/error-history", async (req, res) => {
  try {
    ErrorHandlingService.clearErrorHistory()
    res.json({
      success: true,
      message: "Error history cleared successfully",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to clear error history",
      details: error instanceof Error ? error.message : "Unknown error",
    })
  }
})

// Get batch processing statistics
router.get("/batch-stats", async (req, res) => {
  try {
    const connection = await connectDatabase()
    const gymRepo = connection.getRepository(Gym)
    const allGyms = await gymRepo.find()
    await connection.close()

    // 배치 크기 자동 계산
    const availableMemory = process.memoryUsage().heapTotal
    const optimalBatchSize = 20 // 기본 배치 크기

    res.json({
      success: true,
      data: {
        totalGyms: allGyms.length,
        optimalBatchSize,
        availableMemory: `${(availableMemory / 1024 / 1024).toFixed(2)} MB`,
        estimatedBatches: Math.ceil(allGyms.length / optimalBatchSize),
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to get batch statistics",
      details: error instanceof Error ? error.message : "Unknown error",
    })
  }
})

export default router
