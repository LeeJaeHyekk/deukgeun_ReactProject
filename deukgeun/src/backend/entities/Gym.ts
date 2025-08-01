// src/entities/Gym.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class Gym {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  phone?: string;

  @Column()
  address: string;

  @Column("decimal", { precision: 10, scale: 7 })
  latitude: number;

  @Column("decimal", { precision: 10, scale: 7 })
  longitude: number;

  @Column({ default: false })
  is24Hours: boolean;

  @Column({ default: false })
  hasParking: boolean;

  @Column({ default: false })
  hasShower: boolean;

  @Column({ nullable: true })
  imageUrl?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
