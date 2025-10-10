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
const { User  } = require('./User');
let ExpHistory = class ExpHistory {
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], ExpHistory.prototype, "id", void 0);
__decorate([
    Column({ type: "int" }),
    __metadata("design:type", Number)
], ExpHistory.prototype, "userId", void 0);
__decorate([
    Column({
        type: "enum",
        enum: [
            "workout_complete",
            "workout_streak",
            "goal_achieved",
            "post_created",
            "comment_created",
            "like_received",
            "daily_login",
            "weekly_challenge",
            "monthly_milestone",
        ],
    }),
    __metadata("design:type", String)
], ExpHistory.prototype, "actionType", void 0);
__decorate([
    Column({ type: "int" }),
    __metadata("design:type", Number)
], ExpHistory.prototype, "expGained", void 0);
__decorate([
    Column({ type: "varchar", length: 100 }),
    __metadata("design:type", String)
], ExpHistory.prototype, "source", void 0);
__decorate([
    Column({ type: "json", nullable: true }),
    __metadata("design:type", Object)
], ExpHistory.prototype, "metadata", void 0);
__decorate([
    Column({ type: "int", nullable: true }),
    __metadata("design:type", Number)
], ExpHistory.prototype, "levelBefore", void 0);
__decorate([
    Column({ type: "int", nullable: true }),
    __metadata("design:type", Number)
], ExpHistory.prototype, "levelAfter", void 0);
__decorate([
    Column({ type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], ExpHistory.prototype, "isLevelUp", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date
    // 관계 설정
    )
], ExpHistory.prototype, "createdAt", void 0);
__decorate([
    ManyToOne(() => User, { onDelete: "CASCADE" }),
    JoinColumn({ name: "userId" }),
    __metadata("design:type", User)
], ExpHistory.prototype, "user", void 0);
ExpHistory = __decorate([
    Entity("exp_history")
], ExpHistory);
module.exports.ExpHistory = ExpHistory;
