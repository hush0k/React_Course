import { useSyncExternalStore } from "react";
import { isShowingCachedData, subscribeToCacheStatus } from "@/services/cacheStatus.js";

export function useCachedData() {
    return useSyncExternalStore(subscribeToCacheStatus, isShowingCachedData, () => false);
}
