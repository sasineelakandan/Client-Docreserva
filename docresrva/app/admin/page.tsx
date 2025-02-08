'use client';
import React, { useState, useEffect, useMemo } from 'react';
import AdminNavbar from '../../components/utils/Sidebar';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, ArcElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import axiosInstance from '@/components/utils/axiosInstence';
import Swal from 'sweetalert2';
ChartJS.register(CategoryScale, LinearScale, ArcElement, BarElement, Title, Tooltip, Legend);

const Page: React.FC = () => {
  const [timePeriod, setTimePeriod] = useState<'total' | 'weekly' | 'monthly' | 'yearly'>('total');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
 
const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
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

  // Compute earnings
  const earnings = useMemo(() => {
      const now = new Date();
      
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      const endOfDay = new Date(now.setHours(23, 59, 59, 999));
  
      const dailyEarnings = appointments
        .filter(
          (appt) => {
            const apptDate = new Date(appt.paymentId?.transactionDate || '');
            return apptDate >= startOfDay && apptDate <= endOfDay;
          }
        )
        .reduce((acc, appt) => acc + (appt.paymentId?.amount || 0), 0);
  
      const weeklyEarnings = appointments
        .filter(
          (appt) => new Date(appt.paymentId?.transactionDate || '') >= startOfWeek(now) && new Date(appt.paymentId?.transactionDate || '') <= endOfWeek(now)
        )
        .reduce((acc, appt) => acc + (appt.paymentId?.amount || 0), 0);
  
      const monthlyEarnings = appointments
        .filter(
          (appt) => new Date(appt.paymentId?.transactionDate || '') >= startOfMonth(now) && new Date(appt.paymentId?.transactionDate || '') <= endOfMonth(now)
        )
        .reduce((acc, appt) => acc + (appt.paymentId?.amount || 0), 0);
  
      const yearlyEarnings = appointments
        .filter(
          (appt) => new Date(appt.paymentId?.transactionDate || '') >= startOfYear(now) && new Date(appt.paymentId?.transactionDate || '') <= endOfYear(now)
        )
        .reduce((acc, appt) => acc + (appt.paymentId?.amount || 0), 0);
  
      return {
        daily: dailyEarnings,
        weekly: weeklyEarnings,
        monthly: monthlyEarnings,
        yearly: yearlyEarnings,
      };
  }, [appointments]);
  
  
    const totalEarnings = useMemo(() => appointments.reduce((a, b) => a + (b.paymentId?.amount || 0), 0), [appointments]);
  
    // Filter earnings by selected date range
    useEffect(() => {
      if (fromDate && toDate) {
        const filteredData = appointments.filter((appt) => {
          const apptDate = new Date(appt.paymentId?.transactionDate || '');
          return apptDate >= fromDate && apptDate <= toDate;
        });
  
        const revenue = filteredData.reduce((acc, appt) => acc + (appt.paymentId?.amount || 0), 0);
        setFilteredRevenue(revenue);
      } else {
        setFilteredRevenue(totalEarnings);
      }
    }, [fromDate, toDate, appointments, totalEarnings]);
    const chartData = useMemo(() => {
      if (fromDate && toDate) {
        // Show filtered revenue for selected date range
        return {
          labels: [`Revenue from ${format(fromDate, 'dd MMM yyyy')} to ${format(toDate, 'dd MMM yyyy')}`],
          datasets: [
            {
              data: [filteredRevenue],
              backgroundColor: ['#FFD700'], // Gold color for filtered revenue
            },
          ],
        };
      } else if (timePeriod === 'total') {
        // Show three categories for total earnings
        return {
          labels: ['Weekly Earnings', 'Monthly Earnings', 'Yearly Earnings'],
          datasets: [
            {
              data: [earnings.weekly, earnings.monthly, earnings.yearly],
              backgroundColor: ['#FF5733', '#4CAF50', '#FF6384'],
            },
          ],
        };
      } else {
        // Show single category for selected time period
        const colors = {
          weekly: '#FF5733',
          monthly: '#4CAF50',
          yearly: '#FF6384',
        };
    
        return {
          labels: ['Revenue'],
          datasets: [
            {
              data: [earnings[timePeriod]],
              backgroundColor: [colors[timePeriod]],
            },
          ],
        };
      }
    }, [fromDate, toDate, filteredRevenue, timePeriod, earnings]);
  
    const barChartData = useMemo(() => {
      if (fromDate && toDate) {
        // Show filtered revenue for selected date range
        return {
          labels: [`Revenue from ${format(fromDate, 'dd MMM yyyy')} to ${format(toDate, 'dd MMM yyyy')}`],
          datasets: [
            {
              label: 'Earnings (₹)',
              data: [filteredRevenue],
              backgroundColor: ['#FFD700'],
              borderColor: ['#DAA520'],
              borderWidth: 1,
            },
          ],
        };
      } else if (timePeriod === 'total') {
        // Show all three earnings (weekly, monthly, yearly)
        return {
          labels: ['Weekly', 'Monthly', 'Yearly'],
          datasets: [
            {
              label: 'Earnings (₹)',
              data: [earnings.weekly, earnings.monthly, earnings.yearly],
              backgroundColor: ['#FF5733', '#4CAF50', '#FF6384'],
              borderColor: ['#D32F2F', '#388E3C', '#D32F2F'],
              borderWidth: 1,
            },
          ],
        };
      } else {
        // Show selected time period earnings
        const colors = {
          weekly: '#FF5733',
          monthly: '#4CAF50',
          yearly: '#FF6384',
        };
    
        return {
          labels: [timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)],
          datasets: [
            {
              label: 'Earnings (₹)',
              data: [earnings[timePeriod]],
              backgroundColor: [colors[timePeriod]],
              borderColor: [colors[timePeriod]],
              borderWidth: 1,
            },
          ],
        };
      }
    }, [fromDate, toDate, filteredRevenue, timePeriod, earnings]);
  
    const totalAppointments = appointments.length;
    const totalPatients = patients.length;
    const totalDoctors = doctors.length
  
    if (loading) return <div>Loading...</div>;
  
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <AdminNavbar />

      {/* Main Content */}
      <div className="w-full m-10"> {/* Adjust ml-[250px] to match the width of your sidebar */}
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white shadow-lg rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold">Total Revenue</h3>
            <p className="text-3xl font-bold text-green-600">₹ {totalEarnings}</p>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold">Total Appointments</h3>
            <p className="text-3xl font-bold text-blue-600">{totalAppointments}</p>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold">Total Patients</h3>
            <p className="text-3xl font-bold text-purple-600">{totalPatients}</p>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold">Total Doctors</h3>
            <p className="text-3xl font-bold text-orange-600">{totalDoctors}</p>
          </div>
        </div>

        {/* Date Picker and Period Selector */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
           <div className="flex items-center gap-4">
                      <label className="text-lg font-semibold">From:</label>
                      <DatePicker
                        selected={fromDate}
                        onChange={(date) => setFromDate(date)}
                        className="p-2 border rounded-md"
                        dateFormat="yyyy-MM-dd"
                        isClearable
                        placeholderText="Pick a start date"
                      />
                      <label className="text-lg font-semibold">To:</label>
                      <DatePicker
                        selected={toDate}
                        onChange={(date) => setToDate(date)}
                        className="p-2 border rounded-md"
                        dateFormat="yyyy-MM-dd"
                        isClearable
                        placeholderText="Pick an end date"
                      />
                    </div>
          <div className="flex items-center gap-4">
            <label className="text-lg font-semibold">Select Period:</label>
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value as 'total' | 'weekly' | 'monthly' | 'yearly')}
              className="p-2 border rounded-md"
            >
              <option value="total">Total</option>
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
                     <Doughnut data={chartData} />
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

export default Page;