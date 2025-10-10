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
let Milestone = class Milestone {
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Milestone.prototype, "id", void 0);
__decorate([
    Column({ type: "int" }),
    __metadata("design:type", Number)
], Milestone.prototype, "userId", void 0);
__decorate([
    Column({
        type: "enum",
        enum: [
            "workout_count",
            "streak_days",
            "total_exp",
            "level_reached",
            "goal_completed",
            "community_engagement",
        ],
    }),
    __metadata("design:type", String)
], Milestone.prototype, "milestoneType", void 0);
__decorate([
    Column({ type: "varchar", length: 200 }),
    __metadata("design:type", String)
], Milestone.prototype, "milestoneName", void 0);
__decorate([
    Column({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Milestone.prototype, "milestoneDescription", void 0);
__decorate([
    Column({ type: "int", default: 0 }),
    __metadata("design:type", Number)
], Milestone.prototype, "targetValue", void 0);
__decorate([
    Column({ type: "int", default: 0 }),
    __metadata("design:type", Number)
], Milestone.prototype, "currentValue", void 0);
__decorate([
    Column({ type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], Milestone.prototype, "achieved", void 0);
__decorate([
    Column({ type: "datetime", nullable: true }),
    __metadata("design:type", Date)
], Milestone.prototype, "achievedAt", void 0);
__decorate([
    Column({ type: "json", nullable: true }),
    __metadata("design:type", Object)
], Milestone.prototype, "metadata", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], Milestone.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn(),
    __metadata("design:type", Date
    // 관계 설정
    )
], Milestone.prototype, "updatedAt", void 0);
__decorate([
    ManyToOne(() => User, { onDelete: "CASCADE" }),
    JoinColumn({ name: "userId" }),
    __metadata("design:type", User)
], Milestone.prototype, "user", void 0);
Milestone = __decorate([
    Entity("milestones")
], Milestone);
module.exports.Milestone = Milestone;
