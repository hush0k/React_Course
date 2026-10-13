import { Button } from "@/components/Button.jsx";
import { FaArrowRight, FaBolt, FaExchangeAlt, FaRedo, FaWallet } from "react-icons/fa";
import { NavLink } from "react-router-dom";

export function Header({season, week, weekIncrement, onNextSeason, seasonOver, fired, onRestart, availableBudget, transferBudgetLeft, power}) {
    const links = [
        {to: "/", title: "Клуб"},
        {to: "/team", title: "Команда"},
        {to: "/stadium", title: "Стадион"},
        {to: "/market", title: "Маркет"},
        {to: "/history", title: "История"},
    ]

    const stats = [
        {icon: <FaWallet />, label: "Бюджет", value: `€ ${Math.round(availableBudget)} млн`},
        {icon: <FaExchangeAlt />, label: "Трансферы", value: `€ ${Math.round(transferBudgetLeft)} млн`},
        {icon: <FaBolt />, label: "Сила", value: power === null ? "—" : Math.round(power)},
    ]

    return (
       <div className={"flex flex-row bg-primary px-20 py-2.5 items-center justify-between border-b-3 border-b-secondary" +
           " top-0 z-50 w-full h-20 sticky"}>
            <div className={"flex flex-row items-center justify-start space-x-3"}>
                <img src={`${import.meta.env.BASE_URL}real_madrid.svg`} alt="logo" className={"h-12 w-12"}/>

                <div className={"flex flex-col text-text-inverse"}>
                    <h1 className={"font-semibold text-xl pb-0"}>Madrid Manager</h1>
                    <p className={"uppercase text-sm text-text-inverse-muted"}>Сезон {season} - Неделя {week}</p>
                </div>
            </div>

           <nav className={"flex flex-row items-center justify-center gap-4 h-full"}>
               {links.map((link) => (
                   <NavLink
                       key={link.to}
                       to={link.to}
                       end={link.to === "/"}
                       className={({isActive}) => "cursor-pointer hover:text-text-inverse uppercase text-base" +
                           " font-semibold whitespace-nowrap hover:border-b-2 hover:border-secondary-light " +
                           (isActive ? "text-text-inverse border-b-2 border-secondary-light" : "text-text-inverse-muted")}
                   >
                       {link.title}
                   </NavLink>
               ))}
           </nav>

          <div className={"flex flex-row items-center gap-3"}>
              <div className={"flex flex-row items-center rounded-lg bg-primary-800 border border-secondary/30 divide-x divide-secondary/20"}>
                  {stats.map((stat) => (
                      <div key={stat.label} className={"flex flex-row items-center gap-2 px-3 py-1.5"}>
                          <span className={"text-secondary text-sm"}>{stat.icon}</span>
                          <div className={"flex flex-col leading-tight"}>
                              <span className={"text-[10px] uppercase tracking-wider text-text-inverse-muted"}>{stat.label}</span>
                              <span className={"text-sm font-bold text-text-inverse whitespace-nowrap"}>{stat.value}</span>
                          </div>
                      </div>
                  ))}
              </div>
              <Button
                  text={"Перезапуск"}
                  icon={<FaRedo />}
                  onClick={onRestart}
                  variant={"danger"}
              />
              <Button
                  text={fired ? "Начать заново" : seasonOver ? "След. сезон" : "След. неделя"}
                  icon={<FaArrowRight />}
                  onClick={seasonOver ? onNextSeason : weekIncrement}
                  variant={"secondary"}
                  className={"font-black"}
              />
          </div>
       </div>
    )
}