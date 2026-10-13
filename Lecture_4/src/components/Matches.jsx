import { NextMatch } from "@/components/matches/NextMatch.jsx";
import { SeasonOver } from "@/components/matches/SeasonOver.jsx";
import { RecentMatches } from "@/components/matches/RecentMatches.jsx";
import { SeasonStats } from "@/components/matches/SeasonStats.jsx";

export function Matches({upcomingMatches, date, matches, stats, seasonOver, totalRounds, power}) {
    const playedRounds = matches.filter(match => match.competition === "laliga").length;

    return (
        <section id={"matches"} className={"flex flex-col p-20 space-y-10 w-full"}>
            <div className={"flex flex-col space-y-1 uppercase"}>
                <p className={"text-secondary-text font-bold text-base tracking-wide"}>КАЛЕНДАРЬ</p>
                <h2 className={"text-text font-bold text-8xl"}>Матчи</h2>
            </div>

            {seasonOver
                ? <SeasonOver played={playedRounds} totalRounds={totalRounds} />
                : upcomingMatches.length === 0
                    ? <p className={"text-secondary-text font-semibold"}>На этой неделе у нас нет матча</p>
                    : upcomingMatches.map(match => (
                        <NextMatch
                            key={match.competition}
                            enemyTeam={match.enemy}
                            side={match.side}
                            variant={match.competition === "laliga" ? "laLiga" : "legueOfChampions"}
                            competition={match.competition}
                            stage={match.stage}
                            leg={match.leg}
                            round={match.round}
                            date={date}
                            power={power}
                            winChance={match.winChance}
                        />
                    ))}

            <RecentMatches matches={matches} />

            <SeasonStats stats={stats} played={playedRounds} totalRounds={totalRounds} />
        </section>
    )
}
