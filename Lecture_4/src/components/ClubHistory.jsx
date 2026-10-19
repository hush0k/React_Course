import { FaCheck, FaTimes, FaTrophy } from "react-icons/fa";
import { PLAYOFF_STAGES } from "@/api/history.js";
import { cn } from "@/lib/utils.js";

const statusLabels = {
    win: {text: "Победа в сезоне", className: "bg-success text-text-inverse"},
    lose: {text: "Уволен", className: "bg-danger text-text-inverse"},
    finished: {text: "Сезон завершён", className: "bg-primary text-text-inverse"},
};

function formatMoney(value) {
    const sign = value < 0 ? "−" : "";
    return `${sign}€ ${Math.abs(Math.round(value * 10) / 10)} млн`;
}

function getChampionsResult(season) {
    if (season.champions_league_position === null) return "Не участвовал";
    if (season.champions_league_champion) return "Победитель";
    if (season.playoff_stage) {
        return PLAYOFF_STAGES.find(stage => stage.id === season.playoff_stage).label;
    }
    return `Общий этап, ${season.champions_league_position} место`;
}

function SummaryCard({name, value, className}) {
    return (
        <div className={"flex flex-col bg-background-surface shadow-card rounded-lg border border-border px-6 py-4 flex-1"}>
            <p className={"text-text-muted text-xs uppercase tracking-wide font-bold"}>{name}</p>
            <p className={cn("text-4xl font-bold font-display text-text", className)}>{value}</p>
        </div>
    )
}

function Results({wins, draws, losses}) {
    return (
        <p className={"text-sm text-text-secondary"}>
            <span className={"text-green-700 font-bold"}>{wins}В</span>{" · "}
            <span className={"font-bold"}>{draws}Н</span>{" · "}
            <span className={"text-danger font-bold"}>{losses}П</span>
        </p>
    )
}

function TournamentResult({logo, title, children, className}) {
    return (
        <div className={cn("flex flex-row items-center gap-4 rounded-lg p-4 flex-1", className)}>
            {/* светлая подложка, чтобы тёмные логотипы были видны на тёмной карточке ЛЧ */}
            <div className={"flex items-center justify-center h-16 w-16 shrink-0 rounded-lg bg-white p-2 shadow-sm"}>
                <img src={`${import.meta.env.BASE_URL}${logo}`} alt={title} className={"h-full w-full object-contain"}/>
            </div>
            <div className={"flex flex-col gap-1"}>
                <p className={"text-xs uppercase tracking-wide font-bold opacity-70"}>{title}</p>
                {children}
            </div>
        </div>
    )
}

function MoneyRow({name, value}) {
    return (
        <div className={"flex justify-between text-sm text-text-secondary"}>
            <span>{name}</span>
            <span className={cn("font-bold", value < 0 ? "text-danger" : "text-text")}>{formatMoney(value)}</span>
        </div>
    )
}

function SeasonCard({season}) {
    const status = statusLabels[season.status];
    const inChampionsLeague = season.champions_league_position !== null;

    return (
        <div className={"flex flex-col bg-background-surface shadow-card rounded-xl border border-border p-5 md:p-8 gap-6"}>
            <div className={"flex flex-row flex-wrap items-center justify-between gap-3"}>
                <h3 className={"text-4xl font-bold font-display text-text uppercase"}>Сезон {season.season}</h3>
                {status && (
                    <span className={cn("px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide", status.className)}>
                        {status.text}
                    </span>
                )}
            </div>

            <div className={"flex flex-col md:flex-row gap-4"}>
                <TournamentResult logo={"spain_la-liga.football-logos.cc.svg"} title={"Ла Лига"} className={"bg-background border border-border text-text"}>
                    <p className={"text-2xl font-bold flex items-center gap-2"}>
                        {season.laliga_position === 1 && <FaTrophy className={"text-secondary"}/>}
                        {season.laliga_position} место
                        <span className={"text-sm text-text-muted font-semibold"}>из {season.laliga_total}</span>
                    </p>
                    <p className={"text-sm text-text-secondary"}>{season.laliga_points} очков</p>
                    <Results wins={season.laliga_wins} draws={season.laliga_draws} losses={season.laliga_losses}/>
                </TournamentResult>

                <TournamentResult logo={"tournaments_uefa-champions-league.football-logos.cc.svg"} title={"Лига чемпионов"} className={"bg-[#0a1a5c] text-white"}>
                    <p className={"text-2xl font-bold flex items-center gap-2"}>
                        {season.champions_league_champion && <FaTrophy className={"text-[#00d4ff]"}/>}
                        {getChampionsResult(season)}
                    </p>
                    {inChampionsLeague && (
                        <>
                            <p className={"text-sm text-[#8fa3e6]"}>
                                Общий этап: {season.champions_league_position} место, {season.champions_league_points} очков
                            </p>
                            <p className={"text-sm text-[#8fa3e6]"}>
                                {season.champions_league_wins}В · {season.champions_league_draws}Н · {season.champions_league_losses}П
                            </p>
                        </>
                    )}
                </TournamentResult>
            </div>

            <div className={"flex flex-col lg:flex-row gap-8"}>
                <div className={"flex flex-col gap-2 w-full lg:w-80 shrink-0"}>
                    <p className={"text-text-muted text-xs uppercase tracking-wide font-bold"}>Заработано</p>
                    <MoneyRow name={"Призовые Ла Лиги"} value={season.laliga_earnings}/>
                    <MoneyRow name={"Призовые ЛЧ"} value={season.champions_league_earnings}/>
                    {season.title_bonuses > 0 && <MoneyRow name={"Бонусы за титулы"} value={season.title_bonuses}/>}
                    <MoneyRow name={"Задачи сезона"} value={season.objectives_earnings}/>
                    <div className={"flex justify-between border-t border-border pt-2"}>
                        <span className={"font-bold text-text"}>Итого</span>
                        <span className={"font-bold text-xl font-display text-text"}>{formatMoney(season.total_earnings)}</span>
                    </div>
                    <p className={"text-xs text-text-muted"}>
                        На конец сезона: бюджет {formatMoney(season.budget)} · фанаты {season.fans} · репутация {season.reputation}
                    </p>
                </div>

                <div className={"flex flex-col gap-2 flex-1"}>
                    <p className={"text-text-muted text-xs uppercase tracking-wide font-bold"}>Задачи</p>
                    {season.objectives.length === 0 && <p className={"text-sm text-text-muted"}>Нет задач</p>}
                    {season.objectives.map(objective => {
                        // в истории бэкенд отдаёт только status, поля achieved там нет
                        const achieved = objective.status === "completed" || objective.achieved;
                        return (
                            <div key={objective.id} className={"flex flex-row items-center gap-3 text-sm"}>
                                {achieved
                                    ? <FaCheck className={"text-green-700 shrink-0"}/>
                                    : <FaTimes className={"text-danger shrink-0"}/>}
                                <span className={"text-text flex-1"}>{objective.condition}</span>
                                <span className={cn("font-bold whitespace-nowrap", achieved ? "text-green-700" : "text-danger")}>
                                    {achieved ? `+${formatMoney(objective.reward)}` : formatMoney(-objective.penalty)}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    )
}

export function ClubHistory({seasons}) {
    const titles = seasons.filter(season => season.laliga_position === 1).length;
    const championsTitles = seasons.filter(season => season.champions_league_champion).length;
    const totalEarned = seasons.reduce((sum, season) => sum + season.total_earnings, 0);

    return (
        <section id={"history"} className={"container flex flex-col space-y-8 py-12 lg:py-20 w-full"}>
            <div className={"flex flex-col space-y-1 uppercase"}>
                <p className={"text-secondary-text font-bold text-base tracking-wide"}>архив</p>
                <h2 className={"text-text font-bold text-5xl md:text-8xl"}>История клуба</h2>
            </div>

            <div className={"grid grid-cols-2 lg:grid-cols-4 gap-4"}>
                <SummaryCard name={"Сезонов"} value={seasons.length}/>
                <SummaryCard name={"Чемпионства Ла Лиги"} value={titles}/>
                <SummaryCard name={"Кубки ЛЧ"} value={championsTitles} className={"text-[#001489]"}/>
                <SummaryCard name={"Заработано всего"} value={formatMoney(totalEarned)} className={totalEarned < 0 ? "text-danger" : "text-green-700"}/>
            </div>

            {seasons.length === 0 ? (
                <p className={"text-text-muted"}>Завершённых сезонов пока нет. Доиграйте сезон — его итоги появятся здесь.</p>
            ) : (
                seasons.map(season => <SeasonCard key={season.season} season={season}/>)
            )}
        </section>
    )
}
