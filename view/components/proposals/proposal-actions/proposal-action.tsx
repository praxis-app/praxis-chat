import { PollActionRes } from '@/types/poll-action.types';
import { ProposalActionRole } from './proposal-action-role';

interface Props {
  action: PollActionRes;
}

export const ProposalAction = ({ action }: Props) => {
  if (
    action.role &&
    (action.actionType === 'change-role' || action.actionType === 'create-role')
  ) {
    return <ProposalActionRole action={action} />;
  }

  return null;
};
