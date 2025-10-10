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
let UserLevel = class UserLevel {
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], UserLevel.prototype, "id", void 0);
__decorate([
    Column({ type: "int" }),
    Index(),
    __metadata("design:type", Number)
], UserLevel.prototype, "userId", void 0);
__decorate([
    Column({ type: "int", default: 1 }),
    __metadata("design:type", Number)
], UserLevel.prototype, "level", void 0);
__decorate([
    Column({ type: "int", default: 0 }),
    __metadata("design:type", Number)
], UserLevel.prototype, "currentExp", void 0);
__decorate([
    Column({ type: "int", default: 0 }),
    __metadata("design:type", Number)
], UserLevel.prototype, "totalExp", void 0);
__decorate([
    Column({ type: "int", default: 0 }),
    __metadata("design:type", Number)
], UserLevel.prototype, "seasonExp", void 0);
__decorate([
    Column({ type: "int", default: 0 }),
    __metadata("design:type", Number)
], UserLevel.prototype, "totalLevelUps", void 0);
__decorate([
    Column({ type: "datetime", nullable: true }),
    __metadata("design:type", Date
    // 시즌 관련
    )
], UserLevel.prototype, "lastLevelUpAt", void 0);
__decorate([
    Column({ type: "int", default: 1 }),
    __metadata("design:type", Number)
], UserLevel.prototype, "currentSeason", void 0);
__decorate([
    Column({ type: "datetime", nullable: true }),
    __metadata("design:type", Date)
], UserLevel.prototype, "seasonStartDate", void 0);
__decorate([
    Column({ type: "datetime", nullable: true }),
    __metadata("design:type", Date)
], UserLevel.prototype, "seasonEndDate", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], UserLevel.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn(),
    __metadata("design:type", Date
    // 관계 설정
    )
], UserLevel.prototype, "updatedAt", void 0);
__decorate([
    ManyToOne(() => User, { onDelete: "CASCADE" }),
    JoinColumn({ name: "userId" }),
    __metadata("design:type", User)
], UserLevel.prototype, "user", void 0);
UserLevel = __decorate([
    Entity("user_levels")
], UserLevel);
module.exports.UserLevel = UserLevel;
