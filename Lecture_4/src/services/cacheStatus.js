const listeners = new Set();
let showingCachedData = false;

export function subscribeToCacheStatus(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

export function isShowingCachedData() {
    return showingCachedData;
}

export function setShowingCachedData(value) {
    if (value === showingCachedData) return;
    showingCachedData = value;
    listeners.forEach((listener) => listener());
}
