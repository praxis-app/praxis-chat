import { DECISION_MAKING_MODEL, PROPOSAL_STAGE } from './proposal.constants';

export type DecisionMakingModel = (typeof DECISION_MAKING_MODEL)[number];

export type ProposalStage = (typeof PROPOSAL_STAGE)[number];
