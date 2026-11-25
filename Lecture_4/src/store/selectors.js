import { createSelector } from "@reduxjs/toolkit";
import { getPositionGroup } from "@/lib/players.js";
import { getWeekDate } from "@/services/service.js";

export const PAGE_SIZE = 10;

export const selectMarketStatus = state => state.market.status;

export const selectMarketView = createSelector(
    [state => state.market.players, state => state.market.total, (state, page) => page],
    (found, total, page) => {
        const hasNext = found.length > PAGE_SIZE;
        const pagePlayers = found.slice(0, PAGE_SIZE);
        const totalPages = total !== null
            ? Math.max(1, Math.ceil(total / PAGE_SIZE))
            : page + (hasNext ? 1 : 0);
        const firstShown = pagePlayers.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
        const lastShown = (page - 1) * PAGE_SIZE + pagePlayers.length;
        return {pagePlayers, total, totalPages, firstShown, lastShown};
    },
);

export const selectSimilarPlayers = createSelector(
    [state => state.player.player, (state, pool) => pool],
    (player, pool) => {
        if (!player) return [];
        const group = getPositionGroup(player.position);
        return pool
            .filter(item => item.id !== player.id && group?.positions.includes(item.position))
            .sort((a, b) => Math.abs(a.power - player.power) - Math.abs(b.power - player.power))
            .slice(0, 4);
    },
);

export const selectGame = state => state.game;

export const selectSeasonOver = createSelector(
    [state => state.game.finance, state => state.game.upcoming],
    (finance, upcoming) => (finance ? finance.season_status !== "in_progress" || !upcoming : false),
);

export const selectSeasonResult = createSelector(
    [state => state.game.finance],
    finance => (finance && finance.season_status !== "in_progress" ? finance.season_status : null),
);

export const selectGameDate = createSelector(
    [state => state.game.upcoming],
    upcoming => (upcoming ? getWeekDate(upcoming.week) : null),
);

export const selectUpcomingMatches = createSelector(
    [state => state.game.upcoming],
    upcoming => upcoming?.matches ?? [],
);
