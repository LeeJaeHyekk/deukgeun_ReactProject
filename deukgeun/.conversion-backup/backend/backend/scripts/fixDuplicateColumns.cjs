const { AppDataSource  } = require('../config/database');
const { logger  } = require('../utils/logger');
/**
 * 중복된 컬럼들을 정리하는 마이그레이션 스크립트
 * - workout_goals 테이블의 user_id 컬럼 제거 (userId 사용)
 * - workout_sessions 테이블의 중복 컬럼들 정리
 */
async function fixWorkoutGoalsTable() {
    logger.info("workout_goals 테이블 중복 컬럼 정리 시작...");
    try {
        // user_id 컬럼이 존재하는지 확인
        const columns = await AppDataSource.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'deukgeun_db' 
      AND TABLE_NAME = 'workout_goals' 
      AND COLUMN_NAME = 'user_id'
    `);
        if (columns.length > 0) {
            // 외래키 제약조건 삭제
            await AppDataSource.query(`
        ALTER TABLE workout_goals 
        DROP FOREIGN KEY FK_cad21d3812cb9a2b845092ee38c
      `);
            logger.info("workout_goals 테이블 외래키 제약조건 삭제 완료");
            // user_id 컬럼 제거 (userId 컬럼이 이미 존재하므로)
            await AppDataSource.query(`
        ALTER TABLE workout_goals 
        DROP COLUMN user_id
      `);
            logger.info("workout_goals 테이블에서 user_id 컬럼 제거 완료");
            // userId 컬럼에 새로운 외래키 제약조건 추가
            await AppDataSource.query(`
        ALTER TABLE workout_goals 
        ADD CONSTRAINT FK_workout_goals_user 
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      `);
            logger.info("workout_goals 테이블 새로운 외래키 제약조건 추가 완료");
        }
module.exports.fixWorkoutGoalsTable = fixWorkoutGoalsTable
module.exports.fixWorkoutGoalsTable = fixWorkoutGoalsTable
        else {
            logger.info("workout_goals 테이블에 user_id 컬럼이 존재하지 않습니다");
        }
        logger.info("workout_goals 테이블 정리 완료");
    }
    catch (error) {
        logger.error("workout_goals 테이블 정리 실패:", error);
        throw error;
    }
}
async function fixWorkoutSessionsTable() {
    logger.info("workout_sessions 테이블 중복 컬럼 정리 시작...");
    try {
        // 중복 컬럼들 확인 및 제거
        const duplicateColumns = [
            { old: "user_id", new: "userId", fk: "FK_3a1ec9260afc530837db15579a5" }
module.exports.fixWorkoutSessionsTable = fixWorkoutSessionsTable
module.exports.fixWorkoutSessionsTable = fixWorkoutSessionsTable,
            { old: "plan_id", new: "planId", fk: "FK_8417906741dc09e46fad2922f48" },
            { old: "gym_id", new: "gymId", fk: "FK_7045a0e0659d34923b0efe234fa" },
        ];
        for (const { old, new: newCol, fk } of duplicateColumns) {
            const columns = await AppDataSource.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'deukgeun_db' 
        AND TABLE_NAME = 'workout_sessions' 
        AND COLUMN_NAME = '${old}'
      `);
            if (columns.length > 0) {
                // 외래키 제약조건이 있으면 먼저 삭제
                if (fk) {
                    try {
                        await AppDataSource.query(`
              ALTER TABLE workout_sessions 
              DROP FOREIGN KEY ${fk}
            `);
                        logger.info(`workout_sessions 테이블 외래키 제약조건 ${fk} 삭제 완료`);
                    }
                    catch (error) {
                        logger.info(`외래키 제약조건 ${fk}가 존재하지 않습니다`);
                    }
                }
                // 기존 컬럼 제거
                await AppDataSource.query(`
          ALTER TABLE workout_sessions 
          DROP COLUMN ${old}
        `);
                logger.info(`workout_sessions 테이블에서 ${old} 컬럼 제거 완료`);
                // userId 컬럼에 새로운 외래키 제약조건 추가 (user_id인 경우만)
                if (old === "user_id") {
                    await AppDataSource.query(`
            ALTER TABLE workout_sessions 
            ADD CONSTRAINT FK_workout_sessions_user 
            FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
          `);
                    logger.info("workout_sessions 테이블 새로운 외래키 제약조건 추가 완료");
                }
                // planId 컬럼에 새로운 외래키 제약조건 추가
                if (old === "plan_id") {
                    await AppDataSource.query(`
            ALTER TABLE workout_sessions 
            ADD CONSTRAINT FK_workout_sessions_plan 
            FOREIGN KEY (planId) REFERENCES workout_plans(id) ON DELETE SET NULL
          `);
                    logger.info("workout_sessions 테이블 planId 외래키 제약조건 추가 완료");
                }
                // gymId 컬럼에 새로운 외래키 제약조건 추가
                if (old === "gym_id") {
                    await AppDataSource.query(`
            ALTER TABLE workout_sessions 
            ADD CONSTRAINT FK_workout_sessions_gym 
            FOREIGN KEY (gymId) REFERENCES gym(id) ON DELETE SET NULL
          `);
                    logger.info("workout_sessions 테이블 gymId 외래키 제약조건 추가 완료");
                }
            }
            else {
                logger.info(`workout_sessions 테이블에 ${old} 컬럼이 존재하지 않습니다`);
            }
        }
        logger.info("workout_sessions 테이블 정리 완료");
    }
    catch (error) {
        logger.error("workout_sessions 테이블 정리 실패:", error);
        throw error;
    }
}
async function main() {
    logger.info("중복 컬럼 정리 마이그레이션 시작...");
    try {
        // 데이터베이스 연결
        await AppDataSource.initialize();
        logger.info("데이터베이스 연결 성공");
        // 중복 컬럼 정리 실행
        await fixWorkoutGoalsTable();
        await fixWorkoutSessionsTable();
        logger.info("모든 중복 컬럼 정리 완료!");
        // 연결 종료
        await AppDataSource.destroy();
        logger.info("데이터베이스 연결 종료");
    }
module.exports.main = main
module.exports.main = main
    catch (error) {
        logger.error("마이그레이션 실패:", error);
        process.exit(1);
    }
}
// 스크립트 실행
if (require.main === module) {
    main();
}
