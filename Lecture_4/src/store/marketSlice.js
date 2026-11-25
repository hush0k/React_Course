import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchPlayers } from "@/services/service.js";
import { resetStore } from "@/store/actions.js";

export const loadMarket = createAsyncThunk("market/load", (params, {signal}) => fetchPlayers(params, signal));

const initialState = {
    players: [],
    total: null,
    params: null,
    currentRequestId: null,
};

const marketSlice = createSlice({
    name: "market",
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(loadMarket.pending, (state, action) => {
                state.status = "loading";
                state.params = action.meta.arg;
                state.currentRequestId = action.meta.requestId;
            })
            .addCase(loadMarket.fulfilled, (state, action) => {
                if (action.meta.requestId !== state.currentRequestId) return;
                state.status = "succeeded";
                state.players = action.payload.players;
                state.total = action.payload.total;
            })
            .addCase(loadMarket.rejected, (state, action) => {
                if (action.meta.requestId !== state.currentRequestId) return;
                state.status = "failed";
            })
            .addCase(resetStore, () => initialState);
    },
});

export default marketSlice.reducer;
