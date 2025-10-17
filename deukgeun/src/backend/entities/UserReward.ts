import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from "typeorm"
import type { RewardType } from "@backend/types"
import { User } from "@backend/entities/User"

@Entity("user_rewards")
export class UserReward {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: "int" })
  @Index()
  userId!: number

  @Column({ type: "enum", enum: ["badge", "achievement", "item", "title"] })
  @Index()
  rewardType!: RewardType

  @Column({ type: "varchar", length: 100 })
  @Index()
  rewardId!: string

  @Column({ type: "varchar", length: 200 })
  rewardName!: string

  @Column({ type: "text", nullable: true })
  rewardDescription?: string

  @Column({ type: "datetime", nullable: true })
  claimedAt?: Date

  @Column({ type: "datetime", nullable: true })
  expiresAt?: Date

  @Column({ type: "json", nullable: true })
  metadata?: Record<string, unknown>

  // 보상 상태
  @Column({ type: "boolean", default: false })
  isClaimed!: boolean

  @Column({ type: "boolean", default: false })
  isExpired!: boolean

  @CreateDateColumn()
  createdAt!: Date

  // 관계 설정
  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User
}
