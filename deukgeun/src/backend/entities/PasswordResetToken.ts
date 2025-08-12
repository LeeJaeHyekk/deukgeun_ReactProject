import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from "typeorm"

@Entity()
export class PasswordResetToken {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: "varchar" })
  @Index()
  token!: string

  @Column({ type: "varchar" })
  @Index()
  email!: string

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
