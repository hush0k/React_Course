import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchAcademy, promote, setTraining } from "@/services/service.js";
import { resetStore } from "@/store/actions.js";

export const loadAcademy = createAsyncThunk("academy/load", async () => {
    const academy = await fetchAcademy();
    if (!academy) throw new Error("academy request failed");
    return academy;
});

export const promoteYouth = createAsyncThunk("academy/promote", async (id, {rejectWithValue}) => {
    const result = await promote(id);
    return result.ok ? result : rejectWithValue(result.error);
});

export const changeTraining = createAsyncThunk("academy/training", async ({id, training}, {rejectWithValue}) => {
    const result = await setTraining(id, training);
    return result.ok ? result : rejectWithValue(result.error);
});

const initialState = {
    academy: null,
    status: "idle",
    currentRequestId: null,
    mutationStatus: "idle",
    mutationError: null,
};

const mutationThunks = [promoteYouth, changeTraining];

const academySlice = createSlice({
    name: "academy",
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(loadAcademy.pending, (state, action) => {
                state.status = "loading";
                state.currentRequestId = action.meta.requestId;
            })
            .addCase(loadAcademy.fulfilled, (state, action) => {
                if (action.meta.requestId !== state.currentRequestId) return;
                state.status = "succeeded";
                state.academy = action.payload;
            })
            .addCase(loadAcademy.rejected, (state, action) => {
                if (action.meta.requestId !== state.currentRequestId) return;
                state.status = "failed";
            })
            .addCase(resetStore, () => initialState);

        for (const thunk of mutationThunks) {
            builder
                .addCase(thunk.pending, state => {
                    state.mutationStatus = "loading";
                    state.mutationError = null;
                })
                .addCase(thunk.fulfilled, state => {
                    state.mutationStatus = "succeeded";
                })
                .addCase(thunk.rejected, (state, action) => {
                    state.mutationStatus = "failed";
                    state.mutationError = action.payload ?? "Не удалось выполнить действие";
                });
        }
    },
});

export default academySlice.reducer;
