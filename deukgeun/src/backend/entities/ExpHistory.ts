import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from "typeorm"
import type { ExpActionType } from "@backend/types"
import { User } from "@backend/entities/User"

@Entity("exp_history")
export class ExpHistory {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: "int" })
  userId!: number

  @Column({
    type: "varchar",
    length: 50,
  })
  actionType!: string

  @Column({ type: "int" })
  expGained!: number

  @Column({ type: "varchar", length: 200 })
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
