import { useEffect, useState } from "react";
import { fetchAll, getWeekDate, playRound, post } from "@/services/service.js";

// Всё состояние игры и действия над ним. Используется в RootLayout,
// а страницы получают результат через useOutletContext().
export function useGame() {
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

    const seasonOver = finance ? finance.season_status !== "in_progress" || !upcoming : false;
    const seasonResult = finance && finance.season_status !== "in_progress" ? finance.season_status : null;
    const date = upcoming ? getWeekDate(upcoming.week) : null;

    async function runAction(url) {
        const result = await post(url);
        if (!result.ok) setActionError(result.error);
        await loadAll();
    }

    const sellPlayer = id => runAction(`/player/${id}/sell`);
    const buyPlayer = player => runAction(`/player/${player.id}/buy`);
    const promotePlayer = id => runAction(`/player/${id}/promote`);
    const upgradeStadium = id => runAction(`/stadium/upgrades/${id}/level-up`);

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

    return {
        // данные
        finance, squad, market, staff, upgrades, upcoming, matches, standings, stats,
        season, objectives, power, trophies, academyVersion, date, seasonOver, seasonResult,
        upcomingMatches: upcoming?.matches ?? [],
        // состояние интерфейса
        loadError, actionError, weekLoading, restartConfirmOpen, seasonResultClosed,
        retryLoad,
        clearActionError: () => setActionError(null),
        openRestartConfirm: () => setRestartConfirmOpen(true),
        closeRestartConfirm: () => setRestartConfirmOpen(false),
        closeSeasonResult: () => setSeasonResultClosed(true),
        // действия
        loadAll, sellPlayer, buyPlayer, promotePlayer, upgradeStadium, nextWeek, nextSeason, restartGame,
    };
}
