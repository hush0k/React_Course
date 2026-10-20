import { Header } from "@/components/Header.jsx";
import { SeasonResult } from "@/components/SeasonResult.jsx";
import { ConfirmDialog } from "@/components/ConfirmDialog.jsx";
import { ErrorDialog } from "@/components/ErrorDialog.jsx";
import { Button } from "@/components/Button.jsx";
import { HomePage } from "@/pages/HomePage.jsx";
import { TeamPage } from "@/pages/TeamPage.jsx";
import { StadiumPage } from "@/pages/StadiumPage.jsx";
import { MarketPage } from "@/pages/MarketPage.jsx";
import { HistoryPage } from "@/pages/HistoryPage.jsx";
import { PlayerPage } from "@/pages/PlayerPage.jsx";
import { AcademyPage } from "@/pages/AcademyPage.jsx";
import { fetchAll, getWeekDate, playRound, post } from "@/api";
import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

function App() {
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
    // меняется после тура, чтобы страница академии перезапросила данные
    const [academyVersion, setAcademyVersion] = useState(0);
    // ошибка первой загрузки и номер попытки для кнопки "Повторить"
    const [loadError, setLoadError] = useState(null);
    const [loadAttempt, setLoadAttempt] = useState(0);
    // текст ошибки действия (покупка, продажа, тур) для попапа
    const [actionError, setActionError] = useState(null);
    // пока играется тур — блокируем кнопку и показываем загрузку
    const [weekLoading, setWeekLoading] = useState(false);

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
        try {
            applyData(await fetchAll());
        } catch {
            setActionError("Не удалось обновить данные. Проверьте подключение к серверу");
        }
    }

    useEffect(() => {
        let ignore = false;
        fetchAll()
            .then(data => {
                if (!ignore) applyData(data);
            })
            .catch(() => {
                if (!ignore) setLoadError("Не удалось загрузить данные. Сервер может просыпаться до минуты — попробуйте ещё раз");
            });
        return () => {
            ignore = true;
        };
    }, [loadAttempt]);

    function retryLoad() {
        setLoadError(null);
        setLoadAttempt(a => a + 1);
    }

    if (loadError) {
        return (
            <div className={"flex flex-col items-center justify-center w-full min-h-screen space-y-4 p-4 text-center"}>
                <h1 className={"text-text font-bold font-display text-4xl uppercase"}>Ошибка загрузки</h1>
                <p className={"text-text-secondary max-w-md"}>{loadError}</p>
                <Button text={"Повторить"} variant={"primary"} onClick={retryLoad} />
            </div>
        );
    }

    if (!finance) {
        return (
            <div className={"flex flex-col items-center justify-center w-full min-h-screen space-y-4 p-4"}>
                <div className={"size-12 rounded-full border-4 border-background-subtle border-t-secondary animate-spin"}></div>
                <p className={"text-text-secondary font-bold uppercase tracking-wide"}>Загрузка...</p>
            </div>
        );
    }

    const seasonOver = finance.season_status !== "in_progress" || !upcoming;
    const seasonResult = finance.season_status !== "in_progress" ? finance.season_status : null;
    const date = upcoming ? getWeekDate(upcoming.week) : null;

    async function sellPlayer(id) {
        const result = await post(`/player/${id}/sell`);
        if (!result.ok) setActionError(result.error);
        await loadAll();
    }

    async function buyPlayer(player) {
        const result = await post(`/player/${player.id}/buy`);
        if (!result.ok) setActionError(result.error);
        await loadAll();
    }

    async function promotePlayer(id) {
        const result = await post(`/player/${id}/promote`);
        if (!result.ok) setActionError(result.error);
        await loadAll();
    }

    async function upgradeStadium(id) {
        const result = await post(`/stadium/upgrades/${id}/level-up`);
        if (!result.ok) setActionError(result.error);
        await loadAll();
    }

    async function nextWeek() {
        if (seasonOver || weekLoading) return;

        setWeekLoading(true);
        try {
            const day = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
            const result = await playRound(day);
            if (!result.ok) {
                setActionError(result.error);
                return;
            }
            setAcademyVersion(v => v + 1);
            await loadAll();
        } finally {
            setWeekLoading(false);
        }
    }

    async function nextSeason() {
        if (finance.season_status === "lose") {
            await restartGame();
            return;
        }

        for (const url of ["/season/finish", "/season/reset"]) {
            const result = await post(url);
            if (!result.ok) {
                setActionError(result.error);
                return;
            }
        }
        setSeasonResultClosed(false);
        setAcademyVersion(v => v + 1);
        await loadAll();
    }

    async function restartGame() {
        const result = await post("/game/reset");
        setRestartConfirmOpen(false);
        if (!result.ok) {
            setActionError(result.error);
            return;
        }
        setSeasonResultClosed(false);
        setAcademyVersion(v => v + 1);
        await loadAll();
    }

    return (
        <div className={"flex flex-col items-start justify-start w-full"}>
            <Header season={season} week={finance.week} weekIncrement={nextWeek} weekLoading={weekLoading} onNextSeason={nextSeason} seasonOver={seasonOver} fired={seasonResult === "lose"} onRestart={() => setRestartConfirmOpen(true)} availableBudget={finance.available_budget} transferBudgetLeft={finance.effective_transfer_left} power={power} />
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
                <Route path="/academy" element={
                    <AcademyPage squad={squad} version={academyVersion} onChange={loadAll} />
                } />
                <Route path="/stadium" element={
                    <StadiumPage finance={finance} upgrades={upgrades} onUpgrade={upgradeStadium} />
                } />
                <Route path="/market" element={
                    <MarketPage finance={finance} market={market} onBuy={buyPlayer} />
                } />
                <Route path="/player/:id" element={
                    <PlayerPage squad={squad} market={market} finance={finance} onSell={sellPlayer} onPromote={promotePlayer} onBuy={buyPlayer} />
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
            {actionError && (
                <ErrorDialog text={actionError} onClose={() => setActionError(null)} />
            )}
        </div>
    )
}

export default App
