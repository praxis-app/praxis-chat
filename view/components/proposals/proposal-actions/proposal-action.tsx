import { ProposalActionRes } from '@/types/proposal-action.types';
import { ProposalActionRole } from './proposal-action-role';

interface Props {
  action: ProposalActionRes;
}

export const ProposalAction = ({ action }: Props) => {
  if (
    action.role &&
    (action.actionType === 'change-role' || action.actionType === 'create-role')
  ) {
    return <ProposalActionRole role={action.role} />;
  }

  return null;
};
