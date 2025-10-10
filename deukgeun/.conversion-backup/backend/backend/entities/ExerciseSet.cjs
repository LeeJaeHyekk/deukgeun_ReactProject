var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
const { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn,  } = require('typeorm');
const { WorkoutSession  } = require('./WorkoutSession');
const { Machine  } = require('./Machine');
let ExerciseSet = class ExerciseSet {
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], ExerciseSet.prototype, "id", void 0);
__decorate([
    Column({ type: "int" }),
    __metadata("design:type", Number)
], ExerciseSet.prototype, "sessionId", void 0);
__decorate([
    Column({ type: "int" }),
    __metadata("design:type", Number)
], ExerciseSet.prototype, "machineId", void 0);
__decorate([
    Column({ type: "varchar", length: 255 }),
    __metadata("design:type", String)
], ExerciseSet.prototype, "exerciseName", void 0);
__decorate([
    Column({ type: "int" }),
    __metadata("design:type", Number)
], ExerciseSet.prototype, "setNumber", void 0);
__decorate([
    Column({ type: "int" }),
    __metadata("design:type", Number)
], ExerciseSet.prototype, "repsCompleted", void 0);
__decorate([
    Column({ type: "decimal", precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], ExerciseSet.prototype, "weightKg", void 0);
__decorate([
    Column({ type: "int", nullable: true }),
    __metadata("design:type", Number)
], ExerciseSet.prototype, "durationSeconds", void 0);
__decorate([
    Column({ type: "decimal", precision: 8, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], ExerciseSet.prototype, "distanceMeters", void 0);
__decorate([
    Column({ type: "int", nullable: true }),
    __metadata("design:type", Number)
], ExerciseSet.prototype, "rpeRating", void 0);
__decorate([
    Column({ type: "text", nullable: true }),
    __metadata("design:type", String)
], ExerciseSet.prototype, "notes", void 0);
__decorate([
    Column({ type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], ExerciseSet.prototype, "isPersonalBest", void 0);
__decorate([
    Column({ type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], ExerciseSet.prototype, "isCompleted", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date
    // 관계 설정
    )
], ExerciseSet.prototype, "createdAt", void 0);
__decorate([
    ManyToOne(() => WorkoutSession, { onDelete: "CASCADE" }),
    JoinColumn({ name: "session_id" }),
    __metadata("design:type", WorkoutSession)
], ExerciseSet.prototype, "workoutSession", void 0);
__decorate([
    ManyToOne(() => Machine, { onDelete: "CASCADE" }),
    JoinColumn({ name: "machine_id" }),
    __metadata("design:type", Machine)
], ExerciseSet.prototype, "machine", void 0);
ExerciseSet = __decorate([
    Entity("exercise_sets")
], ExerciseSet);
module.exports.ExerciseSet = ExerciseSet;
