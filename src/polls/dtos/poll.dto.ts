import { PollActionDto } from '../../poll-actions/dtos/poll-action.dto';

export interface PollDto {
  body: string;
  closingAt?: Date;
  action: PollActionDto;
  imageCount?: number;
}
