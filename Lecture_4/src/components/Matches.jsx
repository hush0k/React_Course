export function Matches({enemyTeam, week, side, date, matches, stats, seasonOver, totalRounds}) {
    const summary = [
        {name: "Победы", value: stats.wins, className: "text-green-700"},
        {name: "Ничьи", value: stats.draws, className: "text-text-secondary"},
        {name: "Поражения", value: stats.losses, className: "text-danger"},
    ];

    return (
        <section id={"matches"} className={"flex flex-col p-20 space-y-10 w-full"}>
            <div className={"flex flex-col space-y-1 uppercase"}>
                <p className={"text-secondary-text font-bold text-base tracking-wide"}>КАЛЕНДАРЬ</p>
                <h2 className={"text-text font-bold text-8xl"}>Матчи</h2>
            </div>

            {seasonOver ? (
                <div className={"flex flex-col items-center p-10 bg-background-surface shadow-card w-full rounded-lg border border-border"}>
                    <p className={"text-text font-bold text-4xl font-display uppercase"}>Сезон завершён</p>
                    <p className={"text-text-secondary"}>Сыграно {matches.length} из {totalRounds} туров</p>
                </div>
            ) : (
            <div className={"flex flex-row items-center justify-between p-10 bg-background-surface shadow-card w-full" +
                " rounded-lg border border-border"}>
                <div className={"flex flex-col space-y-2"}>
                    <p className={"uppercase text-secondary-light font-bold text-sm px-3 py-1 tracking-wide rounded-sm" +
                        " bg-primary"}>Следующий матч</p>
                    <p>Ла Лига {week}-й тур</p>
                    <p>{`${side === "home" ? "Сантьяго Бернабеу, дома" : `${enemyTeam.stadium}, в гостях`}`}</p>
                </div>

                <div className={"flex flex-row space-x-10 items-center"}>
                    <h2 className={"font-bold text-6xl w-min"}>{side === "home" ? `Real Madrid` : enemyTeam.name}</h2>
                    <div className={"w-20"}>
                        <img src={side === "home" ? `${import.meta.env.BASE_URL}real_madrid.svg` : enemyTeam.imgUrl} alt="" />
                    </div>
                    <p className={"text-secondary-text text-5xl uppercase font-bold font-display"}>VS</p>
                    <div className={"w-20"}>
                        <img src={side === "home" ? enemyTeam.imgUrl : `${import.meta.env.BASE_URL}real_madrid.svg`} alt="" />
                    </div>
                    <h2 className={"font-bold text-6xl w-min"}>{side === "home" ? enemyTeam.name : `Real Madrid`}</h2>
                </div>

                <div className={"flex flex-col space-y-2"}>
                    <p className={"text-primary font-display font-semibold text-6xl"}>{date.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" })}</p>
                    <p className={"text-sm text-primary-400"}>{date.toLocaleDateString("ru-RU", { weekday: "long" }).replace(/^./, c => c.toUpperCase())} - {date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}</p>
                    <p className={"text-secondary-text text-sm font-semibold"}>Через 5 дней</p>
                </div>
            </div>
            )}

            <div className={"flex flex-col  space-y-5"}>
                <h3 className={"font-medium tracking-wide text-primary-500"}>Последние матчи</h3>

                <div className={"w-full flex flex-row items-center gap-2"}>
                    {matches.slice(-5).reverse().map((match) => (
                        <div key={match.date.getTime()} className={"flex flex-col space-y-2 bg-background-surface shadow-card" +
                            " rounded-lg border border-border p-5 w-64 h-48"}>

                            <div className={"flex flex-row justify-between items-center"}>
                                <p className={"text-sm text-primary-400 "}>{String(match.date.getDate()).padStart(2, "0")}.{String(match.date.getMonth() + 1).padStart(2, "0")} · Ла Лига</p>
                                <p className={"px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider " + (
                                    match.result === "real" ? "bg-green-100 text-green-800"
                                        : match.result === "draw" ? "bg-gray-200 text-gray-700"
                                            : "bg-red-100 text-red-800"
                                )}>
                                    {match.result === "real" ? "Победа" : match.result === "draw" ? "Ничья" : "Поражение"}
                                </p>
                            </div>

                            <div className={"flex flex-col space-y-2"}>
                                {(match.side === "home" ? [
                                    {name: "Real Madrid", imgUrl: `${import.meta.env.BASE_URL}real_madrid.svg`, goals: match.realGoals, isWinner: match.result === "real"},
                                    {name: match.enemy.name, imgUrl: match.enemy.imgUrl, goals: match.enemyGoals, isWinner: match.result === "enemy"},
                                ] : [
                                    {name: match.enemy.name, imgUrl: match.enemy.imgUrl, goals: match.enemyGoals, isWinner: match.result === "enemy"},
                                    {name: "Real Madrid", imgUrl: `${import.meta.env.BASE_URL}real_madrid.svg`, goals: match.realGoals, isWinner: match.result === "real"},
                                ]).map((team) => (
                                    <div key={team.name} className={"grid grid-cols-5 gap-3 items-center"}>
                                        <div className={"col-span-1"}>
                                            <img src={team.imgUrl} alt={team.name} />
                                        </div>
                                        <p className={"col-span-3 font-bold text-text"}>{team.name}</p>
                                        <p className={"col-span-1 text-right font-display font-bold text-2xl " + (
                                            team.isWinner || match.result === "draw" ? "text-text" : "text-primary-300"
                                        )}>{team.goals}</p>
                                    </div>
                                ))}
                            </div>

                        </div>
                    ))}
                </div>
            </div>

            <div className={"flex flex-row items-center gap-4"}>
                {summary.map((item) => (
                    <div key={item.name} className={"flex flex-col bg-background-surface shadow-card rounded-lg border border-border px-6 py-4 w-40"}>
                        <p className={"text-text-muted text-xs uppercase tracking-wide font-bold"}>{item.name}</p>
                        <p className={`text-4xl font-bold font-display ${item.className}`}>{item.value}</p>
                    </div>
                ))}
                <p className={"text-text-secondary text-sm"}>Сыграно {matches.length} из {totalRounds} туров</p>
            </div>
        </section>
    )
}