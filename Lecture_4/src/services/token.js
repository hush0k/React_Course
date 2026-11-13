const TOKEN_KEY = "madrid-manager-token";

export function getToken() {
    try {
        return localStorage.getItem(TOKEN_KEY);
    } catch {
        return null;
    }
}

export function setToken(token) {
    try {
        localStorage.setItem(TOKEN_KEY, token);
    } catch {

    }
}

export function clearToken() {
    try {
        localStorage.removeItem(TOKEN_KEY);
    } catch {

    }
}

export function authHeaders(headers = {}) {
    const token = getToken();
    return token ? {...headers, Authorization: `Bearer ${token}`} : headers;
}

export function handleUnauthorized(response) {
    if (response.status === 401 && getToken()) {
        clearToken();
        window.location.hash = "#/login";
    }
}

function decodeBase64Url(part) {
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - base64.length % 4) % 4);
    return decodeURIComponent(
        atob(padded).split("").map(c => "%" + c.charCodeAt(0).toString(16).padStart(2, "0")).join(""),
    );
}

/** Декодирует payload JWT без проверки подписи (подпись проверяет сервер). */
export function decodeToken(token) {
    try {
        return JSON.parse(decodeBase64Url(token.split(".")[1]));
    } catch {
        return null;
    }
}
