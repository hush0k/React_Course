import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchPlayer } from "@/services/service.js";
import { resetStore } from "@/store/actions.js";

export const loadPlayer = createAsyncThunk("player/load", (id, {signal}) => fetchPlayer(id, signal));

const initialState = {
    id: null,
    player: null,
    status: "idle",
    currentRequestId: null,
};

const playerSlice = createSlice({
    name: "player",
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(loadPlayer.pending, (state, action) => {
                if (state.id !== String(action.meta.arg)) state.player = null;
                state.id = String(action.meta.arg);
                state.status = "loading";
                state.currentRequestId = action.meta.requestId;
            })
            .addCase(loadPlayer.fulfilled, (state, action) => {
                if (action.meta.requestId !== state.currentRequestId) return;
                state.status = "succeeded";
                state.player = action.payload;
            })
            .addCase(loadPlayer.rejected, (state, action) => {
                if (action.meta.requestId !== state.currentRequestId) return;
                state.status = "failed";
            })
            .addCase(resetStore, () => initialState);
    },
});

export default playerSlice.reducer;
