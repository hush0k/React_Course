const CHECK_TIMEOUT = 5000;

export async function checkConnection() {
    try {
        const response = await fetch(`${import.meta.env.BASE_URL}manifest.json?ping=${Date.now()}`, {
            cache: "no-store",
            signal: AbortSignal.timeout(CHECK_TIMEOUT),
        });
        return response.ok;
    } catch {
        return false;
    }
}

export function onReconnect(callback) {
    window.addEventListener("online", callback);
    return () => window.removeEventListener("online", callback);
}
