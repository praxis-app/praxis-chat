import { ProposalActionType } from '@common/proposal-actions/proposal-action.types';
import { ProposalActionRoleDto } from './proposal-action-role.dto';

export interface ProposalActionDto {
  actionType: ProposalActionType;
  role?: ProposalActionRoleDto;
}
