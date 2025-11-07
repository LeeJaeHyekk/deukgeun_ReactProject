"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeDatabase = exports.getDatabase = exports.connectDatabase = exports.AppDataSource = void 0;
exports.checkMySQLServer = checkMySQLServer;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const dotenv_1 = require("dotenv");
const promise_1 = __importDefault(require("mysql2/promise"));
const User_1 = require('../entities/User.cjs');
const UserLevel_1 = require('../entities/UserLevel.cjs');
const UserStreak_1 = require('../entities/UserStreak.cjs');
const ExpHistory_1 = require('../entities/ExpHistory.cjs');
const UserReward_1 = require('../entities/UserReward.cjs');
const Milestone_1 = require('../entities/Milestone.cjs');
const Post_1 = require('../entities/Post.cjs');
const Comment_1 = require('../entities/Comment.cjs');
const Like_1 = require('../entities/Like.cjs');
const Gym_1 = require('../entities/Gym.cjs');
const Equipment_1 = require('../entities/Equipment.cjs');
const Machine_1 = require('../entities/Machine.cjs');
const HomePageConfig_1 = require('../entities/HomePageConfig.cjs');
const WorkoutSession_1 = require('../entities/WorkoutSession.cjs');
const WorkoutPlan_1 = require('../entities/WorkoutPlan.cjs');
const WorkoutPlanExercise_1 = require('../entities/WorkoutPlanExercise.cjs');
const ExerciseSet_1 = require('../entities/ExerciseSet.cjs');
const WorkoutGoal_1 = require('../entities/WorkoutGoal.cjs');
const GoalEntity_1 = require('../entities/GoalEntity.cjs');
const GoalHistoryEntity_1 = require('../entities/GoalHistoryEntity.cjs');
const VerificationToken_1 = require('../entities/VerificationToken.cjs');
const PasswordResetToken_1 = require('../entities/PasswordResetToken.cjs');
(0, dotenv_1.config)();
const environment = process.env.NODE_ENV || "development";
function getEntities() {
    const entities = [
        User_1.User,
        UserLevel_1.UserLevel,
        UserStreak_1.UserStreak,
        ExpHistory_1.ExpHistory,
        UserReward_1.UserReward,
        Milestone_1.Milestone,
        Post_1.Post,
        Comment_1.Comment,
        Like_1.Like,
        Gym_1.Gym,
        Equipment_1.Equipment,
        Machine_1.Machine,
        HomePageConfig_1.HomePageConfig,
        WorkoutSession_1.WorkoutSession,
        WorkoutPlan_1.WorkoutPlan,
        WorkoutPlanExercise_1.WorkoutPlanExercise,
        ExerciseSet_1.ExerciseSet,
        WorkoutGoal_1.WorkoutGoal,
        GoalEntity_1.GoalEntity,
        GoalHistoryEntity_1.GoalHistoryEntity,
        VerificationToken_1.VerificationToken,
        PasswordResetToken_1.PasswordResetToken,
    ];
    console.log(`✅ Loaded ${entities.length} entities`);
    return entities;
}
exports.AppDataSource = new typeorm_1.DataSource({
    type: "mysql",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306"),
    username: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_DATABASE || process.env.DB_NAME || "deukgeun_db",
    extra: {
        connectionLimit: 10,
        charset: 'utf8mb4',
        timezone: '+09:00'
    },
    synchronize: environment === "development",
    logging: environment === "development",
    entities: getEntities(),
    subscribers: [],
    migrations: [],
});
async function checkMySQLServer() {
    try {
        const connection = await promise_1.default.createConnection({
            host: process.env.DB_HOST || "localhost",
            port: parseInt(process.env.DB_PORT || "3306"),
            user: process.env.DB_USERNAME || "root",
            password: process.env.DB_PASSWORD || "",
        });
        await connection.ping();
        await connection.end();
        return true;
    }
    catch (error) {
        console.error("❌ MySQL server check failed:", error);
        return false;
    }
}
const retryDatabaseConnection = async (maxRetries = 3, retryDelay = 1000) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`🔄 Database connection attempt ${attempt}/${maxRetries}...`);
            if (!exports.AppDataSource.isInitialized) {
                await exports.AppDataSource.initialize();
                console.log("✅ Database connection established");
            }
            else {
                console.log("✅ Database already connected");
            }
            return true;
        }
        catch (error) {
            console.error(`❌ Database connection attempt ${attempt} failed:`, error);
            if (attempt < maxRetries) {
                console.log(`⏳ Waiting ${retryDelay}ms before retry...`);
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            }
        }
    }
    console.error(`❌ Failed to connect to database after ${maxRetries} attempts`);
    return false;
};
const connectDatabase = async () => {
    console.log("=".repeat(60));
    console.log("🔧 DATABASE CONNECTION WITH ENTITIES DEBUG START");
    console.log("=".repeat(60));
    try {
        console.log("🔄 Step 1: Loading entities...");
        const entities = getEntities();
        console.log(`✅ Step 1: Loaded ${entities.length} entities`);
        console.log(`📊 Step 1.1: Connection details:`);
        console.log(`   - Host: ${process.env.DB_HOST || "localhost"}`);
        console.log(`   - Port: ${process.env.DB_PORT || "3306"}`);
        console.log(`   - Database: ${process.env.DB_DATABASE || process.env.DB_NAME || "deukgeun_db"}`);
        console.log(`   - Username: ${process.env.DB_USERNAME || "root"}`);
        console.log(`   - Password: ${process.env.DB_PASSWORD ? "***" : "NOT SET"}`);
        console.log(`   - Environment: ${process.env.NODE_ENV || "development"}`);
        console.log("🔄 Step 2: Checking AppDataSource configuration...");
        console.log(`   - Type: ${exports.AppDataSource.options.type}`);
        console.log(`   - Synchronize: ${exports.AppDataSource.options.synchronize}`);
        console.log(`   - Logging: ${exports.AppDataSource.options.logging}`);
        console.log(`   - Entities count: ${exports.AppDataSource.options.entities?.length || 0}`);
        console.log("🔄 Step 3: Attempting AppDataSource.initialize() with retry logic...");
        const startTime = Date.now();
        const connectionSuccess = await retryDatabaseConnection(3, 500);
        if (!connectionSuccess) {
            throw new Error("Failed to connect to database after 3 attempts");
        }
        const endTime = Date.now();
        console.log(`✅ Step 3: Database connection successful in ${endTime - startTime}ms`);
        console.log("🔄 Step 4: Verifying connection status...");
        console.log(`   - Is Initialized: ${exports.AppDataSource.isInitialized}`);
        console.log(`   - Connection Name: ${exports.AppDataSource.name}`);
        console.log("🔄 Step 5: Testing database query...");
        const queryStartTime = Date.now();
        const result = await exports.AppDataSource.query("SELECT 1 as test, NOW() as `current_time`");
        const queryEndTime = Date.now();
        console.log(`✅ Step 5: Database query test successful in ${queryEndTime - queryStartTime}ms`);
        console.log(`   - Query result:`, result);
        console.log("=".repeat(60));
        console.log("✅ DATABASE CONNECTION WITH ENTITIES SUCCESSFUL");
        console.log("=".repeat(60));
        console.log(`📊 Database: ${process.env.DB_DATABASE || process.env.DB_NAME || "deukgeun_db"} on ${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || "3306"}`);
        console.log(`⏱️ Total connection time: ${endTime - startTime}ms`);
        console.log(`📊 Entities loaded: ${entities.length}`);
        console.log("=".repeat(60));
        return exports.AppDataSource;
    }
    catch (error) {
        console.log("=".repeat(60));
        console.log("❌ DATABASE CONNECTION WITH ENTITIES FAILED");
        console.log("=".repeat(60));
        console.error("❌ Error occurred during database connection:");
        console.error("   - Error type:", error?.constructor?.name || "Unknown");
        console.error("   - Error message:", error instanceof Error ? error.message : String(error));
        if (error instanceof Error) {
            console.error("   - Error stack:", error.stack);
        }
        console.log("=".repeat(60));
        console.log("❌ DATABASE CONNECTION WITH ENTITIES DEBUG END");
        console.log("=".repeat(60));
        throw error;
    }
};
exports.connectDatabase = connectDatabase;
const getDatabase = () => {
    if (!exports.AppDataSource.isInitialized) {
        throw new Error("Database not initialized. Call connectDatabase() first.");
    }
    return exports.AppDataSource;
};
exports.getDatabase = getDatabase;
const closeDatabase = async () => {
    if (exports.AppDataSource.isInitialized) {
        await exports.AppDataSource.destroy();
        console.log("✅ Database connection closed");
    }
};
exports.closeDatabase = closeDatabase;
