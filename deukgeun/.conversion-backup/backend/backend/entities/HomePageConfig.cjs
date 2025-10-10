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
let HomePageConfig = class HomePageConfig {
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], HomePageConfig.prototype, "id", void 0);
__decorate([
    Column({ type: "varchar", length: 100, unique: true }),
    __metadata("design:type", String)
], HomePageConfig.prototype, "key", void 0);
__decorate([
    Column({ type: "text" }),
    __metadata("design:type", String)
], HomePageConfig.prototype, "value", void 0);
__decorate([
    Column({ type: "varchar", length: 50, default: "text" }),
    __metadata("design:type", String)
], HomePageConfig.prototype, "type", void 0);
__decorate([
    Column({ type: "varchar", length: 200, nullable: true }),
    __metadata("design:type", String)
], HomePageConfig.prototype, "description", void 0);
__decorate([
    Column({ type: "boolean", default: true }),
    __metadata("design:type", Boolean)
], HomePageConfig.prototype, "isActive", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], HomePageConfig.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn(),
    __metadata("design:type", Date)
], HomePageConfig.prototype, "updatedAt", void 0);
HomePageConfig = __decorate([
    Entity("homepage_configs")
], HomePageConfig);
module.exports.HomePageConfig = HomePageConfig;
