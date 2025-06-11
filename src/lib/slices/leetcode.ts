import { LeetCodeData } from "@/types/model";
import { createSlice } from "@reduxjs/toolkit";



const initialState: LeetCodeData = {
  handle: null,
  easy: null,
  medium: null,
  hard: null,
  total: null,
  currentRating: null,
  maxRating: null,
  contestHistory: [],
};

const leetcodeSlice = createSlice({
  name: "leetcode",
  initialState,
  reducers: {
    updateLeetcodeStats: (state, action) => {
      state.handle = action.payload.handle;
      state.easy = action.payload.easy;
      state.medium = action.payload.medium;
      state.hard = action.payload.hard;
      state.total = action.payload.total;
      state.currentRating = action.payload.currentRating;
      state.maxRating = action.payload.maxRating;
      state.contestHistory = action.payload.contestHistory
    },
  },
});

export const { updateLeetcodeStats } = leetcodeSlice.actions;
export default leetcodeSlice.reducer;
