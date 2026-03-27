import { VOTE_TYPES } from '@common/votes/vote.constants';
import { VoteType } from '@common/votes/vote.types';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { PollOptionSelection } from '../polls/entities/poll-option-selection.entity';
import { Poll } from '../polls/entities/poll.entity';
import { User } from '../users/user.entity';

@Entity()
@Unique(['pollId', 'userId'])
export class Vote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: VOTE_TYPES, nullable: true })
  voteType: VoteType | null;

  @ManyToOne(() => Poll, (poll) => poll.votes, {
    onDelete: 'CASCADE',
  })
  poll?: Poll;

  @Column({ type: 'varchar', nullable: true })
  pollId: string | null;

  @ManyToOne(() => User, (user) => user.votes, { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'uuid' })
  userId: string;

  @OneToMany(
    () => PollOptionSelection,
    (pollOptionSelection) => pollOptionSelection.vote,
    { cascade: true },
  )
  pollOptionSelections: PollOptionSelection[];

  // TODO: Uncomment when Notification is defined
  // @OneToMany(() => Notification, (notification) => notification.vote)
  // notifications: Notification[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
