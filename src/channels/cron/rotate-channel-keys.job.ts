import { CronJob } from 'cron';
import { CronExpression } from '../../common/common.constants';
import { dataSource } from '../../database/data-source';
import { generateChannelKey } from '../channels.service';
import { ChannelKey } from '../entities/channel-key.entity';
import { Channel } from '../entities/channel.entity';

const channelRepository = dataSource.getRepository(Channel);
const channelKeyRepository = dataSource.getRepository(ChannelKey);

const rotateChannelKeys = async () => {
  const channels = await channelRepository.find();

  const newChannelKeysToSave = channels.map((channel) => {
    const { wrappedKey, tag, iv } = generateChannelKey();
    return {
      channelId: channel.id,
      wrappedKey,
      tag,
      iv,
    };
  });

  await channelKeyRepository.save(newChannelKeysToSave);
};

export const rotateChannelKeysJob = new CronJob(
  CronExpression.EVERY_QUARTER,
  async () => {
    await rotateChannelKeys();
  },
);
