// ============================================================================
// WorkoutPlanExercise Entity
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
import { WorkoutPlan } from "./WorkoutPlan"
import { Machine } from "./Machine"

@Entity("workout_plan_exercises")
export class WorkoutPlanExercise {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: "int" })
  planId!: number

  @Column({ type: "int" })
  machineId!: number

  @Column({ type: "int" })
  order!: number

  @Column({ type: "int" })
  sets!: number

  @Column({ type: "int", nullable: true })
  reps?: number

  @Column({ type: "decimal", precision: 8, scale: 2, nullable: true })
  weight?: number

  @Column({ type: "int", nullable: true })
  duration?: number

  @Column({ type: "int", nullable: true })
  restTime?: number

  @Column({ type: "text", nullable: true })
  notes?: string

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date

  @ManyToOne(() => WorkoutPlan, plan => plan.exercises)
  @JoinColumn({ name: "planId" })
  workoutPlan!: WorkoutPlan

  @ManyToOne(() => Machine)
  @JoinColumn({ name: "machineId" })
  machine!: Machine
}
