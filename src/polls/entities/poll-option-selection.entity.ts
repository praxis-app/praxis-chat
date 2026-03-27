/**
 * TODO: Add support for ranked choice and score voting
 * `rank` and `score` fields are nullable and unused for now
 */

import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Vote } from '../../votes/vote.entity';
import { PollOption } from './poll-option.entity';

@Entity()
@Unique(['voteId', 'pollOptionId'])
export class PollOptionSelection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', nullable: true })
  rank: number | null;

  @Column({ type: 'int', nullable: true })
  score: number | null;

  @ManyToOne(() => Vote, (vote) => vote.pollOptionSelections, {
    onDelete: 'CASCADE',
  })
  vote: Vote;

  @Column({ type: 'uuid' })
  voteId: string;

  @ManyToOne(
    () => PollOption,
    (pollOption) => pollOption.pollOptionSelections,
    { onDelete: 'CASCADE' },
  )
  pollOption: PollOption;

  @Column({ type: 'uuid' })
  pollOptionId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
