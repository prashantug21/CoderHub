import { CodeChefData } from "@/types/model";
import { createSlice } from "@reduxjs/toolkit";

const initialState :CodeChefData= {
  handle: null,
  currentRating: null,
  maxRating: null,
  contestHistory: [],
};

const codechefSlice = createSlice({
  name: "codechef",
  initialState,
  reducers: {
    updateCodechefStats: (state, action) => {
      state.handle = action.payload.handle;
      state.currentRating = action.payload.rating;
      state.maxRating = action.payload.maxRating;
      state.contestHistory = action.payload.history;   
    },
  },
});

export const { updateCodechefStats } = codechefSlice.actions;
export default codechefSlice.reducer;
