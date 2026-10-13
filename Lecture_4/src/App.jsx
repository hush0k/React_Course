import { Header } from "@/components/Header.jsx";
import { SeasonResult } from "@/components/SeasonResult.jsx";
import { ConfirmDialog } from "@/components/ConfirmDialog.jsx";
import { HomePage } from "@/pages/HomePage.jsx";
import { TeamPage } from "@/pages/TeamPage.jsx";
import { StadiumPage } from "@/pages/StadiumPage.jsx";
import { MarketPage } from "@/pages/MarketPage.jsx";
import { HistoryPage } from "@/pages/HistoryPage.jsx";
import { fetchAll, getWeekDate, post } from "@/api";
import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

function App() {
    console.log("render App");
    const [finance, setFinance] = useState(null);
    const [squad, setSquad] = useState([]);
    const [market, setMarket] = useState([]);
    const [staff, setStaff] = useState([]);
    const [upgrades, setUpgrades] = useState([]);
    const [upcoming, setUpcoming] = useState(null);
    const [matches, setMatches] = useState([]);
    const [standings, setStandings] = useState({laliga: [], championsLeague: [], championsQualified: 16, playoff: {qualified: 16, rounds: []}});
    const [stats, setStats] = useState({wins: 0, draws: 0, losses: 0});
    const [restartConfirmOpen, setRestartConfirmOpen] = useState(false);
    const [seasonResultClosed, setSeasonResultClosed] = useState(false);
    const [season, setSeason] = useState(1);
    const [objectives, setObjectives] = useState([]);
    const [power, setPower] = useState(null);
    const [trophies, setTrophies] = useState({laliga: 0, championsLeague: 0});

    function applyData(data) {
        setFinance(data.finance);
        setSquad(data.squad);
        setMarket(data.market);
        setStaff(data.staff);
        setUpgrades(data.upgrades);
        setUpcoming(data.upcoming);
        setMatches(data.matches);
        setStandings(data.standings);
        setStats(data.stats);
        setSeason(data.season);
        setObjectives(data.objectives);
        setPower(data.power);
        setTrophies(data.trophies);
    }

    async function loadAll() {
        applyData(await fetchAll());
    }

    useEffect(() => {
        let ignore = false;
        fetchAll().then(data => {
            if (!ignore) applyData(data);
        });
        return () => {
            ignore = true;
        };
    }, []);

    if (!finance) return null;

    const seasonOver = finance.season_status !== "in_progress" || !upcoming;
    const seasonResult = finance.season_status !== "in_progress" ? finance.season_status : null;
    const date = upcoming ? getWeekDate(upcoming.week) : null;

    async function sellPlayer(id) {
        await post(`/player/${id}/sell`);
        await loadAll();
    }

    async function buyPlayer(player) {
        await post(`/player/${player.id}/buy`);
        await loadAll();
    }

    async function promotePlayer(id) {
        await post(`/player/${id}/promote`);
        await loadAll();
    }

    async function upgradeStadium(id) {
        await post(`/stadium/upgrades/${id}/level-up`);
        await loadAll();
    }

    async function nextWeek() {
        if (seasonOver) return;

        const day = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
        await post("/season/round", {date: day});
        await loadAll();
    }

    async function nextSeason() {
        // если уволили — начинаем игру с нуля
        if (finance.season_status === "lose") {
            await restartGame();
            return;
        }

        // finish подводит итоги сезона и пишет их в историю клуба, reset генерирует новое расписание и номер сезона +1
        await post("/season/finish");
        await post("/season/reset");
        setSeasonResultClosed(false);
        await loadAll();
    }

    async function restartGame() {
        await post("/game/reset");
        setRestartConfirmOpen(false);
        setSeasonResultClosed(false);
        await loadAll();
    }

    return (
        <div className={"flex flex-col items-start justify-start w-full"}>
            <Header season={season} week={finance.week} weekIncrement={nextWeek} onNextSeason={nextSeason} seasonOver={seasonOver} fired={seasonResult === "lose"} onRestart={() => setRestartConfirmOpen(true)} availableBudget={finance.available_budget} transferBudgetLeft={finance.effective_transfer_left} power={power} />
            <Routes>
                <Route path="/" element={
                    <HomePage
                        finance={finance}
                        upcomingMatches={upcoming?.matches ?? []}
                        date={date}
                        matches={matches}
                        stats={stats}
                        standings={standings}
                        seasonOver={seasonOver}
                        objectives={objectives}
                        power={power}
                        trophies={trophies}
                    />
                } />
                <Route path="/team" element={
                    <TeamPage squad={squad} staff={staff} onSell={sellPlayer} onPromote={promotePlayer} />
                } />
                <Route path="/stadium" element={
                    <StadiumPage finance={finance} upgrades={upgrades} onUpgrade={upgradeStadium} />
                } />
                <Route path="/market" element={
                    <MarketPage finance={finance} market={market} onBuy={buyPlayer} />
                } />
                <Route path="/history" element={<HistoryPage season={season} />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            {seasonResult && !seasonResultClosed && (
                <SeasonResult result={seasonResult} stats={stats} onRestart={restartGame} onClose={() => setSeasonResultClosed(true)} />
            )}
            {restartConfirmOpen && (
                <ConfirmDialog
                    title={"Перезапуск"}
                    text={"Весь прогресс будет удалён, и игра начнётся заново. Продолжить?"}
                    confirmText={"Перезапустить"}
                    onConfirm={restartGame}
                    onCancel={() => setRestartConfirmOpen(false)}
                />
            )}
        </div>
    )
}

export default App
