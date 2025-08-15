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
import { User } from "./User"
import { Machine } from "./Machine"

@Entity("workout_stats")
export class WorkoutStats {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: "int" })
  userId!: number

  @Column({ type: "int", nullable: true })
  machineId?: number

  @Column({ type: "date" })
  workoutDate!: Date

  @Column({ type: "int", default: 0 })
  totalSessions!: number

  @Column({ type: "int", default: 0 })
  totalDurationMinutes!: number

  @Column({ type: "int", default: 0 })
  totalSets!: number

  @Column({ type: "int", default: 0 })
  totalReps!: number

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  totalWeightKg!: number

  @Column({ type: "decimal", precision: 8, scale: 2, default: 0 })
  totalDistanceMeters!: number

  @Column({ type: "decimal", precision: 5, scale: 2, default: 0 })
  averageMood!: number

  @Column({ type: "decimal", precision: 5, scale: 2, default: 0 })
  averageEnergy!: number

  @Column({ type: "decimal", precision: 5, scale: 2, default: 0 })
  averageRpe!: number

  @Column({ type: "int", default: 0 })
  caloriesBurned!: number

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
  machine?: Machine
}
