import { Button } from "@/components/Button.jsx";
import { FaArrowRight, FaRedo } from "react-icons/fa";

export function Header({week, weekIncrement, seasonOver, onRestart}) {
    const links = [
        {id: "club", title: "Клуб"},
        {id: "matches", title: "Матчи"},
        {id: "line_up", title: "Состав"},
        {id: "staff", title: "Тренерский штаб"},
        {id: "stadium", title: "Стадион"},
        {id: "market", title: "Маркет"},
    ]

    const scrollTo = (id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    };

    return (
       <div className={"flex flex-row bg-primary px-20 py-2.5 items-center justify-between border-b-3 border-b-secondary" +
           " top-0 z-50 w-full h-20 sticky"}>
            <div className={"flex flex-row items-center justify-start space-x-3"}>
                <img src={`${import.meta.env.BASE_URL}real_madrid.svg`} alt="logo" className={"h-12 w-12"}/>

                <div className={"flex flex-col text-text-inverse"}>
                    <h1 className={"font-semibold text-xl pb-0"}>Madrid Manager</h1>
                    <p className={"uppercase text-sm text-text-inverse-muted"}>Сезон 2026/27 - Неделя {week}</p>
                </div>
            </div>

           <nav className={"flex flex-row items-center justify-center gap-4 h-full"}>
               {links.map((link) => (
                   <a className={"cursor-pointer text-text-inverse-muted hover:text-text-inverse uppercase text-base" +
                       " font-semibold whitespace-nowrap hover:border-b-2 hover:border-secondary-light"} key={link.id}
                      onClick={() => scrollTo(link.id)}>{link.title}</a>
               ))}
           </nav>

          <div className={"flex flex-row items-center gap-3"}>
              <Button
                  text={"Перезапуск"}
                  icon={<FaRedo />}
                  onClick={onRestart}
                  variant={"danger"}
              />
              <Button
                  text={seasonOver ? "Сезон окончен" : "След. неделя"}
                  icon={<FaArrowRight />}
                  onClick={weekIncrement}
                  disabled={seasonOver}
                  variant={"secondary"}
                  className={"font-black"}
              />
          </div>
       </div>
    )
}