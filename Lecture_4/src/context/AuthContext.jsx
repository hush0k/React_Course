import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { login as apiLogin, loginWithGoogle, register as apiRegister } from "@/services/service.js";
import { clearToken, decodeToken, getToken } from "@/services/token.js";

const AuthContext = createContext(null);

// Пользователь строится из JWT: sub — UID, username/email/name — отображаемое имя
function readUser() {
    const token = getToken();
    if (!token) return null;
    const payload = decodeToken(token);
    if (!payload || (payload.exp && payload.exp * 1000 < Date.now())) {
        clearToken();
        return null;
    }
    return {
        uid: String(payload.sub ?? payload.user_id ?? payload.id ?? "—"),
        username: payload.username ?? payload.email ?? payload.name ?? String(payload.sub ?? "—"),
        expiresAt: payload.exp ? new Date(payload.exp * 1000) : null,
    };
}

export function AuthProvider({children}) {
    const queryClient = useQueryClient();
    const [user, setUser] = useState(readUser); // сессия восстанавливается синхронно из токена
    const [loading] = useState(false);
    const [error, setError] = useState(null);

    // 401 из сервисов или другая вкладка очистили токен — синхронизируем состояние
    useEffect(() => {
        const sync = () => setUser(readUser());
        window.addEventListener("storage", sync);
        window.addEventListener("hashchange", sync);
        return () => {
            window.removeEventListener("storage", sync);
            window.removeEventListener("hashchange", sync);
        };
    }, []);

    const finish = useCallback(async action => {
        setError(null);
        const result = await action();
        if (!result.ok) {
            setError(result.error);
            return result;
        }
        queryClient.clear();
        setUser(readUser());
        return result;
    }, [queryClient]);

    const value = useMemo(() => ({
        user,
        loading,
        error,
        isAuthenticated: !!user,
        clearError: () => setError(null),
        login: (username, password) => finish(() => apiLogin(username, password)),
        signup: (username, password) => finish(() => apiRegister(username, password)),
        loginWithGoogle: credential => finish(() => loginWithGoogle(credential)),
        logout() {
            clearToken();
            queryClient.clear();
            setUser(null);
        },
    }), [user, loading, error, finish, queryClient]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used inside AuthProvider");
    return context;
}
