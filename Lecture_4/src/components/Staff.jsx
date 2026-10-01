export function Staff({staff}) {
    const columns = ["Имя Фамилия", "Возраст", "Роль в клубе", "Зарплата/год", "Сила"];

    return (
        <section id={"staff"} className={"flex flex-col space-y-4 p-20 w-full"}>
            <div className={"flex flex-col space-y-1 uppercase"}>
                <p className={"text-secondary-text font-bold text-base tracking-wide"}>тренерский штаб · {staff.length} человек</p>
                <h2 className={"text-text font-bold text-8xl"}>Штаб</h2>
            </div>

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
                        {staff.map((person) => (
                            <tr key={`${person.lastName} ${person.name}`} className={"border-t border-border"}>
                                <td className={"px-6 py-4"}>
                                    <p className={"text-text-muted text-sm"}>{person.lastName}</p>
                                    <p className={"text-text text-lg font-bold font-display uppercase"}>{person.name}</p>
                                </td>
                                <td className={"px-6 py-4 text-text-secondary text-base"}>{person.age} лет</td>
                                <td className={"px-6 py-4 text-text text-base font-bold"}>{person.role}</td>
                                <td className={"px-6 py-4 text-text text-lg font-bold"}>{`€ ${person.salary} млн`}</td>
                                <td className={"px-6 py-4"}>
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
