import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Server } from '../servers/entities/server.entity';

@Entity()
export class InstanceConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Server, { nullable: true })
  @JoinColumn()
  defaultServer: Server | null;

  @Column({ type: 'uuid', nullable: true })
  defaultServerId: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
