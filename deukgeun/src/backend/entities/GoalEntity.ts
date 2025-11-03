// ============================================================================
// Goal Entity - 목표 엔티티
// ============================================================================

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index
} from 'typeorm'
import { User } from './User'
import { GoalHistoryEntity } from './GoalHistoryEntity'

@Entity({ name: 'goals' })
export class GoalEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'int' })
  @Index()
  userId!: number

  @Column({ type: 'varchar', length: 255 })
  title!: string

  @Column({ type: 'varchar', length: 64 })
  type!: string

  @Column({ type: 'text', nullable: true })
  description?: string

  @Column({ type: 'varchar', length: 64, nullable: true })
  category?: string

  @Column({ type: 'json', nullable: true })
  targetMetrics?: any

  @Column({ type: 'json', nullable: true })
  progress?: any

  @Column({ type: 'varchar', length: 32, default: 'planned' })
  status!: string

  @Column({ type: 'boolean', default: false })
  isCompleted!: boolean

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date

  @Column({ type: 'timestamp', nullable: true })
  startDate?: Date

  @Column({ type: 'timestamp', nullable: true })
  endDate?: Date

  @Column({ type: 'timestamp', nullable: true })
  deadline?: Date

  @Column({ type: 'timestamp', nullable: true })
  targetDate?: Date

  @Column({ type: 'text', nullable: true })
  notes?: string

  @Column({ type: 'varchar', length: 32, nullable: true })
  difficulty?: string

  @Column({ type: 'int', nullable: true })
  expReward?: number

  @Column({ type: 'int', nullable: true })
  planId?: number

  @Column({ type: 'int', nullable: true })
  exerciseId?: number

  @Column({ type: 'int', nullable: true })
  gymId?: number

  @Column({ type: 'json', nullable: true })
  tasks?: any

  @Column({ type: 'json', nullable: true })
  activeWorkout?: any

  @Column({ type: 'json', nullable: true })
  completedWorkouts?: any

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date

  // 관계 설정
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User

  @OneToMany(() => GoalHistoryEntity, (h) => h.goal, { cascade: true })
  history?: GoalHistoryEntity[]
}

