'use client';
import React, { useState, useEffect } from 'react';
import AdminNavbar from '../../components/utils/Sidebar';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import axios from 'axios';
import Swal from 'sweetalert2';

// Registering the chart elements
ChartJS.register(CategoryScale, LinearScale, ArcElement, Title, Tooltip, Legend);

const AdminDashboard: React.FC = () => {
  const [timePeriod, setTimePeriod] = useState<'weekly' | 'monthly' | 'yearly' | 'today'>('weekly');
  const [doctors, setDoctors] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const { data } = await axios.get(`${process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL}/patients`, { withCredentials: true });
        setPatients(data);
      } catch (err) {
        Swal.fire("Empty!", "No data available for patients.", "warning");
      }
    };
    fetchPatients();
  }, []);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL}/verifieddoctors`, { withCredentials: true });
        setDoctors(response.data);
      } catch (err) {
        Swal.fire("Error!", "Failed to fetch verified doctors.", "error");
      }
    };

    const fetchAppointments = async () => {
      try {
        const { data } = await axios.get(`${process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL}/appointments`, { withCredentials: true });
        setAppointments(data);
      } catch (err) {
        console.log(err)
      }
    };

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([fetchDoctors(), fetchAppointments()]);
      } catch (err) {
        setError("Error loading data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper function to calculate revenue for a given date range
  const calculateRevenue = (startDate: Date, endDate: Date) => {
    return appointments
      .filter((appt) => {
        const transactionDate = new Date(appt.paymentId?.transactionDate || '');
        return transactionDate >= startDate && transactionDate <= endDate;
      })
      .reduce((acc, appt) => acc + (appt.paymentId?.amount || 0), 0);
  };

  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfYear = new Date(today.getFullYear(), 0, 1);

  const stats = {
    totalDoctors: doctors.length,
    totalPatients: patients.length,
    totalAppointments: appointments.length,
    totalEarnings: appointments.reduce((acc, appt) => acc + (appt.paymentId?.amount || 0), 0),
    todayRevenue: calculateRevenue(new Date(today.setHours(0, 0, 0, 0)), today),
    weeklyRevenue: calculateRevenue(startOfWeek, today),
    monthlyRevenue: calculateRevenue(startOfMonth, today),
    yearlyRevenue: calculateRevenue(startOfYear, today),
  };

  const chartData = {
    labels: ['todayRevenue', 'weeklyRevenue ', 'monthlyRevenue', 'yearlyRevenue'],
    datasets: [
      {
        data: [stats.todayRevenue, stats.weeklyRevenue, stats.monthlyRevenue, stats.yearlyRevenue],
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
            return tooltipItem.label === 'Total Earnings'
              ? `₹${value.toLocaleString()}`
              : value.toLocaleString();
          },
        },
      },
    },
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <AdminNavbar />

      {/* Main Content */}
      <div className="flex-1 p-6 bg-gray-100">
       

        {/* Stats Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Doctors', value: stats.totalDoctors, gradient: 'from-blue-400 to-blue-600' },
            { label: 'Total Patients', value: stats.totalPatients, gradient: 'from-teal-400 to-teal-600' },
            { label: 'Total Appointments', value: stats.totalAppointments, gradient: 'from-green-400 to-green-600' },
            { label: 'Total Earnings', value: `₹${stats.totalEarnings.toLocaleString()}`, gradient: 'from-purple-400 to-purple-600' },
            { label: 'Today Revenue', value: `₹${stats.todayRevenue.toLocaleString()}`, gradient: 'from-pink-400 to-pink-600' },
            { label: 'Weekly Revenue', value: `₹${stats.weeklyRevenue.toLocaleString()}`, gradient: 'from-orange-400 to-orange-600' },
            { label: 'Monthly Revenue', value: `₹${stats.monthlyRevenue.toLocaleString()}`, gradient: 'from-indigo-400 to-indigo-600' },
            { label: 'Yearly Revenue', value: `₹${stats.yearlyRevenue.toLocaleString()}`, gradient: 'from-yellow-400 to-yellow-600' },
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

        <div className="mt-8 flex justify-center items-center">
          {/* Doughnut Chart */}
          <div className="w-full md:w-1/2" style={{ height: '400px' }}>
            <Doughnut data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
