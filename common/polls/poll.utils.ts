/**
 * Calculate progress percentage toward a required voting threshold
 * @param current Current count
 * @param required Required count to meet threshold
 */
export const getProgressPercentage = (
  current: number,
  required: number,
): number =>
  required > 0 ? Math.min(100, Math.round((current / required) * 100)) : 100;

/**
 * Calculate the required number of votes to meet quorum
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
 * Calculate the required number of agreements to meet threshold
 * @param memberCount Total eligible voters
 * @param ratificationThreshold Percentage threshold (e.g., 51 for 51%)
 */
export const getRequiredAgreements = (
  memberCount: number,
  ratificationThreshold: number,
): number => {
  return Math.ceil(memberCount * (ratificationThreshold * 0.01));
};
