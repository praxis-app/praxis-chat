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

export const ensureDefaultBotExists = async (): Promise<Bot> => {
  const existingBot = await botRepository.findOne({
    where: { name: DEFAULT_BOT_NAME },
  });

  if (existingBot) {
    return existingBot;
  }

  const newBot = botRepository.create({
    name: DEFAULT_BOT_NAME,
    displayName: 'Praxis Bot',
    description: 'Default bot for automated system messages and analysis',
  });

  await botRepository.save(newBot);
  console.info(`Created default bot: ${DEFAULT_BOT_NAME}`);

  return newBot;
};
