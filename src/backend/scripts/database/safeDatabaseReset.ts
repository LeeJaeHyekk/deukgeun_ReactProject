import { AppDataSource } from "../../shared/database"
import { DataSource } from "typeorm"
import { User } from "../../domains/auth/entities/User"
import { Gym } from "../../domains/gym/entities/Gym"
import { Machine } from "../../domains/machine/entities/Machine"
import { Post } from "../../domains/community/entities/Post"
import { Comment } from "../../domains/community/entities/Comment"
import { Like } from "../../domains/community/entities/Like"
import { UserLevel } from "../../domains/level/entities/UserLevel"
import { ExpHistory } from "../../domains/level/entities/ExpHistory"
import { UserReward } from "../../domains/level/entities/UserReward"
import { Milestone } from "../../entities/Milestone"
import { UserStreak } from "../../entities/UserStreak"
import { WorkoutSession } from "../../domains/workout/entities/WorkoutSession"
import { ExerciseSet } from "../../domains/workout/entities/ExerciseSet"
import { WorkoutGoal } from "../../entities/WorkoutGoal"
import { WorkoutPlan } from "../../domains/workout/entities/WorkoutPlan"
import { WorkoutPlanExercise } from "../../entities/WorkoutPlanExercise"
import { WorkoutStats } from "../../domains/workout/entities/WorkoutStats"
import { WorkoutProgress } from "../../entities/WorkoutProgress"
import { WorkoutReminder } from "../../entities/WorkoutReminder"

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
