import { cardTable } from "@/lib/cardTable.js";

export function Staff({staff}) {
    const columns = ["Имя Фамилия", "Возраст", "Роль в клубе", "Зарплата/год", "Сила"];

    return (
        <section id={"staff"} className={"container flex flex-col space-y-4 py-12 lg:py-20 w-full"}>
            <div className={"flex flex-col space-y-1 uppercase"}>
                <p className={"text-secondary-text font-bold text-base tracking-wide"}>тренерский штаб · {staff.length} человек</p>
                <h2 className={"text-text font-bold text-5xl md:text-8xl"}>Штаб</h2>
            </div>

            <div className={"bg-background-surface shadow-card rounded-lg border border-border w-full overflow-x-auto"}>
                <table className={cardTable.table}>
                    <thead className={cardTable.head}>
                        <tr>
                            {columns.map((column) => (
                                <th key={column} className={"text-text-muted text-xs uppercase tracking-wide font-bold px-3 2xl:px-6 py-4"}>{column}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className={cardTable.body}>
                        {staff.map((person) => (
                            <tr key={person.id} className={cardTable.row}>
                                <td className={cardTable.plainCell}>
                                    <p className={"text-text-muted text-sm"}>{person.lastName}</p>
                                    <p className={"text-text text-lg font-bold font-display uppercase"}>{person.name}</p>
                                </td>
                                <td data-label={columns[1]} className={`${cardTable.cell} text-text-secondary text-base`}>{person.age} лет</td>
                                <td data-label={columns[2]} className={`${cardTable.cell} text-text text-base font-bold`}>{person.role}</td>
                                <td data-label={columns[3]} className={`${cardTable.cell} text-text text-lg font-bold`}>{`€ ${person.salary} млн`}</td>
                                <td data-label={columns[4]} className={cardTable.cell}>
                                    <div className={"flex flex-row items-center space-x-3"}>
                                        <p className={"text-text text-2xl font-bold font-display w-10"}>{person.power}</p>
                                        <div className={"h-2 w-32 bg-background-subtle rounded-full"}>
                                            <div className={"h-full bg-secondary rounded-full"} style={{width: `${person.power}%`}}></div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    )
}
