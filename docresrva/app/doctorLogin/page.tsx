"use client";
import React, { useState } from "react";
import { useForm, SubmitHandler, FieldValues } from "react-hook-form";
import { FaGoogle, FaFacebook, FaTwitter, FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";
import Img from "../../public/1600w--HXaczhPPfU.webp";
import { useDispatch } from "react-redux";
import { setUserDetails } from "../../Store/slices/userSlices";

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
  const router = useRouter();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const onSubmit: SubmitHandler<LoginFormValues> = async (data) => {
    try {
      const response = await axios.post("http://localhost:8001/api/doctor/login", data, {
        withCredentials: true,
      });
      if (response.data) {
        dispatch(
          setUserDetails({
            userId: response.data._id,
            username: response.data.name,
            email: response.data.email,
            isAuthenticated: true,
          })
        );
        toast.success(`Welcome back, Dr. ${response.data.name}!`, {
          position: "top-center",
          autoClose: 2000,
          theme: "colored",
        });
        toast.info("Redirecting to your dashboard...", {
          position: "top-center",
          autoClose: 2000,
          theme: "colored",
        });
        setTimeout(() => {
          router.replace("/doctorHome");
        }, 3000);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || "Please check your email & password";
        toast.error(errorMessage);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-teal-400 to-blue-500 p-4">
        <div className="flex flex-col items-center mb-8">
          <Image src={Img} alt="Doc Reserva Logo" className="w-20 h-20 mb-4 drop-shadow-xl" />
          <h1 className="text-4xl font-extrabold text-white drop-shadow-lg">Doc Reserva</h1>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white shadow-lg rounded-2xl p-10 w-full max-w-lg transform hover:scale-105 transition-transform duration-300"
        >
          <h2 className="text-3xl font-bold text-gray-700 mb-8 text-center">Doctor Login</h2>

          <div className="mb-6">
            <input
              {...register("email", { required: "Email is required" })}
              type="email"
              placeholder="Enter your email"
              className="border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 ease-in-out shadow-md hover:shadow-lg"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div className="mb-6 relative">
            <input
              {...register("password", { required: "Password is required" })}
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 ease-in-out shadow-md hover:shadow-lg"
            />
            <span
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-3 text-gray-500 cursor-pointer hover:text-teal-600 transition-all duration-200"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white font-bold py-3 rounded-lg shadow-md transform hover:-translate-y-1 transition-transform duration-200"
          >
            Login
          </button>

          
          

          <p className="text-center text-gray-600 text-sm mt-6">
            Don't have an account?{" "}
            <a
              href="/doctorSignup"
              className="text-teal-500 hover:text-teal-700 font-semibold transition-colors"
            >
              Sign Up
            </a>
          </p>
        </form>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default Login;
