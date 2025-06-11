import { isSignedIn } from "@/types/model";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState:isSignedIn = {
    isSignedIn: false,
    isLoaded: false,
    username: null,
    error: null
};

const signedIn = createSlice({
  name: "signedIn",
  initialState,
  reducers: {
    setSignIn: (state, action: PayloadAction<isSignedIn>) => {
        state.isSignedIn = action.payload.isSignedIn;
        state.isLoaded = action.payload.isLoaded;
        state.username = action.payload.username;
        state.error = action.payload.error;
    }
  },
});

export const { setSignIn } = signedIn.actions;
export default signedIn.reducer;
