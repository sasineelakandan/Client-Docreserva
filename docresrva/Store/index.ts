'use client'
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlices';
import DoctorReduder from './slices/doctorSlice'
const store = configureStore({
  reducer: {
    user: userReducer,
    doctor:DoctorReduder

  },
});

export type RootState = ReturnType<typeof store.getState>; 
export type AppDispatch = typeof store.dispatch; 

export default store;