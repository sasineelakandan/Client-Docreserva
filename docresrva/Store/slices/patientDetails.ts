'use client';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PatientState {
  _id: string;
  userId: string;
  doctorId: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  reason: string;
  slotId: string;
}

const initialState: PatientState = {
  _id: '',
  userId: '',
  doctorId: '',
  firstName: '',
  lastName: '',
  age: 0,
  gender: '',
  reason: '',
  slotId: '',
};

const patientSlice = createSlice({
  name: 'patient',
  initialState,
  reducers: {
    setPatientDetails: (state, action: PayloadAction<PatientState>) => {
      const {
        _id,
        userId,
        doctorId,
        firstName,
        lastName,
        age,
        gender,
        reason,
        slotId,
      } = action.payload;

      state._id = _id;
      state.userId = userId;
      state.doctorId = doctorId;
      state.firstName = firstName;
      state.lastName = lastName;
      state.age = age;
      state.gender = gender;
      state.reason = reason;
      state.slotId = slotId;

      if (typeof window !== 'undefined') {
        localStorage.setItem('patient', JSON.stringify(state));
      }
    },
    clearPatientDetails: (state) => {
      state._id = '';
      state.userId = '';
      state.doctorId = '';
      state.firstName = '';
      state.lastName = '';
      state.age = 0;
      state.gender = '';
      state.reason = '';
      state.slotId = '';

      if (typeof window !== 'undefined') {
        localStorage.removeItem('patient');
      }
    },
    loadPatientFromStorage: (state) => {
      if (typeof window !== 'undefined') {
        const data = localStorage.getItem('patient');
        if (data) {
          const parsed = JSON.parse(data) as PatientState;
          state._id = parsed._id;
          state.userId = parsed.userId;
          state.doctorId = parsed.doctorId;
          state.firstName = parsed.firstName;
          state.lastName = parsed.lastName;
          state.age = parsed.age;
          state.gender = parsed.gender;
          state.reason = parsed.reason;
          state.slotId = parsed.slotId;
        }
      }
    },
  },
});

// Export actions
export const { setPatientDetails, clearPatientDetails, loadPatientFromStorage } = patientSlice.actions;

// Export reducer
export default patientSlice.reducer;
