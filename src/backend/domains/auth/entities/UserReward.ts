// ============================================================================
// 사용자 보상 엔티티
// ============================================================================

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm"
import { User } from "./User.js"

@Entity("user_rewards")
export class UserReward {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column({ type: "uuid" })
  userId!: string

  @Column({ type: "varchar", length: 50 })
  type!: string

  @Column({ type: "varchar", length: 100 })
  name!: string

  @Column({ type: "text" })
  description!: string

  @Column({ type: "timestamp" })
  earnedAt!: Date

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User

  @CreateDateColumn()
  createdAt!: Date
}
