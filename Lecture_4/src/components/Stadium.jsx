import { Button } from "@/components/Button.jsx";

export function Stadium({upgrades, budget, bonuses, onUpgrade}) {
    const stadiumData = [
        {name: "Вместимость", content: "83 186 мест"},
        {name: "Открыт", content: "14 декабря 1947"},
        {name: "Конструкция", content: "Выдвижная крыша"},
        {name: "Газон", content: "Выдвижной, гибрид"},
        {name: "Владелец", content: "Real Madrid CF"},
        {name: "Расходы на содержание", content: "€ 3,2 млн/мес"},
    ]

    const effectTypes = {
        income: "доход за победу",
        fans: "прирост болельщиков",
    }

    return (
        <section id={"stadium"} className={"flex flex-col space-y-8 p-20 w-full scroll-mt-20"}>
            <div className={"flex flex-col space-y-1 uppercase"}>
                <p className={"text-secondary-text font-bold text-base tracking-wide"}>инфраструктура</p>
                <h2 className={"text-text font-bold text-8xl"}>Стадион</h2>
            </div>

            <div className={"flex flex-row bg-background-surface shadow-card rounded-xl border border-border w-full overflow-hidden"}>
                <img src={`${import.meta.env.BASE_URL}santiago.webp`} alt="Сантьяго Бернабеу" className={"w-[45%] h-[23rem] object-cover"}/>

                <div className={"flex flex-col w-[55%] p-10 space-y-6"}>
                    <div className={"flex flex-row items-start justify-between"}>
                        <div>
                            <h3 className={"text-text font-bold text-6xl"}>Сантьяго Бернабеу</h3>
                            <p className={"text-text-secondary text-base"}>Пасео де ла Кастельяна, 144 · Мадрид</p>
                        </div>
                        <p className={"bg-primary text-secondary-light uppercase text-xs font-bold tracking-wide rounded-sm px-3 py-2 whitespace-nowrap"}>в собственности</p>
                    </div>

                    <div className={"grid grid-cols-3 gap-x-6"}>
                        {stadiumData.map((item) => (
                            <div key={item.name} className={"flex flex-col space-y-1 border-t border-border py-4"}>
                                <p className={"text-text-muted uppercase text-xs font-bold tracking-widest"}>{item.name}</p>
                                <p className={"text-text text-xl font-bold"}>{item.content}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className={"flex flex-row items-end justify-between"}>
                <p className={"text-text-muted uppercase text-sm font-bold tracking-widest"}>Улучшения</p>
                <p className={"text-text-secondary text-sm"}>
                    Доход за победу: <b className={"text-text"}>× {bonuses.incomeBonus} = € {bonuses.winReward} млн</b> ·
                    Прирост болельщиков: <b className={"text-text"}>× {bonuses.fansBonus}</b>
                </p>
            </div>

            <div className={"grid grid-cols-4 gap-5 w-full"}>
                {upgrades.map((upgrade) => {
                    const isMax = upgrade.level >= upgrade.maxLevel;
                    const nextMultiplier = Math.round((upgrade.multiplier + upgrade.multiplierStep) * 100) / 100;

                    return (
                        <div key={upgrade.name} className={"flex flex-col space-y-4 bg-background-surface shadow-soft rounded-lg border border-border p-5"}>
                            <div className={"flex flex-row items-center justify-between"}>
                                <p className={"text-text text-lg font-bold"}>{upgrade.name}</p>
                                <p className={"bg-primary text-secondary-light font-display font-bold uppercase text-base rounded-sm px-2 py-0.5"}>
                                    ур. {upgrade.level}/{upgrade.maxLevel}
                                </p>
                            </div>

                            <div className={"flex flex-row space-x-1.5"}>
                                {Array.from({length: upgrade.maxLevel}).map((_, index) => (
                                    <div key={index} className={`h-1.5 w-full rounded-full ${index < upgrade.level ? "bg-secondary" : "bg-background-subtle"}`}></div>
                                ))}
                            </div>

                            <div className={"flex flex-col space-y-1 flex-1"}>
                                <p className={"text-text-secondary text-sm"}>{upgrade.description}</p>
                                <p className={"text-secondary-text text-sm font-bold"}>× {upgrade.multiplier}{isMax ? "" : ` → × ${nextMultiplier}`} {effectTypes[upgrade.type]}</p>
                            </div>

                            <div className={"flex flex-row items-end justify-between"}>
                                <div className={"flex flex-col"}>
                                    <p className={"text-text-muted uppercase text-xs"}>стоимость</p>
                                    <p className={"text-text text-lg font-bold"}>{isMax ? "Макс. уровень" : `€ ${upgrade.price} млн`}</p>
                                </div>
                                <Button
                                    text={"Улучшить"}
                                    variant={"secondary"}
                                    disabled={isMax || budget < upgrade.price}
                                    onClick={() => onUpgrade(upgrade.name)}
                                />
                            </div>
                        </div>
                    )
                })}
            </div>
        </section>
    )
}
