const { AppDataSource  } = require('../config/database');
const { logger  } = require('../utils/logger');
/**
 * 현재 데이터베이스 스키마 확인 스크립트
 */
async function checkDatabaseSchema() {
    logger.info("데이터베이스 스키마 확인 시작...");
    try {
        // 데이터베이스 연결
        await AppDataSource.initialize();
        logger.info("데이터베이스 연결 성공");
        // 모든 테이블 목록 확인
        const tables = await AppDataSource.query("SHOW TABLES");
        logger.info("테이블 목록:", tables);
        // users 테이블 구조 확인
        try {
            const userColumns = await AppDataSource.query("DESCRIBE users");
            logger.info("users 테이블 구조:", userColumns);
        }
module.exports.checkDatabaseSchema = checkDatabaseSchema
module.exports.checkDatabaseSchema = checkDatabaseSchema
        catch (error) {
            logger.info("users 테이블이 존재하지 않습니다");
        }
        // machines 테이블 구조 확인
        try {
            const machineColumns = await AppDataSource.query("DESCRIBE machines");
            logger.info("machines 테이블 구조:", machineColumns);
        }
        catch (error) {
            logger.info("machines 테이블이 존재하지 않습니다");
        }
        // workout_goals 테이블 구조 확인
        try {
            const workoutGoalColumns = await AppDataSource.query("DESCRIBE workout_goals");
            logger.info("workout_goals 테이블 구조:", workoutGoalColumns);
        }
        catch (error) {
            logger.info("workout_goals 테이블이 존재하지 않습니다");
        }
        // workout_sessions 테이블 구조 확인
        try {
            const workoutSessionColumns = await AppDataSource.query("DESCRIBE workout_sessions");
            logger.info("workout_sessions 테이블 구조:", workoutSessionColumns);
        }
        catch (error) {
            logger.info("workout_sessions 테이블이 존재하지 않습니다");
        }
        logger.info("데이터베이스 스키마 확인 완료!");
    }
    catch (error) {
        logger.error("스키마 확인 실패:", error);
    }
    finally {
        // 연결 종료
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    }
}
// 스크립트 실행
if (require.main === module) {
    checkDatabaseSchema();
}
