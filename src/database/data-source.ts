import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { ChannelMember } from '../channels/models/channel-member.entity';
import { Channel } from '../channels/models/channel.entity';
import { Image } from '../images/models/image.entity';
import { Invite } from '../invites/invite.entity';
import { Message } from '../messages/message.entity';
import { ProposalConfig } from '../proposals/models/proposal-config.entity';
import { Proposal } from '../proposals/models/proposal.entity';
import { ProposalActionPermission } from '../proposals/proposal-actions/models/proposal-action-permission.entity';
import { ProposalActionRoleMember } from '../proposals/proposal-actions/models/proposal-action-role-member.entity';
import { ProposalActionRole } from '../proposals/proposal-actions/models/proposal-action-role.entity';
import { ProposalAction } from '../proposals/proposal-actions/models/proposal-action.entity';
import { Permission } from '../roles/models/permission.entity';
import { Role } from '../roles/models/role.entity';
import { ServerConfig } from '../server-configs/models/server-config.entity';
import { User } from '../users/user.entity';
import { Vote } from '../votes/vote.entity';
import { Init1740949608930 } from './migrations/1740949608930-Init';

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
  migrations: [Init1740949608930],
});
