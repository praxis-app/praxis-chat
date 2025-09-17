import { DecisionMakingModel } from '@common/proposals/proposal.types';

export interface ServerConfigReq {
  decisionMakingModel: DecisionMakingModel;
  disagreementsLimit: number;
  abstainsLimit: number;
  ratificationThreshold: number;
  votingTimeLimit: number;
}

export interface ServerConfigRes {
  decisionMakingModel: DecisionMakingModel;
  disagreementsLimit: number;
  abstainsLimit: number;
  ratificationThreshold: number;
  votingTimeLimit: number;
  updatedAt: Date;
}
