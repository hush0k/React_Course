import { Button } from "@/components/Button.jsx";

function getRank(power) {
    if (power >= 88) return {label: "Мировой класс", className: "bg-secondary text-primary"};
    if (power >= 80) return {label: "Основа", className: "bg-role-bench text-text-inverse"};
    return {label: "Резерв", className: "bg-background-subtle text-text-secondary"};
}

function getBlockReason(player, finances) {
    if (finances.transferBudgetLeft < player.price) return "Мало трансферного бюджета";
    if (finances.salaryFundUsed + player.salary > finances.salaryFund) return "Превышен фонд зарплат";
    if (finances.availableBudget < player.price + player.salary) return "Мало свободных средств";
    return null;
}

export function Market({players, finances, onBuy}) {
    const columns = ["Игрок", "Клуб", "Поз.", "Возраст", "Ранг", "Сила", "Стоимость", "Зарплата/год", ""];
    const sortedPlayers = [...players].sort((a, b) => b.power - a.power);

    return (
        <section id={"market"} className={"flex flex-col space-y-4 p-20 w-full"}>
            <div className={"flex flex-col space-y-1 uppercase"}>
                <p className={"text-secondary-text font-bold text-base tracking-wide"}>трансферный рынок · {players.length} игроков</p>
                <h2 className={"text-text font-bold text-8xl"}>Маркет</h2>
            </div>

            <p className={"text-text-secondary text-sm"}>
                Трансферный бюджет: <b className={"text-text"}>€ {finances.transferBudgetLeft} млн</b> ·
                Свободно: <b className={"text-text"}>€ {finances.availableBudget} млн</b> ·
                Фонд зарплат: <b className={"text-text"}>€ {Math.round(finances.salaryFundUsed * 10) / 10} / {finances.salaryFund} млн</b>
            </p>

            <div className={"bg-background-surface shadow-card rounded-lg border border-border w-full overflow-hidden"}>
                <table className={"w-full text-left"}>
                    <thead className={"bg-background-muted"}>
                        <tr>
                            {columns.map((column) => (
                                <th key={column} className={"text-text-muted text-xs uppercase tracking-wide font-bold px-6 py-4"}>{column}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {sortedPlayers.map((player) => {
                            const rank = getRank(player.power);
                            const blockReason = getBlockReason(player, finances);

                            return (
                                <tr key={`${player.lastName} ${player.name}`} className={"border-t border-border"}>
                                    <td className={"px-6 py-4"}>
                                        <div className={"flex flex-row items-center space-x-4"}>
                                            <img
                                                src={player.imgUrl}
                                                alt={player.name}
                                                className={"h-12 w-12 shrink-0 rounded-full object-cover object-top bg-background-subtle border border-border"}
                                            />
                                            <div>
                                                <p className={"text-text-muted text-sm"}>{player.lastName}</p>
                                                <p className={"text-text text-lg font-bold font-display uppercase"}>{player.name}</p>
                                                <p className={"text-text-muted text-xs"}>{player.nation}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className={"px-6 py-4"}>
                                        <p className={"text-text text-base font-bold"}>{player.club}</p>
                                        <p className={"text-text-muted text-sm"}>{player.league}</p>
                                    </td>
                                    <td className={"px-6 py-4 text-text text-base font-bold"}>{player.position}</td>
                                    <td className={"px-6 py-4 text-text-secondary text-base"}>{player.age} лет</td>
                                    <td className={"px-6 py-4"}>
                                        <span className={`rounded-md px-2 py-1 text-xs font-bold uppercase whitespace-nowrap ${rank.className}`}>{rank.label}</span>
                                    </td>
                                    <td className={"px-6 py-4"}>
                                        <div className={"flex flex-row items-center space-x-3"}>
                                            <p className={"text-text text-2xl font-bold font-display w-10"}>{player.power}</p>
                                            <div className={"h-2 w-24 bg-background-subtle rounded-full"}>
                                                <div className={"h-full bg-secondary rounded-full"} style={{width: `${player.power}%`}}></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className={"px-6 py-4 text-text text-lg font-bold whitespace-nowrap"}>{`€ ${player.price} млн`}</td>
                                    <td className={"px-6 py-4 text-text text-lg font-bold whitespace-nowrap"}>{`€ ${player.salary} млн`}</td>
                                    <td className={"px-6 py-4"}>
                                        <div className={"flex flex-col items-end space-y-1"}>
                                            <Button
                                                text={"Купить"}
                                                size={"sm"}
                                                disabled={blockReason !== null}
                                                onClick={() => onBuy(player)}
                                            />
                                            {blockReason && <p className={"text-danger text-xs whitespace-nowrap"}>{blockReason}</p>}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </section>
    )
}
