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
let VerificationToken = class VerificationToken {
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], VerificationToken.prototype, "id", void 0);
__decorate([
    Column({ type: "varchar" }),
    Index(),
    __metadata("design:type", String)
], VerificationToken.prototype, "token", void 0);
__decorate([
    Column({ type: "varchar" }),
    Index(),
    __metadata("design:type", String)
], VerificationToken.prototype, "email", void 0);
__decorate([
    Column({ type: "enum", enum: ["find_id", "reset_password"] }),
    __metadata("design:type", String)
], VerificationToken.prototype, "type", void 0);
__decorate([
    Column({ type: "varchar", nullable: true }),
    __metadata("design:type", String)
], VerificationToken.prototype, "phone", void 0);
__decorate([
    Column({ type: "varchar", nullable: true }),
    __metadata("design:type", String)
], VerificationToken.prototype, "name", void 0);
__decorate([
    Column({ type: "varchar", length: 6 }),
    __metadata("design:type", String)
], VerificationToken.prototype, "code", void 0);
__decorate([
    Column({ type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], VerificationToken.prototype, "isUsed", void 0);
__decorate([
    Column({ type: "timestamp" }),
    __metadata("design:type", Date)
], VerificationToken.prototype, "expiresAt", void 0);
__decorate([
    Column({ type: "varchar", nullable: true }),
    __metadata("design:type", String)
], VerificationToken.prototype, "ipAddress", void 0);
__decorate([
    Column({ type: "varchar", nullable: true }),
    __metadata("design:type", String)
], VerificationToken.prototype, "userAgent", void 0);
__decorate([
    CreateDateColumn(),
    Index(),
    __metadata("design:type", Date)
], VerificationToken.prototype, "createdAt", void 0);
__decorate([
    Column({ type: "timestamp", nullable: true }),
    __metadata("design:type", Date)
], VerificationToken.prototype, "usedAt", void 0);
VerificationToken = __decorate([
    Entity()
], VerificationToken);
module.exports.VerificationToken = VerificationToken;
