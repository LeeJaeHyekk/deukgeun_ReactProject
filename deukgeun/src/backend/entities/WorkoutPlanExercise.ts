import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm'
// 순환 import 방지를 위해 문자열 기반 관계 정의 사용
// import { WorkoutPlan } from "./WorkoutPlan"
// import { Machine } from "./Machine"

@Entity('workout_plan_exercises')
export class WorkoutPlanExercise {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'int' })
  planId!: number

  @Column({ type: 'int', nullable: true })
  machineId?: number

  @Column({ type: 'int', nullable: true })
  exerciseId?: number

  @Column({ type: 'varchar', length: 255 })
  exerciseName!: string

  @Column({ type: 'int' })
  exerciseOrder!: number

  @Column({ type: 'int' })
  sets!: number

  @Column({ type: 'json' })
  repsRange!: { min: number; max: number }

  @Column({ type: 'json', nullable: true })
  weightRange?: { min: number; max: number }

  @Column({ type: 'int', default: 90 })
  restSeconds!: number

  @Column({ type: 'text', nullable: true })
  notes?: string

  // 관계 설정 - 순환 import 방지를 위해 문자열 기반 관계 정의 사용
  @ManyToOne('WorkoutPlan', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'plan_id' })
  workoutPlan!: any

  @ManyToOne('Machine', { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'machine_id' })
  machine?: any
}
