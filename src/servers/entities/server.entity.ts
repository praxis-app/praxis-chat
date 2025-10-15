import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Channel } from '../../channels/entities/channel.entity';
import { ServerConfig } from '../../server-configs/entities/server-config.entity';
import { ServerMember } from './server-member.entity';

@Entity()
export class Server {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  description: string | null;

  @OneToMany(() => ServerMember, (member) => member.server)
  members: ServerMember[];

  @OneToMany(() => Channel, (channel) => channel.server)
  channels: Channel[];

  @OneToOne(() => ServerConfig, (config) => config.server, {
    cascade: true,
  })
  config: ServerConfig;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
