import { Header } from '@/components/Header';
import { ClubBlock } from "@/components/ClubBlock.jsx";
import { useState } from "react";
import { Matches } from "@/components/Matches.jsx";
import { playGameButton, chooseNextEnemy } from "@/utility/matchRandomizerEngin.js";
import { LineUp } from "@/components/LineUp";
import { Staff } from "@/components/Staff.jsx";
import { Stadium } from "@/components/Stadium.jsx";
import { Market } from "@/components/Market.jsx";
import { SeasonResult } from "@/components/SeasonResult.jsx";
import { ConfirmDialog } from "@/components/ConfirmDialog.jsx";
import {players, teams, staff, stadiumUpgrades, marketPlayers} from "@/data.js";


const lineUpOrder = ["Глубина состава", "Запасной состав", "Игрок ротации", "Основной состав"];

const WIN_REWARD = 2.5;            // млн в общий бюджет за победу
const START_FANS = 500;            // млн болельщиков на старте
const START_SALARY_FUND = 350;     // млн, базовый зарплатный лимит
const FANS_PER_BONUS = 10;         // каждые 10 млн новых болельщиков...
const SALARY_FUND_BONUS = 5;       // ...дают +5 млн к зарплатному лимиту
const FANS_PENALTY_STEP = 10;      // каждые 10 млн болельщиков ниже 500...
const FANS_PENALTY = 10;           // ...отнимают 10 млн от зарплатного и трансферного лимита
const SEASON_ROUNDS = 32;          // туров в сезоне
const SAVE_KEY = "madrid-manager-save";
const baseFansGrowth = {real: 1.2, draw: 0.3, enemy: -0.9};

function loadGame() {
    try {
        const save = JSON.parse(localStorage.getItem(SAVE_KEY)) ?? {};
        if (save.date) save.date = new Date(save.date);
        if (save.matches) save.matches = save.matches.map(match => ({...match, date: new Date(match.date)}));
        return save;
    } catch {
        return {};
    }
}

const saved = loadGame();

function restartGame() {
    try {
        localStorage.removeItem(SAVE_KEY);
    } catch {

    }
    window.location.reload();
}

function getStadiumBonus(upgrades, type) {
    const bonus = upgrades
        .filter(upgrade => upgrade.type === type)
        .reduce((sum, upgrade) => sum + upgrade.multiplier - 1, 0);
    return Math.round((1 + bonus) * 100) / 100;
}

function App() {
    console.log("render App");
    const [week, setWeek] = useState(saved.week ?? 1);
    const [annualBudget, setAnnualBudget] = useState(saved.annualBudget ?? 600);
    const [spent, setSpent] = useState(saved.spent ?? 0);
    const [transferBudgetLeft, setTransferBudgetLeft] = useState(saved.transferBudgetLeft ?? 200);
    const [transferBudget, setTransferBudget] = useState(saved.transferBudget ?? 200);
    const [salaryFund, setSalaryFund] = useState(saved.salaryFund ?? START_SALARY_FUND);
    const [fans, setFans] = useState(saved.fans ?? START_FANS);
    const [fansGrowth, setFansGrowth] = useState(saved.fansGrowth ?? 0);
    const [reputation, setReputation] = useState(saved.reputation ?? 92);
    const [clubs, setClubs] = useState(saved.clubs ?? teams);
    const [nextEnemy, setNextEnemy] = useState(saved.nextEnemy ?? teams[0]);
    const [matches, setMatches] = useState(saved.matches ?? []);
    const [side, setSide] = useState(saved.side ?? "home");
    const [date, setDate] = useState(saved.date ?? new Date(new Date().getFullYear(), 8, 5, 21, 0));
    const [upgrades, setUpgrades] = useState(saved.upgrades ?? stadiumUpgrades);
    const [squad, setSquad] = useState(saved.squad ?? players);
    const [market, setMarket] = useState(saved.market ?? marketPlayers);
    const [restartConfirmOpen, setRestartConfirmOpen] = useState(false);

    function saveGame(changes) {
        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify({
                week, annualBudget, spent, transferBudgetLeft, transferBudget, salaryFund, fans, fansGrowth,
                reputation, clubs, nextEnemy, matches, side, date, upgrades, squad, market,
                ...changes,
            }));
        } catch {
        }
    }

    const allSalary = [...squad, ...staff].reduce((sum, person) => sum + person.salary, 0);
    const availableBudget = Math.round((annualBudget - allSalary - spent) * 10) / 10;
    const incomeBonus = getStadiumBonus(upgrades, "income");
    const fansBonus = getStadiumBonus(upgrades, "fans");
    const winReward = Math.round(WIN_REWARD * incomeBonus * 10) / 10;

    const fanPenaltySteps = Math.floor(Math.round(Math.max(0, START_FANS - fans) * 10) / 10 / FANS_PENALTY_STEP);
    const fanPenalty = fanPenaltySteps * FANS_PENALTY;
    const effectiveSalaryFund = salaryFund - fanPenalty;
    const effectiveTransferBudget = Math.max(0, Math.round((transferBudget - fanPenalty) * 10) / 10);
    const effectiveTransferLeft = Math.max(0, Math.round((transferBudgetLeft - fanPenalty) * 10) / 10);

    const wins = matches.filter(match => match.result === "real").length;
    const draws = matches.filter(match => match.result === "draw").length;
    const losses = matches.filter(match => match.result === "enemy").length;
    const seasonOver = matches.length >= SEASON_ROUNDS;
    const seasonResult = !seasonOver ? null : losses > 12 ? "lose" : losses < 5 ? "win" : "finished";

    function sellPlayer(name) {
        const player = squad.find(item => item.name === name);
        const transferBonus = Math.round(player.price * 0.6 * 10) / 10;

        const newAnnualBudget = annualBudget + player.price;
        const newTransferBudget = transferBudget + transferBonus;
        const newTransferBudgetLeft = transferBudgetLeft + transferBonus;
        const newSquad = squad.filter(item => item.name !== name);

        setAnnualBudget(newAnnualBudget);
        setTransferBudget(newTransferBudget);
        setTransferBudgetLeft(newTransferBudgetLeft);
        setSquad(newSquad);
        saveGame({
            annualBudget: newAnnualBudget,
            transferBudget: newTransferBudget,
            transferBudgetLeft: newTransferBudgetLeft,
            squad: newSquad,
        });
    }

    function buyPlayer(player) {
        if (effectiveTransferLeft < player.price || allSalary + player.salary > effectiveSalaryFund || availableBudget < player.price + player.salary) return;

        const usedNumbers = squad.map(item => item.number);
        let number = 1;
        while (usedNumbers.includes(number)) number++;

        const newSpent = spent + player.price;
        const newTransferBudgetLeft = transferBudgetLeft - player.price;
        const newSquad = [...squad, {...player, number, lineUp: "Глубина состава"}];
        const newMarket = market.filter(item => item.name !== player.name);

        setSpent(newSpent);
        setTransferBudgetLeft(newTransferBudgetLeft);
        setSquad(newSquad);
        setMarket(newMarket);
        saveGame({spent: newSpent, transferBudgetLeft: newTransferBudgetLeft, squad: newSquad, market: newMarket});
    }

    function promotePlayer(name) {
        const newSquad = squad.map(player => {
            if (player.name !== name) return player;
            const nextIndex = (lineUpOrder.indexOf(player.lineUp) + 1) % lineUpOrder.length;

            return {...player, lineUp: lineUpOrder[nextIndex]};
        });

        setSquad(newSquad);
        saveGame({squad: newSquad});
    }

    function upgradeStadium(name) {
        const upgrade = upgrades.find(item => item.name === name);
        if (upgrade.level >= upgrade.maxLevel || availableBudget < upgrade.price) return;

        const newSpent = spent + upgrade.price;
        const newUpgrades = upgrades.map(item => item.name === name
            ? {
                ...item,
                level: item.level + 1,
                price: item.price + item.priceStep,
                multiplier: Math.round((item.multiplier + item.multiplierStep) * 100) / 100,
            }
            : item
        );

        setSpent(newSpent);
        setUpgrades(newUpgrades);
        saveGame({spent: newSpent, upgrades: newUpgrades});
    }

    function nextWeek() {
        if (seasonOver) return;

        let numberOfMain = squad.filter(player => player.lineUp === "Основной состав")
        if (numberOfMain.length !== 11) {
            alert(`Для того чтобы перейти к следующей неделе в основном составе должно быть ровно 11 игроков. Сейчас в составе ${numberOfMain.length} игроков`);
        } else {
            const newWeek = week + 1;
            const result = playGameButton(squad, nextEnemy, date, side)
            const newMatches = [...matches, result];
            setWeek(newWeek);
            setMatches(newMatches);

            const baseGrowth = baseFansGrowth[result.result];
            const growth = baseGrowth > 0 ? baseGrowth * fansBonus : baseGrowth;
            const newFans = Math.round((fans + growth) * 10) / 10;
            setFansGrowth(growth);
            setFans(newFans);

            const newAnnualBudget = result.result === "real"
                ? Math.round((annualBudget + winReward) * 10) / 10
                : annualBudget;
            setAnnualBudget(newAnnualBudget);

            const bonusSteps = Math.floor(Math.max(0, newFans - START_FANS) / FANS_PER_BONUS);
            const newSalaryFund = Math.max(salaryFund, START_SALARY_FUND + bonusSteps * SALARY_FUND_BONUS);
            setSalaryFund(newSalaryFund);

            let updatedClubs = clubs.map(club => club.name === nextEnemy.name ? {...club, played: true} : club)
            if (updatedClubs.every(club => club.played)) {
                updatedClubs = updatedClubs.map(club => ({...club, played: club.name === nextEnemy.name}))
            }
            const newNextEnemy = chooseNextEnemy(updatedClubs);
            setClubs(updatedClubs)
            setNextEnemy(newNextEnemy)
            const nextSide = Math.random() < 0.5 ? "home" : "guest";
            setSide(nextSide);
            const newDate = new Date(date);
            newDate.setDate(newDate.getDate() + 7);
            setDate(newDate);

            saveGame({
                week: newWeek,
                matches: newMatches,
                fans: newFans,
                fansGrowth: growth,
                annualBudget: newAnnualBudget,
                salaryFund: newSalaryFund,
                clubs: updatedClubs,
                nextEnemy: newNextEnemy,
                side: nextSide,
                date: newDate,
            });
        }
    }

    return (
        <div className={"flex flex-col items-start justify-start w-full"}>
            <Header week={week} weekIncrement={nextWeek} seasonOver={seasonOver} onRestart={() => setRestartConfirmOpen(true)} />
            <ClubBlock
                annualBudget={annualBudget}
                availableBudget={availableBudget}
                transferBudgetLeft={effectiveTransferLeft}
                transferBudget={effectiveTransferBudget}
                salaryFundUsed={allSalary}
                salaryFund={effectiveSalaryFund}
                fanPenalty={fanPenalty}
                fans={fans}
                fansGrowth={fansGrowth}
                reputation={reputation}
            />
            <Matches
                enemyTeam={nextEnemy}
                side={side}
                week={week}
                date={date}
                matches={matches}
                stats={{wins, draws, losses}}
                seasonOver={seasonOver}
                totalRounds={SEASON_ROUNDS}
            />
            <LineUp
                squad={squad}
                onSell={sellPlayer}
                onPromote={promotePlayer}
            />
            <Staff staff={staff} />
            <Market
                players={market}
                finances={{availableBudget, transferBudgetLeft: effectiveTransferLeft, salaryFundUsed: allSalary, salaryFund: effectiveSalaryFund}}
                onBuy={buyPlayer}
            />
            <Stadium
                upgrades={upgrades}
                budget={availableBudget}
                bonuses={{incomeBonus, fansBonus, winReward}}
                onUpgrade={upgradeStadium}
            />
            {seasonResult && (
                <SeasonResult result={seasonResult} stats={{wins, draws, losses}} onRestart={restartGame} />
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
