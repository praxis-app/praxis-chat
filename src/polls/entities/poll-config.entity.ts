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

  @Column({ type: 'enum', enum: DECISION_MAKING_MODEL, default: 'consensus' })
  decisionMakingModel: DecisionMakingModel;

  @Column({ type: 'int', default: 2 })
  disagreementsLimit: number;

  @Column({ type: 'int', default: 2 })
  abstainsLimit: number;

  @Column({ type: 'int', default: 51 })
  ratificationThreshold: number;

  @Column({ type: 'boolean', default: true })
  quorumEnabled: boolean;

  @Column({ type: 'int', default: 0 })
  quorumThreshold: number;

  @Column({ type: 'timestamp', nullable: true })
  closingAt?: Date;

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
