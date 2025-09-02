import { AppDataSource } from "../config/database.js"
import { logger } from "../utils/logger.js"

/**
 * 기존 데이터를 삭제하고 새로운 시드 데이터를 넣는 스크립트
 *
 * 실행 방법:
 * npm run seed:clear
 */

async function clearAndSeedData() {
  logger.info("기존 데이터 삭제 및 새로운 시드 시작...")

  try {
    // 데이터베이스 연결
    await AppDataSource.initialize()
    logger.info("데이터베이스 연결 성공")

    // 외래키 제약조건 비활성화
    await AppDataSource.query("SET FOREIGN_KEY_CHECKS = 0")
    logger.info("외래키 제약조건 비활성화 완료")

    // 테이블 목록 (삭제 순서 고려)
    const tablesToClear = [
      "user_rewards",
      "milestones",
      "user_streaks",
      "exp_history",
      "workout_plan_exercises",
      "workout_sessions",
      "workout_goals",
      "workout_plans",
      "exercise_sets",
      "post_likes",
      "comments",
      "posts",
      "user_levels",
      "machines",
      "gym",
      "users",
    ]

    // 기존 데이터 삭제
    logger.info("기존 데이터 삭제 중...")
    for (const table of tablesToClear) {
      try {
        await AppDataSource.query(`DELETE FROM ${table}`)
        logger.info(`${table} 테이블 데이터 삭제 완료`)
      } catch (error) {
        logger.info(`${table} 테이블이 존재하지 않거나 이미 비어있습니다`)
      }
    }

    // 외래키 제약조건 재활성화
    await AppDataSource.query("SET FOREIGN_KEY_CHECKS = 1")
    logger.info("외래키 제약조건 재활성화 완료")

    logger.info("🎉 기존 데이터 삭제 완료!")
    logger.info(
      "이제 'npm run seed:optimized' 명령어로 새로운 시드 데이터를 생성하세요."
    )
  } catch (error) {
    logger.error("데이터 삭제 실패:", error)
    throw error
  } finally {
    // 데이터베이스 연결 종료
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy()
    }
  }
}

// 스크립트 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  clearAndSeedData()
    .then(() => {
      logger.info("✅ 데이터 삭제 및 시드 완료!")
      process.exit(0)
    })
    .catch(error => {
      logger.error("❌ 데이터 삭제 및 시드 실패:", error)
      process.exit(1)
    })
}
