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
import { User } from "./User"

@Entity("milestones")
export class Milestone {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: "int" })
  @Index()
  userId!: number

  @Column({ type: "varchar", length: 100 })
  @Index()
  milestoneType!: string

  @Column({ type: "varchar", length: 200 })
  description!: string

  @Column({ type: "boolean", default: false })
  achieved!: boolean

  @Column({ type: "timestamp", nullable: true })
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
