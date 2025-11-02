import { PollActionRes } from '@/types/poll-action.types';
import { PollActionRole } from './poll-action-role';

interface Props {
  action: PollActionRes;
}

export const PollAction = ({ action }: Props) => {
  if (
    action.serverRole &&
    (action.actionType === 'change-role' || action.actionType === 'create-role')
  ) {
    return <PollActionRole action={action} />;
  }

  return null;
};
