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
import type { ExpActionType } from "../types/index.js"
import { User } from "./User.js"

@Entity("user_levels")
export class UserLevel {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: "int" })
  @Index()
  userId!: number

  @Column({ type: "int", default: 1 })
  level!: number

  @Column({ type: "int", default: 0 })
  currentExp!: number

  @Column({ type: "int", default: 0 })
  totalExp!: number

  @Column({ type: "int", default: 0 })
  seasonExp!: number

  // 레벨업 관련
  @Column({ type: "int", default: 0 })
  totalLevelUps!: number

  @Column({ type: "datetime", nullable: true })
  lastLevelUpAt?: Date

  // 시즌 관련
  @Column({ type: "int", default: 1 })
  currentSeason!: number

  @Column({ type: "datetime", nullable: true })
  seasonStartDate?: Date

  @Column({ type: "datetime", nullable: true })
  seasonEndDate?: Date

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date

  // 관계 설정
  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User
}
