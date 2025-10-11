import { ProposalActionDto } from '../../proposal-actions/dtos/proposal-action.dto';

export interface ProposalDto {
  body: string;
  closingAt?: Date;
  action: ProposalActionDto;
  imageCount?: number;
}
