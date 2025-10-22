"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const databaseConfig_1 = require('config/databaseConfig');
const logger_1 = require('utils/logger');
async function fixWorkoutGoalsTable() {
    logger_1.logger.info("workout_goals 테이블 중복 컬럼 정리 시작...");
    try {
        const columns = await databaseConfig_1.AppDataSource.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'deukgeun_db' 
      AND TABLE_NAME = 'workout_goals' 
      AND COLUMN_NAME = 'user_id'
    `);
        if (columns.length > 0) {
            await databaseConfig_1.AppDataSource.query(`
        ALTER TABLE workout_goals 
        DROP FOREIGN KEY FK_cad21d3812cb9a2b845092ee38c
      `);
            logger_1.logger.info("workout_goals 테이블 외래키 제약조건 삭제 완료");
            await databaseConfig_1.AppDataSource.query(`
        ALTER TABLE workout_goals 
        DROP COLUMN user_id
      `);
            logger_1.logger.info("workout_goals 테이블에서 user_id 컬럼 제거 완료");
            await databaseConfig_1.AppDataSource.query(`
        ALTER TABLE workout_goals 
        ADD CONSTRAINT FK_workout_goals_user 
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      `);
            logger_1.logger.info("workout_goals 테이블 새로운 외래키 제약조건 추가 완료");
        }
        else {
            logger_1.logger.info("workout_goals 테이블에 user_id 컬럼이 존재하지 않습니다");
        }
        logger_1.logger.info("workout_goals 테이블 정리 완료");
    }
    catch (error) {
        logger_1.logger.error("workout_goals 테이블 정리 실패:", error);
        throw error;
    }
}
async function fixWorkoutSessionsTable() {
    logger_1.logger.info("workout_sessions 테이블 중복 컬럼 정리 시작...");
    try {
        const duplicateColumns = [
            { old: "user_id", new: "userId", fk: "FK_3a1ec9260afc530837db15579a5" },
            { old: "plan_id", new: "planId", fk: "FK_8417906741dc09e46fad2922f48" },
            { old: "gym_id", new: "gymId", fk: "FK_7045a0e0659d34923b0efe234fa" },
        ];
        for (const { old, new: newCol, fk } of duplicateColumns) {
            const columns = await databaseConfig_1.AppDataSource.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'deukgeun_db' 
        AND TABLE_NAME = 'workout_sessions' 
        AND COLUMN_NAME = '${old}'
      `);
            if (columns.length > 0) {
                if (fk) {
                    try {
                        await databaseConfig_1.AppDataSource.query(`
              ALTER TABLE workout_sessions 
              DROP FOREIGN KEY ${fk}
            `);
                        logger_1.logger.info(`workout_sessions 테이블 외래키 제약조건 ${fk} 삭제 완료`);
                    }
                    catch (error) {
                        logger_1.logger.info(`외래키 제약조건 ${fk}가 존재하지 않습니다`);
                    }
                }
                await databaseConfig_1.AppDataSource.query(`
          ALTER TABLE workout_sessions 
          DROP COLUMN ${old}
        `);
                logger_1.logger.info(`workout_sessions 테이블에서 ${old} 컬럼 제거 완료`);
                if (old === "user_id") {
                    await databaseConfig_1.AppDataSource.query(`
            ALTER TABLE workout_sessions 
            ADD CONSTRAINT FK_workout_sessions_user 
            FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
          `);
                    logger_1.logger.info("workout_sessions 테이블 새로운 외래키 제약조건 추가 완료");
                }
                if (old === "plan_id") {
                    await databaseConfig_1.AppDataSource.query(`
            ALTER TABLE workout_sessions 
            ADD CONSTRAINT FK_workout_sessions_plan 
            FOREIGN KEY (planId) REFERENCES workout_plans(id) ON DELETE SET NULL
          `);
                    logger_1.logger.info("workout_sessions 테이블 planId 외래키 제약조건 추가 완료");
                }
                if (old === "gym_id") {
                    await databaseConfig_1.AppDataSource.query(`
            ALTER TABLE workout_sessions 
            ADD CONSTRAINT FK_workout_sessions_gym 
            FOREIGN KEY (gymId) REFERENCES gym(id) ON DELETE SET NULL
          `);
                    logger_1.logger.info("workout_sessions 테이블 gymId 외래키 제약조건 추가 완료");
                }
            }
            else {
                logger_1.logger.info(`workout_sessions 테이블에 ${old} 컬럼이 존재하지 않습니다`);
            }
        }
        logger_1.logger.info("workout_sessions 테이블 정리 완료");
    }
    catch (error) {
        logger_1.logger.error("workout_sessions 테이블 정리 실패:", error);
        throw error;
    }
}
async function main() {
    logger_1.logger.info("중복 컬럼 정리 마이그레이션 시작...");
    try {
        await databaseConfig_1.AppDataSource.initialize();
        logger_1.logger.info("데이터베이스 연결 성공");
        await fixWorkoutGoalsTable();
        await fixWorkoutSessionsTable();
        logger_1.logger.info("모든 중복 컬럼 정리 완료!");
        await databaseConfig_1.AppDataSource.destroy();
        logger_1.logger.info("데이터베이스 연결 종료");
    }
    catch (error) {
        logger_1.logger.error("마이그레이션 실패:", error);
        process.exit(1);
    }
}
if (require.main === module) {
    main();
}
