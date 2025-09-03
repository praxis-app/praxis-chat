import { ProposalAction } from '../../proposal-actions/entities/proposal-action.entity';

export interface CreateProposalReq {
  body: string;
  closingAt?: Date;
  action: Partial<ProposalAction>;
  channelId: string;
}
