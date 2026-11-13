import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { FiLock } from "react-icons/fi";
import { Button } from "@/components/Button.jsx";
import { GoogleButton } from "@/components/GoogleButton.jsx";
import { AuthCard, AuthError, AuthField } from "@/components/AuthCard.jsx";
import { login, loginWithGoogle } from "@/services/service.js";
import { getToken } from "@/services/token.js";

export function LoginPage() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    if (getToken()) return <Navigate to={"/"} replace />;

    async function handleSubmit(e) {
        e.preventDefault();
        if (loading) return;
        if (!username.trim() || !password) {
            setError("Введите имя пользователя и пароль");
            return;
        }

        setLoading(true);
        setError(null);
        const result = await login(username.trim(), password);
        setLoading(false);
        if (!result.ok) {
            setError(result.error);
            return;
        }
        navigate("/", {replace: true});
    }

    async function handleGoogle(credential) {
        if (loading) return;
        setLoading(true);
        setError(null);
        const result = await loginWithGoogle(credential);
        setLoading(false);
        if (!result.ok) {
            setError(result.error);
            return;
        }
        navigate("/", {replace: true});
    }

    return (
        <AuthCard
            icon={<FiLock />}
            title={"Вход"}
            subtitle={"Войдите, чтобы продолжить карьеру менеджера"}
            footer={<>Нет аккаунта? <Link to={"/register"} className={"font-semibold text-primary underline"}>Зарегистрироваться</Link></>}
        >
            <form className={"flex flex-col gap-4"} onSubmit={handleSubmit} noValidate>
                <AuthField
                    label={"Имя пользователя"}
                    autoComplete={"username"}
                    placeholder={"manager"}
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    disabled={loading}
                />
                <AuthField
                    label={"Пароль"}
                    type={"password"}
                    autoComplete={"current-password"}
                    placeholder={"••••••••"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    disabled={loading}
                />
                <AuthError>{error}</AuthError>
                <Button
                    type={"submit"}
                    text={loading ? "Входим..." : "Войти"}
                    variant={"secondary"}
                    disabled={loading}
                    className={"w-full justify-center"}
                />
            </form>
            <div className={"mt-4 flex flex-col gap-4"}>
                <GoogleButton onCredential={handleGoogle} disabled={loading} />
            </div>
        </AuthCard>
    );
}
