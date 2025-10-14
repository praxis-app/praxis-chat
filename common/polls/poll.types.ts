import { DECISION_MAKING_MODEL, POLL_STAGE, POLL_TYPE } from './poll.constants';

export type DecisionMakingModel = (typeof DECISION_MAKING_MODEL)[number];

export type PollStage = (typeof POLL_STAGE)[number];

export type PollType = (typeof POLL_TYPE)[number];
