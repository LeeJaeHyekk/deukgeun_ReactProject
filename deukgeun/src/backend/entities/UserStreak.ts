import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from "typeorm"
import type { StreakType } from "../types/index.js"
import { User } from "./User.js"

@Entity("user_streaks")
export class UserStreak {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: "int" })
  @Index()
  userId!: number

  @Column({ type: "enum", enum: ["workout", "login", "post", "goal"] })
  @Index()
  streakType!: StreakType

  @Column({ type: "int", default: 0 })
  currentCount!: number

  @Column({ type: "int", default: 0 })
  maxCount!: number

  @Column({ type: "datetime" })
  lastActivity!: Date

  // 스트릭 관련 추가 정보
  @Column({ type: "datetime", nullable: true })
  streakStartDate?: Date

  @Column({ type: "datetime", nullable: true })
  lastBreakDate?: Date

  @Column({ type: "int", default: 0 })
  totalBreaks!: number

  @Column({ type: "boolean", default: false })
  isActive!: boolean

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date

  // 관계 설정
  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User
}
