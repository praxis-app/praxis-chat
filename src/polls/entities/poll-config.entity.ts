import { DECISION_MAKING_MODEL } from '@common/polls/poll.constants';
import { DecisionMakingModel } from '@common/polls/poll.types';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Poll } from './poll.entity';

@Entity()
export class PollConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: DECISION_MAKING_MODEL,
    default: 'consensus',
    nullable: true,
  })
  decisionMakingModel: DecisionMakingModel | null;

  @Column({ type: 'int', default: 2, nullable: true })
  disagreementsLimit: number | null;

  @Column({ type: 'int', default: 2, nullable: true })
  abstainsLimit: number | null;

  @Column({ type: 'int', default: 51, nullable: true })
  agreementThreshold: number | null;

  @Column({ type: 'boolean', default: true, nullable: true })
  quorumEnabled: boolean | null;

  @Column({ type: 'int', default: 25, nullable: true })
  quorumThreshold: number | null;

  @Column({ type: 'boolean', default: false, nullable: true })
  multipleChoice: boolean | null;

  @Column({ type: 'timestamp', nullable: true })
  closingAt: Date | null;

  @OneToOne(() => Poll, (poll) => poll.config, {
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
