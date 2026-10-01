function getWinChance(powerA, powerB, spread = 10) {
    return 1 / (1 + Math.pow(10, (powerB - powerA) / spread));
}

function playMatch(powerOfRealTeam, enemyPower, maxDrawChance = 0.25) {
    const pureChance = getWinChance(powerOfRealTeam, enemyPower);

    const closeness = 1 - Math.abs(pureChance - 0.5) * 2;
    const drawChance = maxDrawChance * closeness;

    const realChance = (1 - drawChance) * pureChance;
    const enemyChance = (1 - drawChance) * (1 - pureChance);

    const roll = Math.random();

    if (roll < realChance) {
        return "real";
    } else if (roll < realChance + drawChance) {
        return "draw";
    } else {
        return "enemy";
    }
}

function getGoals(min, max, peak, spread) {
    if (peak === undefined) peak = (min + max) / 2;
    if (spread === undefined) spread = (max - min) / 6;

    const weights = [];
    let total = 0;

    for (let i = min; i <= max; i++) {
        const w = Math.exp(-((i - peak) ** 2) / (2 * spread ** 2));
        weights.push(w);
        total += w;
    }

    let roll = Math.random() * total;

    for (let i = 0; i < weights.length; i++) {
        roll -= weights[i];
        if (roll < 0) {
            return min + i;
        }
    }

    return max;
}


function getTeamPower(squad) {
    const starters = squad.filter(player => player.lineUp === "Основной состав")
    return starters.reduce((acc, player) => acc + player.power, 0) / starters.length
}

function simulateMatch(powerOfRealTeam, enemy) {
    const result = playMatch(powerOfRealTeam, enemy.power)

    let realGoals = 0
    let enemyGoals = 0

    if (result === "draw") {
        let goals = getGoals(0, 12, 2, 1.5)
        realGoals = goals
        enemyGoals = goals
    } else if(result === "real") {
        realGoals = getGoals(1, 12, 2, 2)
        enemyGoals = getGoals(0, realGoals - 1, realGoals / 3, 1.5)
    } else if (result === "enemy") {
        enemyGoals = getGoals(1, 12, 2, 2)
        realGoals = getGoals(0, enemyGoals - 1, enemyGoals / 3, 1.5)
    }

    return {
        enemy: enemy,
        realGoals: realGoals,
        enemyGoals: enemyGoals,
        result: result
    }
}

export function lastFiveMatches(squad, teams) {
    const powerOfRealTeam = getTeamPower(squad)

    const allMatches = []

    for (let i = 0; i < 5; i++){
        const enemyTeam = teams[Math.floor(Math.random() * teams.length)];
        allMatches.push(simulateMatch(powerOfRealTeam, enemyTeam))
    }
    return allMatches
}

export function playGameButton(squad, enemy, date, side){
    return {
        ...simulateMatch(getTeamPower(squad), enemy),
        date: date,
        side: side,
    }
}

export function chooseNextEnemy(teams){
    const notPlaysedTeams = teams.filter(team => !team.played)
    return notPlaysedTeams[Math.floor(Math.random() * notPlaysedTeams.length)];
}