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
        // storage unavailable — token lives only for this session
    }
}

export function clearToken() {
    try {
        localStorage.removeItem(TOKEN_KEY);
    } catch {
        // ignore
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
