import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { Bot } from '../bots/bot.entity';
import { ChannelKey } from '../channels/entities/channel-key.entity';
import { ChannelMember } from '../channels/entities/channel-member.entity';
import { Channel } from '../channels/entities/channel.entity';
import { Image } from '../images/entities/image.entity';
import { InstanceConfig } from '../instance/instance-config.entity';
import { InstanceRolePermission } from '../instance/instance-roles/entities/instance-role-permission.entity';
import { InstanceRole } from '../instance/instance-roles/entities/instance-role.entity';
import { Invite } from '../invites/invite.entity';
import { Message } from '../messages/message.entity';
import { PollActionPermission } from '../poll-actions/entities/poll-action-permission.entity';
import { PollActionRoleMember } from '../poll-actions/entities/poll-action-role-member.entity';
import { PollActionRole } from '../poll-actions/entities/poll-action-role.entity';
import { PollAction } from '../poll-actions/entities/poll-action.entity';
import { PollConfig } from '../polls/entities/poll-config.entity';
import { PollOption } from '../polls/entities/poll-option.entity';
import { Poll } from '../polls/entities/poll.entity';
import { ServerMember } from '../servers/entities/server-member.entity';
import { Server } from '../servers/entities/server.entity';
import { ServerConfig } from '../servers/server-configs/entities/server-config.entity';
import { ServerRolePermission } from '../servers/server-roles/entities/server-role-permission.entity';
import { ServerRole } from '../servers/server-roles/entities/server-role.entity';
import { User } from '../users/user.entity';
import { Vote } from '../votes/vote.entity';
import { Initial1767572300125 } from './migrations/1767572300125-Initial';
import { GeneralProposals1768246067251 } from './migrations/1768246067251-GeneralProposals';
import { Quorum1768785488966 } from './migrations/1768785488966-Quorum';
import { PollOptionSelection } from '../polls/entities/poll-option-selection.entity';

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
    Bot,
    Channel,
    ChannelKey,
    ChannelMember,
    Image,
    InstanceConfig,
    InstanceRole,
    InstanceRolePermission,
    Invite,
    Message,
    Poll,
    PollAction,
    PollActionPermission,
    PollActionRole,
    PollActionRoleMember,
    PollConfig,
    PollOption,
    PollOptionSelection,
    Server,
    ServerConfig,
    ServerMember,
    ServerRole,
    ServerRolePermission,
    User,
    Vote,
  ],
  migrations: [
    Initial1767572300125,
    GeneralProposals1768246067251,
    Quorum1768785488966,
  ],
});
