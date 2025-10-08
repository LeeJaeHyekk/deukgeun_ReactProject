import { MigrationInterface, QueryRunner } from "typeorm"

export class InitialSchema1734180000000 implements MigrationInterface {
  name = "InitialSchema1734180000000"

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 사용자 테이블
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" SERIAL PRIMARY KEY,
        "email" VARCHAR(255) UNIQUE NOT NULL,
        "password" VARCHAR(255) NOT NULL,
        "nickname" VARCHAR(100),
        "birthDate" DATE,
        "gender" VARCHAR(10),
        "phoneNumber" VARCHAR(20),
        "level" INTEGER DEFAULT 1,
        "exp" INTEGER DEFAULT 0,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // 헬스장 테이블
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "gyms" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR(255) NOT NULL,
        "address" TEXT,
        "latitude" DECIMAL(10, 8),
        "longitude" DECIMAL(11, 8),
        "phone" VARCHAR(20),
        "website" VARCHAR(255),
        "operatingHours" TEXT,
        "facilities" TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // 운동 계획 테이블
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "workout_plans" (
        "id" SERIAL PRIMARY KEY,
        "userId" INTEGER REFERENCES "users"(id) ON DELETE CASCADE,
        "name" VARCHAR(255) NOT NULL,
        "description" TEXT,
        "isActive" BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // 운동 계획 운동 테이블
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "workout_plan_exercises" (
        "id" SERIAL PRIMARY KEY,
        "planId" INTEGER REFERENCES "workout_plans"(id) ON DELETE CASCADE,
        "exerciseName" VARCHAR(255) NOT NULL,
        "sets" INTEGER DEFAULT 3,
        "reps" INTEGER DEFAULT 10,
        "weight" DECIMAL(5,2),
        "duration" INTEGER,
        "notes" TEXT,
        "order" INTEGER DEFAULT 0,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // 운동 세션 테이블
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "workout_sessions" (
        "id" SERIAL PRIMARY KEY,
        "userId" INTEGER REFERENCES "users"(id) ON DELETE CASCADE,
        "planId" INTEGER REFERENCES "workout_plans"(id) ON DELETE SET NULL,
        "startTime" TIMESTAMP NOT NULL,
        "endTime" TIMESTAMP,
        "duration" INTEGER,
        "notes" TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // 운동 세션 세트 테이블
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "workout_sets" (
        "id" SERIAL PRIMARY KEY,
        "sessionId" INTEGER REFERENCES "workout_sessions"(id) ON DELETE CASCADE,
        "exerciseName" VARCHAR(255) NOT NULL,
        "setNumber" INTEGER NOT NULL,
        "reps" INTEGER,
        "weight" DECIMAL(5,2),
        "duration" INTEGER,
        "notes" TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // 댓글 테이블
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "comments" (
        "id" SERIAL PRIMARY KEY,
        "userId" INTEGER REFERENCES "users"(id) ON DELETE CASCADE,
        "gymId" INTEGER REFERENCES "gyms"(id) ON DELETE CASCADE,
        "content" TEXT NOT NULL,
        "rating" INTEGER CHECK (rating >= 1 AND rating <= 5),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // 인덱스 생성
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users"("email")`
    )
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_workout_plans_user" ON "workout_plans"("userId")`
    )
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_workout_sessions_user" ON "workout_sessions"("userId")`
    )
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_comments_gym" ON "comments"("gymId")`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 인덱스 삭제
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_comments_gym"`)
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_workout_sessions_user"`)
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_workout_plans_user"`)
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_users_email"`)

    // 테이블 삭제 (순서 주의)
    await queryRunner.query(`DROP TABLE IF EXISTS "workout_sets"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "workout_sessions"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "workout_plan_exercises"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "workout_plans"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "comments"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "gyms"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`)
  }
}
