import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from "typeorm"
import { User } from "./User"

@Entity("user_rewards")
export class UserReward {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: "int" })
  @Index()
  userId!: number

  @Column({ type: "varchar", length: 50 })
  @Index()
  rewardType!: string

  @Column({ type: "varchar", length: 100 })
  @Index()
  rewardId!: string

  @Column({ type: "timestamp", nullable: true })
  claimedAt?: Date

  @Column({ type: "timestamp", nullable: true })
  expiresAt?: Date

  @Column({ type: "json", nullable: true })
  metadata?: Record<string, unknown>

  @CreateDateColumn()
  createdAt!: Date

  // 관계 설정
  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User
}
