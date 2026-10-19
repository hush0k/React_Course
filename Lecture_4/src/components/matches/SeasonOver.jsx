export function SeasonOver({played, totalRounds}) {
    return (
        <div className={"flex flex-col items-center text-center p-6 md:p-10 bg-background-surface shadow-card w-full rounded-lg border border-border"}>
            <p className={"text-text font-bold text-3xl md:text-4xl font-display uppercase"}>Сезон завершён</p>
            <p className={"text-text-secondary"}>Сыграно {played} из {totalRounds} туров</p>
        </div>
    )
}
