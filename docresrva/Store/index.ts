'use client'
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlices';
import DoctorReduder from './slices/doctorSlice';
import patientReducer from './slices/patientDetails'
const store = configureStore({
  reducer: {
    user: userReducer,
    doctor:DoctorReduder,
    patient:patientReducer

  },
});

export type RootState = ReturnType<typeof store.getState>; 
export type AppDispatch = typeof store.dispatch; 

export default store;