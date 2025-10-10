var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
const { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany,  } = require('typeorm');
const { User  } = require('./User');
const { WorkoutPlan  } = require('./WorkoutPlan');
const { Gym  } = require('./Gym');
const { ExerciseSet  } = require('./ExerciseSet');
let WorkoutSession = class WorkoutSession {
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], WorkoutSession.prototype, "id", void 0);
__decorate([
    Column({ type: "int" }),
    __metadata("design:type", Number)
], WorkoutSession.prototype, "userId", void 0);
__decorate([
    Column({ type: "int", nullable: true }),
    __metadata("design:type", Number)
], WorkoutSession.prototype, "planId", void 0);
__decorate([
    Column({ type: "int", nullable: true }),
    __metadata("design:type", Number)
], WorkoutSession.prototype, "gymId", void 0);
__decorate([
    Column({ type: "varchar", length: 100 }),
    __metadata("design:type", String)
], WorkoutSession.prototype, "name", void 0);
__decorate([
    Column({ type: "datetime" }),
    __metadata("design:type", Date)
], WorkoutSession.prototype, "startTime", void 0);
__decorate([
    Column({ type: "datetime", nullable: true }),
    __metadata("design:type", Date)
], WorkoutSession.prototype, "endTime", void 0);
__decorate([
    Column({ type: "int", nullable: true }),
    __metadata("design:type", Number)
], WorkoutSession.prototype, "totalDurationMinutes", void 0);
__decorate([
    Column({ type: "int", nullable: true }),
    __metadata("design:type", Number)
], WorkoutSession.prototype, "moodRating", void 0);
__decorate([
    Column({ type: "int", nullable: true }),
    __metadata("design:type", Number)
], WorkoutSession.prototype, "energyLevel", void 0);
__decorate([
    Column({ type: "text", nullable: true }),
    __metadata("design:type", String)
], WorkoutSession.prototype, "notes", void 0);
__decorate([
    Column({
        type: "enum",
        enum: ["in_progress", "completed", "paused", "cancelled"],
        default: "in_progress",
    }),
    __metadata("design:type", String)
], WorkoutSession.prototype, "status", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], WorkoutSession.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn(),
    __metadata("design:type", Date
    // 관계 설정
    )
], WorkoutSession.prototype, "updatedAt", void 0);
__decorate([
    ManyToOne(() => User, { onDelete: "CASCADE" }),
    JoinColumn({ name: "userId" }),
    __metadata("design:type", User)
], WorkoutSession.prototype, "user", void 0);
__decorate([
    ManyToOne(() => WorkoutPlan, { onDelete: "SET NULL" }),
    JoinColumn({ name: "planId" }),
    __metadata("design:type", WorkoutPlan)
], WorkoutSession.prototype, "workoutPlan", void 0);
__decorate([
    ManyToOne(() => Gym, { onDelete: "SET NULL" }),
    JoinColumn({ name: "gymId" }),
    __metadata("design:type", Gym)
], WorkoutSession.prototype, "gym", void 0);
__decorate([
    OneToMany(() => ExerciseSet, set => set.workoutSession),
    __metadata("design:type", Array)
], WorkoutSession.prototype, "exerciseSets", void 0);
WorkoutSession = __decorate([
    Entity("workout_sessions")
], WorkoutSession);
module.exports.WorkoutSession = WorkoutSession;
