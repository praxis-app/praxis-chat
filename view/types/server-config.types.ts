import { DecisionMakingModel } from '@common/polls/poll.types';

export interface ServerConfigReq {
  anonymousUsersEnabled?: boolean;
  decisionMakingModel?: DecisionMakingModel;
  disagreementsLimit?: number;
  abstainsLimit?: number;
  ratificationThreshold?: number;
  votingTimeLimit?: number;
}

export interface ServerConfigRes {
  decisionMakingModel: DecisionMakingModel;
  disagreementsLimit: number;
  abstainsLimit: number;
  ratificationThreshold: number;
  votingTimeLimit: number;
  updatedAt: Date;
}
