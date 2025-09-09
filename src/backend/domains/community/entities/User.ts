import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm"

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: "varchar", length: 100, unique: true })
  email!: string

  @Column({ type: "varchar", length: 50 })
  nickname!: string

  @Column({ type: "varchar", length: 255, nullable: true })
  profileImage?: string

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
