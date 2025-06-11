import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type UserName=
{leetcodeHandle:string;
  codeforcesHandle:string;
  codechefHandle:string;
  gfgHandle:string;}
const initialState:UserName = {
  leetcodeHandle:'',
  codeforcesHandle:'',
  codechefHandle:'',
  gfgHandle:''
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserInfo: (state, action: PayloadAction<UserName>) => {
      state=action.payload;
    }
    
  },
});

export const { setUserInfo } = userSlice.actions;
export default userSlice.reducer;
