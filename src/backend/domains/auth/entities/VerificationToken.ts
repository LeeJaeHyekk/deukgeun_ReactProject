import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from "typeorm"

@Entity()
export class VerificationToken {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: "varchar" })
  @Index()
  token!: string

  @Column({ type: "varchar" })
  @Index()
  email!: string

  @Column({ type: "enum", enum: ["find_id", "reset_password"] })
  type!: "find_id" | "reset_password"

  @Column({ type: "varchar", nullable: true })
  phone?: string

  @Column({ type: "varchar", nullable: true })
  name?: string

  @Column({ type: "varchar", length: 6 })
  code!: string

  @Column({ type: "boolean", default: false })
  isUsed!: boolean

  @Column({ type: "timestamp" })
  expiresAt!: Date

  @Column({ type: "varchar", nullable: true })
  ipAddress?: string

  @Column({ type: "varchar", nullable: true })
  userAgent?: string

  @CreateDateColumn()
  @Index()
  createdAt!: Date

  @Column({ type: "timestamp", nullable: true })
  usedAt?: Date
}
