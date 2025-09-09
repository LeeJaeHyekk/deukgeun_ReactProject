// ============================================================================
// WorkoutStats Entity
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
import { Machine } from "./Machine"

@Entity("workout_stats")
export class WorkoutStats {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: "int" })
  userId!: number

  @Column({ type: "int" })
  machineId!: number

  @Column({ type: "int", default: 0 })
  totalSessions!: number

  @Column({ type: "int", default: 0 })
  totalSets!: number

  @Column({ type: "int", default: 0 })
  totalReps!: number

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  totalWeight!: number

  @Column({ type: "int", default: 0 })
  totalDuration!: number

  @Column({ type: "decimal", precision: 8, scale: 2, default: 0 })
  averageWeight!: number

  @Column({ type: "decimal", precision: 8, scale: 2, default: 0 })
  averageReps!: number

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  personalBest!: number

  @Column({ type: "datetime", nullable: true })
  lastWorkoutDate?: Date

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user!: User

  @ManyToOne(() => Machine)
  @JoinColumn({ name: "machineId" })
  machine!: Machine
}
