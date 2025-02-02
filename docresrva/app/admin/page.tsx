'use client';
import React, { useState, useEffect, useMemo } from 'react';
import AdminNavbar from '../../components/utils/Sidebar';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, ArcElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import axios from 'axios';
import Swal from 'sweetalert2';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import axiosInstance from '@/components/utils/axiosInstence';

// Registering the chart elements
ChartJS.register(CategoryScale, LinearScale, ArcElement, BarElement, Title, Tooltip, Legend);

const AdminDashboard: React.FC = () => {
  const [timePeriod, setTimePeriod] = useState<'weekly' | 'monthly' | 'yearly' | 'today'>('weekly');
  const [doctors, setDoctors] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filteredRevenue, setFilteredRevenue] = useState<number>(0);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const { data } = await axiosInstance.get(`${process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL}/patients`, { withCredentials: true });
        setPatients(data);
      } catch (err) {
        Swal.fire("Empty!", "No data available for patients.", "warning");
      }
    };

    const fetchDoctors = async () => {
      try {
        const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL}/verifieddoctors`, { withCredentials: true });
        setDoctors(response.data);
      } catch (err) {
        Swal.fire("Error!", "Failed to fetch verified doctors.", "error");
      }
    };

    const fetchAppointments = async () => {
      try {
        const { data } = await axiosInstance.get(`${process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL}/appointments`, { withCredentials: true });
        setAppointments(data);
      } catch (err) {
        console.log(err);
      }
    };

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([fetchPatients(), fetchDoctors(), fetchAppointments()]);
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

  // Filter earnings by selected date
  useEffect(() => {
    if (selectedDate) {
      const filteredData = appointments.filter((appt) => {
        const apptDate = new Date(appt.paymentId?.transactionDate || '');
        return format(apptDate, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
      });

      const revenue = filteredData.reduce((acc, appt) => acc + (appt.paymentId?.amount || 0), 0);
      setFilteredRevenue(revenue);
    } else {
      setFilteredRevenue(stats.totalEarnings);
    }
  }, [selectedDate, appointments, stats.totalEarnings]);

  const chartData = useMemo(() => {
    const colors = {
      today: '#FF6384',
      weekly: '#36A2EB',
      monthly: '#4BC0C0',
      yearly: '#FFCD56',
    };

    const revenue = selectedDate ? filteredRevenue : stats[`${timePeriod}Revenue`];

    return {
      labels: [selectedDate ? `Revenue on ${format(selectedDate, 'dd MMM yyyy')}` : 'Revenue'],
      datasets: [
        {
          data: [revenue],
          backgroundColor: [colors[timePeriod]],
        },
      ],
    };
  }, [selectedDate, filteredRevenue, timePeriod, stats]);

  const barChartData = useMemo(() => {
    const colors = {
      today: '#FF6384',
      weekly: '#36A2EB',
      monthly: '#4BC0C0',
      yearly: '#FFCD56',
    };

    return {
      labels: [timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)],
      datasets: [
        {
          label: 'Earnings (₹)',
          data: [stats[`${timePeriod}Revenue`]],
          backgroundColor: [colors[timePeriod]],
          borderColor: [colors[timePeriod]],
          borderWidth: 1,
        },
      ],
    };
  }, [timePeriod, stats]);

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

        {/* Date Picker and Period Selector */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 mt-8">
          <div className="flex items-center gap-4">
            <label className="text-lg font-semibold">Select Date:</label>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              className="p-2 border rounded-md"
              dateFormat="yyyy-MM-dd"
              isClearable
              placeholderText="Pick a date"
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="text-lg font-semibold">Select Period:</label>
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value as 'weekly' | 'monthly' | 'yearly' | 'today')}
              className="p-2 border rounded-md"
            >
              <option value="today">Today</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          {selectedDate && (
            <div className="bg-white shadow-lg rounded-lg p-4 text-center">
              <h3 className="text-lg font-semibold">Revenue for {format(selectedDate, 'dd MMM yyyy')}</h3>
              <p className="text-2xl font-bold text-blue-600">₹ {filteredRevenue}</p>
            </div>
          )}
        </div>

        {/* Charts */}
        <div className="flex flex-wrap justify-between gap-4 mt-8">
          <div className="w-full sm:w-1/2 md:w-1/2 xl:w-1/2 max-w-md">
            <h3 className="text-center text-lg font-semibold mb-4">Revenue Overview</h3>
            <div className="h-[400px] max-h-[500px] flex justify-center items-center bg-white shadow-lg rounded-lg">
              <Doughnut data={chartData} options={chartOptions} />
            </div>
          </div>
          <div className="w-full sm:w-1/2 md:w-1/2 xl:w-1/2 max-w-full">
            <h3 className="text-center text-lg font-semibold mb-4">Earnings Comparison</h3>
            <div className="h-[400px] max-h-[500px] flex justify-center items-center bg-white shadow-lg rounded-lg">
              <Bar data={barChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;