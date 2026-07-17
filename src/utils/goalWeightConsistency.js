/**
 * Soft checks when primary goal and target weight pull in opposite directions.
 * Does not block submit — surfaces guidance so users (and the coach) get clearer intent.
 */

const MUSCLE_ORIENTED = new Set(['muscle-gain', 'strength', 'MUSCLE_GAIN', 'STRENGTH']);
const LOSS_ORIENTED = new Set(['weight-loss', 'WEIGHT_LOSS']);

/** Absolute kg change that counts as a meaningful cut/gain for a soft warning. */
const MEANINGFUL_DELTA_KG = 5;

/**
 * @param {string|null|undefined} primaryGoal
 * @param {string|number|null|undefined} currentWeightKg
 * @param {string|number|null|undefined} targetWeightKg
 * @returns {{ type: string, message: string } | null}
 */
export function getGoalWeightConflict(primaryGoal, currentWeightKg, targetWeightKg) {
  if (targetWeightKg === null || targetWeightKg === undefined || targetWeightKg === '') {
    return null;
  }
  const current = Number(currentWeightKg);
  const target = Number(targetWeightKg);
  if (!Number.isFinite(current) || current <= 0 || !Number.isFinite(target) || target <= 0) {
    return null;
  }

  const delta = target - current;
  const goal = primaryGoal || '';

  if (MUSCLE_ORIENTED.has(goal) && delta <= -MEANINGFUL_DELTA_KG) {
    return {
      type: 'cut_with_muscle_goal',
      message:
        `Your target is ${Math.abs(delta).toFixed(1)} kg below your current weight, but your goal is building muscle/strength. ` +
        'A large drop is usually a fat-loss plan (or body recomposition), not a classic muscle-gain path. ' +
        'Consider switching the goal to Lose Weight, or set a target closer to your current weight if muscle is the priority.'
    };
  }

  if (LOSS_ORIENTED.has(goal) && delta >= MEANINGFUL_DELTA_KG) {
    return {
      type: 'gain_with_loss_goal',
      message:
        `Your target is ${delta.toFixed(1)} kg above your current weight, but your goal is lose weight. ` +
        'That looks more like a bulk / muscle-gain plan. Consider switching the goal to Build Muscle, or pick a lower target weight.'
    };
  }

  return null;
}

/**
 * Short helper copy under the target-weight field (before a number is entered).
 */
export function targetWeightHintForGoal(primaryGoal) {
  if (MUSCLE_ORIENTED.has(primaryGoal || '')) {
    return 'For muscle/strength goals, targets are often near your current weight or slightly higher. Leave blank if you are not chasing a number.';
  }
  if (LOSS_ORIENTED.has(primaryGoal || '')) {
    return 'For weight loss, a realistic lower target helps coaching. Leave blank if you are not targeting a number.';
  }
  return 'Leave blank if you are not targeting a weight change.';
}

/** FitBot one-liner after the user enters a conflicting target. */
export function fitbotGoalWeightWarning(primaryGoal, currentWeightKg, targetWeightKg) {
  const conflict = getGoalWeightConflict(primaryGoal, currentWeightKg, targetWeightKg);
  if (!conflict) {
    return null;
  }
  if (conflict.type === 'cut_with_muscle_goal') {
    return (
      "Heads-up: that target is a meaningful cut, but you picked build muscle/strength. " +
      "Those can conflict — fat loss vs muscle gain. You can keep it (recomp is a thing), " +
      "or change the goal to Lose Weight if dropping kilos is the real priority. Either way I'll coach you."
    );
  }
  if (conflict.type === 'gain_with_loss_goal') {
    return (
      "Heads-up: that target is higher than you are now, but you picked lose weight. " +
      "Want Build Muscle instead, or a lower target? I'll roll with whatever you choose."
    );
  }
  return conflict.message;
}
