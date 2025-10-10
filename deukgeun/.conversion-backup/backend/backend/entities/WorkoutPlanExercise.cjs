var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
const { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,  } = require('typeorm');
const { WorkoutPlan  } = require('./WorkoutPlan');
const { Machine  } = require('./Machine');
let WorkoutPlanExercise = class WorkoutPlanExercise {
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], WorkoutPlanExercise.prototype, "id", void 0);
__decorate([
    Column({ type: "int" }),
    __metadata("design:type", Number)
], WorkoutPlanExercise.prototype, "planId", void 0);
__decorate([
    Column({ type: "int", nullable: true }),
    __metadata("design:type", Number)
], WorkoutPlanExercise.prototype, "machineId", void 0);
__decorate([
    Column({ type: "int", nullable: true }),
    __metadata("design:type", Number)
], WorkoutPlanExercise.prototype, "exerciseId", void 0);
__decorate([
    Column({ type: "varchar", length: 255 }),
    __metadata("design:type", String)
], WorkoutPlanExercise.prototype, "exerciseName", void 0);
__decorate([
    Column({ type: "int" }),
    __metadata("design:type", Number)
], WorkoutPlanExercise.prototype, "exerciseOrder", void 0);
__decorate([
    Column({ type: "int" }),
    __metadata("design:type", Number)
], WorkoutPlanExercise.prototype, "sets", void 0);
__decorate([
    Column({ type: "json" }),
    __metadata("design:type", Object)
], WorkoutPlanExercise.prototype, "repsRange", void 0);
__decorate([
    Column({ type: "json", nullable: true }),
    __metadata("design:type", Object)
], WorkoutPlanExercise.prototype, "weightRange", void 0);
__decorate([
    Column({ type: "int", default: 90 }),
    __metadata("design:type", Number)
], WorkoutPlanExercise.prototype, "restSeconds", void 0);
__decorate([
    Column({ type: "text", nullable: true }),
    __metadata("design:type", String)
], WorkoutPlanExercise.prototype, "notes", void 0);
__decorate([
    ManyToOne(() => WorkoutPlan, { onDelete: "CASCADE" }),
    JoinColumn({ name: "plan_id" }),
    __metadata("design:type", WorkoutPlan)
], WorkoutPlanExercise.prototype, "workoutPlan", void 0);
__decorate([
    ManyToOne(() => Machine, { onDelete: "CASCADE", nullable: true }),
    JoinColumn({ name: "machine_id" }),
    __metadata("design:type", Machine)
], WorkoutPlanExercise.prototype, "machine", void 0);
WorkoutPlanExercise = __decorate([
    Entity("workout_plan_exercises")
], WorkoutPlanExercise);
module.exports.WorkoutPlanExercise = WorkoutPlanExercise;
