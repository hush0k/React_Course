import { MatchCard } from "@/components/matches/MatchCard.jsx";

export function RecentMatches({matches}) {
    return (
        <div className={"flex flex-col  space-y-5"}>
            <h3 className={"font-medium tracking-wide text-primary-500"}>Последние матчи</h3>

            <div className={"w-full flex flex-row items-center gap-2 overflow-x-scroll overflow-y-visible"}>
                {matches.toReversed().map((match) => (
                    <MatchCard key={`${match.week}-${match.competition}`} match={match} />
                ))}
            </div>
        </div>
    )
}
