import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm"
import { WorkoutSession } from "./WorkoutSession"
import { Machine } from "./Machine"

@Entity("exercise_sets")
export class ExerciseSet {
  @PrimaryGeneratedColumn()
  set_id!: number

  @Column({ type: "int" })
  @Index()
  session_id!: number

  @Column({ type: "int" })
  @Index()
  machine_id!: number

  @Column({ type: "int" })
  set_number!: number

  @Column({ type: "int" })
  reps_completed!: number

  @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
  weight_kg?: number

  @Column({ type: "int", nullable: true })
  duration_seconds?: number

  @Column({ type: "decimal", precision: 8, scale: 2, nullable: true })
  distance_meters?: number

  @Column({ type: "int", nullable: true })
  rpe_rating?: number // Rate of Perceived Exertion 1-10

  @Column({ type: "text", nullable: true })
  notes?: string

  @CreateDateColumn()
  created_at!: Date

  // 관계 설정
  @ManyToOne(() => WorkoutSession, { onDelete: "CASCADE" })
  @JoinColumn({ name: "session_id" })
  workout_session!: WorkoutSession

  @ManyToOne(() => Machine, { onDelete: "CASCADE" })
  @JoinColumn({ name: "machine_id" })
  machine!: Machine
}
