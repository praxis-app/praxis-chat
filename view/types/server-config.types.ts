import { DecisionMakingModel } from '@common/polls/poll.types';

export interface ServerConfigReq {
  anonymousUsersEnabled?: boolean;
  decisionMakingModel?: DecisionMakingModel;
  disagreementsLimit?: number;
  abstainsLimit?: number;
  agreementThreshold?: number;
  quorumEnabled?: boolean;
  quorumThreshold?: number;
  votingTimeLimit?: number;
}

export interface ServerConfigRes {
  anonymousUsersEnabled: boolean;
  decisionMakingModel: DecisionMakingModel;
  disagreementsLimit: number;
  abstainsLimit: number;
  agreementThreshold: number;
  quorumEnabled: boolean;
  quorumThreshold: number;
  votingTimeLimit: number;
  updatedAt: Date;
}
