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
exports.ExerciseSet = void 0;
const typeorm_1 = require("typeorm");
const WorkoutSession_1 = require('./WorkoutSession.cjs');
const Machine_1 = require('./Machine.cjs');
let ExerciseSet = class ExerciseSet {
};
exports.ExerciseSet = ExerciseSet;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ExerciseSet.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int" }),
    __metadata("design:type", Number)
], ExerciseSet.prototype, "sessionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int" }),
    __metadata("design:type", Number)
], ExerciseSet.prototype, "machineId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 255 }),
    __metadata("design:type", String)
], ExerciseSet.prototype, "exerciseName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int" }),
    __metadata("design:type", Number)
], ExerciseSet.prototype, "setNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int" }),
    __metadata("design:type", Number)
], ExerciseSet.prototype, "repsCompleted", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], ExerciseSet.prototype, "weightKg", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", nullable: true }),
    __metadata("design:type", Number)
], ExerciseSet.prototype, "durationSeconds", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 8, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], ExerciseSet.prototype, "distanceMeters", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", nullable: true }),
    __metadata("design:type", Number)
], ExerciseSet.prototype, "rpeRating", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], ExerciseSet.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], ExerciseSet.prototype, "isPersonalBest", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], ExerciseSet.prototype, "isCompleted", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ExerciseSet.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => WorkoutSession_1.WorkoutSession, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "session_id" }),
    __metadata("design:type", WorkoutSession_1.WorkoutSession)
], ExerciseSet.prototype, "workoutSession", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Machine_1.Machine, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "machine_id" }),
    __metadata("design:type", Machine_1.Machine)
], ExerciseSet.prototype, "machine", void 0);
exports.ExerciseSet = ExerciseSet = __decorate([
    (0, typeorm_1.Entity)("exercise_sets")
], ExerciseSet);
