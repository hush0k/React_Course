import { loadMarket } from "@/store/marketSlice.js";
import { loadPlayer } from "@/store/playerSlice.js";
import { loadAcademy } from "@/store/academySlice.js";
import { loadHistory } from "@/store/historySlice.js";

export const refreshAll = () => (dispatch, getState) => {
    const {market, player, academy, history} = getState();
    if (market.params !== null) dispatch(loadMarket(market.params));
    if (player.id !== null) dispatch(loadPlayer(player.id));
    if (academy.status !== "idle") dispatch(loadAcademy());
    if (history.status !== "idle") dispatch(loadHistory());
};
