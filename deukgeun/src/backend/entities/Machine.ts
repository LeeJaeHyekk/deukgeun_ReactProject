import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'
// MachineCategory와 DifficultyLevel을 shared types에서 import
import type {
  MachineCategory,
  DifficultyLevel,
  MachineAnatomy,
  MachineGuide,
  MachineTraining,
  MachineExtraInfo,
} from '../../shared/types/machineGuide.types'

@Entity('machines')
export class Machine {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'varchar', length: 100, unique: true })
  machineKey!: string

  @Column({ type: 'varchar', length: 100 })
  name!: string

  @Column({ type: 'varchar', length: 100 })
  nameEn!: string

  @Column({ type: 'varchar', length: 255 })
  imageUrl!: string

  @Column({ type: 'varchar', length: 255 })
  shortDesc!: string

  @Column({
    type: 'enum',
    enum: [
      'chest',
      'back',
      'shoulders',
      'arms',
      'legs',
      'core',
      'cardio',
      'fullbody',
    ],
    default: 'chest',
  })
  category!: MachineCategory

  @Column({
    type: 'enum',
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'beginner',
  })
  difficulty!: DifficultyLevel

  @Column({ type: 'varchar', length: 255, nullable: true })
  videoUrl?: string

  // 새로운 JSON 필드들 (machinesData.json 구조에 맞춤)
  @Column({ type: 'json' })
  anatomy!: MachineAnatomy

  @Column({ type: 'json' })
  guide!: MachineGuide

  @Column({ type: 'json' })
  training!: MachineTraining

  @Column({ type: 'json' })
  extraInfo!: MachineExtraInfo

  @Column({ type: 'boolean', default: true })
  isActive!: boolean

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
