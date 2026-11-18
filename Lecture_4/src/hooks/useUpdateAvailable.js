import { useSyncExternalStore } from "react";
import { isUpdateAvailable, subscribeToUpdate } from "@/services/update.js";

export function useUpdateAvailable() {
    return useSyncExternalStore(subscribeToUpdate, isUpdateAvailable, () => false);
}
