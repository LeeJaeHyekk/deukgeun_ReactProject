"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const databaseConfig_1 = require('config/databaseConfig');
async function syncDatabase() {
    console.log("🔄 데이터베이스 동기화 시작...");
    try {
        await databaseConfig_1.AppDataSource.initialize();
        console.log("✅ 데이터베이스 연결 성공");
        await disableForeignKeyChecks(databaseConfig_1.AppDataSource);
        console.log("✅ 외래키 제약조건 비활성화");
        await databaseConfig_1.AppDataSource.synchronize(true);
        console.log("✅ 스키마 동기화 완료");
        await enableForeignKeyChecks(databaseConfig_1.AppDataSource);
        console.log("✅ 외래키 제약조건 재활성화");
        console.log("🎉 데이터베이스 동기화 완료!");
    }
    catch (error) {
        console.error("❌ 데이터베이스 동기화 실패:", error);
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
syncDatabase()
    .then(() => {
    console.log("✅ 동기화 스크립트 완료");
    process.exit(0);
})
    .catch(error => {
    console.error("❌ 동기화 스크립트 실패:", error);
    process.exit(1);
});
