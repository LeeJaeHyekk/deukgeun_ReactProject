import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from "typeorm"
import type { ExpActionType } from "../types"
import { User } from "./User"

@Entity("exp_history")
export class ExpHistory {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: "int" })
  userId!: number

  @Column({
    type: "enum",
    enum: [
      "workout_complete",
      "workout_streak",
      "goal_achieved",
      "post_created",
      "comment_created",
      "like_received",
      "daily_login",
      "weekly_challenge",
      "monthly_milestone",
    ],
  })
  actionType!: ExpActionType

  @Column({ type: "int" })
  expGained!: number

  @Column({ type: "varchar", length: 100 })
  source!: string

  @Column({ type: "json", nullable: true })
  metadata?: Record<string, unknown>

  // 추가 정보
  @Column({ type: "int", nullable: true })
  levelBefore?: number

  @Column({ type: "int", nullable: true })
  levelAfter?: number

  @Column({ type: "boolean", default: false })
  isLevelUp!: boolean

  @CreateDateColumn()
  createdAt!: Date

  // 관계 설정
  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User
}
