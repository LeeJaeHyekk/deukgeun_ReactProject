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
exports.WorkoutSession = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require('./User.cjs');
const WorkoutPlan_1 = require('./WorkoutPlan.cjs');
const Gym_1 = require('./Gym.cjs');
const ExerciseSet_1 = require('./ExerciseSet.cjs');
let WorkoutSession = class WorkoutSession {
};
exports.WorkoutSession = WorkoutSession;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], WorkoutSession.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int" }),
    __metadata("design:type", Number)
], WorkoutSession.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", nullable: true }),
    __metadata("design:type", Number)
], WorkoutSession.prototype, "planId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", nullable: true }),
    __metadata("design:type", Number)
], WorkoutSession.prototype, "gymId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 100 }),
    __metadata("design:type", String)
], WorkoutSession.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "datetime" }),
    __metadata("design:type", Date)
], WorkoutSession.prototype, "startTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "datetime", nullable: true }),
    __metadata("design:type", Date)
], WorkoutSession.prototype, "endTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", nullable: true }),
    __metadata("design:type", Number)
], WorkoutSession.prototype, "totalDurationMinutes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", nullable: true }),
    __metadata("design:type", Number)
], WorkoutSession.prototype, "moodRating", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", nullable: true }),
    __metadata("design:type", Number)
], WorkoutSession.prototype, "energyLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], WorkoutSession.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: ["in_progress", "completed", "paused", "cancelled"],
        default: "in_progress",
    }),
    __metadata("design:type", String)
], WorkoutSession.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], WorkoutSession.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], WorkoutSession.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "userId" }),
    __metadata("design:type", User_1.User)
], WorkoutSession.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => WorkoutPlan_1.WorkoutPlan, { onDelete: "SET NULL" }),
    (0, typeorm_1.JoinColumn)({ name: "planId" }),
    __metadata("design:type", WorkoutPlan_1.WorkoutPlan)
], WorkoutSession.prototype, "workoutPlan", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Gym_1.Gym, { onDelete: "SET NULL" }),
    (0, typeorm_1.JoinColumn)({ name: "gymId" }),
    __metadata("design:type", Gym_1.Gym)
], WorkoutSession.prototype, "gym", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ExerciseSet_1.ExerciseSet, set => set.workoutSession),
    __metadata("design:type", Array)
], WorkoutSession.prototype, "exerciseSets", void 0);
exports.WorkoutSession = WorkoutSession = __decorate([
    (0, typeorm_1.Entity)("workout_sessions")
], WorkoutSession);
