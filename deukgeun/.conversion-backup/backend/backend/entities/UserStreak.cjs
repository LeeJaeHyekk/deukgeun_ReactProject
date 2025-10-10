var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
const { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn,  } = require('typeorm');
const { User  } = require('./User');
let UserStreak = class UserStreak {
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], UserStreak.prototype, "id", void 0);
__decorate([
    Column({ type: "int" }),
    Index(),
    __metadata("design:type", Number)
], UserStreak.prototype, "userId", void 0);
__decorate([
    Column({ type: "enum", enum: ["workout", "login", "post", "goal"] }),
    Index(),
    __metadata("design:type", String)
], UserStreak.prototype, "streakType", void 0);
__decorate([
    Column({ type: "int", default: 0 }),
    __metadata("design:type", Number)
], UserStreak.prototype, "currentCount", void 0);
__decorate([
    Column({ type: "int", default: 0 }),
    __metadata("design:type", Number)
], UserStreak.prototype, "maxCount", void 0);
__decorate([
    Column({ type: "datetime" }),
    __metadata("design:type", Date
    // 스트릭 관련 추가 정보
    )
], UserStreak.prototype, "lastActivity", void 0);
__decorate([
    Column({ type: "datetime", nullable: true }),
    __metadata("design:type", Date)
], UserStreak.prototype, "streakStartDate", void 0);
__decorate([
    Column({ type: "datetime", nullable: true }),
    __metadata("design:type", Date)
], UserStreak.prototype, "lastBreakDate", void 0);
__decorate([
    Column({ type: "int", default: 0 }),
    __metadata("design:type", Number)
], UserStreak.prototype, "totalBreaks", void 0);
__decorate([
    Column({ type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], UserStreak.prototype, "isActive", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], UserStreak.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn(),
    __metadata("design:type", Date
    // 관계 설정
    )
], UserStreak.prototype, "updatedAt", void 0);
__decorate([
    ManyToOne(() => User, { onDelete: "CASCADE" }),
    JoinColumn({ name: "userId" }),
    __metadata("design:type", User)
], UserStreak.prototype, "user", void 0);
UserStreak = __decorate([
    Entity("user_streaks")
], UserStreak);
module.exports.UserStreak = UserStreak;
