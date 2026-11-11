import { NavLink, useNavigate } from "react-router-dom";
import { clearToken } from "@/services/token.js";

const links = [
    {to: "/", title: "Клуб"},
    {to: "/team", title: "Команда"},
    {to: "/academy", title: "Академия"},
    {to: "/stadium", title: "Стадион"},
    {to: "/market", title: "Маркет"},
    {to: "/history", title: "История"},
]

const desktopLinkClass = ({isActive}) => "cursor-pointer hover:text-text-inverse uppercase text-base" +
    " font-semibold whitespace-nowrap hover:border-b-2 hover:border-secondary-light " +
    (isActive ? "text-text-inverse border-b-2 border-secondary-light" : "text-text-inverse-muted");

const mobileLinkClass = ({isActive}) => "uppercase text-base font-semibold py-2 px-2 rounded-md " +
    (isActive ? "text-text-inverse bg-primary-800" : "text-text-inverse-muted hover:text-text-inverse");

export function NavBar({mobile = false, onNavigate}) {
    const navigate = useNavigate();

    function handleLogout() {
        clearToken();
        onNavigate?.();
        navigate("/login", {replace: true});
    }

    return (
        <nav className={mobile
            ? "flex flex-col gap-1 pt-3"
            : "hidden xl:flex flex-row items-center justify-center gap-4 h-full"}>
            {links.map((link) => (
                <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === "/"}
                    onClick={onNavigate}
                    className={mobile ? mobileLinkClass : desktopLinkClass}
                >
                    {link.title}
                </NavLink>
            ))}
            <button
                type={"button"}
                onClick={handleLogout}
                className={mobile
                    ? "text-left uppercase text-base font-semibold py-2 px-2 rounded-md text-text-inverse-muted hover:text-text-inverse cursor-pointer"
                    : "cursor-pointer uppercase text-base font-semibold whitespace-nowrap text-text-inverse-muted hover:text-text-inverse"}
            >
                Выйти
            </button>
        </nav>
    );
}
