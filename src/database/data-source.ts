import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { ChannelKey } from '../channels/entities/channel-key.entity';
import { ChannelMember } from '../channels/entities/channel-member.entity';
import { Channel } from '../channels/entities/channel.entity';
import { Image } from '../images/entities/image.entity';
import { Invite } from '../invites/invite.entity';
import { Message } from '../messages/message.entity';
import { PollActionPermission } from '../poll-actions/entities/poll-action-permission.entity';
import { PollActionRoleMember } from '../poll-actions/entities/poll-action-role-member.entity';
import { PollActionRole } from '../poll-actions/entities/poll-action-role.entity';
import { PollAction } from '../poll-actions/entities/poll-action.entity';
import { PollConfig } from '../polls/entities/poll-config.entity';
import { Poll } from '../polls/entities/poll.entity';
import { RolePermission } from '../roles/entities/role-permission.entity';
import { Role } from '../roles/entities/role.entity';
import { ServerConfig } from '../server-configs/entities/server-config.entity';
import { ServerMember } from '../servers/entities/server-member.entity';
import { Server } from '../servers/entities/server.entity';
import { User } from '../users/user.entity';
import { Vote } from '../votes/vote.entity';
import { Initial1760569615876 } from './migrations/1760569615876-Initial';

dotenv.config();

export const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  database: process.env.DB_SCHEMA,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT as string),
  synchronize: process.env.NODE_ENV === 'development',
  entities: [
    Channel,
    ChannelKey,
    ChannelMember,
    Image,
    Invite,
    Message,
    Poll,
    PollAction,
    PollActionPermission,
    PollActionRole,
    PollActionRoleMember,
    PollConfig,
    Role,
    RolePermission,
    Server,
    ServerConfig,
    ServerMember,
    User,
    Vote,
  ],
  migrations: [Initial1760569615876],
});
