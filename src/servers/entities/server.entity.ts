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
import { Invite } from '../../invites/invite.entity';
import { ServerRole } from '../../server-roles/entities/server-role.entity';
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

  @OneToMany(() => ServerRole, (serverRole) => serverRole.server)
  serverRoles: ServerRole[];

  @OneToMany(() => Invite, (invite) => invite.server)
  invites: Invite[];

  @OneToOne(() => ServerConfig, (config) => config.server, {
    cascade: true,
  })
  config: ServerConfig;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
