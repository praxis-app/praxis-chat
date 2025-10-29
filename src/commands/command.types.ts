export interface CommandContext {
  channelId: string;
  messageBody: string;
}

export interface CommandJobData {
  channelId: string;
  messageBody: string;
  botMessageId: string;
}
