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
        <section id={"stadium"} className={"container flex flex-col space-y-8 py-12 lg:py-20 w-full scroll-mt-20"}>
            <div className={"flex flex-col space-y-1 uppercase"}>
                <p className={"text-secondary-text font-bold text-base tracking-wide"}>инфраструктура</p>
                <h2 className={"text-text font-bold text-5xl md:text-8xl"}>Стадион</h2>
            </div>

            <div className={"flex flex-col lg:flex-row bg-background-surface shadow-card rounded-xl border border-border w-full overflow-hidden"}>
                <img src={`${import.meta.env.BASE_URL}santiago.webp`} alt="Сантьяго Бернабеу" className={"w-full lg:w-[45%] h-56 md:h-80 lg:h-[23rem] object-cover"}/>

                <div className={"flex flex-col w-full lg:w-[55%] p-6 md:p-10 space-y-6"}>
                    <div className={"flex flex-row flex-wrap items-start justify-between gap-4"}>
                        <div>
                            <h3 className={"text-text font-bold text-4xl md:text-6xl"}>Сантьяго Бернабеу</h3>
                            <p className={"text-text-secondary text-base"}>Пасео де ла Кастельяна, 144 · Мадрид</p>
                        </div>
                        <p className={"bg-primary text-secondary-light uppercase text-xs font-bold tracking-wide rounded-sm px-3 py-2 whitespace-nowrap"}>в собственности</p>
                    </div>

                    <div className={"grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4"}>
                        {stadiumData.map((item) => (
                            <div key={item.name} className={"flex flex-col space-y-1 border-t border-border py-4"}>
                                <p className={"text-text-muted uppercase text-xs font-bold tracking-widest"}>{item.name}</p>
                                <p className={"text-text text-xl font-bold"}>{item.content}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className={"flex flex-col md:flex-row md:items-end justify-between gap-4"}>
                <p className={"text-text-muted uppercase text-sm font-bold tracking-widest"}>Улучшения</p>
                <p className={"text-text-secondary text-sm"}>
                    Доход за победу: <b className={"text-text"}>× {bonuses.incomeBonus} = € {bonuses.winReward} млн</b> ·
                    Прирост болельщиков: <b className={"text-text"}>× {bonuses.fansBonus}</b>
                </p>
            </div>

            <div className={"grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 w-full"}>
                {upgrades.map((upgrade) => {
                    const isMax = upgrade.level >= upgrade.maxLevel;
                    const nextMultiplier = Math.round((upgrade.multiplier + upgrade.multiplierStep) * 100) / 100;

                    return (
                        <div key={upgrade.id} className={"flex flex-col space-y-4 bg-background-surface shadow-soft rounded-lg border border-border p-5"}>
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
                                    onClick={() => onUpgrade(upgrade.id)}
                                />
                            </div>
                        </div>
                    )
                })}
            </div>
        </section>
    )
}
