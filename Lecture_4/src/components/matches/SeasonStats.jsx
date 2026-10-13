export function SeasonStats({stats, played, totalRounds}) {
    const summary = [
        {name: "Победы", value: stats.wins, className: "text-green-700"},
        {name: "Ничьи", value: stats.draws, className: "text-text-secondary"},
        {name: "Поражения", value: stats.losses, className: "text-danger"},
    ];

    return (
        <div className={"flex flex-row items-center gap-4"}>
            {summary.map((item) => (
                <div key={item.name} className={"flex flex-col bg-background-surface shadow-card rounded-lg border border-border px-6 py-4 w-40"}>
                    <p className={"text-text-muted text-xs uppercase tracking-wide font-bold"}>{item.name}</p>
                    <p className={`text-4xl font-bold font-display ${item.className}`}>{item.value}</p>
                </div>
            ))}
            <p className={"text-text-secondary text-sm"}>Сыграно {played} из {totalRounds} туров</p>
        </div>
    )
}
