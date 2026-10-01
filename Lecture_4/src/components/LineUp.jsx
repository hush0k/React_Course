import { useState } from "react";
import { PlayerCard } from "@/components/PlayerCard.jsx";
import { Button } from "@/components/Button.jsx";

const statusPriority = ["Основной состав", "Игрок ротации", "Запасной состав", "Глубина состава"];

const positionPriority = ["ВР", "ПЗ", "ЦЗ", "ЛЗ", "ОП", "ЦП", "АП", "ПВ", "ЛВ", "ФР"];


const filters = [
    {id: "all", label: "Все", test: () => true},

    {id: "starter", label: "Основной", test: player => player.lineUp === "Основной состав"},
    {id: "rotation", label: "Ротация", test: player => player.lineUp === "Игрок ротации"},
    {id: "bench", label: "Запасные", test: player => player.lineUp === "Запасной состав"},
    {id: "depth", label: "Глубина", test: player => player.lineUp === "Глубина состава"},

    {id: "gk", label: "Вратари", test: player => player.position === "ВР"},
    {id: "def", label: "Защита", test: player => ["ПЗ", "ЦЗ", "ЛЗ"].includes(player.position)},
    {id: "mid", label: "Полузащита", test: player => ["ОП", "ЦП", "АП"].includes(player.position)},
    {id: "att", label: "Атака", test: player => ["ПВ", "ЛВ", "ФР"].includes(player.position)},
];

const sorts = [
    {
        id: "default",
        label: "По умолчанию",
        compare: (a, b) => {
            const byStatus = statusPriority.indexOf(a.lineUp) - statusPriority.indexOf(b.lineUp);
            if (byStatus !== 0) return byStatus;

            const byPosition = positionPriority.indexOf(a.position) - positionPriority.indexOf(b.position);
            if (byPosition !== 0) return byPosition;

            return a.power - b.power;
        },
    },
    {id: "power", label: "Сила", compare: (a, b) => b.power - a.power},
    {id: "price", label: "Стоимость", compare: (a, b) => b.price - a.price},
    {id: "salary", label: "Зарплата", compare: (a, b) => b.salary - a.salary},
    {id: "age", label: "Возраст", compare: (a, b) => a.age - b.age},
    {id: "number", label: "Номер", compare: (a, b) => a.number - b.number},
];

export function LineUp({squad, onSell, onPromote}) {
    const [filterId, setFilterId] = useState("all");
    const [sortId, setSortId] = useState("default");
    const [reversed, setReversed] = useState(false);
    const [resetKey, setResetKey] = useState(0);


    const activeFilter = filters.find(filter => filter.id === filterId);
    const activeSort = sorts.find(sort => sort.id === sortId);

    const sortedSquad = [...squad].sort(activeSort.compare);
    const orderedSquad = reversed ? sortedSquad.reverse() : sortedSquad;
    const visibleCount = orderedSquad.filter(activeFilter.test).length;

    console.log("render LineUp");

    return(
        <section id={"line_up"} className={"flex flex-col space-y-4 p-20"}>
            <div className={"flex flex-col space-y-1 uppercase"}>
                <p className={"text-secondary-text font-bold text-base tracking-wide"}>первая команда · {squad.length} игрока</p>
                <h2 className={"text-text font-bold text-8xl"}>Состав</h2>
            </div>

            <div className={"flex flex-col space-y-3"}>
                <div className={"flex flex-row flex-wrap items-center gap-2"}>
                    <p className={"text-text-muted text-sm font-bold uppercase tracking-wide w-28"}>Фильтр</p>
                    {filters.map(filter => (
                        <Button
                            key={filter.id}
                            text={filter.label}
                            size={"sm"}
                            variant={filter.id === filterId ? "primary" : "outline"}
                            onClick={() => setFilterId(filter.id)}
                        />
                    ))}
                </div>

                <div className={"flex flex-row flex-wrap items-center gap-2"}>
                    <p className={"text-text-muted text-sm font-bold uppercase tracking-wide w-28"}>Сортировка</p>
                    {sorts.map(sort => (
                        <Button
                            key={sort.id}
                            text={sort.label}
                            size={"sm"}
                            variant={sort.id === sortId ? "primary" : "outline"}
                            onClick={() => setSortId(sort.id)}
                        />
                    ))}
                    <Button
                        text={"Обратный порядок"}
                        size={"sm"}
                        variant={reversed ? "primary" : "outline"}
                        onClick={() => setReversed(r => !r)}
                    />
                </div>

                <div className={"flex flex-row items-center gap-4"}>
                    <p className={"text-text-secondary text-sm"}>Показано: {visibleCount} из {squad.length}</p>
                    <Button text={"Сбросить отношения"} size={"sm"} variant={"outline"} onClick={() => setResetKey(k => k + 1)}/>
                </div>
            </div>

            <div className={"flex flex-row flex-wrap gap-11"}>
                {orderedSquad.map(player => (
                    <div key={`${player.name}-${resetKey}`} className={activeFilter.test(player) ? "" : "hidden"}>
                        <PlayerCard
                            player={player}
                            onSell={() => onSell(player.name)}
                            onPromote={() => onPromote(player.name)}
                        />
                    </div>
                ))}
            </div>
        </section>
    )
}
