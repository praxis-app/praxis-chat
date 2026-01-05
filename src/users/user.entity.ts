import { VALID_NAME_REGEX } from '@common/users/user.constants';
import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ChannelMember } from '../channels/entities/channel-member.entity';
import { Image } from '../images/entities/image.entity';
import { InstanceRole } from '../instance/instance-roles/entities/instance-role.entity';
import { Invite } from '../invites/invite.entity';
import { Message } from '../messages/message.entity';
import { PollActionRoleMember } from '../poll-actions/entities/poll-action-role-member.entity';
import { Poll } from '../polls/entities/poll.entity';
import { ServerMember } from '../servers/entities/server-member.entity';
import { ServerRole } from '../servers/server-roles/entities/server-role.entity';
import { Vote } from '../votes/vote.entity';

@Entity()
@Check('valid_name_check', `"name" ~ '${VALID_NAME_REGEX.source}'`)
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  displayName: string | null;

  @Column({ type: 'varchar', nullable: true, unique: true })
  email: string | null;

  // TODO: Set `select: false` to avoid accidental password exposure
  @Column({ type: 'varchar', nullable: true })
  password: string | null;

  @Column({ type: 'varchar', nullable: true })
  bio: string | null;

  @Column({ default: false })
  anonymous: boolean;

  @Column({ default: false })
  locked: boolean;

  @OneToMany(() => Poll, (poll) => poll.user, {
    cascade: true,
  })
  polls: Poll[];

  @OneToMany(() => Vote, (vote) => vote.user, {
    cascade: true,
  })
  votes: Vote[];

  @OneToMany(() => Message, (message) => message.user, {
    cascade: true,
  })
  messages: Message[];

  @OneToMany(() => ChannelMember, (channelMember) => channelMember.user, {
    cascade: true,
  })
  channelMembers: ChannelMember[];

  @OneToMany(() => ServerMember, (serverMember) => serverMember.user, {
    cascade: true,
  })
  serverMembers: ServerMember[];

  @ManyToMany(() => ServerRole, (serverRole) => serverRole.members, {
    onDelete: 'CASCADE',
  })
  serverRoles: ServerRole[];

  @OneToMany(() => Invite, (invite) => invite.user, {
    cascade: true,
  })
  invites: Invite[];

  @OneToMany(() => Image, (image) => image.user, {
    cascade: true,
  })
  images: Image[];

  @OneToMany(
    () => PollActionRoleMember,
    (pollActionRoleMember) => pollActionRoleMember.user,
    {
      cascade: true,
    },
  )
  pollActionRoleMembers: PollActionRoleMember[];

  @ManyToMany(() => InstanceRole, (instanceRole) => instanceRole.members, {
    onDelete: 'CASCADE',
  })
  instanceRoles: InstanceRole[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
