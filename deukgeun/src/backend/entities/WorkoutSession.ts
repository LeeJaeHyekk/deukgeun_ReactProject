import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm'
// 순환 import 방지를 위해 문자열 기반 관계 정의 사용
// import { User } from "./User"
// import { WorkoutPlan } from "./WorkoutPlan"
// import { Gym } from "./Gym"
// import { ExerciseSet } from "./ExerciseSet"

@Entity('workout_sessions')
export class WorkoutSession {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'int' })
  userId!: number

  @Column({ type: 'int', nullable: true })
  planId?: number

  @Column({ type: 'int', nullable: true })
  gymId?: number

  @Column({ type: 'varchar', length: 100 })
  name!: string

  @Column({ type: 'datetime' })
  startTime!: Date

  @Column({ type: 'datetime', nullable: true })
  endTime?: Date

  @Column({ type: 'int', nullable: true })
  totalDurationMinutes?: number

  @Column({ type: 'int', nullable: true })
  moodRating?: number // 1-5 scale

  @Column({ type: 'int', nullable: true })
  energyLevel?: number // 1-5 scale

  @Column({ type: 'text', nullable: true })
  notes?: string

  @Column({
    type: 'enum',
    enum: ['in_progress', 'completed', 'paused', 'cancelled'],
    default: 'in_progress',
  })
  status!: 'in_progress' | 'completed' | 'paused' | 'cancelled'

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date

  // 관계 설정 - 순환 import 방지를 위해 문자열 기반 관계 정의 사용
  @ManyToOne('User', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: any

  @ManyToOne('WorkoutPlan', { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'planId' })
  workoutPlan?: any

  @ManyToOne('Gym', { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'gymId' })
  gym?: any

  @OneToMany('ExerciseSet', 'workoutSession')
  exerciseSets!: any[]
}
