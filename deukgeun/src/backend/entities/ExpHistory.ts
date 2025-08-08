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

@Entity("exp_history")
export class ExpHistory {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: "int" })
  @Index()
  userId!: number

  @Column({ type: "varchar", length: 50 })
  @Index()
  actionType!: string

  @Column({ type: "int" })
  expGained!: number

  @Column({ type: "varchar", length: 100 })
  source!: string

  @Column({ type: "json", nullable: true })
  metadata?: Record<string, unknown>

  @CreateDateColumn()
  @Index()
  createdAt!: Date

  // 관계 설정
  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User
}
