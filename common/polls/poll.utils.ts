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
 * Calculate the required count to meet a given threshold in voting
 * @param memberCount Total eligible voters
 * @param threshold Percentage threshold (e.g., 51 for 51%)
 */
export const getRequiredCount = (
  memberCount: number,
  threshold: number,
): number => {
  return Math.ceil(memberCount * (threshold * 0.01));
};
