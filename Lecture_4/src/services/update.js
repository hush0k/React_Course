import { registerSW } from "virtual:pwa-register";

const listeners = new Set();
let updateAvailable = false;

const updateServiceWorker = registerSW({
    onNeedRefresh() {
        updateAvailable = true;
        listeners.forEach((listener) => listener());
    },
    onRegisteredSW(url, registration) {
        if (!registration) return;
        const check = () => registration.update();
        setInterval(check, 5 * 60 * 1000);
        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "visible") check();
        });
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
