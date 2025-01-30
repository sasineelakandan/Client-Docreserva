'use client';
import React, { useState, useEffect, useMemo } from 'react';
import DoctorNavbar from '../../components/utils/doctorNavbar';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, ArcElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, ArcElement, BarElement, Title, Tooltip, Legend);

const Page: React.FC = () => {
  const [timePeriod, setTimePeriod] = useState<'total' | 'weekly' | 'monthly' | 'yearly'>('total');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filteredRevenue, setFilteredRevenue] = useState<number>(0);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const response = await axios.get<any[]>(
          `${process.env.NEXT_PUBLIC_DOCTOR_BACKEND_URL}/dashbord`,
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

  // Compute earnings
  const earnings = useMemo(() => ({
    weekly: appointments
      .filter(
        (appt) => new Date(appt.paymentId?.transactionDate || '') >= new Date(new Date().setDate(new Date().getDate() - 7))
      )
      .reduce((acc, appt) => acc + (appt.paymentId?.amount || 0), 0),
    monthly: appointments
      .filter((appt) => new Date(appt.paymentId?.transactionDate || '').getMonth() === new Date().getMonth())
      .reduce((acc, appt) => acc + (appt.paymentId?.amount || 0), 0),
    yearly: appointments
      .filter((appt) => new Date(appt.paymentId?.transactionDate || '').getFullYear() === new Date().getFullYear())
      .reduce((acc, appt) => acc + (appt.paymentId?.amount || 0), 0),
  }), [appointments]);

  const totalEarnings = useMemo(() => appointments.reduce((a, b) => a + (b.paymentId?.amount || 0), 0), [appointments]);

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
      setFilteredRevenue(totalEarnings);
    }
  }, [selectedDate, appointments, totalEarnings]);

  // Dynamically update Doughnut chart data
  const chartData = useMemo(() => {
    if (timePeriod === 'total') {
      // Show three colors for weekly, monthly, and yearly earnings
      return {
        labels: ['Weekly Earnings', 'Monthly Earnings', 'Yearly Earnings'],
        datasets: [
          {
            data: [earnings.weekly, earnings.monthly, earnings.yearly],
            backgroundColor: ['#FF5733', '#4CAF50', '#FF6384'], // Colors for weekly, monthly, yearly
          },
        ],
      };
    } else {
      // Show single color for selected time period
      const colors = {
        weekly: '#FF5733',
        monthly: '#4CAF50',
        yearly: '#FF6384',
      };

      const revenue = selectedDate ? filteredRevenue : earnings[timePeriod];

      return {
        labels: [selectedDate ? `Revenue on ${format(selectedDate, 'dd MMM yyyy')}` : 'Revenue'],
        datasets: [
          {
            data: [revenue],
            backgroundColor: [colors[timePeriod]],
          },
        ],
      };
    }
  }, [selectedDate, filteredRevenue, timePeriod, earnings]);

  // Dynamically update Bar Chart data
  const barChartData = useMemo(() => {
    if (timePeriod === 'total') {
      // Show all three periods (weekly, monthly, yearly)
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
      // Show only the selected time period
      const colors = {
        weekly: '#FF5733',
        monthly: '#4CAF50',
        yearly: '#FF6384',
      };

      return {
        labels: [timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)], // Capitalize the first letter
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
  }, [timePeriod, earnings]);
  const totalAppointments = appointments.length;
  if (loading) return <div>Loading...</div>;
 

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <DoctorNavbar />
      <main className="flex-1 p-6">
        {/* Date Picker and Revenue Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div className="bg-white shadow-lg rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold">Total Revenue</h3>
            <p className="text-3xl font-bold text-green-600">₹ {totalEarnings}</p>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold">Total Appointments</h3>
            <p className="text-3xl font-bold text-blue-600">{totalAppointments}</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
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
      </main>
    </div>
  );
};

export default Page;