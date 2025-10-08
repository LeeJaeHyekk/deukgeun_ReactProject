import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm"

@Entity("homepage_configs")
export class HomePageConfig {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: "varchar", length: 100, unique: true })
  key!: string

  @Column({ type: "text" })
  value!: string

  @Column({ type: "varchar", length: 50, default: "text" })
  type!: "text" | "number" | "boolean" | "json"

  @Column({ type: "varchar", length: 200, nullable: true })
  description?: string

  @Column({ type: "boolean", default: true })
  isActive!: boolean

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
