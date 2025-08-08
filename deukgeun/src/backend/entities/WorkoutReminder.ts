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
import { User } from "./User"

@Entity("workout_reminders")
export class WorkoutReminder {
  @PrimaryGeneratedColumn()
  reminder_id!: number

  @Column({ type: "int" })
  @Index()
  user_id!: number

  @Column({ type: "varchar", length: 100 })
  title!: string

  @Column({ type: "text", nullable: true })
  description?: string

  @Column({ type: "time" })
  reminder_time!: string

  @Column({ type: "json" })
  repeat_days!: number[] // 0=일요일, 1=월요일, ..., 6=토요일

  @Column({ type: "boolean", default: true })
  is_active!: boolean

  @Column({ type: "boolean", default: false })
  is_sent!: boolean

  @Column({ type: "datetime", nullable: true })
  last_sent_at?: Date

  @Column({ type: "datetime", nullable: true })
  next_send_at?: Date

  @Column({
    type: "enum",
    enum: ["push", "email", "sms"],
    default: "push",
  })
  notification_type!: "push" | "email" | "sms"

  @CreateDateColumn()
  created_at!: Date

  @UpdateDateColumn()
  updated_at!: Date

  // 관계 설정
  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User
}
