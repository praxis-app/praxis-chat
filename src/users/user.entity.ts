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
import { Invite } from '../invites/invite.entity';
import { Message } from '../messages/message.entity';
import { PollActionRoleMember } from '../poll-actions/entities/poll-action-role-member.entity';
import { Poll } from '../polls/entities/poll.entity';
import { Role } from '../roles/entities/role.entity';
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

  @ManyToMany(() => Role, (role) => role.members, {
    onDelete: 'CASCADE',
  })
  roles: Role[];

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
