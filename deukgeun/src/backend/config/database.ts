import { DataSource } from "typeorm"
import { config } from "./env"
import { Post } from "../entities/Post"
import { Gym } from "../entities/Gym"
import { User } from "../entities/User"
import { Machine } from "../entities/Machine"
import { Comment } from "../entities/Comment"
import { PostLike } from "../entities/Like"
import { UserLevel } from "../entities/UserLevel"
import { ExpHistory } from "../entities/ExpHistory"
import { UserReward } from "../entities/UserReward"
import { Milestone } from "../entities/Milestone"
import { UserStreak } from "../entities/UserStreak"
import { WorkoutSession } from "../entities/WorkoutSession"
import { ExerciseSet } from "../entities/ExerciseSet"
import { WorkoutGoal } from "../entities/WorkoutGoal"
import { WorkoutPlan } from "../entities/WorkoutPlan"
import { WorkoutPlanExercise } from "../entities/WorkoutPlanExercise"
import { WorkoutStats } from "../entities/WorkoutStats"
import { WorkoutProgress } from "../entities/WorkoutProgress"
import { WorkoutReminder } from "../entities/WorkoutReminder"
import { VerificationToken } from "../entities/VerificationToken"
import { PasswordResetToken } from "../entities/PasswordResetToken"

// TypeORM DataSource configuration
export const AppDataSource = new DataSource({
  // Database type configuration
  type: "mysql",

  // Database host address
  host: config.DB_HOST,

  // Database port number
  port: config.DB_PORT,

  // Database username
  username: config.DB_USERNAME,

  // Database password
  password: config.DB_PASSWORD,

  // Database name
  database: config.DB_NAME,

  // Auto-sync schema only in development environment
  // Set to false in production to prevent data loss
  synchronize: config.NODE_ENV === "development",

  // Enable SQL query logging only in development environment
  // Used for debugging purposes
  logging: config.NODE_ENV === "development",

  // Entity class list
  // Classes that map to database tables managed by TypeORM
  entities: [
    Post,
    Gym,
    User,
    Machine,
    Comment,
    PostLike,
    UserLevel,
    ExpHistory,
    UserReward,
    Milestone,
    UserStreak,
    WorkoutSession,
    ExerciseSet,
    WorkoutGoal,
    WorkoutPlan,
    WorkoutPlanExercise,
    WorkoutStats,
    WorkoutProgress,
    WorkoutReminder,
    VerificationToken,
    PasswordResetToken,
  ],

  // Subscriber list (currently not used)
  subscribers: [],

  // Migration list (currently not used)
  migrations: [],
})

// Database connection function
export const connectDatabase = async () => {
  try {
    // Initialize the DataSource
    await AppDataSource.initialize()
    console.log("✅ Database connection established successfully")
    return AppDataSource
  } catch (error) {
    console.error("❌ Database connection failed:", error)
    throw error
  }
}

// Get the current connection
export const getConnection = () => {
  if (!AppDataSource.isInitialized) {
    throw new Error("Database connection is not initialized")
  }
  return AppDataSource
}
