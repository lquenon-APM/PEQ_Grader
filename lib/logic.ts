import { Grade } from "./db";

export type SuggestedStatus = Grade["status"];

/**
 * PEQ Standard Success Threshold
 * 75% of non-critical indicators must be checked to suggest ACQUIS.
 */
export const SUCCESS_THRESHOLD = 0.75;

/**
 * PEQ Grading Logic Engine
 * 
 * Hierarchy:
 * 1. Missing any Critical Indicator -> Suggested: NON_ACQUIS (High priority)
 * 2. All Criticals checked BUT Standards ratio < SUCCESS_THRESHOLD -> Suggested: REMEDIATION
 * 3. All Criticals checked AND Standards ratio >= SUCCESS_THRESHOLD -> Suggested: ACQUIS
 */
export function calculateSuggestedStatus(
  checkedIds: string[],
  indicators: { id: string; critical?: boolean }[]
): SuggestedStatus {
  if (indicators.length === 0) return "PENDING";

  // 1. Check Critical Indicators
  const criticalIndicators = indicators.filter(ind => ind.critical);
  const missingCritical = criticalIndicators.some(ind => !checkedIds.includes(ind.id));

  if (missingCritical) {
    return "NON_ACQUIS";
  }

  // 2. Calculate Standard Indicators Success Ratio
  const standardIndicators = indicators.filter(ind => !ind.critical);
  
  if (standardIndicators.length === 0) {
    // If no standards exist and all criticals are checked, it's ACQUIS
    return "ACQUIS";
  }

  const checkedStandards = standardIndicators.filter(ind => checkedIds.includes(ind.id));
  const successRatio = checkedStandards.length / standardIndicators.length;

  // 3. Final Verdict
  if (successRatio >= SUCCESS_THRESHOLD) {
    return "ACQUIS";
  }

  return "REMEDIATION";
}
