// ============================================================================
// UserStreak Entity
// ============================================================================

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm"
import { User } from "./User"

export type StreakType = "workout" | "login" | "community"

@Entity("user_streaks")
export class UserStreak {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: "int" })
  userId!: number

  @Column({
    type: "enum",
    enum: ["workout", "login", "community"],
  })
  streakType!: StreakType

  @Column({ type: "int", default: 0 })
  currentStreak!: number

  @Column({ type: "int", default: 0 })
  longestStreak!: number

  @Column({ type: "date" })
  lastActivityDate!: Date

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user!: User
}
