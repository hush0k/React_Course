import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchSeasonHistory } from "@/services/service.js";
import { resetStore } from "@/store/actions.js";

export const loadHistory = createAsyncThunk("history/load", () => fetchSeasonHistory());

const initialState = {
    seasons: [],
    status: "idle",
    currentRequestId: null,
};

const historySlice = createSlice({
    name: "history",
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(loadHistory.pending, (state, action) => {
                state.status = "loading";
                state.currentRequestId = action.meta.requestId;
            })
            .addCase(loadHistory.fulfilled, (state, action) => {
                if (action.meta.requestId !== state.currentRequestId) return;
                state.status = "succeeded";
                state.seasons = action.payload;
            })
            .addCase(loadHistory.rejected, (state, action) => {
                if (action.meta.requestId !== state.currentRequestId) return;
                state.status = "failed";
            })
            .addCase(resetStore, () => initialState);
    },
});

export default historySlice.reducer;
