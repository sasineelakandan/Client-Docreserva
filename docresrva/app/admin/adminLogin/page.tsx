"use client"
import React, { useState } from 'react';
import { useForm, SubmitHandler, FieldValues } from 'react-hook-form';
import { FaGoogle, FaFacebook, FaTwitter, FaEye, FaEyeSlash } from 'react-icons/fa';
import Img from '../../../public/1600w--HXaczhPPfU.webp';
import Image from 'next/image';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import {useRouter} from "next/navigation";
import { setUserDetails} from '../../../Store/slices/userSlices';
import { useDispatch } from 'react-redux';
import { adminloginApi } from '@/Service/adminapi/page';
interface LoginFormValues extends FieldValues {
  email: string;
  password: string;
}

function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>();
   const router=useRouter()
   const dispatch=useDispatch()
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const onSubmit: SubmitHandler<LoginFormValues> =async (data) => {
    try{
      const response= await adminloginApi(data)
     
      if(response.data){
        
       
          toast.success(`Welcome back, Dr.Admin!`, {
            position: "top-center",
            autoClose: 2000,
            theme: "colored",
          });
          toast.info("Redirecting to your dashboard...", {
            position: "top-center",
            autoClose: 2000,
            theme: "colored",
          
           
        })
        setTimeout(()=>{
          router.replace('/admin/adminHome')
          
        
        },3000)
      }
    }catch(error){
      if (axios.isAxiosError(error)) {
        console.log(error)
        const errorMessage = error.response?.data?.error|| 'Please check your email & password';
        console.log(errorMessage)
        toast.error(errorMessage || 'Please check your email & password');
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
        <h2 className="text-2xl font-semibold text-gray-700 mb-6 text-center">Admin Login</h2>

        <div className="mb-4">
          <input
            {...register('email', { required: 'Email is required' })}
            type="text"
            placeholder="Enter your email"
            className="border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div className="mb-4 relative">
          <input
            {...register('password', { required: 'Password is required' })}
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
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

        <button
          type="submit"
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded mt-4"
        >
          Login
        </button>

        

       
        
      </form>
    </div>
    <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default Login;
