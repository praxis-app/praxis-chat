import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Message } from '../../messages/message.entity';
import { Proposal } from '../../proposals/models/proposal.entity';

@Entity()
export class Image {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, type: 'varchar' })
  filename: string | null;

  @Column({ nullable: true, type: 'varchar' })
  imageType: string | null;

  @ManyToOne(() => Message, (message) => message.images, {
    onDelete: 'CASCADE',
  })
  message?: Message;

  @Column({ type: 'varchar', nullable: true })
  messageId: string | null;

  @ManyToOne(() => Proposal, (proposal) => proposal.images, {
    onDelete: 'CASCADE',
  })
  proposal?: Proposal;

  @Column({ type: 'varchar', nullable: true })
  proposalId: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
