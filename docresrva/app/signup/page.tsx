"use client"

import React, { useState } from 'react';
import { useForm, SubmitHandler, FieldValues } from 'react-hook-form';
import { FaGoogle, FaFacebook, FaTwitter, FaEye, FaEyeSlash } from 'react-icons/fa';
import Img from '../../public/1600w--HXaczhPPfU.webp';
import Image from 'next/image';

interface SignUpFormValues extends FieldValues {
  email: string;
  username: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

function SignUp() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpFormValues>();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  // Watch the password field
  const password = watch("password");

  const onSubmit: SubmitHandler<SignUpFormValues> = (data) => {
    console.log(data);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="flex flex-col items-center mb-8">
        <Image src={Img} alt="Doc Reserva Logo" className="w-16 h-16 mb-2" />
        <h1 className="text-3xl font-bold text-teal-700">Doc Reserva</h1>
      </div>
      
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white shadow-md rounded-lg p-8 w-full max-w-md"
      >
        <h2 className="text-2xl font-semibold text-gray-700 mb-6 text-center">Sign Up</h2>

        <div className="mb-4">
          <input
            {...register('email', { required: 'Email is required' })}
            type="text"
            placeholder="Enter your email"
            className="border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div className="mb-4">
          <input
            {...register('username', { required: 'Username is required' })}
            type="text"
            placeholder="Create Username"
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

        <button
          type="submit"
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded mt-4"
        >
          Sign Up
        </button>

        <div className="flex items-center justify-center my-6">
          <span className="text-gray-500 text-sm">connect with</span>
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
          <a href="/login" className="text-teal-500 hover:text-teal-700 font-semibold">Login</a>
        </p>

        <p className="text-center text-gray-600 text-sm mt-4">
          Are you a doctor?{' '}
          <a href="/doctor-signup" className="text-teal-500 hover:text-teal-700 font-semibold">Click Here</a>
        </p>
      </form>
    </div>
  );
}

export default SignUp;

