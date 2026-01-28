import { PollType } from '@common/polls/poll.types';
import { PollActionDto } from '../../poll-actions/dtos/poll-action.dto';

export interface PollDto {
  body: string;
  pollType: PollType;
  closingAt?: Date;
  imageCount?: number;
  action?: PollActionDto;
  options?: string[];
  multipleChoice?: boolean;
}
