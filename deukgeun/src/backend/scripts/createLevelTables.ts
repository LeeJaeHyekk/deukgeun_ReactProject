import { createConnection } from "typeorm"
import { connectDatabase } from "../config/database"

async function createLevelTables() {
  try {
    console.log("데이터베이스 연결 중...")
    const connection = await connectDatabase()
    console.log("데이터베이스 연결 성공!")

    // 테이블 생성 쿼리들
    const queries = [
      // 사용자 레벨 테이블
      `CREATE TABLE IF NOT EXISTS user_levels (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        level INT DEFAULT 1,
        currentExp INT DEFAULT 0,
        totalExp INT DEFAULT 0,
        seasonExp INT DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_id (userId),
        INDEX idx_level (level),
        INDEX idx_total_exp (totalExp),
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )`,

      // 경험치 이력 테이블
      `CREATE TABLE IF NOT EXISTS exp_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        actionType VARCHAR(50) NOT NULL,
        expGained INT NOT NULL,
        source VARCHAR(100) NOT NULL,
        metadata JSON,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_id (userId),
        INDEX idx_action_type (actionType),
        INDEX idx_created_at (createdAt),
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )`,

      // 사용자 보상 테이블
      `CREATE TABLE IF NOT EXISTS user_rewards (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        rewardType VARCHAR(50) NOT NULL,
        rewardId VARCHAR(100) NOT NULL,
        claimedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expiresAt TIMESTAMP NULL,
        metadata JSON,
        INDEX idx_user_id (userId),
        INDEX idx_reward_type (rewardType),
        INDEX idx_claimed_at (claimedAt),
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )`,

      // 마일스톤 테이블
      `CREATE TABLE IF NOT EXISTS milestones (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        milestoneType VARCHAR(50) NOT NULL,
        milestoneId VARCHAR(100) NOT NULL,
        achievedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        metadata JSON,
        INDEX idx_user_id (userId),
        INDEX idx_milestone_type (milestoneType),
        INDEX idx_achieved_at (achievedAt),
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )`,

      // 사용자 스트릭 테이블
      `CREATE TABLE IF NOT EXISTS user_streaks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        streakType VARCHAR(50) NOT NULL,
        currentCount INT DEFAULT 0,
        lastActivity TIMESTAMP NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_id (userId),
        INDEX idx_streak_type (streakType),
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )`,
    ]

    // 쿼리 실행
    for (let i = 0; i < queries.length; i++) {
      const query = queries[i]
      console.log(`테이블 생성 중... (${i + 1}/${queries.length})`)
      await connection.query(query)
    }

    console.log("모든 레벨 시스템 테이블이 성공적으로 생성되었습니다!")

    // 기존 사용자들을 위한 기본 레벨 데이터 생성
    console.log("기존 사용자들을 위한 기본 레벨 데이터 생성 중...")
    await connection.query(`
      INSERT IGNORE INTO user_levels (userId, level, currentExp, totalExp, seasonExp)
      SELECT id, 1, 0, 0, 0 FROM users
    `)

    console.log("기본 레벨 데이터 생성 완료!")

    await connection.close()
    console.log("데이터베이스 연결 종료")
    process.exit(0)
  } catch (error) {
    console.error("테이블 생성 중 오류 발생:", error)
    process.exit(1)
  }
}

// 스크립트 실행
createLevelTables()
