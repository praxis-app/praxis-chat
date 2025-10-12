import { isChannelMember } from '../channels/channels.service';
import { User } from '../users/user.entity';

const UUID_REGEX =
  '[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}';

type ChannelAccessRule = (
  match: RegExpExecArray,
  user: User,
) => Promise<boolean> | boolean;

interface ChannelAccessPolicy {
  pattern: RegExp;
  rules: Record<string, ChannelAccessRule>;
}

/** Rules to determine if a user can access a given pub-sub channel */
export const CHANNEL_ACCESS_MAP: Record<string, ChannelAccessPolicy> = {
  newMessage: {
    pattern: new RegExp(`^new-message-(${UUID_REGEX})-(${UUID_REGEX})$`),
    rules: {
      isOwnMessage: (match, user) => {
        const userId = match[2];
        return user.id === userId;
      },
      isChannelMember: async (match, user) => {
        const channelId = match[1];
        return isChannelMember(channelId, user.id);
      },
    },
  },
  newPoll: {
    pattern: new RegExp(`^new-poll-(${UUID_REGEX})-(${UUID_REGEX})$`),
    rules: {
      isOwnMessage: (match, user) => {
        const userId = match[2];
        return user.id === userId;
      },
      isChannelMember: async (match, user) => {
        const channelId = match[1];
        return isChannelMember(channelId, user.id);
      },
    },
  },
};
