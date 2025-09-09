// ============================================================================
// Machine Entity (for global entities)
// ============================================================================

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm"

export type MachineCategory =
  | "chest"
  | "back"
  | "shoulders"
  | "arms"
  | "legs"
  | "core"
  | "cardio"
  | "full-body"

export type DifficultyLevel = "beginner" | "intermediate" | "advanced"

@Entity("machines")
export class Machine {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: "varchar", unique: true })
  machineKey!: string

  @Column({ type: "varchar" })
  name!: string

  @Column({ type: "varchar", nullable: true })
  nameKo?: string

  @Column({ type: "varchar", nullable: true })
  nameEn?: string

  @Column({ type: "varchar", nullable: true })
  imageUrl?: string

  @Column({ type: "text", nullable: true })
  shortDesc?: string

  @Column({ type: "text", nullable: true })
  detailDesc?: string

  @Column({ type: "text", nullable: true })
  positiveEffect?: string

  @Column({
    type: "enum",
    enum: [
      "chest",
      "back",
      "shoulders",
      "arms",
      "legs",
      "core",
      "cardio",
      "full-body",
    ],
  })
  category!: MachineCategory

  @Column({ type: "json", nullable: true })
  targetMuscles?: string[]

  @Column({
    type: "enum",
    enum: ["beginner", "intermediate", "advanced"],
  })
  difficulty!: DifficultyLevel

  @Column({ type: "varchar", nullable: true })
  videoUrl?: string

  @Column({ type: "boolean", default: true })
  isActive!: boolean

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
