var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
const { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index,  } = require('typeorm');
const { User  } = require('./User');
let WorkoutReminder = class WorkoutReminder {
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], WorkoutReminder.prototype, "id", void 0);
__decorate([
    Column({ type: "int" }),
    Index(),
    __metadata("design:type", Number)
], WorkoutReminder.prototype, "userId", void 0);
__decorate([
    Column({ type: "varchar", length: 100 }),
    __metadata("design:type", String)
], WorkoutReminder.prototype, "title", void 0);
__decorate([
    Column({ type: "text", nullable: true }),
    __metadata("design:type", String)
], WorkoutReminder.prototype, "description", void 0);
__decorate([
    Column({ type: "time" }),
    __metadata("design:type", String)
], WorkoutReminder.prototype, "reminderTime", void 0);
__decorate([
    Column({ type: "json" }),
    __metadata("design:type", Array)
], WorkoutReminder.prototype, "repeatDays", void 0);
__decorate([
    Column({ type: "boolean", default: true }),
    __metadata("design:type", Boolean)
], WorkoutReminder.prototype, "isActive", void 0);
__decorate([
    Column({ type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], WorkoutReminder.prototype, "isSent", void 0);
__decorate([
    Column({ type: "datetime", nullable: true }),
    __metadata("design:type", Date)
], WorkoutReminder.prototype, "lastSentAt", void 0);
__decorate([
    Column({ type: "datetime", nullable: true }),
    __metadata("design:type", Date)
], WorkoutReminder.prototype, "nextSendAt", void 0);
__decorate([
    Column({
        type: "enum",
        enum: ["push", "email", "sms"],
        default: "push",
    }),
    __metadata("design:type", String)
], WorkoutReminder.prototype, "notificationType", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], WorkoutReminder.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn(),
    __metadata("design:type", Date
    // 관계 설정
    )
], WorkoutReminder.prototype, "updatedAt", void 0);
__decorate([
    ManyToOne(() => User, { onDelete: "CASCADE" }),
    JoinColumn({ name: "userId" }),
    __metadata("design:type", User)
], WorkoutReminder.prototype, "user", void 0);
WorkoutReminder = __decorate([
    Entity("workout_reminders")
], WorkoutReminder);
module.exports.WorkoutReminder = WorkoutReminder;
