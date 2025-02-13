'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Img from '../../../public/1600w--HXaczhPPfU.webp';
import { forgototpApi } from '@/Service/doctorApi/page';

const OTPVerification = () => {
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));
  const [timer, setTimer] = useState<number>(59);
  const [isExpired, setIsExpired] = useState<boolean>(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('id');
  const email = searchParams.get('email');
  const password = searchParams.get('password');

  useEffect(() => {
    if (!userId) {
      toast.error('User ID is missing.');
      return;
    }

    // Generate a unique key using userId and a random value
    const uniqueKey = `otpTimer_${userId}_${Math.random().toString(36).substr(2, 9)}`;
    const storedTimer = localStorage.getItem(uniqueKey);

    if (storedTimer) {
      const savedTimer = parseInt(storedTimer, 10);
      if (savedTimer > 0) {
        setTimer(savedTimer);
      } else {
        setIsExpired(true);
      }
    }

    const countdown = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(countdown);
          setIsExpired(true);
          return 0;
        }
        const newTimer = prevTimer - 1;
        localStorage.setItem(uniqueKey, newTimer.toString());
        return newTimer;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [userId]);

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    if (element.nextSibling) {
      (element.nextSibling as HTMLInputElement).focus();
    }
  };

  const handleSubmit = async () => {
    try {
      const otpString = otp.join('');
      const response = await forgototpApi({ otp: otpString, userId, password })
      

      if (response.data) {
        toast.success('OTP Verified');
        toast.success('Password changed successfully');
        setTimeout(() => {
          router.replace('/doctor/doctorLogin');
        }, 2000);
      }
    } catch (error) {
      const errorMessage = axios.isAxiosError(error) && error.response?.data?.error
        ? error.response.data.error
        : 'Something went wrong. Please try again later.';
      toast.error(errorMessage);
    }
  };

  const handleResend = async () => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_DOCTOR_BACKEND_URL}/resendotp`,
        { userId },
        { withCredentials: true }
      );

      if (response.data) {
        toast.success('OTP Resent Successfully');
        setOtp(new Array(6).fill(''));
        setTimer(59);
        setIsExpired(false);

        // Save the new timer with the same unique key
        const uniqueKey = `otpTimer_${userId}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem(uniqueKey, '59');
      }
    } catch (error) {
      const errorMessage = axios.isAxiosError(error) && error.response?.data?.error
        ? error.response.data.error
        : 'Something went wrong. Please try again later.';
      toast.error(errorMessage);
    }
  };

  if (!userId) {
    return null; // Return null if the user ID is missing (which will prevent rendering until the necessary data is available)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <ToastContainer position="top-right" autoClose={4000} />
      <div className="text-center mb-8">
        <Image src={Img} alt="Doc Reserva Logo" className="w-16 h-16 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-teal-700">Doc Reserva</h1>
      </div>

      <div className="flex flex-col items-center bg-white p-8 shadow-md rounded-lg max-w-sm w-full">
        <Image src={Img} alt="OTP Illustration" className="w-32 h-32 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">OTP Verification</h2>
        <p className="text-gray-500 mb-6">We sent an OTP to your registered email</p>

        <div className="flex space-x-2 mb-4">
          {otp.map((data, index) => (
            <input
              key={index}
              type="text"
              className="border border-gray-300 rounded-lg w-12 h-12 text-center text-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
              maxLength={1}
              value={data}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(e.target, index)}
              onFocus={(e) => e.target.select()}
            />
          ))}
        </div>

        <div className="text-right text-red-500 text-sm mb-6">
          {timer > 0 ? `0:${timer.toString().padStart(2, '0')}s` : 'Time expired'}
        </div>

        {isExpired ? (
          <button
            onClick={handleResend}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded"
          >
            Resend OTP
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded"
            disabled={otp.includes('') || timer <= 0}
          >
            Verify
          </button>
        )}
      </div>
    </div>
  );
};

const OTPVerificationPage = () => {
  return (
    <React.Suspense fallback={<div>Loading OTP Verification...</div>}>
      <OTPVerification />
    </React.Suspense>
  );
};

export default OTPVerificationPage;
