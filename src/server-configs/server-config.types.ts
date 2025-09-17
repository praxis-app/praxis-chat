import { ServerConfig } from './entities/server-config.entity';

export type ServerConfigDto = Partial<
  Pick<
    ServerConfig,
    | 'decisionMakingModel'
    | 'standAsidesLimit'
    | 'reservationsLimit'
    | 'ratificationThreshold'
    | 'votingTimeLimit'
  >
>;
