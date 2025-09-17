import { DecisionMakingModel } from '@common/proposals/proposal.types';

export interface ServerConfigReq {
  decisionMakingModel: DecisionMakingModel;
  standAsidesLimit: number;
  reservationsLimit: number;
  ratificationThreshold: number;
  votingTimeLimit: number;
}

export interface ServerConfigRes {
  decisionMakingModel: DecisionMakingModel;
  standAsidesLimit: number;
  reservationsLimit: number;
  ratificationThreshold: number;
  votingTimeLimit: number;
  updatedAt: Date;
}
