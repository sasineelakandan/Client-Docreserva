"use client";
import axios from 'axios';
import React, { useState } from 'react';
import { useForm, SubmitHandler, FieldValues } from 'react-hook-form';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Img from '../../public/1600w--HXaczhPPfU.webp';
import Image from 'next/image';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from "next/navigation";
import { setUserDetails } from '../../Store/slices/userSlices';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../Store';
import Spinner from '@/components/Spinner';
import Map from '../map/page'; // Import the MapComponent
import Swal from 'sweetalert2';
import Icon from '../../public/png-transparent-computer-icons-map-map-cdr-map-vector-map.png'
interface DoctorSignUpFormValues extends FieldValues {
  email: string;
  name: string;
  phone: string;
  password: string;
  confirmPassword: string;
  specialization: string;
  licenseNumber: string;
  experience: number;
}

function DoctorSignUp() {
  const router = useRouter();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<DoctorSignUpFormValues>();
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  const password = watch("password");

  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    address: '',
});

const handleLocationSelect = (locationData: { latitude: any; longitude: any; address: string }) => {
  console.log('Location data received from child:', locationData);
  setLocation(locationData);
};


 

const onSubmit: SubmitHandler<DoctorSignUpFormValues> = async (data) => {
  try {
    if (!location.latitude || !location.longitude) {
      // Location is not selected, show SweetAlert with a map icon
      Swal.fire({
        icon: 'error',
        title: 'Location Missing',
        text: 'Please select a location before submitting the form.',
        // Dynamically set the image src for the SweetAlert icon
        iconHtml: `<img src="${Icon.src}" style="width: 40px; height: 40px; color: red;" />`,  // Use Icon.src for the correct path
        customClass: {
          icon: 'swal2-icon swal2-error',  // Styling for the icon
        },
        confirmButtonText: 'Okay',
        confirmButtonColor: '#4CAF50',
      });
      return;
    }

    const fullData = { ...data, location };  // Include location in the data
    setLoading(true);
    console.log(fullData)
    const response = await axios.post('http://localhost:8001/api/doctor/signup', fullData, { withCredentials: true });

    if (response.data) {
      console.log(response.data);
      toast.success('Sign Up successful! Please verify your email.');
      dispatch(
        setUserDetails({
          userId: response.data._id,
          username: response.data.name,
          email: response.data.email,
          isAuthenticated: false,
        })
      );
      const doctorId = response.data._id;
      setTimeout(() => {
        router.replace(`/doctorOtp?id=${doctorId}`);
      }, 2000);
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log(error);
      const errorMessage = error.response?.data?.error || 'An unexpected error occurred.';
      toast.error(errorMessage || 'An error occurred during sign-up.');
    } else {
      console.log(error);
    }
  } finally {
    setLoading(false);
  }
};


  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-teal-500 to-teal-700 p-4">
        <div className="flex flex-col items-center mb-8">
          <Image src={Img} alt="Doc Reserva Logo" className="w-16 h-16 mb-2" />
          <h1 className="text-4xl font-bold text-white">Doc Reserva</h1>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white shadow-2xl rounded-lg p-8 w-full max-w-md"
        >
          <h2 className="text-2xl font-semibold text-teal-600 mb-6 text-center">Doctor Sign Up</h2>

          <div className="mb-4">
            <input
              {...register('email', {
                required: 'Email is required',
                validate: {
                  isGmail: (value) =>
                    value.endsWith('.com') || 'Only .com emails are allowed',
                },
              })}
              type="email"
              placeholder="Enter your email"
              className="border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div className="mb-4">
            <input
              {...register('name', { required: 'Username is required' })}
              type="text"
              placeholder="Create username"
              className="border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div className="mb-4">
            <input
              {...register('phone', { required: 'Phone number is required' })}
              type="tel"
              placeholder="Enter Phone Number"
              className="border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
          </div>

          <div className="mb-4">
            <select
              {...register("specialization", { required: "Specialization is required" })}
              defaultValue=""
              className="border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
            >
              <option value="" disabled>Select Specialization</option>
              <option value="cardiology">Cardiology</option>
              <option value="dermatology">Dermatology</option>
              <option value="pediatrics">Pediatrics</option>
              <option value="neurology">Neurology</option>
              <option value="orthopedics">Orthopedics</option>
            </select>
            {errors.specialization && <p className="text-red-500 text-xs mt-1">{errors.specialization.message}</p>}
          </div>

          <div className="mb-4">
            <input
              {...register('experience', {
                required: 'Experience is required',
                min: { value: 1, message: 'Experience must be at least 1 year' },
                max: { value: 50, message: 'Experience cannot exceed 50 years' },
              })}
              type="number"
              placeholder="Years of Experience"
              className="border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
            />
            {errors.experience && <p className="text-red-500 text-xs mt-1">{errors.experience.message}</p>}
          </div>

          <div className="mb-4 relative">
            <input
              {...register('password', { required: 'Password is required' })}
              type={showPassword ? 'text' : 'password'}
              placeholder="Create Password"
              className="border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
            />
            <span
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-3 text-gray-500 cursor-pointer"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div className="mb-4 relative">
            <input
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) =>
                  value === password || 'Passwords do not match',
              })}
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Re-enter Password"
              className="border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
            />
            <span
              onClick={toggleConfirmPasswordVisibility}
              className="absolute right-3 top-3 text-gray-500 cursor-pointer"
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <div className="mb-4">
            <input
              {...register('licenseNumber', { required: 'License number is required' })}
              type="text"
              placeholder="Enter License Number"
              className="border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
            />
            {errors.licenseNumber && <p className="text-red-500 text-xs mt-1">{errors.licenseNumber.message}</p>}
          </div>

          {/* Add the MapComponent for location selection */}
          <div className="mb-4 flex justify-center">
            <button
              type="button"
              onClick={() => setShowMap(!showMap)} // Toggle the map visibility
              className="bg-teal-600 text-white py-2 px-4 rounded-lg text-lg"
            >
              {showMap ? 'Hide Location Map' : 'Select Location'}
            </button>
          </div>

          {/* Show the Map component only when showMap is true */}
          {showMap && (
            <div className="mb-4">
              <Map onLocationSelect={handleLocationSelect} />
            </div>
          )}

          <div className="flex justify-center items-center">
            <button
              type="submit"
              className="bg-teal-600 text-white py-3 px-6 rounded-lg text-lg w-full disabled:bg-gray-400"
              disabled={loading}
            >
              {loading ? <Spinner /> : 'Sign Up'}
            </button>
          </div>

          <ToastContainer />
        </form>
      </div>
    </>
  );
}

export default DoctorSignUp;
