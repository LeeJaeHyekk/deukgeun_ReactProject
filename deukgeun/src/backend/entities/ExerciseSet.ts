import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm'
// 순환 import 방지를 위해 문자열 기반 관계 정의 사용
// import { WorkoutSession } from "./WorkoutSession"
// import { Machine } from "./Machine"

@Entity('exercise_sets')
export class ExerciseSet {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'int' })
  sessionId!: number

  @Column({ type: 'int' })
  machineId!: number

  @Column({ type: 'varchar', length: 255 })
  exerciseName!: string

  @Column({ type: 'int' })
  setNumber!: number

  @Column({ type: 'int' })
  repsCompleted!: number

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weightKg?: number

  @Column({ type: 'int', nullable: true })
  durationSeconds?: number

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  distanceMeters?: number

  @Column({ type: 'int', nullable: true })
  rpeRating?: number // Rate of Perceived Exertion 1-10

  @Column({ type: 'text', nullable: true })
  notes?: string

  @Column({ type: 'boolean', default: false })
  isPersonalBest!: boolean

  @Column({ type: 'boolean', default: false })
  isCompleted!: boolean

  @CreateDateColumn()
  createdAt!: Date

  // 관계 설정 - 순환 import 방지를 위해 문자열 기반 관계 정의 사용
  @ManyToOne('WorkoutSession', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  workoutSession!: any

  @ManyToOne('Machine', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'machine_id' })
  machine!: any
}
