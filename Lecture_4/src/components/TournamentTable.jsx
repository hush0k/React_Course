import { cn } from "@/lib/utils.js";

const variants = {
    leagueOfChampions: {
        wrapper: "bg-gradient-to-br from-[#0a1a5c] via-[#001489] to-[#050b2e] border-[#2b3fa8] shadow-[0_6px_24px_rgba(0,20,137,0.35)]",
        title: "text-[#00d4ff]",
        subtitle: "text-[#8fa3e6]",
        head: "text-[#8fa3e6] border-[#2b3fa8]",
        row: "border-[#2b3fa8]/50 text-[#c9d6ff]",
        ownRow: "bg-[#00d4ff]/10",
        name: "text-white",
        points: "text-[#7ee8ff]",
        muted: "text-[#5b6fb8]",
        badge: "bg-[#00d4ff] text-[#050b2e]",
    },
    laLiga: {
        wrapper: "bg-background-surface shadow-card border-border",
        title: "text-primary-400",
        subtitle: "text-secondary-text",
        head: "text-text-muted border-border",
        row: "border-border text-text-secondary",
        ownRow: "bg-primary/10",
        name: "text-text",
        points: "text-text",
        muted: "text-text-muted",
        badge: "bg-primary text-secondary-light",
    },
};

function getZone(position, total, variant, qualified) {
    if (variant === "leagueOfChampions") {
        return position <= qualified ? "bg-success" : null;
    }
    if (position <= 4) return "bg-[#00d4ff]";
    if (position > total - 3) return "bg-danger";
    return null;
}

export function TournamentTable({standings, variant = "laLiga", qualified = 16}) {
    const v = variant === "leagueOfChampions" ? variants.leagueOfChampions : variants.laLiga;
    const title = variant === "leagueOfChampions" ? "Лига Чемпионов" : "Ла Лига";
    const subtitle = variant === "leagueOfChampions" ? "Общий этап" : "Чемпионат Испании";

    return (
        <div className={cn("flex flex-col rounded-lg border px-6 py-5 space-y-4", v.wrapper)}>
            <div className={"flex flex-col uppercase"}>
                <p className={cn("text-xs font-bold tracking-wide", v.subtitle)}>{subtitle}</p>
                <h3 className={cn("font-display font-bold text-3xl", v.title)}>{title}</h3>
            </div>

            <table className={"w-full text-base"}>
                <thead>
                <tr className={cn("border-b text-sm uppercase tracking-wide font-bold", v.head)}>
                    <th className={"py-3 w-10 text-left"}>№</th>
                    <th className={"py-3 text-left"}>Команда</th>
                    <th className={"py-3 w-10"}>И</th>
                    <th className={"py-3 w-10"}>В</th>
                    <th className={"py-3 w-10"}>Н</th>
                    <th className={"py-3 w-10"}>П</th>
                    <th className={"py-3 w-16"}>Мячи</th>
                    <th className={"py-3 w-12"}>РМ</th>
                    <th className={"py-3 w-12"}>О</th>
                </tr>
                </thead>
                <tbody>
                {standings.map(row => {
                    const zone = getZone(row.position, standings.length, variant, qualified);
                    return (
                        <tr
                            key={row.id}
                            className={cn("border-b last:border-b-0 text-center", v.row, row.isOwnClub && v.ownRow)}
                        >
                            <td className={"py-4 text-left"}>
                                <div className={"flex items-center gap-2"}>
                                    <span className={cn("w-1 h-8 rounded-full", zone ?? "bg-transparent")}/>
                                    <span className={"font-bold text-lg"}>{row.position}</span>
                                </div>
                            </td>
                            <td className={"py-4 text-left"}>
                                <div className={"flex items-center gap-3"}>
                                    <img src={row.imgUrl} alt={row.name} className={"w-9 h-9 object-contain"}/>
                                    <span className={cn("font-bold text-lg", v.name)}>{row.name}</span>
                                    {row.isOwnClub && (
                                        <span className={cn("px-2 py-0.5 rounded text-xs font-bold uppercase", v.badge)}>
                                            Мы
                                        </span>
                                    )}
                                </div>
                            </td>
                            <td className={"py-4"}>{row.played}</td>
                            <td className={"py-4"}>{row.wins}</td>
                            <td className={"py-4"}>{row.draws}</td>
                            <td className={"py-4"}>{row.losses}</td>
                            <td className={cn("py-4", v.muted)}>{row.goalsFor}:{row.goalsAgainst}</td>
                            <td className={"py-4"}>
                                {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                            </td>
                            <td className={cn("py-4 font-bold text-xl", v.points)}>{row.points}</td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
        </div>
    )
}
