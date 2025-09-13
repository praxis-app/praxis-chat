import { ProposalActionRes } from '@/types/proposal-action.types';
import { ProposalActionRole } from './proposal-action-role';

interface Props {
  action: ProposalActionRes;
}

export const ProposalAction = ({ action }: Props) => {
  if (action.actionType === 'change-role' && action.role) {
    return <ProposalActionRole role={action.role} />;
  }

  return null;
};
