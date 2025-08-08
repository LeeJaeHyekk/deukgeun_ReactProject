import { createConnection, getConnection } from "typeorm"
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

// TypeORM database connection configuration
export const connectDatabase = async () => {
  try {
    // 기존 연결이 있는지 확인
    const existingConnection = getConnection()
    if (existingConnection.isConnected) {
      return existingConnection
    }
  } catch {
    // 연결이 없으면 새로 생성
  }

  const connection = await createConnection({
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
    ],

    // Subscriber list (currently not used)
    subscribers: [],

    // Migration list (currently not used)
    migrations: [],
  })

  return connection // Return the established connection object
}

// Re-export for convenience
export { createConnection }
