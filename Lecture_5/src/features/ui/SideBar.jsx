import { NavLink } from "react-router-dom";
import { FaUsers } from "react-icons/fa";
import { IoSettingsSharp } from "react-icons/io5";
import { MdHistory, MdOutlineGroup } from "react-icons/md";
import { FaRegCircleUser } from "react-icons/fa6";

const navBars = [
    { logo: <FaUsers />, name: "All users", link: "/" },
    { logo: <FaRegCircleUser />, name: "My profile", link: "/profile"},
    { logo: <MdHistory />, name: "Recent contacts", link: "/recent"},
    { logo: <MdOutlineGroup />, name: "Groups", link: "/groups" },
    { logo: <IoSettingsSharp />, name: "Settings", link: "/settings" },
];

export function SideBar() {
    return (
        <div className="w-full md:w-64 lg:w-80 shrink-0 px-3 pt-3 md:py-8">
            {/* на мобильных меню становится горизонтальной прокручиваемой полосой */}
            <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-1 md:pb-0">
                {navBars.map((nav, i) => (
                    <NavLink
                        key={i}
                        to={nav.link}
                        end
                        className={({ isActive }) => `${isActive ? "bg-gray-300 text-primary" : "text-gray-700"} flex flex-row items-center justify-start shrink-0 whitespace-nowrap md:w-full px-3 py-1 rounded-xl cursor-pointer hover:bg-gray-200 focus:outline-none text-md gap-3`}
                    >
                        {nav.logo}
                        {nav.name}
                    </NavLink>
                ))}
            </nav>
        </div>
    );
}
