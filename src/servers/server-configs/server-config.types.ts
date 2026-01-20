import { ServerConfig } from './entities/server-config.entity';

export type ServerConfigDto = Partial<
  Pick<
    ServerConfig,
    | 'anonymousUsersEnabled'
    | 'decisionMakingModel'
    | 'disagreementsLimit'
    | 'abstainsLimit'
    | 'agreementThreshold'
    | 'votingTimeLimit'
  >
>;
