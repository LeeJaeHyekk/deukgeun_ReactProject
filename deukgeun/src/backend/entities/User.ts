import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm"

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: "varchar", unique: true })
  email: string

  @Column({ type: "varchar" })
  password: string

  @Column({ type: "varchar", unique: true })
  nickname: string

  @Column({ type: "varchar", nullable: true })
  phone: string

  @Column({ type: "enum", enum: ["male", "female", "other"], nullable: true })
  gender: "male" | "female" | "other"

  @Column({ type: "date", nullable: true })
  birthday: Date

  @Column({ type: "varchar", nullable: true })
  profileImage: string

  @Column({ default: "user" })
  role: "user" | "admin"

  @CreateDateColumn()
  @Index()
  createdAt: Date

  @UpdateDateColumn()
  @Index()
  updatedAt: Date
}
