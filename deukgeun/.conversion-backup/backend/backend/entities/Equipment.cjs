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
exports.Equipment = exports.EquipmentCategory = exports.EquipmentType = void 0;
const typeorm_1 = require("typeorm");
const Gym_1 = require('entities/Gym');
var EquipmentType;
(function (EquipmentType) {
    EquipmentType["CARDIO"] = "cardio";
    EquipmentType["WEIGHT"] = "weight";
})(EquipmentType || (exports.EquipmentType = EquipmentType = {}));
var EquipmentCategory;
(function (EquipmentCategory) {
    EquipmentCategory["TREADMILL"] = "treadmill";
    EquipmentCategory["BIKE"] = "bike";
    EquipmentCategory["STEPPER"] = "stepper";
    EquipmentCategory["ROWING_MACHINE"] = "rowing_machine";
    EquipmentCategory["CROSS_TRAINER"] = "cross_trainer";
    EquipmentCategory["STAIR_MASTER"] = "stair_master";
    EquipmentCategory["SKI_MACHINE"] = "ski_machine";
    EquipmentCategory["DUMBBELL"] = "dumbbell";
    EquipmentCategory["BARBELL"] = "barbell";
    EquipmentCategory["WEIGHT_MACHINE"] = "weight_machine";
    EquipmentCategory["SMITH_MACHINE"] = "smith_machine";
    EquipmentCategory["POWER_RACK"] = "power_rack";
    EquipmentCategory["CABLE"] = "cable";
    EquipmentCategory["PULL_UP_BAR"] = "pull_up_bar";
})(EquipmentCategory || (exports.EquipmentCategory = EquipmentCategory = {}));
let Equipment = class Equipment {
};
exports.Equipment = Equipment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Equipment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Gym_1.Gym, gym => gym.equipments, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "gymId" }),
    __metadata("design:type", Gym_1.Gym)
], Equipment.prototype, "gym", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int" }),
    __metadata("design:type", Number)
], Equipment.prototype, "gymId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: EquipmentType,
        comment: "기구 타입 (유산소/웨이트)"
    }),
    __metadata("design:type", String)
], Equipment.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: EquipmentCategory,
        comment: "기구 카테고리"
    }),
    __metadata("design:type", String)
], Equipment.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 100 }),
    __metadata("design:type", String)
], Equipment.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", default: 0, comment: "기구 개수" }),
    __metadata("design:type", Number)
], Equipment.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 100, nullable: true, comment: "브랜드명" }),
    __metadata("design:type", String)
], Equipment.prototype, "brand", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 200, nullable: true, comment: "모델명" }),
    __metadata("design:type", String)
], Equipment.prototype, "model", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false, comment: "최신 모델 여부" }),
    __metadata("design:type", Boolean)
], Equipment.prototype, "isLatestModel", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 50, nullable: true, comment: "무게 범위 (예: 5kg~50kg)" }),
    __metadata("design:type", String)
], Equipment.prototype, "weightRange", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 100, nullable: true, comment: "기구 종류 (예: 올림픽 바, 스탠다드 바)" }),
    __metadata("design:type", String)
], Equipment.prototype, "equipmentVariant", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, comment: "추가 정보" }),
    __metadata("design:type", String)
], Equipment.prototype, "additionalInfo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 3, scale: 2, default: 0.8, comment: "데이터 신뢰도" }),
    __metadata("design:type", Number)
], Equipment.prototype, "confidence", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 50, nullable: true, comment: "데이터 소스" }),
    __metadata("design:type", String)
], Equipment.prototype, "source", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Equipment.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Equipment.prototype, "updatedAt", void 0);
exports.Equipment = Equipment = __decorate([
    (0, typeorm_1.Entity)()
], Equipment);
