// ============================================================================
// Gym Entity (for workout domain)
// ============================================================================

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm"

@Entity("gyms")
export class Gym {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: "varchar" })
  name!: string

  @Column({ type: "varchar" })
  address!: string

  @Column({ type: "varchar", nullable: true })
  phone?: string

  @Column({ type: "decimal", precision: 10, scale: 8 })
  latitude!: number

  @Column({ type: "decimal", precision: 11, scale: 8 })
  longitude!: number

  @Column({ type: "json", nullable: true })
  facilities?: string[]

  @Column({ type: "varchar", nullable: true })
  openHour?: string

  @Column({ type: "boolean", default: false })
  is24Hours!: boolean

  @Column({ type: "boolean", default: false })
  hasGX!: boolean

  @Column({ type: "boolean", default: false })
  hasPT!: boolean

  @Column({ type: "boolean", default: false })
  hasGroupPT!: boolean

  @Column({ type: "boolean", default: false })
  hasParking!: boolean

  @Column({ type: "boolean", default: false })
  hasShower!: boolean

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
