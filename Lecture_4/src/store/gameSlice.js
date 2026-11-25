import { createAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchAll, playRound, post } from "@/services/service.js";
import { ACADEMY, lineUps } from "@/lib/players.js";
import { resetStore } from "@/store/actions.js";
import { refreshAll } from "@/store/refresh.js";
import { selectGameDate, selectSeasonOver } from "@/store/selectors.js";

const LOAD_ERROR = "Не удалось загрузить данные. Сервер может просыпаться до минуты — попробуйте ещё раз";
const REFRESH_ERROR = "Не удалось обновить данные. Проверьте подключение к серверу";

const round = value => Math.round(value * 100) / 100;

const emptyData = {
    finance: null,
    squad: [],
    market: [],
    staff: [],
    upgrades: [],
    upcoming: null,
    matches: [],
    standings: {laliga: [], championsLeague: [], championsQualified: 16, playoff: {qualified: 16, rounds: []}},
    stats: {wins: 0, draws: 0, losses: 0},
    season: 1,
    objectives: [],
    power: null,
    trophies: {laliga: 0, championsLeague: 0},
};

const initialState = {
    ...emptyData,
    status: "idle",
    currentRequestId: null,
    loadError: null,
    actionError: null,
    weekLoading: false,
    seasonLoading: false,
};

export const loadGame = createAsyncThunk("game/load", async (_, {dispatch}) => {
    const data = await fetchAll();
    dispatch(refreshAll());
    return data;
}, {
   condition: (arg, {getState}) => !(arg?.initial && getState().game.status === "loading"),
});

let queue = Promise.resolve();
let pendingActions = 0;

export const runQueuedAction = createAsyncThunk("game/queuedAction", async (url, {dispatch, rejectWithValue}) => {
    pendingActions += 1;
    const task = queue.then(async () => {
        let error = null;
        try {
            const result = await post(url);
            if (!result.ok) error = result.error;
        } finally {
            pendingActions -= 1;
        }
        if (error || pendingActions === 0) await dispatch(loadGame());
        return error;
    });
    queue = task.catch(() => {});
    const error = await task;
    return error ? rejectWithValue(error) : null;
});

export const nextWeek = createAsyncThunk("game/nextWeek", async (_, {dispatch, getState, rejectWithValue}) => {
    const date = selectGameDate(getState());
    const day = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const result = await playRound(day);
    if (!result.ok) return rejectWithValue(result.error);
    await dispatch(loadGame());
    return null;
}, {
    condition: (_, {getState}) => {
        const state = getState();
        return !selectSeasonOver(state) && !state.game.weekLoading;
    },
});

export const restartGame = createAsyncThunk("game/restart", async (_, {dispatch, rejectWithValue}) => {
    const result = await post("/game/reset");
    if (!result.ok) return rejectWithValue(result.error);
    await dispatch(loadGame());
    return null;
});

export const nextSeason = createAsyncThunk("game/nextSeason", async (_, {dispatch, getState, rejectWithValue}) => {
    if (getState().game.finance.season_status === "lose") {
        const restarted = await dispatch(restartGame());
        return restartGame.rejected.match(restarted) ? rejectWithValue(restarted.payload) : null;
    }
    for (const url of ["/season/finish", "/season/reset"]) {
        const result = await post(url);
        if (!result.ok) return rejectWithValue(result.error);
    }
    await dispatch(loadGame());
    return null;
}, {
    condition: (_, {getState}) => !getState().game.seasonLoading && getState().game.finance !== null,
});

export const optimisticSell = createAction("game/optimisticSell");
export const optimisticBuy = createAction("game/optimisticBuy");
export const optimisticPromote = createAction("game/optimisticPromote");
export const optimisticUpgrade = createAction("game/optimisticUpgrade");

export const sellPlayer = id => dispatch => {
    dispatch(optimisticSell(id));
    return dispatch(runQueuedAction(`/player/${id}/sell`));
};

export const buyPlayer = player => dispatch => {
    dispatch(optimisticBuy(player));
    return dispatch(runQueuedAction(`/player/${player.id}/buy`));
};

export const promotePlayer = id => dispatch => {
    dispatch(optimisticPromote(id));
    return dispatch(runQueuedAction(`/player/${id}/promote`));
};

export const upgradeStadium = id => dispatch => {
    dispatch(optimisticUpgrade(id));
    return dispatch(runQueuedAction(`/stadium/upgrades/${id}/level-up`));
};

const gameSlice = createSlice({
    name: "game",
    initialState,
    reducers: {
        clearActionError(state) {
            state.actionError = null;
        },
    },
    extraReducers: builder => {
        builder
            .addCase(loadGame.pending, (state, action) => {
                state.status = "loading";
                state.currentRequestId = action.meta.requestId;
                state.loadError = null;
            })
            .addCase(loadGame.fulfilled, (state, action) => {
                if (action.meta.requestId !== state.currentRequestId) return;
                Object.assign(state, action.payload);
                state.status = "succeeded";
            })
            .addCase(loadGame.rejected, (state, action) => {
                if (action.meta.requestId !== state.currentRequestId) return;
                state.status = "failed";
                if (state.finance === null) state.loadError = LOAD_ERROR;
                else state.actionError = REFRESH_ERROR;
            })

            .addCase(optimisticSell, (state, action) => {
                const player = state.squad.find(item => item.id === action.payload);
                if (!player || !state.finance) return;
                state.squad = state.squad.filter(item => item.id !== player.id);
                state.market.unshift({...player, status: "market"});
                state.finance.available_budget += player.price;
                state.finance.all_salary -= player.salary;
            })
            .addCase(optimisticBuy, (state, action) => {
                const player = action.payload;
                if (!state.finance) return;
                state.market = state.market.filter(item => item.id !== player.id);
                state.squad.push({...player, status: "squad"});
                state.finance.available_budget -= player.price + player.salary;
                state.finance.effective_transfer_left -= player.price;
                state.finance.all_salary += player.salary;
            })
            .addCase(optimisticPromote, (state, action) => {
                const player = state.squad.find(item => item.id === action.payload);
                if (!player) return;
                const roster = lineUps.filter(name => name !== ACADEMY);
                const next = player.lineUp === ACADEMY ? roster[0] : roster[(roster.indexOf(player.lineUp) + 1) % roster.length];
                player.lineUp = next;
                player.line_up = next;
            })
            .addCase(optimisticUpgrade, (state, action) => {
                const upgrade = state.upgrades.find(item => item.id === action.payload);
                if (!upgrade || upgrade.level >= upgrade.maxLevel || !state.finance) return;
                const multiplier = round(upgrade.multiplier + upgrade.multiplierStep);
                const ratio = upgrade.multiplier ? multiplier / upgrade.multiplier : 1;
                const finance = state.finance;
                finance.available_budget -= upgrade.price;
                if (upgrade.type === "income") {
                    finance.income_bonus = round(finance.income_bonus * ratio);
                    finance.win_reward = round(finance.win_reward * ratio);
                } else if (upgrade.type === "fans") {
                    finance.fans_bonus = round(finance.fans_bonus * ratio);
                }
                upgrade.level += 1;
                upgrade.multiplier = multiplier;
                upgrade.price += upgrade.priceStep ?? 0;
            })

            .addCase(runQueuedAction.rejected, (state, action) => {
                state.actionError = action.payload ?? REFRESH_ERROR;
            })

            .addCase(nextWeek.pending, state => {
                state.weekLoading = true;
            })
            .addCase(nextWeek.fulfilled, state => {
                state.weekLoading = false;
            })
            .addCase(nextWeek.rejected, (state, action) => {
                state.weekLoading = false;
                if (action.meta.condition) return;
                state.actionError = action.payload ?? REFRESH_ERROR;
            })

            .addCase(restartGame.rejected, (state, action) => {
                state.actionError = action.payload ?? REFRESH_ERROR;
            })

            .addCase(nextSeason.pending, state => {
                state.seasonLoading = true;
            })
            .addCase(nextSeason.fulfilled, state => {
                state.seasonLoading = false;
            })
            .addCase(nextSeason.rejected, (state, action) => {
                if (action.meta.condition) return;
                state.seasonLoading = false;
                state.actionError = action.payload ?? REFRESH_ERROR;
            })

            .addCase(resetStore, () => initialState);
    },
});

export const {clearActionError} = gameSlice.actions;
export default gameSlice.reducer;
