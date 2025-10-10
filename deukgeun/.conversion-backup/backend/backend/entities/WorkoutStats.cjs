var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
const { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn,  } = require('typeorm');
const { User  } = require('./User');
const { Machine  } = require('./Machine');
let WorkoutStats = class WorkoutStats {
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], WorkoutStats.prototype, "id", void 0);
__decorate([
    Column({ type: "int" }),
    __metadata("design:type", Number)
], WorkoutStats.prototype, "userId", void 0);
__decorate([
    Column({ type: "int", nullable: true }),
    __metadata("design:type", Number)
], WorkoutStats.prototype, "machineId", void 0);
__decorate([
    Column({ type: "date" }),
    __metadata("design:type", Date)
], WorkoutStats.prototype, "workoutDate", void 0);
__decorate([
    Column({ type: "int", default: 0 }),
    __metadata("design:type", Number)
], WorkoutStats.prototype, "totalSessions", void 0);
__decorate([
    Column({ type: "int", default: 0 }),
    __metadata("design:type", Number)
], WorkoutStats.prototype, "totalDurationMinutes", void 0);
__decorate([
    Column({ type: "int", default: 0 }),
    __metadata("design:type", Number)
], WorkoutStats.prototype, "totalSets", void 0);
__decorate([
    Column({ type: "int", default: 0 }),
    __metadata("design:type", Number)
], WorkoutStats.prototype, "totalReps", void 0);
__decorate([
    Column({ type: "decimal", precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], WorkoutStats.prototype, "totalWeightKg", void 0);
__decorate([
    Column({ type: "decimal", precision: 8, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], WorkoutStats.prototype, "totalDistanceMeters", void 0);
__decorate([
    Column({ type: "decimal", precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], WorkoutStats.prototype, "averageMood", void 0);
__decorate([
    Column({ type: "decimal", precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], WorkoutStats.prototype, "averageEnergy", void 0);
__decorate([
    Column({ type: "decimal", precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], WorkoutStats.prototype, "averageRpe", void 0);
__decorate([
    Column({ type: "int", default: 0 }),
    __metadata("design:type", Number)
], WorkoutStats.prototype, "caloriesBurned", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], WorkoutStats.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn(),
    __metadata("design:type", Date
    // 관계 설정
    )
], WorkoutStats.prototype, "updatedAt", void 0);
__decorate([
    ManyToOne(() => User, { onDelete: "CASCADE" }),
    JoinColumn({ name: "userId" }),
    __metadata("design:type", User)
], WorkoutStats.prototype, "user", void 0);
__decorate([
    ManyToOne(() => Machine, { onDelete: "CASCADE" }),
    JoinColumn({ name: "machineId" }),
    __metadata("design:type", Machine)
], WorkoutStats.prototype, "machine", void 0);
WorkoutStats = __decorate([
    Entity("workout_stats")
], WorkoutStats);
module.exports.WorkoutStats = WorkoutStats;
