import {
  handleCompromisesCommand,
  handleConsensusCommand,
  handleDisagreementsCommand,
  handleDraftProposalCommand,
  handleSummaryCommand,
} from '../chat-analysis/chat-analysis.commands';

enum Commands {
  Summary = '/summary',
  Consensus = '/consensus',
  Disagreements = '/disagreements',
  Compromises = '/compromises',
  DraftProposal = '/draft-proposal',
}

interface CommandContext {
  channelId: string;
  messageBody: string;
}

export const handleCommandExecution = async (
  context: CommandContext,
): Promise<string> => {
  const commandHandlers: Record<
    Commands,
    (context: CommandContext) => Promise<string>
  > = {
    [Commands.Summary]: handleSummaryCommand,
    [Commands.Consensus]: handleConsensusCommand,
    [Commands.Disagreements]: handleDisagreementsCommand,
    [Commands.Compromises]: handleCompromisesCommand,
    [Commands.DraftProposal]: handleDraftProposalCommand,
  };

  const command = Object.values(Commands).find((command) =>
    context.messageBody?.toLowerCase().startsWith(command),
  );
  if (!command) {
    throw new Error('No valid command found in message');
  }
  return await commandHandlers[command](context);
};

export const isCommandMessage = (body: string) => {
  return Object.values(Commands).some((command) =>
    body?.toLowerCase().startsWith(command),
  );
};
