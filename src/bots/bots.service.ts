import { dataSource } from '../database/data-source';
import { DEFAULT_BOT_NAME } from './bot.constants';
import { Bot } from './bot.entity';

const botRepository = dataSource.getRepository(Bot);

export const getDefaultBot = async (): Promise<Bot> => {
  const bot = await botRepository.findOne({
    where: { name: DEFAULT_BOT_NAME },
  });

  if (!bot) {
    throw new Error(`Default bot "${DEFAULT_BOT_NAME}" not found`);
  }

  return bot;
};

export const ensureDefaultBotExists = async () => {
  const defaultBotExists = await botRepository.exists({
    where: { name: DEFAULT_BOT_NAME },
  });

  if (defaultBotExists) {
    return;
  }

  const newBot = botRepository.create({
    name: DEFAULT_BOT_NAME,
  });

  await botRepository.save(newBot);
  console.info(`Created default bot: ${DEFAULT_BOT_NAME}`);
};
