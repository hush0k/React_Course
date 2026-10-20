import { useState } from "react";
import { Button } from "@/components/Button.jsx";
import { FaArrowRight, FaBolt, FaExchangeAlt, FaRedo, FaWallet } from "react-icons/fa";
import { FiMenu, FiX } from "react-icons/fi";
import { NavLink } from "react-router-dom";

export function Header({season, week, weekIncrement, weekLoading, onNextSeason, seasonOver, fired, onRestart, availableBudget, transferBudgetLeft, power}) {
    const [menuOpen, setMenuOpen] = useState(false);

    const links = [
        {to: "/", title: "Клуб"},
        {to: "/team", title: "Команда"},
        {to: "/academy", title: "Академия"},
        {to: "/stadium", title: "Стадион"},
        {to: "/market", title: "Маркет"},
        {to: "/history", title: "История"},
    ]

    const stats = [
        {icon: <FaWallet />, label: "Бюджет", value: `€ ${Math.round(availableBudget)} млн`},
        {icon: <FaExchangeAlt />, label: "Трансферы", value: `€ ${Math.round(transferBudgetLeft)} млн`},
        {icon: <FaBolt />, label: "Сила", value: power === null ? "—" : Math.round(power)},
    ]

    const statsBox = (
        <div className={"flex flex-row items-center rounded-lg bg-primary-800 border border-secondary/30 divide-x divide-secondary/20"}>
            {stats.map((stat) => (
                <div key={stat.label} className={"flex flex-row items-center gap-2 px-3 py-1.5 flex-1"}>
                    <span className={"text-secondary text-sm"}>{stat.icon}</span>
                    <div className={"flex flex-col leading-tight"}>
                        <span className={"text-[10px] uppercase tracking-wider text-text-inverse-muted"}>{stat.label}</span>
                        <span className={"text-sm font-bold text-text-inverse whitespace-nowrap"}>{stat.value}</span>
                    </div>
                </div>
            ))}
        </div>
    );

    const linkClass = ({isActive}) => "cursor-pointer hover:text-text-inverse uppercase text-base" +
        " font-semibold whitespace-nowrap hover:border-b-2 hover:border-secondary-light " +
        (isActive ? "text-text-inverse border-b-2 border-secondary-light" : "text-text-inverse-muted");

    return (
       <div className={"sticky top-0 z-50 w-full bg-primary border-b-3 border-b-secondary"}>
           <div className={"flex flex-row items-center justify-between gap-3 px-4 lg:px-20 py-2.5 min-h-16 lg:min-h-20"}>
               <div className={"flex flex-row items-center justify-start space-x-3 min-w-0"}>
                   <img src={`${import.meta.env.BASE_URL}real_madrid.svg`} alt="logo" className={"h-10 w-10 lg:h-12 lg:w-12 shrink-0"}/>

                   <div className={"flex flex-col text-text-inverse min-w-0"}>
                       <h1 className={"font-semibold text-lg lg:text-xl pb-0 truncate"}>Madrid Manager</h1>
                       <p className={"uppercase text-xs lg:text-sm text-text-inverse-muted truncate"}>Сезон {season} - Неделя {week}</p>
                   </div>
               </div>

               <nav className={"hidden xl:flex flex-row items-center justify-center gap-4 h-full"}>
                   {links.map((link) => (
                       <NavLink key={link.to} to={link.to} end={link.to === "/"} className={linkClass}>
                           {link.title}
                       </NavLink>
                   ))}
               </nav>

               <div className={"flex flex-row items-center gap-2 lg:gap-3 shrink-0"}>
                   <div className={"hidden lg:block"}>{statsBox}</div>
                   <Button
                       text={"Перезапуск"}
                       icon={<FaRedo />}
                       onClick={onRestart}
                       variant={"danger"}
                       className={"hidden md:inline-flex"}
                   />
                   <Button
                       size={"icon"}
                       onClick={onRestart}
                       variant={"danger"}
                       className={"md:hidden"}
                       aria-label={"Перезапуск"}
                   >
                       <FaRedo />
                   </Button>
                   <Button
                       text={weekLoading ? "Играем тур…" : fired ? "Начать заново" : seasonOver ? "След. сезон" : "След. неделя"}
                       icon={weekLoading
                           ? <span className={"size-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin"}></span>
                           : <FaArrowRight />}
                       onClick={seasonOver ? onNextSeason : weekIncrement}
                       disabled={weekLoading}
                       aria-busy={weekLoading}
                       variant={"secondary"}
                       className={"font-black max-sm:px-3 max-sm:text-sm"}
                   />
                   <button
                       type={"button"}
                       onClick={() => setMenuOpen(open => !open)}
                       aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
                       aria-expanded={menuOpen}
                       className={"xl:hidden flex items-center justify-center h-10 w-10 rounded-md text-text-inverse hover:bg-primary-800"}
                   >
                       {menuOpen ? <FiX size={24}/> : <FiMenu size={24}/>}
                   </button>
               </div>
           </div>

           {menuOpen && (
               <div className={"xl:hidden flex flex-col gap-4 px-4 lg:px-20 pb-4 border-t border-secondary/20"}>
                   <nav className={"flex flex-col gap-1 pt-3"}>
                       {links.map((link) => (
                           <NavLink
                               key={link.to}
                               to={link.to}
                               end={link.to === "/"}
                               onClick={() => setMenuOpen(false)}
                               className={({isActive}) => "uppercase text-base font-semibold py-2 px-2 rounded-md " +
                                   (isActive ? "text-text-inverse bg-primary-800" : "text-text-inverse-muted hover:text-text-inverse")}
                           >
                               {link.title}
                           </NavLink>
                       ))}
                   </nav>
                   <div className={"lg:hidden"}>{statsBox}</div>
               </div>
           )}
       </div>
    )
}
