import { ServerConfig } from './entities/server-config.entity';

export type ServerConfigDto = Partial<
  Pick<
    ServerConfig,
    | 'decisionMakingModel'
    | 'disagreementsLimit'
    | 'abstainsLimit'
    | 'ratificationThreshold'
    | 'votingTimeLimit'
  >
>;
