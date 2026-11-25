import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    buyPlayer, clearActionError, loadGame, nextSeason, nextWeek, promotePlayer,
    restartGame, sellPlayer, upgradeStadium,
} from "@/store/gameSlice.js";
import {
    selectGame, selectGameDate, selectSeasonOver, selectSeasonResult, selectUpcomingMatches,
} from "@/store/selectors.js";

export function useGame() {
    const dispatch = useDispatch();
    const game = useSelector(selectGame);
    const date = useSelector(selectGameDate);
    const seasonOver = useSelector(selectSeasonOver);
    const seasonResult = useSelector(selectSeasonResult);
    const upcomingMatches = useSelector(selectUpcomingMatches);
    const [restartConfirmOpen, setRestartConfirmOpen] = useState(false);
    const [seasonResultClosed, setSeasonResultClosed] = useState(false);

    useEffect(() => {
        if (game.status === "idle") dispatch(loadGame({initial: true}));
    }, [dispatch, game.status]);

    const loadAll = useCallback(() => dispatch(loadGame()), [dispatch]);

    async function restart() {
        const result = await dispatch(restartGame());
        setRestartConfirmOpen(false);
        if (!result.error) setSeasonResultClosed(false);
    }

    async function toNextSeason() {
        const result = await dispatch(nextSeason());
        if (!result.error) setSeasonResultClosed(false);
    }

    return {
        ...game, date, seasonOver, seasonResult, upcomingMatches,
        restartConfirmOpen, seasonResultClosed,
        retryLoad: loadAll,
        clearActionError: () => dispatch(clearActionError()),
        openRestartConfirm: () => setRestartConfirmOpen(true),
        closeRestartConfirm: () => setRestartConfirmOpen(false),
        closeSeasonResult: () => setSeasonResultClosed(true),
        loadAll,
        sellPlayer: id => dispatch(sellPlayer(id)),
        buyPlayer: player => dispatch(buyPlayer(player)),
        promotePlayer: id => dispatch(promotePlayer(id)),
        upgradeStadium: id => dispatch(upgradeStadium(id)),
        nextWeek: () => dispatch(nextWeek()),
        nextSeason: toNextSeason,
        restartGame: restart,
    };
}
