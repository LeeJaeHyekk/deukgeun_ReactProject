import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm"
import type {
  MachineCategory,
  DifficultyLevel,
} from "../../shared/types/machine"

@Entity("machines")
export class Machine {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: "varchar", length: 100, unique: true })
  machineKey!: string

  @Column({ type: "varchar", length: 100 })
  name!: string

  @Column({ type: "varchar", length: 100, nullable: true })
  nameKo?: string

  @Column({ type: "varchar", length: 100, nullable: true })
  nameEn?: string

  @Column({ type: "varchar", length: 255 })
  imageUrl!: string

  @Column({ type: "varchar", length: 255 })
  shortDesc!: string

  @Column({ type: "text" })
  detailDesc!: string

  @Column({ type: "text", nullable: true })
  positiveEffect?: string

  @Column({
    type: "enum",
    enum: [
      "cardio",
      "strength",
      "flexibility",
      "balance",
      "functional",
      "rehabilitation",
    ],
    default: "strength",
  })
  category!: MachineCategory

  @Column({ type: "json", nullable: true })
  targetMuscles?: string[]

  @Column({
    type: "enum",
    enum: ["beginner", "intermediate", "advanced", "expert"],
    default: "beginner",
  })
  difficulty!: DifficultyLevel

  @Column({ type: "varchar", length: 255, nullable: true })
  videoUrl?: string

  @Column({ type: "boolean", default: true })
  isActive!: boolean

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
