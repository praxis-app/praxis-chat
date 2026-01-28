import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PollOptionSelection } from './poll-option-selection.entity';
import { Poll } from './poll.entity';

@Entity()
export class PollOption {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  text: string;

  @ManyToOne(() => Poll, (poll) => poll.options, {
    onDelete: 'CASCADE',
  })
  poll: Poll;

  @Column({ type: 'uuid' })
  pollId: string;

  @OneToMany(
    () => PollOptionSelection,
    (pollOptionSelection) => pollOptionSelection.pollOption,
    { cascade: true },
  )
  pollOptionSelections: PollOptionSelection[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
