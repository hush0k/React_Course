import { FaBolt } from "react-icons/fa";
import { cn } from "@/lib/utils.js";

const REAL_LOGO = `${import.meta.env.BASE_URL}real_madrid.svg`;

const PLAYOFF_STAGES = {
    round_of_16: "1/8 финала",
    quarter_final: "1/4 финала",
    semi_final: "Полуфинал",
    final: "Финал",
};

// до финала пара из двух матчей
function legLabel(leg) {
    return leg ? `, ${leg === 1 ? "1-й" : "ответный"} матч` : "";
}

function competitionTitle(competition, stage, round, leg) {
    if (competition === "laliga") return `Ла Лига ${round}-й тур`;
    if (stage === "league") return `Лига чемпионов ${round}-й тур`;
    return `Лига чемпионов, ${PLAYOFF_STAGES[stage]}${legLabel(leg)}`;
}

const variants = {
    leagueOfChampions: {
        card: "bg-gradient-to-br from-[#0a1a5c] via-[#001489] to-[#050b2e] text-white border-[#2b3fa8]" +
            " shadow-[0_10px_40px_rgba(0,20,137,0.45)] relative overflow-hidden",
        badge: "text-[#050b2e] bg-gradient-to-r from-[#00d4ff] to-[#7ee8ff]",
        title: "text-[#c9d6ff] font-display uppercase tracking-wider",
        venue: "text-[#8fa3e6]",
        teamName: "text-white",
        vs: "text-[#00d4ff]",
        date: "text-white",
        time: "text-[#8fa3e6]",
        countdown: "text-[#00d4ff]",
        power: "bg-white/10 text-white",
        chanceLabel: "text-[#8fa3e6]",
        track: "bg-white/10",
    },
    laLiga: {
        card: "bg-background-surface shadow-card border-border",
        badge: "text-secondary-light bg-primary",
        title: "",
        venue: "",
        teamName: "",
        vs: "text-secondary-text",
        date: "text-primary",
        time: "text-primary-400",
        countdown: "text-secondary-text",
        power: "bg-primary text-text-inverse",
        chanceLabel: "text-text-muted",
        track: "bg-border",
    },
}

function percent(value) {
    return Math.round(value * 100);
}

function PowerBadge({power, className}) {
    return (
        <div className={cn("flex flex-row items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold whitespace-nowrap", className)}>
            <FaBolt className={"text-secondary"}/>
            {power === null ? "—" : Math.round(power)}
        </div>
    )
}

// шансы считает бэкенд: победа / ничья / поражение с точки зрения Реала.
// победа Реала рисуется со стороны Реала, поэтому в гостях шкала зеркалится
function WinChance({chance, realOnRight, v}) {
    const realParts = [
        {name: "Победа", value: chance.win, className: "bg-green-500"},
        {name: "Ничья", value: chance.draw, className: "bg-gray-400"},
        {name: "Поражение", value: chance.lose, className: "bg-red-500"},
    ];
    const parts = realOnRight ? [...realParts].reverse() : realParts;

    return (
        <div className={"flex flex-col gap-2 w-full"}>
            <div className={cn("flex flex-row h-2.5 w-full rounded-full overflow-hidden", v.track)}>
                {parts.map(part => (
                    <div key={part.name} className={part.className} style={{width: `${part.value * 100}%`}}/>
                ))}
            </div>
            <div className={cn("flex flex-row justify-between text-sm", v.chanceLabel)}>
                {parts.map(part => (
                    <p key={part.name}>{part.name} <span className={"font-bold"}>{percent(part.value)}%</span></p>
                ))}
            </div>
        </div>
    )
}

export function NextMatch({enemyTeam, side, competition, stage, round, leg, date, power, winChance}) {
    const isHome = side === "home";
    const real = {name: "Real Madrid", imgUrl: REAL_LOGO, power: winChance?.power ?? power};
    const enemy = {...enemyTeam, power: winChance?.enemy_power ?? enemyTeam.power};
    const home = isHome ? real : enemy;
    const away = isHome ? enemy : real;
    const v = competition === "laliga" ? variants.laLiga : variants.leagueOfChampions;

    return (
        <div className={`flex flex-row items-center justify-between p-10 w-full rounded-lg border ${v.card}`}>
            <div className={"flex flex-col space-y-2"}>
                <p className={`uppercase font-bold text-sm px-3 py-1 tracking-wide rounded-sm ${v.badge}`}>Следующий матч</p>
                <p className={v.title}>{competitionTitle(competition, stage, round, leg)}</p>
                <p className={v.venue}>{isHome ? "Сантьяго Бернабеу, дома" : `${enemyTeam.stadium}, в гостях`}</p>
            </div>

            <div className={"flex flex-col items-center gap-6"}>
                <div className={"flex flex-row space-x-10 items-center"}>
                    <h2 className={`font-bold text-6xl w-min ${v.teamName}`}>{home.name}</h2>
                    <div className={"flex flex-col items-center gap-2 w-20"}>
                        <img src={home.imgUrl} alt="" />
                        <PowerBadge power={home.power} className={v.power}/>
                    </div>
                    <p className={`text-5xl uppercase font-bold font-display ${v.vs}`}>VS</p>
                    <div className={"flex flex-col items-center gap-2 w-20"}>
                        <img src={away.imgUrl} alt="" />
                        <PowerBadge power={away.power} className={v.power}/>
                    </div>
                    <h2 className={`font-bold text-6xl w-min ${v.teamName}`}>{away.name}</h2>
                </div>
                {winChance && <WinChance chance={winChance} realOnRight={!isHome} v={v}/>}
            </div>

            <div className={"flex flex-col space-y-2"}>
                <p className={`font-display font-semibold text-6xl ${v.date}`}>{date.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" })}</p>
                <p className={`text-sm ${v.time}`}>{date.toLocaleDateString("ru-RU", { weekday: "long" }).replace(/^./, c => c.toUpperCase())} - {date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}</p>
                <p className={`text-sm font-semibold ${v.countdown}`}>Через {competition === "laliga" ? '5' : '3'} дней</p>
            </div>
        </div>
    )
}
