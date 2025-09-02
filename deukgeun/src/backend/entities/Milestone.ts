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
import type { MilestoneType } from "../types/index.js"
import { User } from "./User.js"

@Entity("milestones")
export class Milestone {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: "int" })
  userId!: number

  @Column({
    type: "enum",
    enum: [
      "workout_count",
      "streak_days",
      "total_exp",
      "level_reached",
      "goal_completed",
      "community_engagement",
    ],
  })
  milestoneType!: MilestoneType

  @Column({ type: "varchar", length: 200 })
  milestoneName!: string

  @Column({ type: "text", nullable: true })
  milestoneDescription?: string

  @Column({ type: "int", default: 0 })
  targetValue!: number

  @Column({ type: "int", default: 0 })
  currentValue!: number

  @Column({ type: "boolean", default: false })
  achieved!: boolean

  @Column({ type: "datetime", nullable: true })
  achievedAt?: Date

  @Column({ type: "json", nullable: true })
  metadata?: Record<string, unknown>

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date

  // 관계 설정
  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User
}
