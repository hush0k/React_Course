import { Header } from '@/components/Header';
import { ClubBlock } from "@/components/ClubBlock.jsx";
import { useEffect, useState } from "react";
import { Matches } from "@/components/Matches.jsx";
import { LineUp } from "@/components/LineUp";
import { Staff } from "@/components/Staff.jsx";
import { Stadium } from "@/components/Stadium.jsx";
import { Market } from "@/components/Market.jsx";
import { SeasonResult } from "@/components/SeasonResult.jsx";
import { ConfirmDialog } from "@/components/ConfirmDialog.jsx";


const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

function getWeekDate(week) {
    const date = new Date(new Date().getFullYear(), 8, 5, 21, 0);
    date.setDate(date.getDate() + (week - 1) * 7);
    return date;
}

function toTeam(team) {
    return {...team, imgUrl: `${import.meta.env.BASE_URL}${team.img_url}`};
}

function toPlayer(player) {
    return {
        ...player,
        lastName: player.last_name,
        lineUp: player.line_up,
        imgUrl: `${import.meta.env.BASE_URL}${player.img_url}`,
    };
}

function toCoach(coach) {
    return {...coach, lastName: coach.last_name};
}

function toUpgrade(upgrade) {
    return {
        ...upgrade,
        maxLevel: upgrade.max_level,
        priceStep: upgrade.price_step,
        multiplierStep: upgrade.multiplier_step,
    };
}

function toMatches(schedule, clubs) {
    return schedule
        .filter(round => round.competition === "laliga")
        .map(round => {
            const match = round.matches.find(item => item.played && (item.home_team_id === null || item.guest_team_id === null));
            if (!match) return null;

            const side = match.home_team_id === null ? "home" : "guest";
            const enemyId = side === "home" ? match.guest_team_id : match.home_team_id;
            const realGoals = side === "home" ? match.home_goals : match.guest_goals;
            const enemyGoals = side === "home" ? match.guest_goals : match.home_goals;

            return {
                enemy: clubs.find(club => club.id === enemyId),
                realGoals,
                enemyGoals,
                result: realGoals > enemyGoals ? "real" : realGoals === enemyGoals ? "draw" : "enemy",
                side,
                date: getWeekDate(round.week),
            };
        })
        .filter(match => match !== null);
}

async function getJson(url) {
    const response = await fetch(`${API}${url}`);
    if (!response.ok) return null;
    return response.json();
}

async function post(url, body) {
    const response = await fetch(`${API}${url}`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: body ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) {
        const error = await response.json();
        alert(error.detail);
    }
    return response.ok;
}

function App() {
    console.log("render App");
    const [finance, setFinance] = useState(null);
    const [squad, setSquad] = useState([]);
    const [market, setMarket] = useState([]);
    const [staff, setStaff] = useState([]);
    const [upgrades, setUpgrades] = useState([]);
    const [nextMatch, setNextMatch] = useState(null);
    const [matches, setMatches] = useState([]);
    const [stats, setStats] = useState({wins: 0, draws: 0, losses: 0});
    const [restartConfirmOpen, setRestartConfirmOpen] = useState(false);

    async function loadAll() {
        const financeData = await getJson("/finance");
        const squadData = await getJson("/player?status=squad");
        const marketData = await getJson("/player?status=market");
        const staffData = await getJson("/coach");
        const clubsData = await getJson("/team");
        const upgradesData = await getJson("/stadium/upgrades");
        const nextMatchData = await getJson("/season/next-match");
        const standingsData = await getJson("/season/standings");
        const scheduleData = await getJson("/season/schedule");

        const clubs = clubsData.map(toTeam);
        const ownClub = standingsData.find(row => row.is_own_club);

        setFinance(financeData);
        setSquad(squadData.map(toPlayer));
        setMarket(marketData.map(toPlayer));
        setStaff(staffData.map(toCoach));
        setUpgrades(upgradesData.map(toUpgrade));
        setNextMatch(nextMatchData ? {...nextMatchData, enemy: toTeam(nextMatchData.enemy)} : null);
        setMatches(toMatches(scheduleData, clubs));
        setStats({wins: ownClub.wins, draws: ownClub.draws, losses: ownClub.losses});
    }

    useEffect(() => {
        loadAll();
    }, []);

    if (!finance) return null;

    const seasonOver = finance.season_status !== "in_progress" || !nextMatch;
    const seasonResult = finance.season_status !== "in_progress" ? finance.season_status : null;
    const date = nextMatch ? getWeekDate(nextMatch.week) : null;

    async function sellPlayer(id) {
        await post(`/player/${id}/sell`);
        loadAll();
    }

    async function buyPlayer(player) {
        await post(`/player/${player.id}/buy`);
        loadAll();
    }

    async function promotePlayer(id) {
        await post(`/player/${id}/promote`);
        loadAll();
    }

    async function upgradeStadium(id) {
        await post(`/stadium/upgrades/${id}/level-up`);
        loadAll();
    }

    async function nextWeek() {
        if (seasonOver) return;

        const day = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
        await post("/season/round", {date: day});
        loadAll();
    }

    async function restartGame() {
        await post("/game/reset");
        setRestartConfirmOpen(false);
        loadAll();
    }

    return (
        <div className={"flex flex-col items-start justify-start w-full"}>
            <Header week={finance.week} weekIncrement={nextWeek} seasonOver={seasonOver} onRestart={() => setRestartConfirmOpen(true)} />
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
            />
            <Matches
                enemyTeam={nextMatch?.enemy}
                side={nextMatch?.side}
                week={nextMatch?.round}
                date={date}
                matches={matches}
                stats={stats}
                seasonOver={seasonOver}
                totalRounds={finance.season_rounds}
            />
            <LineUp
                squad={squad}
                onSell={sellPlayer}
                onPromote={promotePlayer}
            />
            <Staff staff={staff} />
            <Market
                players={market}
                finances={{
                    availableBudget: finance.available_budget,
                    transferBudgetLeft: finance.effective_transfer_left,
                    salaryFundUsed: finance.all_salary,
                    salaryFund: finance.effective_salary_fund,
                }}
                onBuy={buyPlayer}
            />
            <Stadium
                upgrades={upgrades}
                budget={finance.available_budget}
                bonuses={{incomeBonus: finance.income_bonus, fansBonus: finance.fans_bonus, winReward: finance.win_reward}}
                onUpgrade={upgradeStadium}
            />
            {seasonResult && (
                <SeasonResult result={seasonResult} stats={stats} onRestart={restartGame} />
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
