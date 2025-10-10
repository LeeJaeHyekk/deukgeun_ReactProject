var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
const { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, ManyToOne, JoinColumn,  } = require('typeorm');
const { User  } = require('./User');
let UserReward = class UserReward {
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], UserReward.prototype, "id", void 0);
__decorate([
    Column({ type: "int" }),
    Index(),
    __metadata("design:type", Number)
], UserReward.prototype, "userId", void 0);
__decorate([
    Column({ type: "enum", enum: ["badge", "achievement", "item", "title"] }),
    Index(),
    __metadata("design:type", String)
], UserReward.prototype, "rewardType", void 0);
__decorate([
    Column({ type: "varchar", length: 100 }),
    Index(),
    __metadata("design:type", String)
], UserReward.prototype, "rewardId", void 0);
__decorate([
    Column({ type: "varchar", length: 200 }),
    __metadata("design:type", String)
], UserReward.prototype, "rewardName", void 0);
__decorate([
    Column({ type: "text", nullable: true }),
    __metadata("design:type", String)
], UserReward.prototype, "rewardDescription", void 0);
__decorate([
    Column({ type: "datetime", nullable: true }),
    __metadata("design:type", Date)
], UserReward.prototype, "claimedAt", void 0);
__decorate([
    Column({ type: "datetime", nullable: true }),
    __metadata("design:type", Date)
], UserReward.prototype, "expiresAt", void 0);
__decorate([
    Column({ type: "json", nullable: true }),
    __metadata("design:type", Object)
], UserReward.prototype, "metadata", void 0);
__decorate([
    Column({ type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], UserReward.prototype, "isClaimed", void 0);
__decorate([
    Column({ type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], UserReward.prototype, "isExpired", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date
    // 관계 설정
    )
], UserReward.prototype, "createdAt", void 0);
__decorate([
    ManyToOne(() => User, { onDelete: "CASCADE" }),
    JoinColumn({ name: "userId" }),
    __metadata("design:type", User)
], UserReward.prototype, "user", void 0);
UserReward = __decorate([
    Entity("user_rewards")
], UserReward);
module.exports.UserReward = UserReward;
