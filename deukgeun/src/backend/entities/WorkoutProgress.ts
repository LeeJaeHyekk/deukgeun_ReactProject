import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm"
import { User } from "@backend/entities/User"
import { Machine } from "@backend/entities/Machine"

@Entity("workout_progress")
export class WorkoutProgress {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: "int" })
  userId!: number

  @Column({ type: "int" })
  machineId!: number

  @Column({ type: "date" })
  progressDate!: Date

  @Column({ type: "int" })
  setNumber!: number

  @Column({ type: "int" })
  repsCompleted!: number

  @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
  weightKg?: number

  @Column({ type: "int", nullable: true })
  durationSeconds?: number

  @Column({ type: "decimal", precision: 8, scale: 2, nullable: true })
  distanceMeters?: number

  @Column({ type: "int", nullable: true })
  rpeRating?: number

  @Column({ type: "text", nullable: true })
  notes?: string

  @Column({ type: "boolean", default: false })
  isPersonalBest!: boolean

  @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
  improvementPercentage?: number

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date

  // 관계 설정
  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User

  @ManyToOne(() => Machine, { onDelete: "CASCADE" })
  @JoinColumn({ name: "machineId" })
  machine!: Machine
}
