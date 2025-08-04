import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Gym {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: "decimal", precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column({ type: "decimal", precision: 10, scale: 7, nullable: true })
  longitude: number;

  @Column({ nullable: true })
  facilities: string;

  @Column({ nullable: true })
  openHour: string;

  @Column({ default: false })
  is24Hours: boolean;

  @Column({ default: false })
  hasGX: boolean;

  @Column({ default: false })
  hasPT: boolean;

  @Column({ default: false })
  hasGroupPT: boolean;

  @Column({ default: false })
  hasParking: boolean;

  @Column({ default: false })
  hasShower: boolean;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;
}
