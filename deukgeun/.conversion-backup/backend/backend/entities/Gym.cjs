var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
const { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,  } = require('typeorm');
let Gym = class Gym {
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Gym.prototype, "id", void 0);
__decorate([
    Column({ type: "varchar", length: 255 }),
    __metadata("design:type", String)
], Gym.prototype, "name", void 0);
__decorate([
    Column({ type: "varchar", length: 255 }),
    __metadata("design:type", String)
], Gym.prototype, "address", void 0);
__decorate([
    Column({ type: "varchar", nullable: true }),
    __metadata("design:type", String)
], Gym.prototype, "phone", void 0);
__decorate([
    Column({ type: "decimal", precision: 10, scale: 7, nullable: true }),
    __metadata("design:type", Number)
], Gym.prototype, "latitude", void 0);
__decorate([
    Column({ type: "decimal", precision: 10, scale: 7, nullable: true }),
    __metadata("design:type", Number)
], Gym.prototype, "longitude", void 0);
__decorate([
    Column({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Gym.prototype, "facilities", void 0);
__decorate([
    Column({ type: "varchar", nullable: true }),
    __metadata("design:type", String)
], Gym.prototype, "openHour", void 0);
__decorate([
    Column({ type: "tinyint", default: 0 }),
    __metadata("design:type", Boolean)
], Gym.prototype, "is24Hours", void 0);
__decorate([
    Column({ type: "tinyint", default: 0 }),
    __metadata("design:type", Boolean)
], Gym.prototype, "hasGX", void 0);
__decorate([
    Column({ type: "tinyint", default: 0 }),
    __metadata("design:type", Boolean)
], Gym.prototype, "hasPT", void 0);
__decorate([
    Column({ type: "tinyint", default: 0 }),
    __metadata("design:type", Boolean)
], Gym.prototype, "hasGroupPT", void 0);
__decorate([
    Column({ type: "tinyint", default: 0 }),
    __metadata("design:type", Boolean)
], Gym.prototype, "hasParking", void 0);
__decorate([
    Column({ type: "tinyint", default: 0 }),
    __metadata("design:type", Boolean)
], Gym.prototype, "hasShower", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], Gym.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn(),
    __metadata("design:type", Date)
], Gym.prototype, "updatedAt", void 0);
Gym = __decorate([
    Entity()
], Gym);
module.exports.Gym = Gym;
