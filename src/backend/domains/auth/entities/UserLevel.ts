// ============================================================================
// 사용자 레벨 엔티티
// ============================================================================

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm"
import { User } from "./User.js"

@Entity("user_levels")
export class UserLevel {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column({ type: "uuid" })
  userId!: string

  @Column({ type: "int", default: 1 })
  level!: number

  @Column({ type: "int", default: 0 })
  exp!: number

  @Column({ type: "int", default: 0 })
  totalExp!: number

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
