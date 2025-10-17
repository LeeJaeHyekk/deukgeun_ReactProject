import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm"
import { Equipment } from "@backend/entities/Equipment"

@Entity()
export class Gym {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: "varchar", length: 255 })
  name!: string

  @Column({ type: "varchar", length: 255 })
  address!: string

  @Column({ type: "varchar", nullable: true })
  phone!: string

  @Column({ type: "decimal", precision: 10, scale: 7, nullable: true })
  latitude!: number

  @Column({ type: "decimal", precision: 10, scale: 7, nullable: true })
  longitude!: number

  @Column({ type: "text", nullable: true })
  facilities!: string

  @Column({ type: "varchar", nullable: true })
  openHour!: string

  @Column({ type: "varchar", nullable: true })
  closeHour!: string

  @Column({ type: "varchar", nullable: true })
  price!: string

  @Column({ type: "decimal", precision: 3, scale: 2, nullable: true })
  rating!: number

  @Column({ type: "int", nullable: true })
  reviewCount!: number

  @Column({ type: "varchar", nullable: true })
  source!: string

  @Column({ type: "decimal", precision: 3, scale: 2, nullable: true })
  confidence!: number

  @Column({ type: "varchar", length: 50, nullable: true })
  type!: string

  @Column({ type: "tinyint", default: 0 })
  is24Hours!: boolean

  @Column({ type: "tinyint", default: 0 })
  hasGX!: boolean

  @Column({ type: "tinyint", default: 0 })
  hasPT!: boolean

  @Column({ type: "tinyint", default: 0 })
  hasGroupPT!: boolean

  @Column({ type: "tinyint", default: 0 })
  hasParking!: boolean

  @Column({ type: "tinyint", default: 0 })
  hasShower!: boolean

  @OneToMany(() => Equipment, equipment => equipment.gym)
  equipments!: Equipment[]

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
