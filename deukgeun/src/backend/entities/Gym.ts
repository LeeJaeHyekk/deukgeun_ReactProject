import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class Gym {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: "varchar", length: 255 })
  name: string

  @Column({ type: "varchar", length: 255 })
  address: string

  @Column({ type: "varchar", nullable: true })
  phone: string

  @Column({ type: "decimal", precision: 10, scale: 7, nullable: true })
  latitude: number

  @Column({ type: "decimal", precision: 10, scale: 7, nullable: true })
  longitude: number

  @Column({ type: "text", nullable: true })
  facilities: string

  @Column({ type: "varchar", nullable: true })
  openHour: string

  @Column({ type: "tinyint", default: 0 })
  is24Hours: boolean

  @Column({ type: "tinyint", default: 0 })
  hasGX: boolean

  @Column({ type: "tinyint", default: 0 })
  hasPT: boolean

  @Column({ type: "tinyint", default: 0 })
  hasGroupPT: boolean

  @Column({ type: "tinyint", default: 0 })
  hasParking: boolean

  @Column({ type: "tinyint", default: 0 })
  hasShower: boolean

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date

  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updatedAt: Date
}
