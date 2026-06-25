import type {
  InferActivityParams,
  RegisteredActivityName,
} from "@stackflow/config";
import { useActivity, useFlow } from "@stackflow/react";
import {
  canPerformBackNavigation,
  performBackNavigation,
} from "./performBackNavigation";

export type { ActivityName, ActivityParams } from "./activityParams";

export function useAppNavigation() {
  const flow = useFlow();
  const activity = useActivity();
  const isRoot = activity?.isRoot ?? true;

  return {
    navigate<Name extends RegisteredActivityName>(
      name: Name,
      params: InferActivityParams<Name>,
    ) {
      return flow.push(name, params);
    },
    replace<Name extends RegisteredActivityName>(
      name: Name,
      params: InferActivityParams<Name>,
    ) {
      return flow.replace(name, params);
    },
    canGoBack() {
      return canPerformBackNavigation(isRoot);
    },
    goBack() {
      performBackNavigation({
        isRoot,
        pop: () => flow.pop(),
      });
    },
    goBackOrExit() {
      performBackNavigation({
        isRoot,
        pop: () => flow.pop(),
      });
    },
    pop() {
      flow.pop();
    },
  };
}
