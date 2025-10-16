import { VOTE_TYPES } from '@common/votes/vote.constants';
import { VoteType } from '@common/votes/vote.types';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Poll } from '../polls/entities/poll.entity';
import { User } from '../users/user.entity';

@Entity()
@Unique(['pollId', 'userId'])
export class Vote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: VOTE_TYPES })
  voteType: VoteType;

  @ManyToOne(() => Poll, (poll) => poll.votes, {
    onDelete: 'CASCADE',
  })
  poll?: Poll;

  @Column({ type: 'varchar', nullable: true })
  pollId: string | null;

  // TODO: Uncomment when QuestionnaireTicket is defined
  // @ManyToOne(
  //   () => QuestionnaireTicket,
  //   (questionnaireTicket) => questionnaireTicket.votes,
  //   {
  //     onDelete: 'CASCADE',
  //   },
  // )
  // questionnaireTicket?: QuestionnaireTicket;

  // TODO: Uncomment when QuestionnaireTicket is defined
  // @Column({ type: 'varchar', nullable: true })
  // questionnaireTicketId: string | null;

  @ManyToOne(() => User, (user) => user.votes, { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'uuid' })
  userId: string;

  // TODO: Uncomment when Notification is defined
  // @OneToMany(() => Notification, (notification) => notification.vote)
  // notifications: Notification[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
