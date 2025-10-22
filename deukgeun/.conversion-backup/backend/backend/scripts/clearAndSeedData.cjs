"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const databaseConfig_1 = require('config/databaseConfig');
const logger_1 = require('utils/logger');
async function clearAndSeedData() {
    logger_1.logger.info("기존 데이터 삭제 및 새로운 시드 시작...");
    try {
        await databaseConfig_1.AppDataSource.initialize();
        logger_1.logger.info("데이터베이스 연결 성공");
        await databaseConfig_1.AppDataSource.query("SET FOREIGN_KEY_CHECKS = 0");
        logger_1.logger.info("외래키 제약조건 비활성화 완료");
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
        ];
        logger_1.logger.info("기존 데이터 삭제 중...");
        for (const table of tablesToClear) {
            try {
                await databaseConfig_1.AppDataSource.query(`DELETE FROM ${table}`);
                logger_1.logger.info(`${table} 테이블 데이터 삭제 완료`);
            }
            catch (error) {
                logger_1.logger.info(`${table} 테이블이 존재하지 않거나 이미 비어있습니다`);
            }
        }
        await databaseConfig_1.AppDataSource.query("SET FOREIGN_KEY_CHECKS = 1");
        logger_1.logger.info("외래키 제약조건 재활성화 완료");
        logger_1.logger.info("🎉 기존 데이터 삭제 완료!");
        logger_1.logger.info("이제 'npm run seed:optimized' 명령어로 새로운 시드 데이터를 생성하세요.");
    }
    catch (error) {
        logger_1.logger.error("데이터 삭제 실패:", error);
        throw error;
    }
    finally {
        if (databaseConfig_1.AppDataSource.isInitialized) {
            await databaseConfig_1.AppDataSource.destroy();
        }
    }
}
if (require.main === module) {
    clearAndSeedData()
        .then(() => {
        logger_1.logger.info("✅ 데이터 삭제 및 시드 완료!");
        process.exit(0);
    })
        .catch(error => {
        logger_1.logger.error("❌ 데이터 삭제 및 시드 실패:", error);
        process.exit(1);
    });
}
