import { DecisionMakingModel } from '@common/proposals/proposal.types';

export interface ServerConfigReq {
  decisionMakingModel: DecisionMakingModel;
  standAsidesLimit: number;
  reservationsLimit: number;
  ratificationThreshold: number;
  verificationThreshold: number;
  votingTimeLimit: number;
}

export interface ServerConfigRes {
  id: string;
  decisionMakingModel: DecisionMakingModel;
  standAsidesLimit: number;
  reservationsLimit: number;
  ratificationThreshold: number;
  verificationThreshold: number;
  votingTimeLimit: number;
  createdAt: Date;
  updatedAt: Date;
}
