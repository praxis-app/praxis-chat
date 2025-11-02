import { PollActionType } from '@common/poll-actions/poll-action.types';
import { PollActionRoleDto } from './poll-action-role.dto';

export interface PollActionDto {
  actionType: PollActionType;
  serverRole?: PollActionRoleDto;
}
