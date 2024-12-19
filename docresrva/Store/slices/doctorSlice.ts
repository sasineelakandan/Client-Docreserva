'use client';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DoctorState {
  _id: string;
  name: string;
  email: string;
  password: string;
  specialization: string;
  experience: number;
  phone: string;
  isVerified: boolean;
  isOtpVerified: boolean;
  isBlocked: boolean;
  isDeleted: boolean;
  hospitalName: string;
  licenseNumber: string;
  location:any,
  licenseImage: string;
  createdAt: string;
  updatedAt: string;
  profilePic?: string;
  fees: number;
  isAuthenticated: boolean;
}

const initialState: DoctorState = {
  _id: '',
  name: '',
  email: '',
  password: '',
  specialization: '',
  experience: 0,
  phone: '',
  isVerified: false,
  isOtpVerified: false,
  isBlocked: false,
  isDeleted: false,
  hospitalName: '',
  licenseNumber: '',
  location:null,
  licenseImage: '',
  createdAt: '',
  updatedAt: '',
  profilePic: '',
  fees: 0,
  isAuthenticated: false,
};

const DoctorSlice = createSlice({
  name: 'Doctor',
  initialState,
  reducers: {
    setUserDetails: (State, action: PayloadAction<DoctorState>) => {
      const {
        _id, name, email, password, specialization, experience, phone,
        isVerified, isOtpVerified, isBlocked, isDeleted, hospitalName,
        licenseNumber, location, licenseImage, createdAt,
        updatedAt, profilePic, fees, isAuthenticated
      } = action.payload;
      
      State._id = _id;
      State.name = name;
      State.email = email;
      State.password = password;
      State.specialization = specialization;
      State.experience = experience;
      State.phone = phone;
      State.isVerified = isVerified;
      State.isOtpVerified = isOtpVerified;
      State.isBlocked = isBlocked;
      State.isDeleted = isDeleted;
      State.hospitalName = hospitalName;
      State.licenseNumber = licenseNumber;
      State.location =location;
     
      State.licenseImage = licenseImage;
      State.createdAt = createdAt;
      State.updatedAt = updatedAt;
      State.profilePic = profilePic;
      State.fees = fees;
      State.isAuthenticated = isAuthenticated;

      if (typeof window !== 'undefined') {
        localStorage.setItem('Doctor', JSON.stringify(State));
      }
    },
    clearUserDetails: (State) => {
      Object.assign(State, initialState);

      if (typeof window !== 'undefined') {
        localStorage.removeItem('Doctor');
      }
    },
    authenticateUser: (State) => {
        State.isAuthenticated = true;

      if (typeof window !== 'undefined') {
        localStorage.setItem('Doctor', JSON.stringify(State));
      }
    },
    deauthenticateUser: (State) => {
        State.isAuthenticated = false;

      if (typeof window !== 'undefined') {
        localStorage.setItem('Doctor', JSON.stringify(State));
      }
    },
    loadUserFromStorage: (State) => {
      if (typeof window !== 'undefined') {
        const data = localStorage.getItem('Doctor');
        if (data) {
          const parsed = JSON.parse(data) as DoctorState;
          Object.assign(State, parsed);
        }
      }
    },
  },
});

// Export actions
export const {
  setUserDetails,
  clearUserDetails,
  authenticateUser,
  deauthenticateUser,
  loadUserFromStorage,
} = DoctorSlice.actions;

// Export reducer
export default DoctorSlice.reducer;
