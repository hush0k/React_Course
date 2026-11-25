import { createSelector } from "@reduxjs/toolkit";
import { getPositionGroup } from "@/lib/players.js";

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
