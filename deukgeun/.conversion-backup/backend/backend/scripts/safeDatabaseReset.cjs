"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const databaseConfig_1 = require('config/databaseConfig');
async function safeDatabaseReset() {
    console.log("🔄 안전한 데이터베이스 리셋 시작...");
    try {
        await databaseConfig_1.AppDataSource.initialize();
        console.log("✅ 데이터베이스 연결 성공");
        await disableForeignKeyChecks(databaseConfig_1.AppDataSource);
        console.log("✅ 외래키 제약조건 비활성화");
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
        ];
        for (const table of tablesToDrop) {
            try {
                await databaseConfig_1.AppDataSource.query(`DROP TABLE IF EXISTS \`${table}\``);
                console.log(`✅ 테이블 삭제: ${table}`);
            }
            catch (error) {
                console.log(`⚠️ 테이블 삭제 실패 (무시): ${table}`);
            }
        }
        await enableForeignKeyChecks(databaseConfig_1.AppDataSource);
        console.log("✅ 외래키 제약조건 재활성화");
        await databaseConfig_1.AppDataSource.synchronize(true);
        console.log("✅ 스키마 동기화 완료");
        console.log("🎉 안전한 데이터베이스 리셋 완료!");
    }
    catch (error) {
        console.error("❌ 데이터베이스 리셋 실패:", error);
        throw error;
    }
    finally {
        if (databaseConfig_1.AppDataSource.isInitialized) {
            await databaseConfig_1.AppDataSource.destroy();
        }
    }
}
async function disableForeignKeyChecks(dataSource) {
    await dataSource.query("SET FOREIGN_KEY_CHECKS = 0");
}
async function enableForeignKeyChecks(dataSource) {
    await dataSource.query("SET FOREIGN_KEY_CHECKS = 1");
}
safeDatabaseReset()
    .then(() => {
    console.log("✅ 리셋 스크립트 완료");
    process.exit(0);
})
    .catch(error => {
    console.error("❌ 리셋 스크립트 실패:", error);
    process.exit(1);
});
