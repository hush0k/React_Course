import { registerSW } from "virtual:pwa-register";

const listeners = new Set();
let updateAvailable = false;

const updateServiceWorker = registerSW({
    onNeedRefresh() {
        updateAvailable = true;
        listeners.forEach((listener) => listener());
    },
});

export function subscribeToUpdate(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

export function isUpdateAvailable() {
    return updateAvailable;
}

export function applyUpdate() {
    return updateServiceWorker(true);
}
