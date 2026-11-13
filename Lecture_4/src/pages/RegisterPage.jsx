import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { FiUserPlus } from "react-icons/fi";
import { Button } from "@/components/Button.jsx";
import { GoogleButton } from "@/components/GoogleButton.jsx";
import { AuthCard, AuthError, AuthField } from "@/components/AuthCard.jsx";
import { register, loginWithGoogle } from "@/services/service.js";
import { getToken } from "@/services/token.js";
import { validatePassword, validateUsername } from "@/services/authValidation.js";

export function RegisterPage() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [touched, setTouched] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    if (getToken()) return <Navigate to={"/"} replace />;

    const errors = {
        username: validateUsername(username.trim()),
        password: validatePassword(password),
        confirm: confirm !== password ? "Пароли не совпадают" : null,
    };
    const hasErrors = Object.values(errors).some(Boolean);

    async function handleSubmit(e) {
        e.preventDefault();
        setTouched(true);
        if (hasErrors || loading) return;

        setLoading(true);
        setError(null);
        const result = await register(username.trim(), password);
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
            icon={<FiUserPlus />}
            title={"Регистрация"}
            subtitle={"Создайте аккаунт, чтобы начать карьеру менеджера"}
            footer={<>Уже есть аккаунт? <Link to={"/login"} className={"font-semibold text-primary underline"}>Войти</Link></>}
        >
            <form className={"flex flex-col gap-4"} onSubmit={handleSubmit} noValidate>
                <AuthField
                    label={"Имя пользователя"}
                    autoComplete={"username"}
                    placeholder={"manager"}
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    disabled={loading}
                    error={touched && errors.username}
                />
                <AuthField
                    label={"Пароль"}
                    type={"password"}
                    autoComplete={"new-password"}
                    placeholder={"••••••••"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    disabled={loading}
                    error={touched && errors.password}
                />
                <AuthField
                    label={"Повторите пароль"}
                    type={"password"}
                    autoComplete={"new-password"}
                    placeholder={"••••••••"}
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    disabled={loading}
                    error={touched && errors.confirm}
                />
                <AuthError>{error}</AuthError>
                <Button
                    type={"submit"}
                    text={loading ? "Создаём аккаунт..." : "Зарегистрироваться"}
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
