import {
  PROPOSAL_ACTION_TYPE,
  ROLE_ATTRIBUTE_CHANGE_TYPE,
} from './proposal-action.constants';

export type ProposalActionType = (typeof PROPOSAL_ACTION_TYPE)[number];

export type RoleAttributeChangeType =
  (typeof ROLE_ATTRIBUTE_CHANGE_TYPE)[number];
