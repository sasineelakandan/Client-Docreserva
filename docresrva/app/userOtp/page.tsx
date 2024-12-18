'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import Img from '../../public/1600w--HXaczhPPfU.webp';
import Image from 'next/image';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter, useSearchParams } from 'next/navigation';

function OTPVerification() {
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));
  const [timer, setTimer] = useState<number>(0);
  const [isExpired, setIsExpired] = useState<boolean>(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('id');

  useEffect(() => {
    if (!userId) return;

    const savedStartTime = localStorage.getItem(`otpTimerStart_${userId}`);
    const now = Date.now();

    if (savedStartTime) {
      const elapsedSeconds = Math.floor((now - Number(savedStartTime)) / 1000);
      const remainingTime = Math.max(59 - elapsedSeconds, 0);

      setTimer(remainingTime);
      setIsExpired(remainingTime === 0);
    } else {
      resetTimer();
    }

    let countdown: NodeJS.Timeout;
    if (timer > 0) {
      countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }

    return () => clearInterval(countdown);
  }, [timer, userId]);

  const resetTimer = () => {
    if (!userId) return;

    const now = Date.now();
    localStorage.setItem(`otpTimerStart_${userId}`, now.toString());
    setTimer(59);
    setIsExpired(false);
  };

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
      const response = await axios.post(
        'http://localhost:8001/api/user/verifyotp',
        { otp: otpString, userId },
        { withCredentials: true }
      );

      if (response.data) {
        toast.success('Otp Verified')
        console.log(response.data);
        setTimeout(()=>{
          router.replace('/userHome');
        },2000)
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || 'An unexpected error occurred.';
        toast.error(errorMessage);
      } else {
        toast.error('Something went wrong. Please try again later.');
      }
    }
  };

  const handleResend = async () => {
    try {
      const response = await axios.post(
        'http://localhost:8001/api/user/resendotp',
        { userId },
        { withCredentials: true }
      );

      if (response.data) {
        toast.success(' resend Otp success')
        console.log(response.data);
        setOtp(new Array(6).fill(''));
        resetTimer(); 
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || 'An unexpected error occurred.';
        toast.error(errorMessage);
      } else {
        toast.error('Something went wrong. Please try again later.');
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <>
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
      </>
    </div>
  );
}

export default OTPVerification;
