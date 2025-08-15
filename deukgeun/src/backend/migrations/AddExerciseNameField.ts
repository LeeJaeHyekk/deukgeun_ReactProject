import { MigrationInterface, QueryRunner } from "typeorm"

export class AddExerciseNameField1734180000000 implements MigrationInterface {
  name = "AddExerciseNameField1734180000000"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "workout_plan_exercises" ADD "exerciseName" character varying(255) NOT NULL DEFAULT ''`
    )

    // 기존 데이터에서 notes 필드를 exerciseName으로 복사
    await queryRunner.query(
      `UPDATE "workout_plan_exercises" SET "exerciseName" = COALESCE("notes", '') WHERE "exerciseName" = ''`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "workout_plan_exercises" DROP COLUMN "exerciseName"`
    )
  }
}
