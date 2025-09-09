// ============================================================================
// 마일스톤 엔티티
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

@Entity("milestones")
export class Milestone {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column({ type: "uuid" })
  userId!: string

  @Column({ type: "varchar", length: 50 })
  type!: string

  @Column({ type: "varchar", length: 100 })
  title!: string

  @Column({ type: "text" })
  description!: string

  @Column({ type: "timestamp" })
  achievedAt!: Date

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User

  @CreateDateColumn()
  createdAt!: Date
}
