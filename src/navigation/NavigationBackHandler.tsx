import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { useFlow } from "@stackflow/react";
import { useCallback, useEffect } from "react";
import { performBackNavigation } from "./performBackNavigation";
import { useTopActivity } from "./useTopActivity";

export function NavigationBackHandler() {
  const flow = useFlow();
  const topActivity = useTopActivity();
  const isRoot = topActivity?.isRoot ?? true;

  const handleBack = useCallback(() => {
    performBackNavigation({
      isRoot,
      pop: () => flow.pop(),
    });
  }, [flow, isRoot]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const listener = App.addListener("backButton", () => {
      handleBack();
    });

    return () => {
      void listener.then((subscription) => subscription.remove());
    };
  }, [handleBack]);

  return null;
}
