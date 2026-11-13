import { useNavigate } from "react-router-dom";
import { Button } from "@/components/Button.jsx";
import { useAuth } from "@/context/AuthContext.jsx";

export function ProfilePage() {
    const {user, logout} = useAuth();
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate("/login", {replace: true});
    }

    return (
        <section className={"container w-full py-16 flex flex-col gap-6 max-w-xl"}>
            <p className={"text-secondary-text font-bold text-base uppercase tracking-eyebrow"}>Аккаунт</p>
            <h1 className={"text-text font-bold text-4xl"}>Профиль</h1>
            <dl className={"bg-background-surface shadow-card rounded-lg border border-border p-6 flex flex-col gap-4"}>
                <div>
                    <dt className={"text-text-muted text-sm uppercase"}>Email / логин</dt>
                    <dd className={"text-text font-bold break-all"}>{user?.username}</dd>
                </div>
                <div>
                    <dt className={"text-text-muted text-sm uppercase"}>UID</dt>
                    <dd className={"text-text font-mono break-all"}>{user?.uid}</dd>
                </div>
            </dl>
            <div><Button text={"Выйти"} variant={"outline"} onClick={handleLogout} /></div>
        </section>
    );
}
