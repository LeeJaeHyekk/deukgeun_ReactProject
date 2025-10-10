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
let WorkoutProgress = class WorkoutProgress {
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], WorkoutProgress.prototype, "id", void 0);
__decorate([
    Column({ type: "int" }),
    __metadata("design:type", Number)
], WorkoutProgress.prototype, "userId", void 0);
__decorate([
    Column({ type: "int" }),
    __metadata("design:type", Number)
], WorkoutProgress.prototype, "machineId", void 0);
__decorate([
    Column({ type: "date" }),
    __metadata("design:type", Date)
], WorkoutProgress.prototype, "progressDate", void 0);
__decorate([
    Column({ type: "int" }),
    __metadata("design:type", Number)
], WorkoutProgress.prototype, "setNumber", void 0);
__decorate([
    Column({ type: "int" }),
    __metadata("design:type", Number)
], WorkoutProgress.prototype, "repsCompleted", void 0);
__decorate([
    Column({ type: "decimal", precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], WorkoutProgress.prototype, "weightKg", void 0);
__decorate([
    Column({ type: "int", nullable: true }),
    __metadata("design:type", Number)
], WorkoutProgress.prototype, "durationSeconds", void 0);
__decorate([
    Column({ type: "decimal", precision: 8, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], WorkoutProgress.prototype, "distanceMeters", void 0);
__decorate([
    Column({ type: "int", nullable: true }),
    __metadata("design:type", Number)
], WorkoutProgress.prototype, "rpeRating", void 0);
__decorate([
    Column({ type: "text", nullable: true }),
    __metadata("design:type", String)
], WorkoutProgress.prototype, "notes", void 0);
__decorate([
    Column({ type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], WorkoutProgress.prototype, "isPersonalBest", void 0);
__decorate([
    Column({ type: "decimal", precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], WorkoutProgress.prototype, "improvementPercentage", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], WorkoutProgress.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn(),
    __metadata("design:type", Date
    // 관계 설정
    )
], WorkoutProgress.prototype, "updatedAt", void 0);
__decorate([
    ManyToOne(() => User, { onDelete: "CASCADE" }),
    JoinColumn({ name: "userId" }),
    __metadata("design:type", User)
], WorkoutProgress.prototype, "user", void 0);
__decorate([
    ManyToOne(() => Machine, { onDelete: "CASCADE" }),
    JoinColumn({ name: "machineId" }),
    __metadata("design:type", Machine)
], WorkoutProgress.prototype, "machine", void 0);
WorkoutProgress = __decorate([
    Entity("workout_progress")
], WorkoutProgress);
module.exports.WorkoutProgress = WorkoutProgress;
