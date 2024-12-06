'use client';

import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import Swal from "sweetalert2";
import AdminSidebar from "@/components/utils/Sidebar";
import axios from "axios";

// Define types for appointment, doctor, and patient
interface Doctor {
  name: string;
  email: string;
  profilePic: string;
  hospitalName:string;
  state:string;
  city:string;
  street:string

}

interface Patient {
  firstName: string;
  age: number;
  reason:string
}
interface User {
  profilePic:string
}

interface Payment {
  amount: number;
  status: string;
  transactionId: string;
}

interface Slot {
  date: string;
  startTime: string;
  endTime:string
}

interface Appointment {
  _id: string;
  doctorId: Doctor;
  patientId: Patient;
  paymentId: Payment;
  userId:User
  slotId: Slot;
  status: string;
}

const AppointmentManagement: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL}/appointments`,
          { withCredentials: true }
        );
        setAppointments(data);
      } catch (err) {
        Swal.fire("Error!", "Unable to fetch appointments.", "error");
      }
    };
    fetchAppointments();
  }, []);

  const filteredAppointments = appointments.filter((appointment) =>
    appointment?.patientId?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment?.doctorId?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="w-full p-6">
        <h1 className="text-2xl font-bold mb-4">Appointment Management</h1>
        <div className="mb-4 flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search for a patient"
            className="p-2 border border-gray-300 rounded w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button 
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => setSearchTerm(searchTerm)} // Trigger the search when clicked
          >
            <FaSearch />
          </button>
        </div>
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-4 py-2">Doctor Name</th>
              <th className="border px-4 py-2">Patient Name</th>
              <th className="border px-4 py-2">Payment ID</th>
              <th className="border px-4 py-2">Date</th>
              <th className="border px-4 py-2">Status</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((appointment) => (
                <tr key={appointment._id}>
                  <td className="border px-4 py-2">{appointment.doctorId.name}</td>
                  <td className="border px-4 py-2">{appointment?.patientId?.firstName}</td>
                  <td className="border px-4 py-2">{appointment?.paymentId?.transactionId}</td>
                  <td className="border px-4 py-2">
                    {new Date(appointment?.slotId?.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
          {appointment.status === "completed" ? (
            <span className="px-3 py-1 rounded-md bg-green-100 text-green-700 font-medium">
              Completed
            </span>
          ) : appointment.status === "canceled" ? (
            <span className="px-3 py-1 rounded-md bg-red-100 text-red-700 font-medium">
              Canceled
            </span>
          ) : appointment.status === "rescheduled" ? (
            <span className="px-3 py-1 rounded-md bg-yellow-100 text-yellow-700 font-medium">
              Rescheduled
            </span>
          ) : (
            <span className="px-3 py-1 rounded-md bg-blue-100 text-blue-700 font-medium">
              Scheduled
            </span>
          )}
        </td>
                  <td className="border px-4 py-2 space-x-2">
                    <button
                      className="bg-blue-500 text-white px-4 py-2 rounded"
                      onClick={() => openModal(appointment)}
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-4">No appointments found</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Custom Modal */}
{isModalOpen && selectedAppointment && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg mx-auto overflow-y-auto max-h-[80vh]">
      <h2 className="text-2xl font-bold mb-4">Appointment Details</h2>

      {/* Doctor Details */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Doctor Details</h3>
        <img
          src={selectedAppointment?.doctorId?.profilePic || "default-doctor.png"}
          alt="Doctor Profile"
          className="w-32 h-32 object-cover mb-4 border-2 border-gray-300 rounded-md"
        />
        <p><strong>Name:</strong> {selectedAppointment?.doctorId?.name}</p>
        <p><strong>Email:</strong> {selectedAppointment?.doctorId?.email}</p>
        <p><strong>Hospital Name:</strong> {selectedAppointment?.doctorId?.hospitalName}</p>
        <p><strong>Street:</strong> {selectedAppointment?.doctorId?.street}</p>
        <p><strong>City:</strong> {selectedAppointment?.doctorId?.city}</p>
        <p><strong>State:</strong> {selectedAppointment?.doctorId?.state}</p>
      </div>

      {/* Patient Details */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Patient Details</h3>
        <img
          src={selectedAppointment?.userId?.profilePic || "default-doctor.png"}
          alt="Doctor Profile"
          className="w-32 h-32 object-cover mb-4 border-2 border-gray-300 rounded-md"
        />
        <p><strong>Name:</strong> {selectedAppointment?.patientId?.firstName}</p>
        <p><strong>Age:</strong> {selectedAppointment?.patientId?.age}</p>
        <p><strong>Reason:</strong> {selectedAppointment?.patientId?.reason}</p>
      </div>

      {/* Slot Details */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Slot Details</h3>
        <p><strong>Date:</strong> {new Date(selectedAppointment?.slotId?.date).toLocaleDateString()}</p>
        <p><strong>Start Time:</strong> {selectedAppointment?.slotId?.startTime}</p>
        <p><strong>End Time:</strong> {selectedAppointment?.slotId?.endTime}</p>
      </div>

      {/* Payment Details */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Payment Details</h3>
        <p><strong>Amount:</strong> {selectedAppointment?.paymentId?.amount}</p>
        <p><strong>Status:</strong> {selectedAppointment?.status}</p>
      </div>

      <button
        className="bg-red-500 text-white px-4 py-2 rounded mt-4"
        onClick={closeModal}
      >
        Close
      </button>
    </div>
  </div>
)}
      </div>
    </div>
  );
};

export default AppointmentManagement;
