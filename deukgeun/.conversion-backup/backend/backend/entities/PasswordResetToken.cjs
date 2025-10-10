var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
const { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index,  } = require('typeorm');
let PasswordResetToken = class PasswordResetToken {
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], PasswordResetToken.prototype, "id", void 0);
__decorate([
    Column({ type: "varchar" }),
    Index(),
    __metadata("design:type", String)
], PasswordResetToken.prototype, "token", void 0);
__decorate([
    Column({ type: "varchar" }),
    Index(),
    __metadata("design:type", String)
], PasswordResetToken.prototype, "email", void 0);
__decorate([
    Column({ type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], PasswordResetToken.prototype, "isUsed", void 0);
__decorate([
    Column({ type: "timestamp" }),
    __metadata("design:type", Date)
], PasswordResetToken.prototype, "expiresAt", void 0);
__decorate([
    Column({ type: "varchar", nullable: true }),
    __metadata("design:type", String)
], PasswordResetToken.prototype, "ipAddress", void 0);
__decorate([
    Column({ type: "varchar", nullable: true }),
    __metadata("design:type", String)
], PasswordResetToken.prototype, "userAgent", void 0);
__decorate([
    CreateDateColumn(),
    Index(),
    __metadata("design:type", Date)
], PasswordResetToken.prototype, "createdAt", void 0);
__decorate([
    Column({ type: "timestamp", nullable: true }),
    __metadata("design:type", Date)
], PasswordResetToken.prototype, "usedAt", void 0);
PasswordResetToken = __decorate([
    Entity()
], PasswordResetToken);
module.exports.PasswordResetToken = PasswordResetToken;
