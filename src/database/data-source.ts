import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { ChannelKey } from '../channels/entities/channel-key.entity';
import { ChannelMember } from '../channels/entities/channel-member.entity';
import { Channel } from '../channels/entities/channel.entity';
import { Image } from '../images/entities/image.entity';
import { Invite } from '../invites/invite.entity';
import { Message } from '../messages/message.entity';
import { ProposalActionPermission } from '../proposal-actions/entities/proposal-action-permission.entity';
import { ProposalActionRoleMember } from '../proposal-actions/entities/proposal-action-role-member.entity';
import { ProposalActionRole } from '../proposal-actions/entities/proposal-action-role.entity';
import { ProposalAction } from '../proposal-actions/entities/proposal-action.entity';
import { ProposalConfig } from '../proposals/entities/proposal-config.entity';
import { Proposal } from '../proposals/entities/proposal.entity';
import { Permission } from '../roles/entities/permission.entity';
import { Role } from '../roles/entities/role.entity';
import { ServerConfig } from '../server-configs/entities/server-config.entity';
import { User } from '../users/user.entity';
import { Vote } from '../votes/vote.entity';
import { Initial1759959254452 } from './migrations/1759959254452-Initial';

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
    Permission,
    Proposal,
    ProposalAction,
    ProposalActionPermission,
    ProposalActionRole,
    ProposalActionRoleMember,
    ProposalConfig,
    Role,
    ServerConfig,
    User,
    Vote,
  ],
  migrations: [Initial1759959254452],
});
