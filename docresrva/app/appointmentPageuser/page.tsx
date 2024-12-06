'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/utils/doctorNavbar';
import axios from 'axios';
import Swal from 'sweetalert2';

const AppointmentsList = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState<string>('');
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_USER_BACKEND_URL}/appointments`,
          { withCredentials: true }
        );
        console.log(response.data);
        setAppointments(response.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const filteredAppointments = filterDate
    ? appointments.filter((appt: any) => {
        const appointmentDate = new Date(appt.slotId.date).toISOString().split('T')[0];
        return appointmentDate === filterDate;
      })
    : appointments;

  const formatTime = (time24: any) => {
    const [hours, minutes] = time24.split(':');
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes} ${period}`;
  };

  const handleCancel = async (appointmentId: any) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, cancel it!',
      });

      if (result.isConfirmed) {
        const response = await axios.put(
          `${process.env.NEXT_PUBLIC_USER_BACKEND_URL}/appointments`,
          { appointmentId },
          { withCredentials: true }
        );

        if (response.data) {
          setAppointments(prev =>
            prev.map(appt => (appt._id === appointmentId ? { ...appt, status: "canceled" } : appt))
          );
          Swal.fire('Cancelled!', 'Your appointment has been cancelled.', 'success');
          
        }
      } else {
        Swal.fire('Cancelled', 'Your appointment is safe :)', 'info');
      }
    } catch (error) {
      console.error('Error while canceling the appointment:', error);

      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', error.response?.data || error.message);
        Swal.fire('Error', error.response?.data?.message || 'Something went wrong!', 'error');
      } else {
        console.error('Unexpected error:', error);
        Swal.fire('Error', 'Unexpected error occurred.', 'error');
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 py-10 px-6">
        <h1 className="text-4xl font-extrabold text-center text-blue-900 mb-8">Appointments</h1>

        {/* Filter Section */}
        <div className="max-w-md mx-auto mb-6">
          <label className="block text-lg font-semibold text-blue-900 mb-2">Filter by Date:</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full p-3 border border-blue-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
          />
        </div>

        {/* Appointment List */}
        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold text-blue-700 mb-6">Scheduled Appointments</h2>
          <ul className="space-y-4">
            {filteredAppointments.map((appt: any) => (
              <li
                key={appt._id}
                className="p-4 border border-gray-300 rounded-lg shadow-md hover:shadow-lg transition duration-300 flex justify-between items-center"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={appt.doctorId.profilePic}
                    alt={`${appt.patientId.name} ${appt.patientId.lastName}`}
                    className="w-16 h-16 rounded-full object-cover shadow-md"
                  />
                  <div>
                    <p className="text-lg font-semibold text-gray-800">{appt.doctorId.name}</p>
                    <p className="text-sm text-gray-500">
                      Date: {new Date(appt.slotId.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <p className="text-sm text-gray-500">
                      Time: {formatTime(appt.slotId.startTime)} - {formatTime(appt.slotId.endTime)}
                    </p>
                    <p className="text-sm text-gray-500">Reason: {appt.patientId.reason}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {appt.status === 'complete' && (
                    <span className="px-4 py-2 bg-green-100 text-green-600 rounded-lg shadow">Complete</span>
                  )}
                  {appt.status === 'canceled' && (
                    <span className="px-4 py-2 bg-red-100 text-red-600 rounded-lg shadow">Canceled</span>
                  )}
                  {appt.status !== 'complete' && appt.status !== 'canceled' && (
                    <>
                      <span
                        className={`px-4 py-2 rounded-lg shadow ${
                          appt.status === 'rescheduled' ? 'bg-yellow-100 text-yellow-600' : ''
                        } ${appt.status === 'scheduled' ? 'bg-green-100 text-green-600' : ''}`}
                      >
                        {appt.status === 'rescheduled' ? 'Rescheduled' : appt.status === 'scheduled' ? 'Scheduled' : ''}
                      </span>
                      <button
                        onClick={() => handleCancel(appt._id)}
                        className="bg-red-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-red-600 transition duration-300"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Appointment Details Modal */}
        {selectedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-8 shadow-lg w-full max-w-lg">
              <h3 className="text-2xl font-bold text-blue-700 mb-4">Appointment Details</h3>
              <img
                src={selectedAppointment.profilePic}
                alt={`${selectedAppointment.firstName} ${selectedAppointment.lastName}`}
                className="w-24 h-24 rounded-full mx-auto mb-6 object-cover shadow-md"
              />
              <p className="text-lg font-medium mb-2">
                <strong>Patient Name:</strong> {selectedAppointment.firstName} {selectedAppointment.lastName}
              </p>
              <p className="text-lg font-medium mb-2">
                <strong>Date:</strong> {selectedAppointment.date}
              </p>
              <p className="text-lg font-medium mb-2">
                <strong>Time:</strong> {selectedAppointment.startTime} - {selectedAppointment.endTime}
              </p>
              <p className="text-lg font-medium mb-2">
                <strong>Reason:</strong> {selectedAppointment.reason}
              </p>
              <div className="mt-6 text-center">
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="bg-blue-500 text-white px-6 py-3 rounded-md shadow-md hover:bg-blue-600 transition duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AppointmentsList;
