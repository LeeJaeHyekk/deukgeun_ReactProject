// ============================================================================
// Goal History Entity - 목표 히스토리 엔티티
// ============================================================================

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index
} from 'typeorm'
import { GoalEntity } from './GoalEntity'

@Entity({ name: 'goal_history' })
export class GoalHistoryEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'int' })
  @Index()
  goalId!: number

  @ManyToOne(() => GoalEntity, (g) => g.history, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'goalId' })
  goal!: GoalEntity

  @Column({ type: 'timestamp' })
  date!: Date

  @Column({ type: 'int', nullable: true })
  sessionId?: number

  @Column({ type: 'varchar', length: 255, nullable: true })
  sessionName?: string

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date

  @Column({ type: 'int', nullable: true })
  totalDurationMinutes?: number

  @Column({ type: 'int', nullable: true })
  totalSets?: number

  @Column({ type: 'int', nullable: true })
  totalReps?: number

  @Column({ type: 'int', nullable: true })
  expEarned?: number

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  avgIntensity?: number

  @Column({ type: 'int', nullable: true })
  moodRating?: number

  @Column({ type: 'int', nullable: true })
  energyLevel?: number

  @Column({ type: 'text', nullable: true })
  notes?: string

  @Column({ type: 'json', nullable: true })
  summary?: any

  @Column({ type: 'json', nullable: true })
  actions?: any

  @CreateDateColumn()
  createdAt!: Date
}

