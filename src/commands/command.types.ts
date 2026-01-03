export interface CommandContext {
  serverId: string;
  channelId: string;
  messageBody: string;
}

export interface CommandJobData {
  serverId: string;
  channelId: string;
  messageBody: string;
  botMessageId: string;
}
