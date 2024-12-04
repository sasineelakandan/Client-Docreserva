'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/utils/doctorNavbar';
import axios from 'axios';



const AppointmentsList = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_DOCTOR_BACKEND_URL}/appointments`,
          { withCredentials: true }
        );
        console.log(response.data)
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

  return <ShowAppointments appointments={appointments} />;
};

const ShowAppointments: React.FC<{ appointments: any }> = ({ appointments }) => {
  const [filterDate, setFilterDate] = useState<string>('');
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);

  // Function to format the date to a comparable string format (yyyy-mm-dd)
  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    return d.toISOString().split('T')[0]; // yyyy-mm-dd format
  };

  // Filter appointments based on the selected date
  const filteredAppointments = filterDate
    ? appointments.filter((appt: any) => formatDate(appt?.slotId?.date) === filterDate)
    : appointments;

  const handleReschedule = (appt: any, action: string) => {
    alert(`Rescheduling appointment with ${appt.firstName} ${appt.lastName}`);
  };

  const handleCancel = (appt: any) => {
    alert(`Cancelling appointment with ${appt.firstName} ${appt.lastName}`);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 py-10 px-6">
        <h1 className="text-4xl font-extrabold text-center text-blue-900 mb-8">
          Appointments
        </h1>

        {/* Filter Section */}
        <div className="max-w-md mx-auto mb-6">
          <label className="block text-lg font-semibold text-blue-900 mb-2">
            Filter by Date:
          </label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full p-3 border border-blue-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
          />
        </div>

        {/* Appointment List */}
        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold text-blue-700 mb-6">
            Scheduled Appointments
          </h2>
          <ul className="space-y-4">
            {filteredAppointments.map((appt: any) => (
              <li
                key={appt._id}
                className="p-4 border border-gray-300 rounded-lg shadow-md hover:shadow-lg transition duration-300 flex justify-between items-center"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={appt.userId.profilePic}
                    alt={`${appt.patientId.firstName} ${appt.patientId.lastName}`}
                    className="w-16 h-16 rounded-full object-cover shadow-md"
                  />
                  <div>
                    <p className="text-lg font-semibold text-gray-800">
                      {appt.patientId.firstName} {appt.patientId.lastName}
                    </p>
                    <p className="text-sm text-gray-500">
                      Date: {new Date(appt.slotId.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-sm text-gray-500">
                      Time: {appt.slotId.startTime} - {appt.slotId.endTime}
                    </p>
                    <p className="text-sm text-gray-500">Reason: {appt.patientId.reason}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    onChange={(e) => {
                      const action = e.target.value;
                      if (action === "reschedule") {
                        handleReschedule(appt, action);
                      } else if (action === "complete") {
                        handleReschedule(appt, action);
                      }
                    }}
                    className="bg-white border border-gray-300 rounded-md shadow-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                  >
                    <option value="" disabled>
                      Select Action
                    </option>
                    <option value="reschedule">Reschedule</option>
                    <option value="complete">Complete</option>
                  </select>
                  <button className="px-4 py-2 bg-gray-600 text-white rounded-lg shadow hover:scale-105 transform transition">
                    Message
                  </button>
                  <button
                    onClick={() => handleCancel(appt)}
                    className="bg-red-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-red-600 transition duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Appointment Details Modal */}
        {selectedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-8 shadow-lg w-full max-w-lg">
              <h3 className="text-2xl font-bold text-blue-700 mb-4">
                Appointment Details
              </h3>
              <img
                src={selectedAppointment.profilePic}
                alt={`${selectedAppointment.firstName} ${selectedAppointment.lastName}`}
                className="w-24 h-24 rounded-full mx-auto mb-6 object-cover shadow-md"
              />
              <p className="text-lg font-medium mb-2">
                <strong>Patient Name:</strong> {selectedAppointment.firstName}{' '}
                {selectedAppointment.lastName}
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
