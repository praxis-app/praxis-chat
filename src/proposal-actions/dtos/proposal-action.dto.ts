import { ProposalActionType } from '../../proposals/proposal.types';
import { ProposalActionRoleDto } from './proposal-action-role.dto';

export interface ProposalActionDto {
  actionType: ProposalActionType;
  role?: ProposalActionRoleDto;
}
