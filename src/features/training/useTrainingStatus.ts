import { useAppSelector } from "src/store";

/**
 * Mandatory training progress of the logged user, derived from the counts the
 * backend ships in the authentication payload (and refreshed by the finish-item
 * response, see TrainingPlayer).
 *
 * `mandatoryTotal === 0` covers every "nothing to do" case at once: a schema
 * with no mandatory module, a pre-existing user that only new-user modules
 * target, a user enrolled before any content was published, and the feature
 * being switched off. So there is nothing to fetch and nothing to guard.
 */
export function useTrainingStatus() {
  const training = useAppSelector((state: any) => state.user.account.training);

  const total = training?.mandatoryTotal ?? 0;
  const finished = training?.mandatoryFinished ?? 0;

  return {
    isPending: finished < total,
    isCompleted: total > 0 && finished === total,
    remaining: Math.max(total - finished, 0),
  };
}
