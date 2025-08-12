import { AppDataSource } from "../config/database"
import { logger } from "../utils/logger"

async function createAccountRecoveryTables() {
  try {
    // Initialize database connection
    await AppDataSource.initialize()
    logger.info("Database connection established")

    // Create verification_tokens table
    await AppDataSource.query(`
      CREATE TABLE IF NOT EXISTS verification_token (
        id INT AUTO_INCREMENT PRIMARY KEY,
        token VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        type ENUM('find_id', 'reset_password') NOT NULL,
        phone VARCHAR(20),
        name VARCHAR(100),
        code VARCHAR(6) NOT NULL,
        isUsed BOOLEAN DEFAULT FALSE,
        expiresAt TIMESTAMP NOT NULL,
        ipAddress VARCHAR(45),
        userAgent TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        usedAt TIMESTAMP NULL,
        INDEX idx_token (token),
        INDEX idx_email (email),
        INDEX idx_createdAt (createdAt)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    logger.info("✅ verification_token table created successfully")

    // Create password_reset_tokens table
    await AppDataSource.query(`
      CREATE TABLE IF NOT EXISTS password_reset_token (
        id INT AUTO_INCREMENT PRIMARY KEY,
        token VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        isUsed BOOLEAN DEFAULT FALSE,
        expiresAt TIMESTAMP NOT NULL,
        ipAddress VARCHAR(45),
        userAgent TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        usedAt TIMESTAMP NULL,
        INDEX idx_token (token),
        INDEX idx_email (email),
        INDEX idx_createdAt (createdAt)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    logger.info("✅ password_reset_token table created successfully")

    logger.info("🎉 All account recovery tables created successfully!")
  } catch (error) {
    logger.error("❌ Error creating account recovery tables:", error)
    throw error
  } finally {
    // Close database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy()
      logger.info("Database connection closed")
    }
  }
}

// Run the script if called directly
if (require.main === module) {
  createAccountRecoveryTables()
    .then(() => {
      logger.info("✅ Account recovery tables setup completed")
      process.exit(0)
    })
    .catch((error) => {
      logger.error("❌ Account recovery tables setup failed:", error)
      process.exit(1)
    })
}

export { createAccountRecoveryTables }
