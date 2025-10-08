import { MigrationInterface, QueryRunner } from "typeorm"

export class AddMissingFieldsToWorkoutEntities implements MigrationInterface {
  name = "AddMissingFieldsToWorkoutEntities"

  public async up(queryRunner: QueryRunner): Promise<void> {
    // WorkoutPlanExercise 테이블에 exerciseId 컬럼 추가
    await queryRunner.query(`
      ALTER TABLE "workout_plan_exercises" 
      ADD COLUMN "exerciseId" integer
    `)

    // ExerciseSet 테이블에 누락된 컬럼들 추가
    await queryRunner.query(`
      ALTER TABLE "exercise_sets" 
      ADD COLUMN "exerciseName" character varying(255) NOT NULL DEFAULT ''
    `)

    await queryRunner.query(`
      ALTER TABLE "exercise_sets" 
      ADD COLUMN "isPersonalBest" boolean NOT NULL DEFAULT false
    `)

    await queryRunner.query(`
      ALTER TABLE "exercise_sets" 
      ADD COLUMN "isCompleted" boolean NOT NULL DEFAULT false
    `)

    // 기존 데이터에 대한 기본값 설정
    await queryRunner.query(`
      UPDATE "exercise_sets" 
      SET "exerciseName" = '운동' 
      WHERE "exerciseName" = ''
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // ExerciseSet 테이블에서 추가된 컬럼들 제거
    await queryRunner.query(`
      ALTER TABLE "exercise_sets" DROP COLUMN "isCompleted"
    `)

    await queryRunner.query(`
      ALTER TABLE "exercise_sets" DROP COLUMN "isPersonalBest"
    `)

    await queryRunner.query(`
      ALTER TABLE "exercise_sets" DROP COLUMN "exerciseName"
    `)

    // WorkoutPlanExercise 테이블에서 exerciseId 컬럼 제거
    await queryRunner.query(`
      ALTER TABLE "workout_plan_exercises" DROP COLUMN "exerciseId"
    `)
  }
}
