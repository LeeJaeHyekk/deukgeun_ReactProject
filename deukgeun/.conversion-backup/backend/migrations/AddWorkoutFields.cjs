"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddMissingFieldsToWorkoutEntities = void 0;
class AddMissingFieldsToWorkoutEntities {
    constructor() {
        this.name = "AddMissingFieldsToWorkoutEntities";
    }
    async up(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "workout_plan_exercises" 
      ADD COLUMN "exerciseId" integer
    `);
        await queryRunner.query(`
      ALTER TABLE "exercise_sets" 
      ADD COLUMN "exerciseName" character varying(255) NOT NULL DEFAULT ''
    `);
        await queryRunner.query(`
      ALTER TABLE "exercise_sets" 
      ADD COLUMN "isPersonalBest" boolean NOT NULL DEFAULT false
    `);
        await queryRunner.query(`
      ALTER TABLE "exercise_sets" 
      ADD COLUMN "isCompleted" boolean NOT NULL DEFAULT false
    `);
        await queryRunner.query(`
      UPDATE "exercise_sets" 
      SET "exerciseName" = '운동' 
      WHERE "exerciseName" = ''
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "exercise_sets" DROP COLUMN "isCompleted"
    `);
        await queryRunner.query(`
      ALTER TABLE "exercise_sets" DROP COLUMN "isPersonalBest"
    `);
        await queryRunner.query(`
      ALTER TABLE "exercise_sets" DROP COLUMN "exerciseName"
    `);
        await queryRunner.query(`
      ALTER TABLE "workout_plan_exercises" DROP COLUMN "exerciseId"
    `);
    }
}
exports.AddMissingFieldsToWorkoutEntities = AddMissingFieldsToWorkoutEntities;
