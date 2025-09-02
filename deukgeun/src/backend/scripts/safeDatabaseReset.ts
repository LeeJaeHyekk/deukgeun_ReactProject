import { AppDataSource } from "../config/database.js"
import { DataSource } from "typeorm"
import { User } from "../entities/User.js"
import { Gym } from "../entities/Gym.js"
import { Machine } from "../entities/Machine.js"
import { Post } from "../entities/Post.js"
import { Comment } from "../entities/Comment.js"
import { Like } from "../entities/Like.js"
import { UserLevel } from "../entities/UserLevel.js"
import { ExpHistory } from "../entities/ExpHistory.js"
import { UserReward } from "../entities/UserReward.js"
import { Milestone } from "../entities/Milestone.js"
import { UserStreak } from "../entities/UserStreak.js"
import { WorkoutSession } from "../entities/WorkoutSession.js"
import { ExerciseSet } from "../entities/ExerciseSet.js"
import { WorkoutGoal } from "../entities/WorkoutGoal.js"
import { WorkoutPlan } from "../entities/WorkoutPlan.js"
import { WorkoutPlanExercise } from "../entities/WorkoutPlanExercise.js"
import { WorkoutStats } from "../entities/WorkoutStats.js"
import { WorkoutProgress } from "../entities/WorkoutProgress.js"
import { WorkoutReminder } from "../entities/WorkoutReminder.js"

async function safeDatabaseReset() {
  console.log("🔄 안전한 데이터베이스 리셋 시작...")

  try {
    // 데이터베이스 연결
    await AppDataSource.initialize()
    console.log("✅ 데이터베이스 연결 성공")

    // 외래키 제약조건 비활성화
    await disableForeignKeyChecks(AppDataSource)
    console.log("✅ 외래키 제약조건 비활성화")

    // 모든 테이블 삭제 (순서 중요)
    const tablesToDrop = [
      "typeorm_metadata",
      "workout_reminders",
      "workout_progress",
      "workout_stats",
      "exercise_sets",
      "workout_sessions",
      "workout_plan_exercises",
      "workout_plans",
      "workout_goals",
      "user_streaks",
      "milestones",
      "user_rewards",
      "exp_history",
      "user_levels",
      "post_likes",
      "comments",
      "posts",
      "password_reset_token",
      "verification_token",
      "machines",
      "gym",
      "users",
    ]

    for (const table of tablesToDrop) {
      try {
        await AppDataSource.query(`DROP TABLE IF EXISTS \`${table}\``)
        console.log(`✅ 테이블 삭제: ${table}`)
      } catch (error) {
        console.log(`⚠️ 테이블 삭제 실패 (무시): ${table}`)
      }
    }

    // 외래키 제약조건 재활성화
    await enableForeignKeyChecks(AppDataSource)
    console.log("✅ 외래키 제약조건 재활성화")

    // 스키마 동기화
    await AppDataSource.synchronize(true)
    console.log("✅ 스키마 동기화 완료")

    console.log("🎉 안전한 데이터베이스 리셋 완료!")
  } catch (error) {
    console.error("❌ 데이터베이스 리셋 실패:", error)
    throw error
  } finally {
    // 데이터베이스 연결 종료
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy()
    }
  }
}

// 외래키 제약조건 비활성화
async function disableForeignKeyChecks(dataSource: DataSource) {
  await dataSource.query("SET FOREIGN_KEY_CHECKS = 0")
}

// 외래키 제약조건 재활성화
async function enableForeignKeyChecks(dataSource: DataSource) {
  await dataSource.query("SET FOREIGN_KEY_CHECKS = 1")
}

// 스크립트 실행
safeDatabaseReset()
  .then(() => {
    console.log("✅ 리셋 스크립트 완료")
    process.exit(0)
  })
  .catch(error => {
    console.error("❌ 리셋 스크립트 실패:", error)
    process.exit(1)
  })
