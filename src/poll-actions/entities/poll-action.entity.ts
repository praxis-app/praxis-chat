import { POLL_ACTION_TYPE } from '@common/poll-actions/poll-action.constants';
import { PollActionType } from '@common/poll-actions/poll-action.types';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Poll } from '../../polls/entities/poll.entity';
import { PollActionRole } from './poll-action-role.entity';

@Entity()
export class PollAction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: POLL_ACTION_TYPE })
  actionType: PollActionType;

  @OneToOne(
    () => PollActionRole,
    (proposedRole) => proposedRole.pollAction,
    {
      cascade: true,
      nullable: true,
    },
  )
  role?: PollActionRole;

  @OneToOne(() => Poll, (poll) => poll.action, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  poll: Poll;

  @Column({ type: 'uuid' })
  pollId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
