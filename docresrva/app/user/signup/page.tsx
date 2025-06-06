"use client";
import axios from "axios";
import React, { useState } from "react";
import { useForm, SubmitHandler, FieldValues } from "react-hook-form";
import { FaGoogle, FaFacebook, FaTwitter, FaEye, FaEyeSlash } from "react-icons/fa";
import Img from "../../../public/1600w--HXaczhPPfU.webp";
import Image from "next/image";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
import { setUserDetails } from "../../../Store/slices/userSlices";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../Store";
import Spinner from "@/components/Spinner";
import { signupApi } from "@/Service/userApi/page";

interface SignUpFormValues extends FieldValues {
  email: string;
  username: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

function SignUp() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpFormValues>();
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  const password = watch("password");

  const onSubmit: SubmitHandler<SignUpFormValues> = async (data) => {
    try {
      console.log(data);
      setLoading(true);
      const response = await signupApi(data);
      console.log(response)
      if (response.data) {
        toast.success("Sign Up successful! Please verify your email.");
        dispatch(
          setUserDetails({
            username: response.data.username,
            email: response.data.email,
            userId: response.data.id,
            isAuthenticated: false,
          })
        );
        const userId = response.data._id;
        setLoading(false);
        setTimeout(() => {
          router.replace(`/user/userOtp?id=${userId}`);
        }, 2000);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(error);
        const errorMessage = error.response?.data?.error || "An unexpected error occurred.";
        console.log(errorMessage);
        toast.error(errorMessage || "An error occurred during sign-up.");
      } else {
        console.log(error)
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-teal-400 to-teal-600 p-4">
        <div className="flex flex-col items-center mb-8">
          <Image src={Img} alt="Doc Reserva Logo" className="w-16 h-16 mb-2" />
          <h1 className="text-4xl font-extrabold text-white">Doc Reserva</h1>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white shadow-xl rounded-lg p-8 w-full max-w-md"
        >
          <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">Sign Up</h2>

          <div className="mb-4">
            <input
              {...register("email", {
                required: "Email is required",
                validate: {
                  endsWithDotCom: (value) =>
                    value.endsWith(".com") || "Email must end with .com",
                },
              })}
              type="text"
              placeholder="Enter your email"
              className="border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 transition duration-300 ease-in-out"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          <div className="mb-4">
            <input
              {...register("username", { required: "Username is required" })}
              type="text"
              placeholder="Create Username"
              className="border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 transition duration-300 ease-in-out"
            />
            {errors.username && (
              <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>
            )}
          </div>

          <div className="mb-4">
            <input
              {...register("phone", { required: "Phone number is required" })}
              type="tel"
              placeholder="Enter Phone Number"
              className="border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 transition duration-300 ease-in-out"
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
          </div>

          <div className="mb-4 relative">
            <input
              {...register("password", { required: "Password is required" })}
              type={showPassword ? "text" : "password"}
              placeholder="Create Password"
              className="border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 transition duration-300 ease-in-out"
            />
            <span
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-3 text-gray-500 cursor-pointer"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          <div className="mb-4 relative">
            <input
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) => value === password || "Passwords do not match",
              })}
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Re-enter Password"
              className="border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 transition duration-300 ease-in-out"
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
          {loading ? (
            <Spinner />
          ) : (
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:bg-gradient-to-r hover:from-teal-500 hover:to-teal-600 text-white font-semibold py-3 rounded mt-4 transition duration-300 ease-in-out"
            >
              Sign Up
            </button>
          )}

          <div className="flex items-center justify-center my-6">
            <span className="text-gray-500 text-sm">connect with</span>
          </div>

         

          <p className="text-center text-gray-600 text-sm">
            Already have an account?{" "}
            <a href="/user/login" className="text-teal-500 hover:text-teal-700 font-semibold">
              Login
            </a>
          </p>
        </form>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default SignUp;
