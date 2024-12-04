'use client'

import React, { useState } from "react";
import Navbar from "@/components/utils/doctorNavbar";

type Appointment = {
  id: number;
  patientName: string;
  profilePhoto: string;
  date: string;
  time: string;
  purpose: string;
};

const appointments: Appointment[] = [
  {
    id: 1,
    patientName: "John Doe",
    profilePhoto: "https://via.placeholder.com/100",
    date: "2024-12-05",
    time: "10:00 AM",
    purpose: "General Checkup",
  },
  {
    id: 2,
    patientName: "Jane Smith",
    profilePhoto: "https://via.placeholder.com/100",
    date: "2024-12-06",
    time: "11:30 AM",
    purpose: "Follow-up",
  },
  {
    id: 3,
    patientName: "Michael Brown",
    profilePhoto: "https://via.placeholder.com/100",
    date: "2024-12-05",
    time: "02:00 PM",
    purpose: "Consultation",
  },
];

const ShowAppointments: React.FC = () => {
  const [filterDate, setFilterDate] = useState<string>("");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const filteredAppointments = filterDate
    ? appointments.filter((appt) => appt.date === filterDate)
    : appointments;

  const handleReschedule = (appt: Appointment) => {
    alert(`Rescheduling appointment with ${appt.patientName}`);
  };

  const handleCancel = (appt: Appointment) => {
    alert(`Cancelling appointment with ${appt.patientName}`);
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
            {filteredAppointments.map((appt) => (
              <li
                key={appt.id}
                className="p-4 border border-gray-300 rounded-lg shadow-md hover:shadow-lg transition duration-300 flex justify-between items-center"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={appt.profilePhoto}
                    alt={appt.patientName}
                    className="w-16 h-16 rounded-full object-cover shadow-md"
                  />
                  <div>
                    <p className="text-lg font-semibold text-gray-800">{appt.patientName}</p>
                    <p className="text-sm text-gray-500">Date: {appt.date}</p>
                    <p className="text-sm text-gray-500">Time: {appt.time}</p>
                    <p className="text-sm text-gray-500">Purpose: {appt.purpose}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleReschedule(appt)}
                    className="bg-yellow-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-yellow-600 transition duration-300"
                  >
                    Reschedule
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
                src={selectedAppointment.profilePhoto}
                alt={selectedAppointment.patientName}
                className="w-24 h-24 rounded-full mx-auto mb-6 object-cover shadow-md"
              />
              <p className="text-lg font-medium mb-2">
                <strong>Patient Name:</strong> {selectedAppointment.patientName}
              </p>
              <p className="text-lg font-medium mb-2">
                <strong>Date:</strong> {selectedAppointment.date}
              </p>
              <p className="text-lg font-medium mb-2">
                <strong>Time:</strong> {selectedAppointment.time}
              </p>
              <p className="text-lg font-medium mb-2">
                <strong>Purpose:</strong> {selectedAppointment.purpose}
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

export default ShowAppointments;
