import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext.jsx";

const links = [
    {to: "/", title: "Клуб"},
    {to: "/team", title: "Команда"},
    {to: "/academy", title: "Академия"},
    {to: "/stadium", title: "Стадион"},
    {to: "/market", title: "Маркет"},
    {to: "/history", title: "История"},
]

const linkClass = ({isActive}) => "uppercase text-base font-semibold py-2 px-2 rounded-md " +
    (isActive ? "text-text-inverse bg-primary-800" : "text-text-inverse-muted hover:text-text-inverse");

export function NavBar({onNavigate}) {
    const navigate = useNavigate();
    const {isAuthenticated, logout} = useAuth();

    function handleLogout() {
        logout();
        onNavigate?.();
        navigate("/login", {replace: true});
    }

    return (
        <nav className={"flex flex-col gap-1 pt-3"}>
            {links.map((link) => (
                <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === "/"}
                    onClick={onNavigate}
                    className={linkClass}
                >
                    {link.title}
                </NavLink>
            ))}
            {isAuthenticated ? (
                <>
                    <NavLink to={"/profile"} onClick={onNavigate} className={linkClass}>
                        Профиль
                    </NavLink>
                    <button
                        type={"button"}
                        onClick={handleLogout}
                        className={"text-left uppercase text-base font-semibold py-2 px-2 rounded-md text-text-inverse-muted hover:text-text-inverse cursor-pointer"}
                    >
                        Выйти
                    </button>
                </>
            ) : (
                <>
                    <NavLink to={"/login"} onClick={onNavigate} className={linkClass}>
                        Войти
                    </NavLink>
                    <NavLink to={"/signup"} onClick={onNavigate} className={linkClass}>
                        Регистрация
                    </NavLink>
                </>
            )}
        </nav>
    );
}
