import { COMMAND_STATUS } from './command.constants';

export type CommandStatus = (typeof COMMAND_STATUS)[number];

export interface CommandContext {
  channelId: string;
  messageBody: string;
}

export interface CommandJobData {
  channelId: string;
  messageBody: string;
  botMessageId: string;
}
