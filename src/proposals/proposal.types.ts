import {
  DECISION_MAKING_MODEL,
  PROPOSAL_ACTION_TYPE,
  PROPOSAL_STAGE,
} from '@common/proposals/proposal.constants';

export type DecisionMakingModel = (typeof DECISION_MAKING_MODEL)[number];

export type ProposalActionType = (typeof PROPOSAL_ACTION_TYPE)[number];

export type ProposalStage = (typeof PROPOSAL_STAGE)[number];
