var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
const { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index,  } = require('typeorm');
const { User  } = require('./User');
let WorkoutGoal = class WorkoutGoal {
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], WorkoutGoal.prototype, "id", void 0);
__decorate([
    Column({ type: "int" }),
    Index(),
    __metadata("design:type", Number)
], WorkoutGoal.prototype, "userId", void 0);
__decorate([
    Column({ type: "varchar", length: 255 }),
    __metadata("design:type", String)
], WorkoutGoal.prototype, "title", void 0);
__decorate([
    Column({ type: "text", nullable: true }),
    __metadata("design:type", String)
], WorkoutGoal.prototype, "description", void 0);
__decorate([
    Column({
        type: "enum",
        enum: ["weight", "reps", "duration", "frequency", "streak"],
    }),
    __metadata("design:type", String)
], WorkoutGoal.prototype, "type", void 0);
__decorate([
    Column({ type: "decimal", precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], WorkoutGoal.prototype, "targetValue", void 0);
__decorate([
    Column({ type: "decimal", precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], WorkoutGoal.prototype, "currentValue", void 0);
__decorate([
    Column({ type: "varchar", length: 50 }),
    __metadata("design:type", String)
], WorkoutGoal.prototype, "unit", void 0);
__decorate([
    Column({ type: "date", nullable: true }),
    __metadata("design:type", Date)
], WorkoutGoal.prototype, "deadline", void 0);
__decorate([
    Column({ type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], WorkoutGoal.prototype, "isCompleted", void 0);
__decorate([
    Column({ type: "datetime", nullable: true }),
    __metadata("design:type", Date)
], WorkoutGoal.prototype, "completedAt", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], WorkoutGoal.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn(),
    __metadata("design:type", Date
    // 관계 설정
    )
], WorkoutGoal.prototype, "updatedAt", void 0);
__decorate([
    ManyToOne(() => User, { onDelete: "CASCADE" }),
    JoinColumn({ name: "userId" }),
    __metadata("design:type", User)
], WorkoutGoal.prototype, "user", void 0);
WorkoutGoal = __decorate([
    Entity("workout_goals")
], WorkoutGoal);
module.exports.WorkoutGoal = WorkoutGoal;
