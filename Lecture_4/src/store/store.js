import { configureStore } from "@reduxjs/toolkit";
import market from "@/store/marketSlice.js";
import player from "@/store/playerSlice.js";
import academy from "@/store/academySlice.js";
import history from "@/store/historySlice.js";
import publicData from "@/store/publicDataSlice.js";

export const store = configureStore({
    reducer: {market, player, academy, history, publicData},
});
