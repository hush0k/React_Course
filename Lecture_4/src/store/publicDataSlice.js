import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchPublicData } from "@/services/service.js";
import { resetStore } from "@/store/actions.js";

export const loadPublicData = createAsyncThunk("publicData/load", () => fetchPublicData());

const initialState = {
    data: null,
    status: "idle",
    currentRequestId: null,
};

const publicDataSlice = createSlice({
    name: "publicData",
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(loadPublicData.pending, (state, action) => {
                state.status = "loading";
                state.currentRequestId = action.meta.requestId;
            })
            .addCase(loadPublicData.fulfilled, (state, action) => {
                if (action.meta.requestId !== state.currentRequestId) return;
                state.status = "succeeded";
                state.data = action.payload;
            })
            .addCase(loadPublicData.rejected, (state, action) => {
                if (action.meta.requestId !== state.currentRequestId) return;
                state.status = "failed";
            })
            .addCase(resetStore, () => initialState);
    },
});

export default publicDataSlice.reducer;
