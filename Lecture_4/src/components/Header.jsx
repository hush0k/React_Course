import { useEffect, useState } from "react";
import { Button } from "@/components/Button.jsx";
import { FaArrowRight, FaBolt, FaExchangeAlt, FaRedo, FaWallet } from "react-icons/fa";
import { FiMenu, FiX } from "react-icons/fi";
import { NavBar } from "@/components/NavBar.jsx";
import { ConnectionStatus } from "@/components/ConnectionStatus.jsx";
import { cn } from "@/lib/utils.js";

export function Header({season, week, weekIncrement, weekLoading, onNextSeason, seasonOver, fired, onRestart, availableBudget, transferBudgetLeft, power}) {
    const [menuOpen, setMenuOpen] = useState(false);

    const closeMenu = () => setMenuOpen(false);

    useEffect(() => {
        if (!menuOpen || !window.matchMedia("(max-width: 1023px)").matches) return;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, [menuOpen]);

    const stats = [
        {icon: <FaWallet />, label: "Бюджет", value: `€ ${Math.round(availableBudget)} млн`},
        {icon: <FaExchangeAlt />, label: "Трансферы", value: `€ ${Math.round(transferBudgetLeft)} млн`},
        {icon: <FaBolt />, label: "Сила", value: power === null ? "—" : Math.round(power)},
    ]

    const statsBox = (
        <div className={"flex flex-col xl:flex-row xl:items-center rounded-lg bg-primary-800 border border-secondary/30 divide-y xl:divide-y-0 xl:divide-x divide-secondary/20"}>
            {stats.map((stat) => (
                <div key={stat.label} className={"flex flex-row items-center gap-2 px-3 py-1.5 xl:flex-1"}>
                    <span className={"text-secondary text-sm"}>{stat.icon}</span>
                    <div className={"flex flex-col leading-tight"}>
                        <span className={"text-[10px] uppercase tracking-wider text-text-inverse-muted"}>{stat.label}</span>
                        <span className={"text-sm font-bold text-text-inverse whitespace-nowrap"}>{stat.value}</span>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
       <div className={"sticky top-0 z-50 w-full bg-primary border-b-3 border-b-secondary"}>
           <div className={"flex flex-row items-center justify-between gap-3 px-4 lg:px-10 2xl:px-20 py-2.5 min-h-16 lg:min-h-20"}>
               <div className={"flex flex-row items-center justify-start gap-3 min-w-0"}>
                   <img src={`${import.meta.env.BASE_URL}real_madrid.svg`} alt="logo" className={"h-10 w-10 lg:h-12 lg:w-12 shrink-0"}/>

                   <div className={"hidden min-[380px]:flex flex-col text-text-inverse min-w-0"}>
                       <h1 className={"font-semibold text-lg lg:text-xl pb-0 truncate"}>Madrid Manager</h1>
                       <p className={"uppercase text-xs lg:text-sm text-text-inverse-muted truncate"}>Сезон {season} - Неделя {week}</p>
                   </div>
               </div>

               <div className={"flex flex-row items-center gap-2 lg:gap-3 shrink-0"}>
                   <ConnectionStatus />
                   <div className={"hidden xl:block"}>{statsBox}</div>
                   <Button
                       text={"Перезапуск"}
                       icon={<FaRedo />}
                       onClick={onRestart}
                       variant={"danger"}
                       className={"hidden md:inline-flex"}
                   />
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
                       className={"flex items-center justify-center size-11 rounded-md text-text-inverse hover:bg-primary-800"}
                   >
                       {menuOpen ? <FiX size={24}/> : <FiMenu size={24}/>}
                   </button>
               </div>
           </div>

           {menuOpen && (
               <div className={"hidden lg:block"}>
                   <div className={"fixed inset-0 -z-10"} onClick={closeMenu}></div>
                   <div className={"absolute right-10 2xl:right-20 top-full w-72 flex flex-col gap-4 px-4 pb-4 border border-t-0 border-secondary/30 rounded-b-lg bg-primary shadow-card"}>
                       <NavBar onNavigate={closeMenu} />
                       <div className={"xl:hidden"}>{statsBox}</div>
                   </div>
               </div>
           )}

           <div className={cn("lg:hidden fixed inset-0 z-20 transition-all duration-300", menuOpen ? "visible opacity-100" : "invisible opacity-0")}>
               <div className={"absolute inset-0 bg-black/60"} onClick={closeMenu}></div>
               <aside className={cn("absolute inset-y-0 right-0 flex w-80 max-w-[85%] flex-col gap-5 overflow-y-auto bg-primary border-l border-secondary/30 shadow-card p-5 transition-transform duration-300", menuOpen ? "translate-x-0" : "translate-x-full")}>
                   <div className={"flex flex-row items-center justify-between gap-3 pb-4 border-b border-secondary/20"}>
                       <div className={"flex flex-row items-center gap-3 min-w-0"}>
                           <img src={`${import.meta.env.BASE_URL}real_madrid.svg`} alt="logo" className={"h-10 w-10 shrink-0"}/>
                           <div className={"flex flex-col text-text-inverse min-w-0"}>
                               <p className={"font-semibold text-lg truncate"}>Madrid Manager</p>
                               <p className={"uppercase text-xs text-text-inverse-muted truncate"}>Сезон {season} - Неделя {week}</p>
                           </div>
                       </div>
                       <button
                           type={"button"}
                           onClick={closeMenu}
                           aria-label={"Закрыть меню"}
                           className={"flex items-center justify-center size-11 shrink-0 rounded-md text-text-inverse hover:bg-primary-800"}
                       >
                           <FiX size={24}/>
                       </button>
                   </div>
                   <NavBar onNavigate={closeMenu} />
                   {statsBox}
                   <Button
                       text={"Перезапуск"}
                       icon={<FaRedo />}
                       onClick={() => {
                           closeMenu();
                           onRestart();
                       }}
                       variant={"danger"}
                       className={"mt-auto w-full"}
                   />
               </aside>
           </div>
       </div>
    )
}
