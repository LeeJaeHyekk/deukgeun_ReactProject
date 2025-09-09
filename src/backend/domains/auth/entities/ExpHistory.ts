// ============================================================================
// 경험치 히스토리 엔티티
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

@Entity("exp_histories")
export class ExpHistory {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column({ type: "uuid" })
  userId!: string

  @Column({ type: "varchar", length: 50 })
  type!: string

  @Column({ type: "int" })
  amount!: number

  @Column({ type: "text" })
  description!: string

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User

  @CreateDateColumn()
  createdAt!: Date
}
