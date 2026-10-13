import { useState } from "react";
import { ClubBlock } from "@/components/ClubBlock.jsx";
import { Matches } from "@/components/Matches.jsx";
import { SeasonObjectives } from "@/components/SeasonObjectives.jsx";
import { TournamentTable } from "@/components/TournamentTable.jsx";
import { TournamentSwitch } from "@/components/TournamentSwitch.jsx";
import { PlayoffBracket } from "@/components/PlayoffBracket.jsx";

export function HomePage({finance, upcomingMatches, date, matches, stats, standings, seasonOver, objectives, power, trophies}) {
    const [tournamentId, setTournamentId] = useState("laLiga");

    const isChampions = tournamentId === "leagueOfChampions";
    const isPlayoff = tournamentId === "championsPlayoff";

    return (
        <>
            <ClubBlock
                annualBudget={finance.annual_budget}
                availableBudget={finance.available_budget}
                transferBudgetLeft={finance.effective_transfer_left}
                transferBudget={finance.effective_transfer_budget}
                salaryFundUsed={finance.all_salary}
                salaryFund={finance.effective_salary_fund}
                fanPenalty={finance.fan_penalty}
                fans={finance.fans}
                fansGrowth={finance.fans_growth}
                reputation={finance.reputation}
                power={power}
                trophies={trophies}
                position={standings.laliga.find(row => row.isOwnClub)?.position}
            />
            <SeasonObjectives objectives={objectives}/>
            <Matches
                upcomingMatches={upcomingMatches}
                date={date}
                matches={matches}
                stats={stats}
                seasonOver={seasonOver}
                totalRounds={finance.season_rounds}
                power={power}
            />

            <section id={"standings"} className={"flex flex-col px-20 pb-20 space-y-6 w-full"}>
                <div className={"flex flex-col space-y-1 uppercase"}>
                    <p className={"text-secondary-text font-bold text-base tracking-wide"}>ТУРНИРЫ</p>
                    <h2 className={"text-text font-bold text-8xl"}>Таблицы</h2>
                </div>

                <TournamentSwitch value={tournamentId} onChange={setTournamentId}/>

                {isPlayoff
                    ? <PlayoffBracket playoff={standings.playoff}/>
                    : (
                        <TournamentTable
                            variant={tournamentId}
                            standings={isChampions ? standings.championsLeague : standings.laliga}
                            qualified={standings.championsQualified}
                        />
                    )}
            </section>
        </>
    )
}
