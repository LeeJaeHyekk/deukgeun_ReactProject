// ============================================================================
// User Entity (for workout domain)
// ============================================================================

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm"

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: "varchar", unique: true })
  email!: string

  @Column({ type: "varchar" })
  password!: string

  @Column({ type: "varchar", unique: true })
  nickname!: string

  @Column({ type: "varchar", nullable: true })
  phone?: string

  @Column({ type: "varchar", nullable: true })
  profileImage?: string

  @Column({
    type: "enum",
    enum: ["user", "admin", "moderator"],
    default: "user",
  })
  role!: "user" | "admin" | "moderator"

  @Column({ type: "boolean", default: true })
  isActive!: boolean

  @Column({ type: "boolean", default: false })
  isEmailVerified!: boolean

  @Column({ type: "datetime", nullable: true })
  lastLoginAt?: Date

  @Column({ type: "datetime", nullable: true })
  lastActivityAt?: Date

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
