import { ProposalActionDto } from '../../proposal-actions/dtos/proposal-action.dto';

export interface ProposalDto {
  body: string;
  closingAt?: Date;
  action: ProposalActionDto;

  // TODO: Remove this field, it's already in the params
  channelId: string;
}
