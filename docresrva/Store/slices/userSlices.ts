'use client';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  userId:string
  username: string;
  email: string;
  isAuthenticated: boolean;
  profilePic?:any;
}


const initialState: UserState = { username: '', email: '', isAuthenticated: false,profilePic:null,userId:'' };

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserDetails: (state, action: PayloadAction<UserState>) => {
      const { username, email, isAuthenticated,userId,profilePic } = action.payload;
      state.userId=userId
      state.username = username;
      state.email = email;
      state.isAuthenticated = isAuthenticated;
      state.profilePic=profilePic

     
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(state));
      }
    },
    clearUserDetails: (state) => {
      state.username = '';
      state.email = '';
      state.isAuthenticated = false;

      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
      }
    },
    authenticateUser: (state) => {
      state.isAuthenticated = true;

      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(state));
      }
    },
    deauthenticateUser: (state) => {
      state.isAuthenticated = false;

      // Update localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(state));
      }
    },
   
    loadUserFromStorage: (state) => {
      if (typeof window !== 'undefined') {
        const data = localStorage.getItem('user');
        console.log(data)
        if (data) {
          const parsed = JSON.parse(data) as UserState;
          state.userId=parsed.userId
          state.username = parsed.username;
          state.email = parsed.email;
          state.isAuthenticated = parsed.isAuthenticated;
        }
      }
    },
  },
});

// Export actions
export const { setUserDetails, clearUserDetails, authenticateUser, deauthenticateUser, loadUserFromStorage } = userSlice.actions;

// Export reducer
export default userSlice.reducer;
