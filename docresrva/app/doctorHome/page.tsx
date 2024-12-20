'use client';
import React, { useState, useEffect } from 'react';
import DoctorNavbar from '../../components/utils/doctorNavbar';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import axios from 'axios';
import Image from 'next/image';
// Registering the chart elements
ChartJS.register(CategoryScale, LinearScale, ArcElement, Title, Tooltip, Legend);

const Page: React.FC = () => {
  const [timePeriod, setTimePeriod] = useState<'weekly' | 'monthly' | 'yearly' | 'today'>('weekly');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [doctorProfile, setDoctorProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetching doctor profile data
  useEffect(() => {
    const fetchDoctorProfile = async () => {
      try {
        const response = await axios.get('http://localhost:8001/api/doctor/profile', { withCredentials: true });
        if (response.data) {
          setDoctorProfile(response.data); // Storing the doctor profile in state
        }
      } catch (error: any) {
        if (error?.response) {
          setError(error.response.data?.message || "An error occurred while fetching doctor profile.");
        } else {
          setError("An unexpected error occurred.");
        }
      }
    };

    fetchDoctorProfile();
  }, []);

  // Fetching appointments data
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const response = await axios.get<any[]>(
          `${process.env.NEXT_PUBLIC_DOCTOR_BACKEND_URL}/appointments`,
          { withCredentials: true }
        );
        setAppointments(response.data);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError('Failed to fetch appointments.');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const isToday = (date: Date) => {
    const now = new Date();
    return (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  };

  const isThisMonth = (date: Date) => {
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  };

  const isThisYear = (date: Date) => {
    const now = new Date();
    return date.getFullYear() === now.getFullYear();
  };

  const earningsToday = appointments
    .filter((appt) => isToday(new Date(appt.paymentId?.transactionDate || '')))
    .reduce((acc, appt) => acc + (appt.paymentId?.amount || 0), 0);

  const earningsWeekly = appointments
    .filter(
      (appt) =>
        new Date(appt.paymentId?.transactionDate || '') >=
        new Date(new Date().setDate(new Date().getDate() - 7))
    )
    .reduce((acc, appt) => acc + (appt.paymentId?.amount || 0), 0);

  const earningsMonthly = appointments
    .filter((appt) => isThisMonth(new Date(appt.paymentId?.transactionDate || '')))
    .reduce((acc, appt) => acc + (appt.paymentId?.amount || 0), 0);

  const earningsYearly = appointments
    .filter((appt) => isThisYear(new Date(appt.paymentId?.transactionDate || '')))
    .reduce((acc, appt) => acc + (appt.paymentId?.amount || 0), 0);

  const filteredAppointments = appointments.filter((appt) => {
    const transactionDate = new Date(appt.paymentId?.transactionDate || '');
    return timePeriod === 'weekly'
      ? transactionDate >= new Date(new Date().setDate(new Date().getDate() - 7))
      : timePeriod === 'monthly'
      ? transactionDate >= new Date(new Date().setMonth(new Date().getMonth() - 1))
      : timePeriod === 'yearly'
      ? transactionDate >= new Date(new Date().setFullYear(new Date().getFullYear() - 1))
      : timePeriod === 'today'
      ? isToday(transactionDate)
      : false;
  });

  const totalEarnings = filteredAppointments.reduce((acc, appt) => acc + (appt.paymentId?.amount || 0), 0);

  const cardData = {
    appointments: filteredAppointments.length,
    earningsToday,
    earningsWeekly,
    earningsMonthly,
    earningsYearly,
  };

  const chartData = {
    labels: ['Earnings Today', 'Earnings Weekly', 'Earnings Monthly', 'Earnings Yearly'],
    datasets: [
      {
        data: [
          cardData.earningsToday,
          cardData.earningsWeekly,
          cardData.earningsMonthly,
          cardData.earningsYearly,
        ],
        backgroundColor: ['#FF6384', '#36A2EB', '#4BC0C0', '#FFCD56'],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: function (tooltipItem: any) {
            const value = tooltipItem.raw as number;
            return `₹${value.toLocaleString()}`;  // Changed to ₹ symbol
          },
        },
      },
    },
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <div className="flex-1 flex flex-col">
        <DoctorNavbar />
        <main className="p-6 flex-1">
          {/* Time Period Buttons */}
          <div className="flex space-x-4 mb-6">
            {['today', 'weekly', 'monthly', 'yearly'].map((period) => (
              <button
                key={period}
                onClick={() => setTimePeriod(period as 'weekly' | 'monthly' | 'yearly' | 'today')}
                className={`px-4 py-2 rounded-md transition-all ${
                  timePeriod === period
                    ? 'bg-blue-600 text-white scale-105'
                    : 'bg-blue-400 text-white hover:bg-blue-500'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>

          {/* Stats Cards */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              { label: 'Appointments', value: cardData.appointments, gradient: 'from-blue-400 to-blue-600' },
              { label: 'Earnings Today', value: `₹${cardData.earningsToday.toLocaleString()}`, gradient: 'from-green-400 to-green-600' },
              { label: 'Earnings Weekly', value: `₹${cardData.earningsWeekly.toLocaleString()}`, gradient: 'from-yellow-400 to-yellow-600' },
              { label: 'Earnings Monthly', value: `₹${cardData.earningsMonthly.toLocaleString()}`, gradient: 'from-purple-400 to-purple-600' },
              { label: 'Earnings Yearly', value: `₹${cardData.earningsYearly.toLocaleString()}`, gradient: 'from-red-400 to-red-600' },
            ].map((card, index) => (
              <div
                key={index}
                className={`bg-gradient-to-r ${card.gradient} p-4 shadow-lg rounded-lg text-center`}
              >
                <h3 className="text-xl font-semibold text-white">{card.label}</h3>
                <p className="mt-2 text-3xl font-bold text-white">{card.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-between items-center flex-wrap">
            {/* Doughnut Chart */}
            <div className="flex justify-center items-center w-full md:w-1/2" style={{ height: '400px' }}>
              <Doughnut data={chartData} options={chartOptions} />
            </div>

            {/* Doctor Profile */}
            <div className="mt-8 md:mt-0 w-full md:w-1/2 flex flex-col items-center text-center">
              <div className="bg-gray-100 p-8 shadow-xl rounded-xl w-full md:w-96">
                {doctorProfile?.isVerified ? (
                  <>
                    <Image
                      src={doctorProfile?.profilePic}
                      alt="Doctor"
                      className="w-52 h-52 rounded-full border-8 border-blue-600"
                    />
                    <h3 className="text-4xl font-semibold mt-6">{doctorProfile?.name}</h3>
                    <p className="text-xl text-gray-600 mt-3">Specialist: {doctorProfile?.specialization}</p>
                    <p className="text-xl text-gray-600 mt-3">License Number: {doctorProfile?.licenseNumber}</p>

                    {/* Only show the "Verified" section if doctor is verified */}
                    {doctorProfile?.isVerified && (
                      <div className="mt-4 flex items-center justify-center">
                        <span className="text-green-500 text-3xl">✔</span>
                        <span className="ml-3 text-xl text-green-500">Verified</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center text-xl text-gray-700 mt-6">
                    <h3 className="font-semibold text-2xl">Profile Incomplete</h3>
                    <p className="mt-4">
                      Please complete your profile and wait for verification to access all features.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Page;
