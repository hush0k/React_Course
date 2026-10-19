import { FaQuestion, FaTrophy } from "react-icons/fa";
import { cn } from "@/lib/utils.js";

const STAGES = [
    {id: "round_of_16", label: "1/8 финала", teams: 16},
    {id: "quarter_final", label: "1/4 финала", teams: 8},
    {id: "semi_final", label: "Полуфинал", teams: 4},
    {id: "final", label: "Финал", teams: 2},
];

const TBD = {id: null, name: "TBD", imgUrl: null, scores: [], aggregate: null, penalties: null};

function winnerOf(match) {
    if (!match?.winner) return null;
    return match[match.winner];
}

function emptyMatch(home = TBD, guest = TBD) {
    return {played: false, winner: null, home, guest};
}

function hasTeam(match, team) {
    return team?.id != null && (match.home.id === team.id || match.guest.id === team.id);
}

// Сетка строится целиком сразу: чего ещё нет в данных — заполняется TBD,
// а победители уже сыгранных пар сразу проходят в следующую стадию
function buildBracket(playoff) {
    const stages = STAGES.filter(stage => stage.teams <= playoff.qualified);
    const columns = [];

    stages.forEach((stage, index) => {
        const slots = stage.teams / 2;
        const data = playoff.rounds.find(round => round.stage === stage.id)?.matches ?? [];
        const previous = columns[index - 1];

        if (!previous) {
            columns.push({...stage, matches: Array.from({length: slots}, (_, i) => data[i] ?? emptyMatch())});
            return;
        }

        const unused = [...data];
        const matches = Array.from({length: slots}, (_, i) => {
            const first = winnerOf(previous.matches[i * 2]);
            const second = winnerOf(previous.matches[i * 2 + 1]);
            // пара в данных может стоять в другом порядке — ищем её по прошедшим командам
            const found = unused.find(match => hasTeam(match, first) || hasTeam(match, second));
            if (found) {
                unused.splice(unused.indexOf(found), 1);
                return found;
            }
            return emptyMatch(first ?? TBD, second ?? TBD);
        });
        // если пары не нашлись по командам — раскладываем оставшиеся по порядку
        columns.push({
            ...stage,
            matches: matches.map(match => match.home.id === null && match.guest.id === null && unused.length
                ? unused.shift()
                : match),
        });
    });

    return columns;
}

function TeamLine({team, state}) {
    const isTbd = team.id === null;
    const isLoser = state === "loser";
    // две игры: счёт каждого матча мелко, сумма — крупно; одна игра — только счёт
    const twoLegs = team.scores.length === 2;
    const total = twoLegs ? team.aggregate : team.scores[0] ?? null;

    return (
        <div className={cn(
            "flex items-center gap-2 px-3 py-2 transition-opacity duration-300",
            isLoser && "opacity-35 grayscale",
        )}>
            <span className={"flex items-center justify-center w-7 h-7 shrink-0"}>
                {isTbd
                    ? (
                        <span className={"flex items-center justify-center w-6 h-6 rounded-full border border-dashed border-[#5b6fb8] text-[#5b6fb8]"}>
                            <FaQuestion className={"w-2.5 h-2.5"}/>
                        </span>
                    )
                    : <img src={team.imgUrl} alt={team.name} className={"w-7 h-7 object-contain"}/>}
            </span>
            <span className={cn(
                "flex-1 truncate text-sm",
                isTbd ? "text-[#5b6fb8] tracking-widest" : "text-white font-bold",
                team.isOwnClub && !isLoser && "text-[#7ee8ff]",
            )}>
                {team.name}
            </span>
            {twoLegs && team.scores.some(score => score !== null) && (
                <span className={"flex gap-1.5 text-xs tabular-nums text-[#8fa3e6]"}>
                    {team.scores.map((score, index) => <span key={index} className={"w-3 text-center"}>{score ?? "–"}</span>)}
                </span>
            )}
            {total !== null && (
                <span className={cn(
                    "w-8 text-right font-display font-bold text-lg tabular-nums",
                    state === "winner" ? "text-[#7ee8ff]" : "text-white",
                )}>
                    {total}
                    {team.penalties !== null && (
                        <sup className={"ml-0.5 text-[10px] text-[#8fa3e6]"}>({team.penalties})</sup>
                    )}
                </span>
            )}
        </div>
    );
}

function MatchBox({match}) {
    const stateOf = side => !match.winner ? null : match.winner === side ? "winner" : "loser";
    const hasOwnClub = match.home.isOwnClub || match.guest.isOwnClub;

    return (
        <div className={cn(
            "relative w-64 rounded-md border bg-[#050b2e]/60 divide-y divide-[#2b3fa8]/60",
            hasOwnClub ? "border-[#00d4ff]/70" : "border-[#2b3fa8]",
        )}>
            <TeamLine team={match.home} state={stateOf("home")}/>
            <TeamLine team={match.guest} state={stateOf("guest")}/>
        </div>
    );
}

export function PlayoffBracket({playoff}) {
    const columns = buildBracket(playoff);
    const champion = winnerOf(columns[columns.length - 1]?.matches[0]);

    return (
        <div className={cn(
            "flex flex-col rounded-lg border px-4 md:px-6 py-5 space-y-4 overflow-x-auto",
            "bg-gradient-to-br from-[#0a1a5c] via-[#001489] to-[#050b2e] border-[#2b3fa8] shadow-[0_6px_24px_rgba(0,20,137,0.35)]",
        )}>
            <div className={"flex flex-col uppercase"}>
                <p className={"text-xs font-bold tracking-wide text-[#8fa3e6]"}>Лига Чемпионов</p>
                <h3 className={"font-display font-bold text-3xl text-[#00d4ff]"}>Плей-офф</h3>
            </div>

            <div className={"flex gap-6 min-w-max"}>
                {columns.map((column, columnIndex) => {
                    const isLast = columnIndex === columns.length - 1;
                    // по две пары в группе — от группы идёт скобка к следующей стадии
                    const groups = isLast
                        ? [column.matches]
                        : Array.from({length: column.matches.length / 2}, (_, i) => column.matches.slice(i * 2, i * 2 + 2));

                    return (
                        <div key={column.id} className={"flex flex-col"}>
                            <p className={"pb-3 text-xs font-bold uppercase tracking-wide text-[#8fa3e6]"}>{column.label}</p>
                            <div className={"flex flex-col flex-1"}>
                                {groups.map((group, groupIndex) => (
                                    <div key={groupIndex} className={"relative flex flex-col flex-1"}>
                                        {group.map((match, matchIndex) => (
                                            <div key={matchIndex} className={"relative flex flex-1 items-center py-2"}>
                                                {columnIndex > 0 && (
                                                    <span className={"absolute -left-3 top-1/2 w-3 border-t border-[#2b3fa8]"}/>
                                                )}
                                                <MatchBox match={match}/>
                                            </div>
                                        ))}
                                        {!isLast && (
                                            <span className={"absolute -right-3 top-1/4 h-1/2 w-3 border-y border-r rounded-r border-[#2b3fa8]"}/>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}

                <div className={"flex flex-col"}>
                    <p className={"pb-3 text-xs font-bold uppercase tracking-wide text-[#8fa3e6]"}>Чемпион</p>
                    <div className={"relative flex flex-1 items-center"}>
                        <span className={"absolute -left-3 top-1/2 w-3 border-t border-[#2b3fa8]"}/>
                        <div className={cn(
                            "flex flex-col items-center gap-2 w-36 rounded-md border px-3 py-4 text-center",
                            champion ? "border-[#00d4ff] bg-[#00d4ff]/10" : "border-[#2b3fa8] border-dashed",
                        )}>
                            <FaTrophy className={cn("w-6 h-6", champion ? "text-secondary-light" : "text-[#5b6fb8]")}/>
                            {champion
                                ? <img src={champion.imgUrl} alt={champion.name} className={"w-12 h-12 object-contain"}/>
                                : (
                                    <span className={"flex items-center justify-center w-12 h-12 rounded-full border border-dashed border-[#5b6fb8] text-[#5b6fb8]"}>
                                        <FaQuestion className={"w-4 h-4"}/>
                                    </span>
                                )}
                            <span className={cn("text-sm font-bold", champion ? "text-white" : "text-[#5b6fb8] tracking-widest")}>
                                {champion ? champion.name : "TBD"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
