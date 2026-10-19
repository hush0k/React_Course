const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export function getWeekDate(week) {
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
        // у воспитанников фото может не быть — тогда карточки показывают инициалы
        imgUrl: player.img_url ? `${import.meta.env.BASE_URL}${player.img_url}` : null,
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

function toStanding(row, clubs) {
    const club = clubs.find(item => item.id === row.team_id);
    return {
        ...row,
        goalsFor: row.goals_for,
        goalsAgainst: row.goals_against,
        goalDifference: row.goal_difference,
        isOwnClub: row.is_own_club,
        // у своего клуба team_id = null, логотип берём из public
        imgUrl: club ? club.imgUrl : `${import.meta.env.BASE_URL}real_madrid.svg`,
    };
}

function toMatches(schedule, clubs) {
    return schedule
        .map(round => {
            const match = round.matches.find(item => item.played && (item.home_team_id === null || item.guest_team_id === null));
            if (!match) return null;

            const side = match.home_team_id === null ? "home" : "guest";
            const enemyId = side === "home" ? match.guest_team_id : match.home_team_id;
            const realGoals = side === "home" ? match.home_goals : match.guest_goals;
            const enemyGoals = side === "home" ? match.guest_goals : match.home_goals;
            // ничья в плей-офф ЛЧ решается пенальти
            const penalties = match.home_penalties === null ? null : {
                real: side === "home" ? match.home_penalties : match.guest_penalties,
                enemy: side === "home" ? match.guest_penalties : match.home_penalties,
            };
            const [realScore, enemyScore] = realGoals === enemyGoals && penalties
                ? [penalties.real, penalties.enemy]
                : [realGoals, enemyGoals];

            return {
                enemy: clubs.find(club => club.id === enemyId),
                realGoals,
                enemyGoals,
                penalties,
                result: realScore > enemyScore ? "real" : realScore === enemyScore ? "draw" : "enemy",
                side,
                competition: round.competition,
                stage: round.stage,
                leg: round.leg,
                round: round.round,
                week: round.week,
                date: getWeekDate(round.week),
            };
        })
        .filter(match => match !== null)
        // по неделям; в одну неделю сначала Ла Лига, потом ЛЧ
        .sort((a, b) => a.week - b.week || (a.competition === "laliga" ? -1 : 1));
}

function toPlayoffTeam(id, name, clubs) {
    // у своего клуба team_id = null
    const club = id === null ? null : clubs.find(item => item.id === id);
    return {
        id: id ?? "own",
        name: club ? club.name : name,
        imgUrl: club ? club.imgUrl : `${import.meta.env.BASE_URL}real_madrid.svg`,
        isOwnClub: id === null,
    };
}

function toPlayoffSide(match, side, clubs) {
    return toPlayoffTeam(match[`${side}_team_id`], match[side], clubs);
}

// Пара плей-офф: до финала — два матча (первый и ответный, хозяева меняются),
// в финале и в сезонах по старым правилам — один. Стороны — как в первом матче
function toPlayoffTie(first, second, clubs) {
    const decider = second ?? first;
    // в ответном матче хозяин первого — гость
    const side = (own, other) => ({
        ...toPlayoffSide(first, own, clubs),
        scores: second ? [first[`${own}_goals`], second[`${other}_goals`]] : [first[`${own}_goals`]],
        aggregate: second ? second[`${other}_aggregate`] : null,
        penalties: second ? second[`${other}_penalties`] : first[`${own}_penalties`],
    });
    return {
        played: decider.played,
        winner: decider.winner === null ? null : decider.winner === first.home ? "home" : "guest",
        home: side("home", "guest"),
        guest: side("guest", "home"),
    };
}

function toPlayoff(data, clubs) {
    if (!data) return {qualified: 16, rounds: []};
    const stages = [];
    data.rounds.forEach(round => {
        let stage = stages.find(item => item.stage === round.stage);
        if (!stage) {
            stage = {stage: round.stage, first: [], second: []};
            stages.push(stage);
        }
        (round.leg === 2 ? stage.second : stage.first).push(...round.matches);
    });
    return {
        qualified: data.qualified,
        rounds: stages.map(({stage, first, second}) => ({
            stage,
            // ответный матч ищем по командам: хозяева поменялись местами
            matches: first.map(match => toPlayoffTie(
                match,
                second.find(item =>
                    item.home_team_id === match.guest_team_id && item.guest_team_id === match.home_team_id,
                ),
                clubs,
            )),
        })),
    };
}

// титулы, выигранные в игре: завершённые сезоны из истории
// плюс текущий, если он уже закончился, но ещё не попал в историю
function countTrophies(history, finance, season, ownClub, playoff) {
    const trophies = {
        laliga: history.filter(item => item.laliga_position === 1).length,
        championsLeague: history.filter(item => item.champions_league_champion).length,
    };
    const seasonOver = finance.season_status !== "in_progress";
    if (seasonOver && !history.some(item => item.season === season)) {
        if (ownClub.position === 1) trophies.laliga += 1;
        const final = playoff.rounds.find(round => round.stage === "final")?.matches[0];
        if (final?.winner && final[final.winner].isOwnClub) trophies.championsLeague += 1;
    }
    return trophies;
}

async function getJson(url) {
    const response = await fetch(`${API}${url}`);
    if (!response.ok) return null;
    return response.json();
}

// POST-запрос; ошибку бэка возвращает текстом, чтобы показать её в попапе
export async function post(url, body) {
    return request(url, "POST", body);
}

export async function fetchAll() {
    const financeData = await getJson("/finance");
    const squadData = await getJson("/player?status=squad");
    const marketData = await getJson("/player?status=market");
    const staffData = await getJson("/coach");
    const clubsData = await getJson("/team");
    const upgradesData = await getJson("/stadium/upgrades");
    const nextWeekData = await getJson("/season/next-week");
    const standingsData = await getJson("/season/standings");
    const laligaSchedule = await getJson("/season/schedule?competition=laliga");
    const championsSchedule = await getJson("/season/schedule?competition=champions_league");
    const championsStandingsData = await getJson("/league-of-champions/standings");
    const playoffData = await getJson("/league-of-champions/playoff");
    const objectivesData = await getJson("/objectives");
    const historyData = (await getJson("/season/history")) ?? [];
    // 409, если основной состав пуст — тогда силу и шансы не показываем
    const powerData = await getJson("/game-engine/team-power");
    const upcomingMatches = await Promise.all((nextWeekData?.matches ?? []).map(async match => ({
        ...match,
        enemy: toTeam(match.enemy),
        winChance: powerData ? await getJson(`/game-engine/win-chance/${match.enemy.id}`) : null,
    })));

    // без этих данных приложение не может работать — App покажет экран ошибки
    if (!financeData || !squadData || !marketData || !staffData || !clubsData || !upgradesData
        || !standingsData || !laligaSchedule || !championsSchedule) {
        throw new Error("Не удалось загрузить данные с сервера");
    }

    const clubs = clubsData.map(toTeam);
    const ownClub = standingsData.find(row => row.is_own_club);
    const playoff = toPlayoff(playoffData, clubs);

    return {
        finance: financeData,
        squad: squadData.map(toPlayer),
        market: marketData.map(toPlayer),
        staff: staffData.map(toCoach),
        upgrades: upgradesData.map(toUpgrade),
        upcoming: nextWeekData
            ? {
                week: nextWeekData.week,
                matches: upcomingMatches,
            }
            : null,
        matches: toMatches([...laligaSchedule, ...championsSchedule], clubs),
        standings: {
            laliga: standingsData.map(row => toStanding(row, clubs)),
            championsLeague: (championsStandingsData ?? []).map(row => toStanding(row, clubs)),
            championsQualified: playoffData?.qualified ?? 16,
            playoff,
        },
        trophies: countTrophies(historyData, financeData, objectivesData?.season ?? 1, ownClub, playoff),
        stats: {wins: ownClub.wins, draws: ownClub.draws, losses: ownClub.losses},
        season: objectivesData?.season ?? 1,
        objectives: objectivesData?.objectives ?? [],
        power: powerData?.power ?? null,
    };
}

// итоги завершённых сезонов, новые сверху, вместе с задачами сезона
export async function fetchSeasonHistory() {
    return (await getJson("/season/history")) ?? [];
}

// страница маркета/состава с фильтрами, сортировкой и пагинацией на бэке;
// общее число найденных бэк отдаёт в заголовке X-Total-Count
export async function fetchPlayers(params) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== false) query.append(key, value);
    });

    const response = await fetch(`${API}/player?${query}`);
    if (!response.ok) return {players: [], total: 0};

    const total = response.headers.get("X-Total-Count");
    const players = (await response.json()).map(toPlayer);
    return {players, total: total === null ? null : Number(total)};
}

// запрос, который возвращает ошибку бэка как есть (detail из 409/422)
async function request(url, method, body) {
    let response;
    try {
        response = await fetch(`${API}${url}`, {
            method,
            headers: {"Content-Type": "application/json"},
            body: body ? JSON.stringify(body) : undefined,
        });
    } catch {
        return {ok: false, data: null, error: "Сервер недоступен. Проверьте подключение"};
    }
    const data = await response.json().catch(() => null);
    if (response.ok) return {ok: true, data, error: null};
    return {ok: false, data: null, error: formatError(data?.detail)};
}

function formatError(detail) {
    if (!detail) return "Не удалось выполнить запрос";
    if (typeof detail === "string") return detail;
    // 422 от FastAPI — список ошибок по полям
    if (Array.isArray(detail)) return detail.map(item => item.msg).join("; ");
    return JSON.stringify(detail);
}

// академия: нагрузка и воспитанники (отсортированы по силе)
export async function fetchAcademy() {
    const data = await getJson("/player/academy");
    if (!data) return null;
    return {
        weightUsed: data.weight_used,
        weightLimit: data.weight_limit,
        players: data.players.map(toPlayer),
    };
}

export async function createPlayer(body) {
    const result = await request("/player", "POST", body);
    return result.ok ? {...result, data: toPlayer(result.data)} : result;
}

export async function setTraining(id, training) {
    return request(`/player/${id}/training`, "PATCH", {training});
}

export async function promote(id) {
    return request(`/player/${id}/promote`, "POST");
}

// тур сезона: в ответе результаты матчей и прогресс тренировок академии
export async function playRound(date) {
    return request("/season/round", "POST", {date});
}
