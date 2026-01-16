interface QuorumProgress {
  required: number;
  percentage: number;
  isMet: boolean;
}

interface ThresholdProgress {
  required: number;
  percentage: number;
  isMet: boolean;
}

/**
 * Calculate the required number of votes to meet quorum.
 * @param memberCount Total eligible voters
 * @param quorumThreshold Percentage threshold (e.g., 51 for 51%)
 */
export const getRequiredQuorum = (
  memberCount: number,
  quorumThreshold: number,
): number => {
  return Math.ceil(memberCount * (quorumThreshold * 0.01));
};

/**
 * Calculate quorum progress for a poll.
 * @param totalVotes Number of votes cast
 * @param memberCount Total eligible voters
 * @param quorumThreshold Percentage threshold (e.g., 51 for 51%)
 */
export const getQuorumProgress = (
  totalVotes: number,
  memberCount: number,
  quorumThreshold: number,
): QuorumProgress => {
  const required = getRequiredQuorum(memberCount, quorumThreshold);
  const percentage =
    required > 0
      ? Math.min(100, Math.round((totalVotes / required) * 100))
      : 100;
  const isMet = totalVotes >= required;

  return { required, percentage, isMet };
};

/**
 * Calculate the required number of agreements to meet threshold.
 * @param memberCount Total eligible voters
 * @param ratificationThreshold Percentage threshold (e.g., 51 for 51%)
 */
export const getRequiredThreshold = (
  memberCount: number,
  ratificationThreshold: number,
): number => {
  return Math.floor(memberCount * (ratificationThreshold * 0.01));
};

/**
 * Calculate ratification threshold progress for a poll.
 * @param agreementCount Number of agreement votes
 * @param memberCount Total eligible voters
 * @param ratificationThreshold Percentage threshold (e.g., 51 for 51%)
 */
export const getThresholdProgress = (
  agreementCount: number,
  memberCount: number,
  ratificationThreshold: number,
): ThresholdProgress => {
  const required = getRequiredThreshold(memberCount, ratificationThreshold);
  const percentage =
    required > 0
      ? Math.min(100, Math.round((agreementCount / required) * 100))
      : 100;
  const isMet = agreementCount >= required;

  return { required, percentage, isMet };
};
