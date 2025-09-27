import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Message } from '../../messages/message.entity';
import { Proposal } from '../../proposals/entities/proposal.entity';
import { IMAGE_TYPES } from '../image.constants';
import { ImageType } from '../image.types';

@Entity()
export class Image {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, type: 'varchar' })
  filename: string | null;

  @Column({ type: 'enum', enum: IMAGE_TYPES })
  imageType: ImageType;

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
