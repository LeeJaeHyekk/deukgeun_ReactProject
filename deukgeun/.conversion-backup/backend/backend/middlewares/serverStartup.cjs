"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startupTracker = void 0;
exports.validateEnvironment = validateEnvironment;
exports.validateDatabaseConnection = validateDatabaseConnection;
exports.validatePortAvailability = validatePortAvailability;
exports.validateMemoryUsage = validateMemoryUsage;
exports.validateDependencies = validateDependencies;
exports.performStartupValidation = performStartupValidation;
exports.performPostStartupHealthCheck = performPostStartupHealthCheck;
const databaseConfig_1 = require('config/databaseConfig');
class StartupTracker {
    constructor() {
        this.phases = [];
        this.startTime = Date.now();
    }
    startPhase(name) {
        const phase = {
            name,
            startTime: Date.now(),
            success: false
        };
        this.phases.push(phase);
        console.log(`🔄 Starting phase: ${name}`);
    }
    completePhase(name, success = true, error) {
        const phase = this.phases.find(p => p.name === name && !p.endTime);
        if (phase) {
            phase.endTime = Date.now();
            phase.duration = phase.endTime - phase.startTime;
            phase.success = success;
            if (error)
                phase.error = error;
            const status = success ? "✅" : "❌";
            console.log(`${status} Completed phase: ${name} (${phase.duration}ms)`);
        }
    }
    getReport() {
        const totalDuration = Date.now() - this.startTime;
        const success = this.phases.every(p => p.success);
        return {
            totalDuration,
            phases: this.phases,
            success,
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || "development",
            version: process.env.npm_package_version || "1.0.0"
        };
    }
}
const startupTracker = new StartupTracker();
exports.startupTracker = startupTracker;
async function validateEnvironment() {
    startupTracker.startPhase("Environment Validation");
    try {
        const environment = process.env.NODE_ENV || 'development';
        if (environment === 'development') {
            console.log("🔧 Development mode: Using flexible environment validation");
            const criticalVars = ['NODE_ENV'];
            const missingCriticalVars = criticalVars.filter(varName => !process.env[varName]);
            if (missingCriticalVars.length > 0) {
                const error = `Missing critical environment variables: ${missingCriticalVars.join(', ')}`;
                startupTracker.completePhase("Environment Validation", false, error);
                return false;
            }
            const dbName = process.env.DB_DATABASE || process.env.DB_NAME;
            if (!dbName) {
                console.warn("⚠️ Database name not set (DB_DATABASE or DB_NAME) - server will run in limited mode");
            }
            const dbHost = process.env.DB_HOST;
            if (!dbHost) {
                console.warn("⚠️ Database host not set (DB_HOST) - server will run in limited mode");
            }
            startupTracker.completePhase("Environment Validation");
            return true;
        }
        else {
            const requiredVars = [
                'NODE_ENV',
                'PORT',
                'DB_HOST',
                'DB_USERNAME',
                'DB_PASSWORD'
            ];
            const dbName = process.env.DB_DATABASE || process.env.DB_NAME;
            if (!dbName) {
                const error = 'Missing required database name (DB_DATABASE or DB_NAME)';
                startupTracker.completePhase("Environment Validation", false, error);
                return false;
            }
            const missingVars = requiredVars.filter(varName => !process.env[varName]);
            if (missingVars.length > 0) {
                const error = `Missing required environment variables: ${missingVars.join(', ')}`;
                startupTracker.completePhase("Environment Validation", false, error);
                return false;
            }
            startupTracker.completePhase("Environment Validation");
            return true;
        }
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        startupTracker.completePhase("Environment Validation", false, errorMessage);
        return false;
    }
}
async function validateDatabaseConnection() {
    startupTracker.startPhase("Database Connection");
    try {
        const environment = process.env.NODE_ENV || 'development';
        if (environment === 'development') {
            console.log("🔧 Development mode: Attempting database connection (optional)");
            try {
                if (!databaseConfig_1.AppDataSource.isInitialized) {
                    await databaseConfig_1.AppDataSource.initialize();
                }
                await databaseConfig_1.AppDataSource.query("SELECT 1 as test");
                console.log("✅ Database connection successful");
                startupTracker.completePhase("Database Connection");
                return true;
            }
            catch (dbError) {
                console.warn("⚠️ Database connection failed in development mode - continuing without database");
                console.warn(`   Error: ${dbError instanceof Error ? dbError.message : String(dbError)}`);
                startupTracker.completePhase("Database Connection", true, "Database connection failed but continuing in development mode");
                return true;
            }
        }
        else {
            if (!databaseConfig_1.AppDataSource.isInitialized) {
                await databaseConfig_1.AppDataSource.initialize();
            }
            await databaseConfig_1.AppDataSource.query("SELECT 1 as test");
            startupTracker.completePhase("Database Connection");
            return true;
        }
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        startupTracker.completePhase("Database Connection", false, errorMessage);
        return false;
    }
}
async function validatePortAvailability(port) {
    startupTracker.startPhase("Port Availability Check");
    try {
        const net = require('net');
        return new Promise((resolve) => {
            const server = net.createServer();
            server.listen(port, () => {
                server.once('close', () => {
                    startupTracker.completePhase("Port Availability Check");
                    resolve(true);
                });
                server.close();
            });
            server.on('error', (err) => {
                if (err.code === 'EADDRINUSE') {
                    startupTracker.completePhase("Port Availability Check", false, `Port ${port} is already in use`);
                    resolve(false);
                }
                else {
                    startupTracker.completePhase("Port Availability Check", false, err.message);
                    resolve(false);
                }
            });
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        startupTracker.completePhase("Port Availability Check", false, errorMessage);
        return false;
    }
}
function validateMemoryUsage() {
    startupTracker.startPhase("Memory Usage Check");
    try {
        const memory = process.memoryUsage();
        const heapUsedMB = memory.heapUsed / 1024 / 1024;
        if (heapUsedMB > 100) {
            const warning = `High memory usage detected: ${Math.round(heapUsedMB)}MB`;
            console.warn(`⚠️ ${warning}`);
        }
        startupTracker.completePhase("Memory Usage Check");
        return true;
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        startupTracker.completePhase("Memory Usage Check", false, errorMessage);
        return false;
    }
}
async function validateDependencies() {
    startupTracker.startPhase("Dependencies Check");
    try {
        const requiredModules = [
            'express',
            'cors',
            'helmet',
            'morgan',
            'typeorm',
            'mysql2'
        ];
        const missingModules = [];
        for (const moduleName of requiredModules) {
            try {
                require(moduleName);
            }
            catch {
                missingModules.push(moduleName);
            }
        }
        if (missingModules.length > 0) {
            const error = `Missing required modules: ${missingModules.join(', ')}`;
            startupTracker.completePhase("Dependencies Check", false, error);
            return false;
        }
        startupTracker.completePhase("Dependencies Check");
        return true;
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        startupTracker.completePhase("Dependencies Check", false, errorMessage);
        return false;
    }
}
async function performStartupValidation(port) {
    console.log("=".repeat(60));
    console.log("🔧 SERVER STARTUP VALIDATION START");
    console.log("=".repeat(60));
    const validations = [
        () => validateEnvironment(),
        () => validateDependencies(),
        () => validateMemoryUsage(),
        () => validateDatabaseConnection(),
        () => validatePortAvailability(port)
    ];
    for (const validation of validations) {
        const result = await validation();
        if (!result) {
            console.log("=".repeat(60));
            console.log("❌ SERVER STARTUP VALIDATION FAILED");
            console.log("=".repeat(60));
            break;
        }
    }
    const report = startupTracker.getReport();
    if (report.success) {
        console.log("=".repeat(60));
        console.log("✅ SERVER STARTUP VALIDATION SUCCESSFUL");
        console.log("=".repeat(60));
        console.log(`⏱️ Total startup time: ${report.totalDuration}ms`);
        console.log(`🌍 Environment: ${report.environment}`);
        console.log(`📦 Version: ${report.version}`);
        console.log("=".repeat(60));
    }
    else {
        console.log("=".repeat(60));
        console.log("❌ SERVER STARTUP VALIDATION FAILED");
        console.log("=".repeat(60));
        console.log("📊 Failed phases:");
        report.phases
            .filter(p => !p.success)
            .forEach(p => console.log(`   - ${p.name}: ${p.error || 'Unknown error'}`));
        console.log("=".repeat(60));
    }
    return report;
}
async function performPostStartupHealthCheck() {
    startupTracker.startPhase("Post-Startup Health Check");
    try {
        const healthChecks = [
            () => process.uptime() > 0,
            () => process.memoryUsage().heapUsed > 0,
            () => databaseConfig_1.AppDataSource.isInitialized
        ];
        const allChecksPassed = healthChecks.every(check => check());
        if (allChecksPassed) {
            startupTracker.completePhase("Post-Startup Health Check");
            return true;
        }
        else {
            startupTracker.completePhase("Post-Startup Health Check", false, "One or more health checks failed");
            return false;
        }
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        startupTracker.completePhase("Post-Startup Health Check", false, errorMessage);
        return false;
    }
}
