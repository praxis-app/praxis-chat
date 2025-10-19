import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ChannelKey } from '../channels/entities/channel-key.entity';
import { Channel } from '../channels/entities/channel.entity';
import { Image } from '../images/entities/image.entity';
import { User } from '../users/user.entity';

@Entity()
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'bytea', nullable: true })
  ciphertext: Buffer | null;

  @Column({ type: 'bytea', nullable: true })
  iv: Buffer | null;

  @Column({ type: 'bytea', nullable: true })
  tag: Buffer | null;

  @OneToMany(() => Image, (image) => image.message)
  images: Image[];

  @ManyToOne(() => User, (user) => user.messages, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  user: User | null;

  @Column({ nullable: true })
  userId: string | null;

  @Column({ default: false })
  isBot: boolean;

  @Column({ type: 'varchar', nullable: true })
  commandStatus: 'processing' | 'completed' | 'failed' | null;

  @ManyToOne(() => ChannelKey, (key) => key.messages)
  key?: ChannelKey;

  @Column({ type: 'uuid', nullable: true })
  keyId: string | null;

  @ManyToOne(() => Channel, (channel) => channel.messages, {
    onDelete: 'CASCADE',
  })
  channel: Channel;

  @Column()
  channelId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
