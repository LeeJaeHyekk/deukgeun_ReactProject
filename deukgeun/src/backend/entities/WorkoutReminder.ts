import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm"
import { User } from "@backend/entities/User"

@Entity("workout_reminders")
export class WorkoutReminder {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: "int" })
  @Index()
  userId!: number

  @Column({ type: "varchar", length: 100 })
  title!: string

  @Column({ type: "text", nullable: true })
  description?: string

  @Column({ type: "time" })
  reminderTime!: string

  @Column({ type: "json" })
  repeatDays!: number[] // 0=일요일, 1=월요일, ..., 6=토요일

  @Column({ type: "boolean", default: true })
  isActive!: boolean

  @Column({ type: "boolean", default: false })
  isSent!: boolean

  @Column({ type: "datetime", nullable: true })
  lastSentAt?: Date

  @Column({ type: "datetime", nullable: true })
  nextSendAt?: Date

  @Column({
    type: "enum",
    enum: ["push", "email", "sms"],
    default: "push",
  })
  notificationType!: "push" | "email" | "sms"

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date

  // 관계 설정
  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User
}
