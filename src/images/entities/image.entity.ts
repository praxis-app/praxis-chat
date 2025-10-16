import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Message } from '../../messages/message.entity';
import { Poll } from '../../polls/entities/poll.entity';
import { User } from '../../users/user.entity';
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

  @ManyToOne(() => Poll, (poll) => poll.images, {
    onDelete: 'CASCADE',
  })
  poll?: Poll;

  @Column({ type: 'varchar', nullable: true })
  pollId: string | null;

  @ManyToOne(() => User, (user) => user.images, {
    onDelete: 'CASCADE',
  })
  user?: User;

  @Column({ type: 'varchar', nullable: true })
  userId: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
