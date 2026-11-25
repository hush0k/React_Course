import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { refreshAll } from "@/store/refresh.js";
import { fetchAll, getWeekDate, playRound, post } from "@/services/service.js";
import { ACADEMY, lineUps } from "@/lib/players.js";

export function useGame() {
    const dispatch = useDispatch();
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
    const [academyVersion, setAcademyVersion] = useState(0);
    const [loadError, setLoadError] = useState(null);
    const [loadAttempt, setLoadAttempt] = useState(0);
    const [actionError, setActionError] = useState(null);
    const [weekLoading, setWeekLoading] = useState(false);
    const [seasonLoading, setSeasonLoading] = useState(false);

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
            dispatch(refreshAll());
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

    // Оптимистичные действия: UI меняется сразу, запрос уходит в фоне.
    // Запросы идут по очереди, а полная синхронизация — один раз, когда очередь опустела.
    const queue = useRef(Promise.resolve());
    const pending = useRef(0);

    function runAction(url, optimistic) {
        optimistic?.();
        pending.current += 1;
        queue.current = queue.current.then(async () => {
            let failed = false;
            try {
                const result = await post(url);
                if (!result.ok) {
                    failed = true;
                    setActionError(result.error);
                }
            } finally {
                pending.current -= 1;
            }
            // при ошибке откатываем оптимистичное изменение данными сервера
            if (failed || pending.current === 0) await loadAll();
        });
    }

    function sellPlayer(id) {
        runAction(`/player/${id}/sell`, () => {
            const player = squad.find(item => item.id === id);
            if (!player) return;
            setSquad(prev => prev.filter(item => item.id !== id));
            setMarket(prev => [{...player, status: "market"}, ...prev]);
            setFinance(prev => prev && ({
                ...prev,
                available_budget: prev.available_budget + player.price,
                all_salary: prev.all_salary - player.salary,
            }));
        });
    }

    function buyPlayer(player) {
        runAction(`/player/${player.id}/buy`, () => {
            setMarket(prev => prev.filter(item => item.id !== player.id));
            setSquad(prev => [...prev, {...player, status: "squad"}]);
            setFinance(prev => prev && ({
                ...prev,
                available_budget: prev.available_budget - player.price - player.salary,
                effective_transfer_left: prev.effective_transfer_left - player.price,
                all_salary: prev.all_salary + player.salary,
            }));
        });
    }

    function promotePlayer(id) {
        runAction(`/player/${id}/promote`, () => {
            setSquad(prev => prev.map(item => {
                if (item.id !== id) return item;
                // воспитанник уходит в основу, остальные идут по кругу статусов
                const roster = lineUps.filter(name => name !== ACADEMY);
                const next = item.lineUp === ACADEMY ? roster[0] : roster[(roster.indexOf(item.lineUp) + 1) % roster.length];
                return {...item, lineUp: next, line_up: next};
            }));
        });
    }

    function upgradeStadium(id) {
        runAction(`/stadium/upgrades/${id}/level-up`, () => {
            const upgrade = upgrades.find(item => item.id === id);
            if (!upgrade || upgrade.level >= upgrade.maxLevel) return;
            const round = value => Math.round(value * 100) / 100;
            const multiplier = round(upgrade.multiplier + upgrade.multiplierStep);
            const ratio = upgrade.multiplier ? multiplier / upgrade.multiplier : 1;
            setUpgrades(prev => prev.map(item => item.id === id
                ? {...item, level: item.level + 1, multiplier, price: item.price + (item.priceStep ?? 0)}
                : item));
            // бонусы пересчитываются на сервере, тут грубая оценка до синхронизации
            setFinance(prev => prev && ({
                ...prev,
                available_budget: prev.available_budget - upgrade.price,
                ...(upgrade.type === "income" && {
                    income_bonus: round(prev.income_bonus * ratio),
                    win_reward: round(prev.win_reward * ratio),
                }),
                ...(upgrade.type === "fans" && {fans_bonus: round(prev.fans_bonus * ratio)}),
            }));
        });
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
        if (seasonLoading) return;
        setSeasonLoading(true);
        try {
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
        } finally {
            setSeasonLoading(false);
        }
    }

    return {
        finance, squad, market, staff, upgrades, upcoming, matches, standings, stats,
        season, objectives, power, trophies, academyVersion, date, seasonOver, seasonResult,
        upcomingMatches: upcoming?.matches ?? [],
        loadError, actionError, weekLoading, seasonLoading, restartConfirmOpen, seasonResultClosed,
        retryLoad,
        clearActionError: () => setActionError(null),
        openRestartConfirm: () => setRestartConfirmOpen(true),
        closeRestartConfirm: () => setRestartConfirmOpen(false),
        closeSeasonResult: () => setSeasonResultClosed(true),
        loadAll, sellPlayer, buyPlayer, promotePlayer, upgradeStadium, nextWeek, nextSeason, restartGame,
    };
}
