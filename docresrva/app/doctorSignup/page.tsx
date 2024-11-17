"use client";
import axios from 'axios';
import React, { useState } from 'react';
import { useForm, SubmitHandler, FieldValues } from 'react-hook-form';
import { FaGoogle, FaFacebook, FaTwitter, FaEye, FaEyeSlash } from 'react-icons/fa';
import Img from '../../public/1600w--HXaczhPPfU.webp';
import Image from 'next/image';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from "next/navigation";
import { setUserDetails } from '../../Store/slices/userSlices';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../Store';

interface DoctorSignUpFormValues extends FieldValues {
  email: string;
  username: string;
  phone: string;
  password: string;
  confirmPassword: string;
  specialization: string;
  licenseNumber: string;
  experience: number;
}

function DoctorSignUp() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<DoctorSignUpFormValues>();
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  const password = watch("password");

  const onSubmit: SubmitHandler<DoctorSignUpFormValues> = async (data) => {
    try {
      console.log(data);
      const response = await axios.post('http://localhost:8001/api/doctor/signup', data, { withCredentials: true });
      if (response.data) {
        dispatch(
          setUserDetails({
            username: response.data.name,
            email: response.data.email,
            isAuthenticated: false,
          })
        );
        const doctorId = response.data._id;
        router.replace(`/doctorOtp?id=${doctorId}`);
        toast.success('Sign Up successful! Please verify your email.');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(error);
        const errorMessage = error.response?.data?.error || 'An unexpected error occurred.';
        toast.error(errorMessage || 'An error occurred during sign-up.');
      } else {
        toast.error('Something went wrong. Please try again later.');
      }
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="flex flex-col items-center mb-8">
          <Image src={Img} alt="Doc Reserva Logo" className="w-16 h-16 mb-2" />
          <h1 className="text-3xl font-bold text-teal-700">Doc Reserva</h1>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white shadow-md rounded-lg p-8 w-full max-w-md"
        >
          <h2 className="text-2xl font-semibold text-gray-700 mb-6 text-center">Doctor Sign Up</h2>

          <div className="mb-4">
            <input
              {...register('email', { required: 'Email is required' })}
              type="email"
              placeholder="Enter your email"
              className="border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div className="mb-4">
            <input
              {...register('name', { required: 'name is required' })}
              type="text"
              placeholder="Create name"
              className="border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
          </div>

          <div className="mb-4">
            <input
              {...register('phone', { required: 'Phone number is required' })}
              type="tel"
              placeholder="Enter Phone Number"
              className="border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
          </div>

          <div className="mb-4">
  <select
    {...register("specialization", { required: "Specialization is required" })}
    defaultValue="" // Ensures the default placeholder is selected initially
    className="border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
  >
    <option value="" disabled>
      Select Specialization
    </option>
    <option value="cardiology">Cardiology</option>
    <option value="dermatology">Dermatology</option>
    <option value="pediatrics">Pediatrics</option>
    <option value="neurology">Neurology</option>
    <option value="orthopedics">Orthopedics</option>
  </select>
  {errors.specialization && (
    <p className="text-red-500 text-xs mt-1">{errors.specialization.message}</p>
  )}
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
    className="border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
  />
  {errors.experience && (
    <p className="text-red-500 text-xs mt-1">{errors.experience.message}</p>
  )}
</div>
          

         

          <div className="mb-4 relative">
            <input
              {...register('password', { required: 'Password is required' })}
              type={showPassword ? 'text' : 'password'}
              placeholder="Create Password"
              className="border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
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
              className="border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <span
              onClick={toggleConfirmPasswordVisibility}
              className="absolute right-3 top-3 text-gray-500 cursor-pointer"
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>
          <div className="flex justify-center space-x-6 mb-6">
          <button className="bg-red-600 text-white p-3 rounded-full">
            <FaGoogle />
          </button>
          <button className="bg-blue-600 text-white p-3 rounded-full">
            <FaFacebook />
          </button>
          <button className="bg-blue-400 text-white p-3 rounded-full">
            <FaTwitter />
          </button>
        </div>

        <p className="text-center text-gray-600 text-sm">
          Already have an account?{' '}
          <a href="/doctorLogin" className="text-teal-500 hover:text-teal-700 font-semibold">Login</a>
        </p>
          <button
            type="submit"
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded mt-4"
          >
            Sign Up
          </button>
        </form>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default DoctorSignUp;
