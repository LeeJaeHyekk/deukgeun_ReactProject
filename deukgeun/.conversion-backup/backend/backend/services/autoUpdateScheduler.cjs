const { Gym  } = require('../entities/Gym');
const { connectDatabase  } = require('../config/database');
const { updateGymDetailsWithEnhancedSources  } = require('./enhancedCrawlerService');
const { updateGymDetails  } = require('./gymCrawlerService');
const { updateGymDetailsWithMultipleSources  } = require('./multiSourceCrawlerService');
const { updateGymDetailsWithAdvancedSources  } = require('./advancedCrawlerService');
const { DataReferenceService  } = require('./dataReferenceService');
const { logger  } = require('../utils/logger');
// Default configuration
const DEFAULT_CONFIG = {
    hour: 6, // 6 AM
    minute: 0, // 0 minutes
    updateType: "enhanced", // Use enhanced crawling
    enabled: true,
    intervalDays: 3, // Run every 3 days
};
class AutoUpdateScheduler {
    constructor(config) {
        this.intervalId = null;
        this.isRunning = false;
        this.config = { ...DEFAULT_CONFIG, ...config };
    }
    // Calculate next execution time
    calculateNextRunTime() {
        const now = new Date();
        const nextRun = new Date();
        nextRun.setHours(this.config.hour, this.config.minute, 0, 0);
        // If today's execution time has passed, set to next execution
        if (nextRun <= now) {
            nextRun.setDate(nextRun.getDate() + this.config.intervalDays);
        }
        return nextRun;
    }
    // Start scheduler
    start() {
        if (this.intervalId) {
            logger.info("Scheduler is already running");
            return;
        }
        if (!this.config.enabled) {
            logger.info("Scheduler is disabled");
            return;
        }
        logger.info(`🚀 Starting auto-update scheduler for ${this.config.updateType} at ${this.config.hour}:${this.config.minute.toString().padStart(2, "0")} every ${this.config.intervalDays} days`);
        // Schedule next execution
        this.scheduleNextRun();
        // If execution time has already passed today, run immediately
        const nextRun = this.calculateNextRunTime();
        const now = new Date();
        if (nextRun.getDate() === now.getDate() &&
            nextRun.getTime() <= now.getTime()) {
            logger.info("⏰ Execution time has passed, running immediately");
            this.executeUpdate();
        }
    }
    // Execute update
    async executeUpdate() {
        if (this.isRunning) {
            logger.warn("⚠️ Update is already running, skipping");
            return;
        }
        this.isRunning = true;
        const startTime = Date.now();
        logger.info(`🔄 Starting ${this.config.updateType} update`);
        try {
            // Database connection
            const connection = await connectDatabase();
            const gymRepo = connection.getRepository(Gym);
            // Pre-scheduler check: 업데이트가 필요한지 확인
            logger.info("📊 스케줄러 실행 전 상태 확인 중...");
            const preCheck = await DataReferenceService.preSchedulerCheck(gymRepo);
            if (!preCheck.shouldRunUpdate) {
                logger.info(`⏭️ 업데이트 건너뜀: ${preCheck.reason}`);
                await DataReferenceService.logDataReferenceStatistics(gymRepo);
                await connection.close();
                return;
            }
            logger.info(`🔄 업데이트 실행: ${preCheck.reason}`);
            await DataReferenceService.logDataReferenceStatistics(gymRepo);
            // Execute selected update method
            switch (this.config.updateType) {
                case "enhanced":
                    await updateGymDetailsWithEnhancedSources(gymRepo);
                    break;
                case "basic":
                    await updateGymDetails(gymRepo);
                    break;
                case "multisource":
                    await updateGymDetailsWithMultipleSources(gymRepo);
                    break;
                case "advanced":
                    await updateGymDetailsWithAdvancedSources(gymRepo);
                    break;
                default:
                    await updateGymDetailsWithEnhancedSources(gymRepo);
            }
            // Post-update statistics
            logger.info("📊 업데이트 후 상태 확인...");
            await DataReferenceService.logDataReferenceStatistics(gymRepo);
            // Close database connection
            await connection.close();
            const duration = Date.now() - startTime;
            logger.info(`✅ ${this.config.updateType} update completed successfully in ${duration}ms`);
        }
        catch (error) {
            const duration = Date.now() - startTime;
            logger.error(`❌ Error during ${this.config.updateType} update after ${duration}ms:`, error);
        }
        finally {
            this.isRunning = false;
            // Calculate next execution time and schedule
            this.scheduleNextRun();
        }
    }
    // Schedule next execution
    scheduleNextRun() {
        const nextRun = this.calculateNextRunTime();
        const delay = nextRun.getTime() - Date.now();
        this.intervalId = setTimeout(() => {
            this.executeUpdate();
        }, delay);
        const daysUntilNext = Math.round(delay / 1000 / 60 / 60 / 24);
        const hoursUntilNext = Math.round((delay / 1000 / 60 / 60) % 24);
        const minutesUntilNext = Math.round((delay / 1000 / 60) % 60);
        logger.info(`📅 Next update scheduled for ${nextRun.toLocaleString()} (in ${daysUntilNext} days, ${hoursUntilNext} hours, ${minutesUntilNext} minutes)`);
    }
    // Stop scheduler
    stop() {
        if (this.intervalId) {
            clearTimeout(this.intervalId);
            this.intervalId = null;
            logger.info("Scheduler stopped");
        }
    }
    // Restart scheduler
    restart() {
        this.stop();
        this.start();
    }
    // Update configuration
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        logger.info("Scheduler configuration updated");
        if (this.intervalId) {
            this.restart();
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
        };
    }
    // Manual update execution
    async runManualUpdate(updateType) {
        const typeToUse = updateType || this.config.updateType;
        logger.info(`Manual ${typeToUse} update requested`);
        const originalType = this.config.updateType;
        this.config.updateType = typeToUse;
        try {
            await this.executeUpdate();
        }
        finally {
            this.config.updateType = originalType;
        }
    }
}
// Global scheduler instance
let globalScheduler = null;
// Initialize and start scheduler
function initializeScheduler
module.exports.initializeScheduler = initializeScheduler(config) {
    if (globalScheduler) {
        globalScheduler.stop();
    }
module.exports.initializeScheduler = initializeScheduler
    globalScheduler = new AutoUpdateScheduler(config);
    globalScheduler.start();
    return globalScheduler;
}
// Get scheduler instance
function getScheduler
module.exports.getScheduler = getScheduler() {
    return globalScheduler;
}
module.exports.getScheduler = getScheduler
// Stop scheduler
function stopScheduler
module.exports.stopScheduler = stopScheduler() {
    if (globalScheduler) {
        globalScheduler.stop();
        globalScheduler = null;
    }
module.exports.stopScheduler = stopScheduler
}
// Manual update execution
async function runManualUpdate(updateType) {
    if (globalScheduler) {
        await globalScheduler.runManualUpdate(updateType);
    }
module.exports.runManualUpdate = runManualUpdate
module.exports.runManualUpdate = runManualUpdate
    else {
        throw new Error("Scheduler not initialized");
    }
}
// Get scheduler status
function getSchedulerStatus
module.exports.getSchedulerStatus = getSchedulerStatus() {
    return globalScheduler ? globalScheduler.getStatus() : null;
}
module.exports.getSchedulerStatus = getSchedulerStatus
// Load configuration from environment variables
function loadConfigFromEnv() {
    const config = {}
module.exports.loadConfigFromEnv = loadConfigFromEnv;
    // Execution time settings
    const hour = parseInt(process.env.AUTO_UPDATE_HOUR || "6");
    const minute = parseInt(process.env.AUTO_UPDATE_MINUTE || "0");
    if (hour >= 0 && hour <= 23)
        config.hour = hour;
    if (minute >= 0 && minute <= 59)
        config.minute = minute;
    // Update type settings
    const updateType = process.env.AUTO_UPDATE_TYPE;
    if (updateType &&
        ["enhanced", "basic", "multisource", "advanced"].includes(updateType)) {
        config.updateType = updateType;
    }
    // Activation settings
    if (process.env.AUTO_UPDATE_ENABLED !== undefined) {
        config.enabled = process.env.AUTO_UPDATE_ENABLED === "true";
    }
    // Interval settings
    const intervalDays = parseInt(process.env.AUTO_UPDATE_INTERVAL_DAYS || "3");
    if (intervalDays >= 1)
        config.intervalDays = intervalDays;
    return config;
}
// Auto-initialize scheduler on application startup
function autoInitializeScheduler
module.exports.autoInitializeScheduler = autoInitializeScheduler() {
    try {
        const envConfig = loadConfigFromEnv();
        initializeScheduler(envConfig);
        logger.info("Auto-update scheduler initialized from environment variables");
    }
module.exports.autoInitializeScheduler = autoInitializeScheduler
    catch (error) {
        logger.error("Failed to initialize auto-update scheduler:", error);
    }
}
// Scheduler API functions for external control
const schedulerAPI
module.exports.schedulerAPI = schedulerAPI = {
    // Start scheduler
    start: (config) => {
        return initializeScheduler(config);
    },
    // Stop scheduler
    stop: () => {
        stopScheduler();
    },
    // Get status
    status: () => {
        return getSchedulerStatus();
    },
    // Manual update
    manualUpdate: async (updateType) => {
        await runManualUpdate(updateType);
    },
    // Update configuration
    updateConfig: (config) => {
        const scheduler = getScheduler();
        if (scheduler) {
            scheduler.updateConfig(config);
        }
    },
};
