var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
const { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, Index,  } = require('typeorm');
const { User  } = require('./User');
const { WorkoutPlanExercise  } = require('./WorkoutPlanExercise');
let WorkoutPlan = class WorkoutPlan {
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], WorkoutPlan.prototype, "id", void 0);
__decorate([
    Column({ type: "int" }),
    Index(),
    __metadata("design:type", Number)
], WorkoutPlan.prototype, "userId", void 0);
__decorate([
    Column({ type: "varchar", length: 100 }),
    __metadata("design:type", String)
], WorkoutPlan.prototype, "name", void 0);
__decorate([
    Column({ type: "text", nullable: true }),
    __metadata("design:type", String)
], WorkoutPlan.prototype, "description", void 0);
__decorate([
    Column({
        type: "enum",
        enum: ["beginner", "intermediate", "advanced"],
        default: "beginner",
    }),
    __metadata("design:type", String)
], WorkoutPlan.prototype, "difficulty", void 0);
__decorate([
    Column({ type: "int" }),
    __metadata("design:type", Number)
], WorkoutPlan.prototype, "estimatedDurationMinutes", void 0);
__decorate([
    Column({ type: "json", nullable: true }),
    __metadata("design:type", Array)
], WorkoutPlan.prototype, "targetMuscleGroups", void 0);
__decorate([
    Column({ type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], WorkoutPlan.prototype, "isTemplate", void 0);
__decorate([
    Column({ type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], WorkoutPlan.prototype, "isPublic", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], WorkoutPlan.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn(),
    __metadata("design:type", Date
    // 관계 설정
    )
], WorkoutPlan.prototype, "updatedAt", void 0);
__decorate([
    ManyToOne(() => User, { onDelete: "CASCADE" }),
    JoinColumn({ name: "userId" }),
    __metadata("design:type", User)
], WorkoutPlan.prototype, "user", void 0);
__decorate([
    OneToMany(() => WorkoutPlanExercise, exercise => exercise.workoutPlan),
    __metadata("design:type", Array)
], WorkoutPlan.prototype, "exercises", void 0);
WorkoutPlan = __decorate([
    Entity("workout_plans")
], WorkoutPlan);
module.exports.WorkoutPlan = WorkoutPlan;
