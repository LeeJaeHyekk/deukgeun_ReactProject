import { Repository } from "typeorm"
import { Gym } from "../entities/Gym"
import { connectDatabase } from "../config/database"
import { updateGymDetailsWithEnhancedSources } from "./enhancedCrawlerService"
import { updateGymDetails } from "./gymCrawlerService"
import { updateGymDetailsWithMultipleSources } from "./multiSourceCrawlerService"
import { updateGymDetailsWithAdvancedSources } from "./advancedCrawlerService"
import { DataReferenceService } from "./dataReferenceService"
import { logger } from "../utils/logger"

type UpdateType = "enhanced" | "basic" | "multisource" | "advanced"

interface SchedulerConfig {
  hour: number // Execution hour (24-hour format)
  minute: number // Execution minute
  updateType: UpdateType // Update method to use
  enabled: boolean // Scheduler activation status
  intervalDays: number // Interval between executions in days
}

// Default configuration
const DEFAULT_CONFIG: SchedulerConfig = {
  hour: 6, // 6 AM
  minute: 0, // 0 minutes
  updateType: "enhanced", // Use enhanced crawling
  enabled: true,
  intervalDays: 3, // Run every 3 days
}

class AutoUpdateScheduler {
  private config: SchedulerConfig
  private intervalId: NodeJS.Timeout | null = null
  private isRunning = false

  constructor(config?: Partial<SchedulerConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  // Calculate next execution time
  private calculateNextRunTime(): Date {
    const now = new Date()
    const nextRun = new Date()
    nextRun.setHours(this.config.hour, this.config.minute, 0, 0)

    // If today's execution time has passed, set to next execution
    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + this.config.intervalDays)
    }

    return nextRun
  }

  // Start scheduler
  start(): void {
    if (this.intervalId) {
      logger.info("Scheduler is already running")
      return
    }

    if (!this.config.enabled) {
      logger.info("Scheduler is disabled")
      return
    }

    logger.info(
      `🚀 Starting auto-update scheduler for ${this.config.updateType} at ${
        this.config.hour
      }:${this.config.minute.toString().padStart(2, "0")} every ${this.config.intervalDays} days`
    )

    // Schedule next execution
    this.scheduleNextRun()

    // If execution time has already passed today, run immediately
    const nextRun = this.calculateNextRunTime()
    const now = new Date()
    if (
      nextRun.getDate() === now.getDate() &&
      nextRun.getTime() <= now.getTime()
    ) {
      logger.info("⏰ Execution time has passed, running immediately")
      this.executeUpdate()
    }
  }

  // Execute update
  private async executeUpdate(): Promise<void> {
    if (this.isRunning) {
      logger.warn("⚠️ Update is already running, skipping")
      return
    }

    this.isRunning = true
    const startTime = Date.now()
    logger.info(`🔄 Starting ${this.config.updateType} update`)

    try {
      // Database connection
      const connection = await connectDatabase()
      const gymRepo = connection.getRepository(Gym)

      // Pre-scheduler check: 업데이트가 필요한지 확인
      logger.info("📊 스케줄러 실행 전 상태 확인 중...")
      const preCheck = await DataReferenceService.preSchedulerCheck(gymRepo)

      if (!preCheck.shouldRunUpdate) {
        logger.info(`⏭️ 업데이트 건너뜀: ${preCheck.reason}`)
        await DataReferenceService.logDataReferenceStatistics(gymRepo)
        await connection.close()
        return
      }

      logger.info(`🔄 업데이트 실행: ${preCheck.reason}`)
      await DataReferenceService.logDataReferenceStatistics(gymRepo)

      // Execute selected update method
      switch (this.config.updateType) {
        case "enhanced":
          await updateGymDetailsWithEnhancedSources(gymRepo)
          break
        case "basic":
          await updateGymDetails(gymRepo)
          break
        case "multisource":
          await updateGymDetailsWithMultipleSources(gymRepo)
          break
        case "advanced":
          await updateGymDetailsWithAdvancedSources(gymRepo)
          break
        default:
          await updateGymDetailsWithEnhancedSources(gymRepo)
      }

      // Post-update statistics
      logger.info("📊 업데이트 후 상태 확인...")
      await DataReferenceService.logDataReferenceStatistics(gymRepo)

      // Close database connection
      await connection.close()
      const duration = Date.now() - startTime
      logger.info(
        `✅ ${this.config.updateType} update completed successfully in ${duration}ms`
      )
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error(
        `❌ Error during ${this.config.updateType} update after ${duration}ms:`,
        error
      )
    } finally {
      this.isRunning = false
      // Calculate next execution time and schedule
      this.scheduleNextRun()
    }
  }

  // Schedule next execution
  private scheduleNextRun(): void {
    const nextRun = this.calculateNextRunTime()
    const delay = nextRun.getTime() - Date.now()

    this.intervalId = setTimeout(() => {
      this.executeUpdate()
    }, delay)

    const daysUntilNext = Math.round(delay / 1000 / 60 / 60 / 24)
    const hoursUntilNext = Math.round((delay / 1000 / 60 / 60) % 24)
    const minutesUntilNext = Math.round((delay / 1000 / 60) % 60)

    logger.info(
      `📅 Next update scheduled for ${nextRun.toLocaleString()} (in ${daysUntilNext} days, ${hoursUntilNext} hours, ${minutesUntilNext} minutes)`
    )
  }

  // Stop scheduler
  stop(): void {
    if (this.intervalId) {
      clearTimeout(this.intervalId)
      this.intervalId = null
      logger.info("Scheduler stopped")
    }
  }

  // Restart scheduler
  restart(): void {
    this.stop()
    this.start()
  }

  // Update configuration
  updateConfig(newConfig: Partial<SchedulerConfig>): void {
    this.config = { ...this.config, ...newConfig }
    logger.info("Scheduler configuration updated")

    if (this.intervalId) {
      this.restart()
    }
  }

  // Get current status
  getStatus() {
    return {
      enabled: this.config.enabled,
      updateType: this.config.updateType,
      nextRun: this.intervalId ? this.calculateNextRunTime() : null,
      isRunning: this.isRunning,
      schedule: `${this.config.hour}:${this.config.minute
        .toString()
        .padStart(2, "0")}`,
      intervalDays: this.config.intervalDays,
    }
  }

  // Manual update execution
  async runManualUpdate(updateType?: UpdateType): Promise<void> {
    const typeToUse = updateType || this.config.updateType
    logger.info(`Manual ${typeToUse} update requested`)

    const originalType = this.config.updateType
    this.config.updateType = typeToUse

    try {
      await this.executeUpdate()
    } finally {
      this.config.updateType = originalType
    }
  }
}

// Global scheduler instance
let globalScheduler: AutoUpdateScheduler | null = null

// Initialize and start scheduler
export function initializeScheduler(
  config?: Partial<SchedulerConfig>
): AutoUpdateScheduler {
  if (globalScheduler) {
    globalScheduler.stop()
  }

  globalScheduler = new AutoUpdateScheduler(config)
  globalScheduler.start()
  return globalScheduler
}

// Get scheduler instance
export function getScheduler(): AutoUpdateScheduler | null {
  return globalScheduler
}

// Stop scheduler
export function stopScheduler(): void {
  if (globalScheduler) {
    globalScheduler.stop()
    globalScheduler = null
  }
}

// Manual update execution
export async function runManualUpdate(updateType?: UpdateType): Promise<void> {
  if (globalScheduler) {
    await globalScheduler.runManualUpdate(updateType)
  } else {
    throw new Error("Scheduler not initialized")
  }
}

// Get scheduler status
export function getSchedulerStatus() {
  return globalScheduler ? globalScheduler.getStatus() : null
}

// Load configuration from environment variables
function loadConfigFromEnv(): Partial<SchedulerConfig> {
  const config: Partial<SchedulerConfig> = {}

  // Execution time settings
  const hour = parseInt(process.env.AUTO_UPDATE_HOUR || "6")
  const minute = parseInt(process.env.AUTO_UPDATE_MINUTE || "0")

  if (hour >= 0 && hour <= 23) config.hour = hour
  if (minute >= 0 && minute <= 59) config.minute = minute

  // Update type settings
  const updateType = process.env.AUTO_UPDATE_TYPE
  if (
    updateType &&
    ["enhanced", "basic", "multisource", "advanced"].includes(updateType)
  ) {
    config.updateType = updateType as UpdateType
  }

  // Activation settings
  if (process.env.AUTO_UPDATE_ENABLED !== undefined) {
    config.enabled = process.env.AUTO_UPDATE_ENABLED === "true"
  }

  // Interval settings
  const intervalDays = parseInt(process.env.AUTO_UPDATE_INTERVAL_DAYS || "3")
  if (intervalDays >= 1) config.intervalDays = intervalDays

  return config
}

// Auto-initialize scheduler on application startup
export function autoInitializeScheduler(): void {
  try {
    const envConfig = loadConfigFromEnv()
    initializeScheduler(envConfig)
    logger.info("Auto-update scheduler initialized from environment variables")
  } catch (error) {
    logger.error("Failed to initialize auto-update scheduler:", error)
  }
}

// Scheduler API functions for external control
export const schedulerAPI = {
  // Start scheduler
  start: (config?: Partial<SchedulerConfig>) => {
    return initializeScheduler(config)
  },

  // Stop scheduler
  stop: () => {
    stopScheduler()
  },

  // Get status
  status: () => {
    return getSchedulerStatus()
  },

  // Manual update
  manualUpdate: async (updateType?: UpdateType) => {
    await runManualUpdate(updateType)
  },

  // Update configuration
  updateConfig: (config: Partial<SchedulerConfig>) => {
    const scheduler = getScheduler()
    if (scheduler) {
      scheduler.updateConfig(config)
    }
  },
}
