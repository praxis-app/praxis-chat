import { DECISION_MAKING_MODEL, POLL_STAGE } from './poll.constants';

export type DecisionMakingModel = (typeof DECISION_MAKING_MODEL)[number];

export type PollStage = (typeof POLL_STAGE)[number];
