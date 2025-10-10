var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
const { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, OneToMany,  } = require('typeorm');
const { UserLevel  } = require('./UserLevel');
const { ExpHistory  } = require('./ExpHistory');
const { UserReward  } = require('./UserReward');
const { Milestone  } = require('./Milestone');
const { UserStreak  } = require('./UserStreak');
const { Comment  } = require('./Comment');
const { NullableDateTransformer  } = require('../transformers/nullableDate');
let User = class User {
    constructor() {
        this.birthday = null;
    }
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], User.prototype, "id", void 0);
__decorate([
    Column({ type: "varchar", unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    Column({ type: "varchar" }),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    Column({ type: "varchar", unique: true }),
    __metadata("design:type", String)
], User.prototype, "nickname", void 0);
__decorate([
    Column({ type: "varchar", nullable: true }),
    __metadata("design:type", String)
], User.prototype, "phone", void 0);
__decorate([
    Column({ type: "enum", enum: ["male", "female", "other"], nullable: true }),
    __metadata("design:type", String)
], User.prototype, "gender", void 0);
__decorate([
    Column({
        type: "date",
        nullable: true,
        transformer: NullableDateTransformer,
    }),
    __metadata("design:type", Object)
], User.prototype, "birthday", void 0);
__decorate([
    Column({ type: "varchar", nullable: true }),
    __metadata("design:type", String)
], User.prototype, "profileImage", void 0);
__decorate([
    Column({
        type: "enum",
        enum: ["user", "admin", "moderator"],
        default: "user",
    }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    Column({ type: "boolean", default: true }),
    __metadata("design:type", Boolean)
], User.prototype, "isActive", void 0);
__decorate([
    Column({ type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "isEmailVerified", void 0);
__decorate([
    Column({ type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "isPhoneVerified", void 0);
__decorate([
    Column({ type: "varchar", nullable: true }),
    __metadata("design:type", String)
], User.prototype, "name", void 0);
__decorate([
    Column({ type: "varchar", nullable: true }),
    __metadata("design:type", String)
], User.prototype, "username", void 0);
__decorate([
    Column({ type: "datetime", nullable: true }),
    __metadata("design:type", Date)
], User.prototype, "lastLoginAt", void 0);
__decorate([
    Column({ type: "datetime", nullable: true }),
    __metadata("design:type", Date
    // 로그인 시도 관련
    )
], User.prototype, "lastActivityAt", void 0);
__decorate([
    Column({ type: "int", default: 0 }),
    __metadata("design:type", Number)
], User.prototype, "loginAttempts", void 0);
__decorate([
    Column({ type: "datetime", nullable: true }),
    __metadata("design:type", Date)
], User.prototype, "lockedUntil", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn(),
    __metadata("design:type", Date
    // 관계 설정
    )
], User.prototype, "updatedAt", void 0);
__decorate([
    OneToOne(() => UserLevel, userLevel => userLevel.user, { cascade: true }),
    __metadata("design:type", UserLevel)
], User.prototype, "userLevel", void 0);
__decorate([
    OneToMany(() => ExpHistory, expHistory => expHistory.user, { cascade: true }),
    __metadata("design:type", Array)
], User.prototype, "expHistory", void 0);
__decorate([
    OneToMany(() => UserReward, userReward => userReward.user, { cascade: true }),
    __metadata("design:type", Array)
], User.prototype, "userRewards", void 0);
__decorate([
    OneToMany(() => Milestone, milestone => milestone.user, { cascade: true }),
    __metadata("design:type", Array)
], User.prototype, "milestones", void 0);
__decorate([
    OneToMany(() => UserStreak, userStreak => userStreak.user, { cascade: true }),
    __metadata("design:type", Array)
], User.prototype, "userStreaks", void 0);
__decorate([
    OneToMany(() => Comment, comment => comment.user, { cascade: true }),
    __metadata("design:type", Array)
], User.prototype, "comments", void 0);
User = __decorate([
    Entity("users")
], User);
module.exports.User = User;
