"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserReward = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User.cjs");
let UserReward = class UserReward {
};
exports.UserReward = UserReward;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], UserReward.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int" }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Number)
], UserReward.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "enum", enum: ["badge", "achievement", "item", "title"] }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], UserReward.prototype, "rewardType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 100 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], UserReward.prototype, "rewardId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 200 }),
    __metadata("design:type", String)
], UserReward.prototype, "rewardName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], UserReward.prototype, "rewardDescription", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "datetime", nullable: true }),
    __metadata("design:type", Date)
], UserReward.prototype, "claimedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "datetime", nullable: true }),
    __metadata("design:type", Date)
], UserReward.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "json", nullable: true }),
    __metadata("design:type", Object)
], UserReward.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], UserReward.prototype, "isClaimed", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], UserReward.prototype, "isExpired", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], UserReward.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "userId" }),
    __metadata("design:type", User_1.User)
], UserReward.prototype, "user", void 0);
exports.UserReward = UserReward = __decorate([
    (0, typeorm_1.Entity)("user_rewards")
], UserReward);
