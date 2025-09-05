export const DECISION_MAKING_MODEL = [
  'consent',
  'consensus',
  'majority-vote',
] as const;

export const PROPOSAL_ACTION_TYPE = [
  'change-settings',
  'change-role',
  'create-role',
  'plan-event',
  'test',
] as const;

export const PROPOSAL_STAGE = [
  'voting',
  'ratified',
  'revision',
  'closed',
] as const;

export const VOTE_TYPE = ['agree', 'disagree', 'abstain', 'block'] as const;
