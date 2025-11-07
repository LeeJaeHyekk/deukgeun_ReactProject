"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkoutPlanExercise = void 0;
const typeorm_1 = require("typeorm");
const WorkoutPlan_1 = require("./WorkoutPlan.cjs");
const Machine_1 = require("./Machine.cjs");
let WorkoutPlanExercise = class WorkoutPlanExercise {
};
exports.WorkoutPlanExercise = WorkoutPlanExercise;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], WorkoutPlanExercise.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int" }),
    __metadata("design:type", Number)
], WorkoutPlanExercise.prototype, "planId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", nullable: true }),
    __metadata("design:type", Number)
], WorkoutPlanExercise.prototype, "machineId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", nullable: true }),
    __metadata("design:type", Number)
], WorkoutPlanExercise.prototype, "exerciseId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 255 }),
    __metadata("design:type", String)
], WorkoutPlanExercise.prototype, "exerciseName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int" }),
    __metadata("design:type", Number)
], WorkoutPlanExercise.prototype, "exerciseOrder", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int" }),
    __metadata("design:type", Number)
], WorkoutPlanExercise.prototype, "sets", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "json" }),
    __metadata("design:type", Object)
], WorkoutPlanExercise.prototype, "repsRange", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "json", nullable: true }),
    __metadata("design:type", Object)
], WorkoutPlanExercise.prototype, "weightRange", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", default: 90 }),
    __metadata("design:type", Number)
], WorkoutPlanExercise.prototype, "restSeconds", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], WorkoutPlanExercise.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => WorkoutPlan_1.WorkoutPlan, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "plan_id" }),
    __metadata("design:type", WorkoutPlan_1.WorkoutPlan)
], WorkoutPlanExercise.prototype, "workoutPlan", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Machine_1.Machine, { onDelete: "CASCADE", nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "machine_id" }),
    __metadata("design:type", Machine_1.Machine)
], WorkoutPlanExercise.prototype, "machine", void 0);
exports.WorkoutPlanExercise = WorkoutPlanExercise = __decorate([
    (0, typeorm_1.Entity)("workout_plan_exercises")
], WorkoutPlanExercise);
