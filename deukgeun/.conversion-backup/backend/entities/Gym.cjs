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
exports.Gym = void 0;
const typeorm_1 = require("typeorm");
const Equipment_1 = require("./Equipment.cjs");
let Gym = class Gym {
};
exports.Gym = Gym;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Gym.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 255 }),
    __metadata("design:type", String)
], Gym.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 255 }),
    __metadata("design:type", String)
], Gym.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", nullable: true }),
    __metadata("design:type", String)
], Gym.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 7, nullable: true }),
    __metadata("design:type", Number)
], Gym.prototype, "latitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 7, nullable: true }),
    __metadata("design:type", Number)
], Gym.prototype, "longitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Gym.prototype, "facilities", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", nullable: true }),
    __metadata("design:type", String)
], Gym.prototype, "openHour", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", nullable: true }),
    __metadata("design:type", String)
], Gym.prototype, "closeHour", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", nullable: true }),
    __metadata("design:type", String)
], Gym.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 3, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Gym.prototype, "rating", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", nullable: true }),
    __metadata("design:type", Number)
], Gym.prototype, "reviewCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", nullable: true }),
    __metadata("design:type", String)
], Gym.prototype, "source", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 3, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Gym.prototype, "confidence", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 50, nullable: true }),
    __metadata("design:type", String)
], Gym.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "tinyint", default: 0 }),
    __metadata("design:type", Boolean)
], Gym.prototype, "is24Hours", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "tinyint", default: 0 }),
    __metadata("design:type", Boolean)
], Gym.prototype, "hasGX", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "tinyint", default: 0 }),
    __metadata("design:type", Boolean)
], Gym.prototype, "hasPT", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "tinyint", default: 0 }),
    __metadata("design:type", Boolean)
], Gym.prototype, "hasGroupPT", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "tinyint", default: 0 }),
    __metadata("design:type", Boolean)
], Gym.prototype, "hasParking", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "tinyint", default: 0 }),
    __metadata("design:type", Boolean)
], Gym.prototype, "hasShower", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Equipment_1.Equipment, equipment => equipment.gym),
    __metadata("design:type", Array)
], Gym.prototype, "equipments", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Gym.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Gym.prototype, "updatedAt", void 0);
exports.Gym = Gym = __decorate([
    (0, typeorm_1.Entity)()
], Gym);
