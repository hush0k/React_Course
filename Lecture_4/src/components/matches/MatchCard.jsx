const REAL_LOGO = `${import.meta.env.BASE_URL}real_madrid.svg`;

const RESULT_LABEL = {
    real: "Победа",
    draw: "Ничья",
    enemy: "Поражение",
};

const variants = {
    leagueOfChampions: {
        card: "bg-gradient-to-br from-[#0a1a5c] via-[#001489] to-[#050b2e] border-[#2b3fa8]" +
            " shadow-[0_6px_24px_rgba(0,20,137,0.35)]",
        meta: "text-[#8fa3e6]",
        teamName: "text-white",
        goals: "text-white",
        goalsLoser: "text-[#5b6fb8]",
        badge: {
            real: "bg-[#00d4ff]/20 text-[#7ee8ff]",
            draw: "bg-white/15 text-[#c9d6ff]",
            enemy: "bg-red-500/20 text-red-300",
        },
    },
    laLiga: {
        card: "bg-background-surface shadow-card border-border",
        meta: "text-primary-400",
        teamName: "text-text",
        goals: "text-text",
        goalsLoser: "text-primary-300",
        badge: {
            real: "bg-green-100 text-green-800",
            draw: "bg-gray-200 text-gray-700",
            enemy: "bg-red-100 text-red-800",
        },
    },
};

const PLAYOFF_STAGES = {
    round_of_16: "1/8 финала",
    quarter_final: "1/4 финала",
    semi_final: "Полуфинал",
    final: "Финал",
};

function competitionLabel(match) {
    if (match.competition === "laliga") return "Ла Лига";
    if (match.stage === "league") return "ЛЧ";
    const leg = match.leg ? `, ${match.leg === 1 ? "1-й" : "ответный"} матч` : "";
    return `ЛЧ, ${PLAYOFF_STAGES[match.stage]}${leg}`;
}

function TeamRow({team, isDraw, v}) {
    return (
        <div className={"grid grid-cols-5 gap-3 items-center"}>
            <div className={"col-span-1 flex items-center justify-center h-12"}>
                <img src={team.imgUrl} alt={team.name}
                     className={"h-full w-full object-contain drop-shadow-sm"} />
            </div>
            <p className={`col-span-3 font-bold ${v.teamName}`}>{team.name}</p>
            <p className={"col-span-1 text-right font-display font-bold text-2xl " + (
                team.isWinner || isDraw ? v.goals : v.goalsLoser
            )}>{team.goals}</p>
        </div>
    )
}

export function MatchCard({match}) {
    const real = {name: "Real Madrid", imgUrl: REAL_LOGO, goals: match.realGoals, isWinner: match.result === "real"};
    const enemy = {name: match.enemy.name, imgUrl: match.enemy.imgUrl, goals: match.enemyGoals, isWinner: match.result === "enemy"};
    const teams = match.side === "home" ? [real, enemy] : [enemy, real];
    const v = match.competition === "laliga" ? variants.laLiga : variants.leagueOfChampions;

    return (
        <div className={`flex flex-col space-y-2 rounded-lg border p-5 h-44 w-[18rem] md:w-[20rem] shrink-0 ${v.card}`}>

            <div className={"flex flex-row justify-between items-center"}>
                <p className={`text-sm ${v.meta}`}>{String(match.date.getDate()).padStart(2, "0")}.{String(match.date.getMonth() + 1).padStart(2, "0")} · {competitionLabel(match)}
                    {match.penalties && ` · пен. ${match.penalties.real}:${match.penalties.enemy}`}</p>
                <p className={"px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider " + v.badge[match.result]}>
                    {RESULT_LABEL[match.result]}
                </p>
            </div>

            <div className={"flex flex-col space-y-2"}>
                {teams.map((team) => (
                    <TeamRow key={team.name} team={team} isDraw={match.result === "draw"} v={v} />
                ))}
            </div>
        </div>
    )
}
