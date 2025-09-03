import { CreateProposalActionReq } from '../../proposal-actions/dtos/create-proposal-action-req.dto';

export interface CreateProposalReq {
  body: string;
  closingAt?: Date;
  action: CreateProposalActionReq;
  channelId: string;
}
