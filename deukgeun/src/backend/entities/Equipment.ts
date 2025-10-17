import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm"
import { Gym } from "@backend/entities/Gym"

export enum EquipmentType {
  CARDIO = "cardio",
  WEIGHT = "weight"
}

export enum EquipmentCategory {
  // 유산소 기구
  TREADMILL = "treadmill",
  BIKE = "bike",
  STEPPER = "stepper",
  ROWING_MACHINE = "rowing_machine",
  CROSS_TRAINER = "cross_trainer",
  STAIR_MASTER = "stair_master",
  SKI_MACHINE = "ski_machine",
  
  // 웨이트 기구
  DUMBBELL = "dumbbell",
  BARBELL = "barbell",
  WEIGHT_MACHINE = "weight_machine",
  SMITH_MACHINE = "smith_machine",
  POWER_RACK = "power_rack",
  CABLE = "cable",
  PULL_UP_BAR = "pull_up_bar"
}

@Entity()
export class Equipment {
  @PrimaryGeneratedColumn()
  id!: number

  @ManyToOne(() => Gym, gym => gym.equipments, { onDelete: "CASCADE" })
  @JoinColumn({ name: "gymId" })
  gym!: Gym

  @Column({ type: "int" })
  gymId!: number

  @Column({ 
    type: "enum", 
    enum: EquipmentType,
    comment: "기구 타입 (유산소/웨이트)"
  })
  type!: EquipmentType

  @Column({ 
    type: "enum", 
    enum: EquipmentCategory,
    comment: "기구 카테고리"
  })
  category!: EquipmentCategory

  @Column({ type: "varchar", length: 100 })
  name!: string

  @Column({ type: "int", default: 0, comment: "기구 개수" })
  quantity!: number

  @Column({ type: "varchar", length: 100, nullable: true, comment: "브랜드명" })
  brand!: string

  @Column({ type: "varchar", length: 200, nullable: true, comment: "모델명" })
  model!: string

  @Column({ type: "boolean", default: false, comment: "최신 모델 여부" })
  isLatestModel!: boolean

  @Column({ type: "varchar", length: 50, nullable: true, comment: "무게 범위 (예: 5kg~50kg)" })
  weightRange!: string

  @Column({ type: "varchar", length: 100, nullable: true, comment: "기구 종류 (예: 올림픽 바, 스탠다드 바)" })
  equipmentVariant!: string

  @Column({ type: "text", nullable: true, comment: "추가 정보" })
  additionalInfo!: string

  @Column({ type: "decimal", precision: 3, scale: 2, default: 0.8, comment: "데이터 신뢰도" })
  confidence!: number

  @Column({ type: "varchar", length: 50, nullable: true, comment: "데이터 소스" })
  source!: string

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
