"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const databaseConfig_1 = require('config/databaseConfig');
const logger_1 = require('utils/logger');
async function checkDatabaseSchema() {
    logger_1.logger.info("데이터베이스 스키마 확인 시작...");
    try {
        await databaseConfig_1.AppDataSource.initialize();
        logger_1.logger.info("데이터베이스 연결 성공");
        const tables = await databaseConfig_1.AppDataSource.query("SHOW TABLES");
        logger_1.logger.info("테이블 목록:", tables);
        try {
            const userColumns = await databaseConfig_1.AppDataSource.query("DESCRIBE users");
            logger_1.logger.info("users 테이블 구조:", userColumns);
        }
        catch (error) {
            logger_1.logger.info("users 테이블이 존재하지 않습니다");
        }
        try {
            const machineColumns = await databaseConfig_1.AppDataSource.query("DESCRIBE machines");
            logger_1.logger.info("machines 테이블 구조:", machineColumns);
        }
        catch (error) {
            logger_1.logger.info("machines 테이블이 존재하지 않습니다");
        }
        try {
            const workoutGoalColumns = await databaseConfig_1.AppDataSource.query("DESCRIBE workout_goals");
            logger_1.logger.info("workout_goals 테이블 구조:", workoutGoalColumns);
        }
        catch (error) {
            logger_1.logger.info("workout_goals 테이블이 존재하지 않습니다");
        }
        try {
            const workoutSessionColumns = await databaseConfig_1.AppDataSource.query("DESCRIBE workout_sessions");
            logger_1.logger.info("workout_sessions 테이블 구조:", workoutSessionColumns);
        }
        catch (error) {
            logger_1.logger.info("workout_sessions 테이블이 존재하지 않습니다");
        }
        logger_1.logger.info("데이터베이스 스키마 확인 완료!");
    }
    catch (error) {
        logger_1.logger.error("스키마 확인 실패:", error);
    }
    finally {
        if (databaseConfig_1.AppDataSource.isInitialized) {
            await databaseConfig_1.AppDataSource.destroy();
        }
    }
}
if (require.main === module) {
    checkDatabaseSchema();
}
