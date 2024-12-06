'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/utils/doctorNavbar';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useForm } from "react-hook-form";


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
  const [showSlots, setShowSlots] = useState(false);
  const [change, setChange] = useState(false);
  const [rescheduleAppointmentId, setRescheduleAppointmentId] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } }: any = useForm();
  
  const filteredAppointments = filterDate
    ? appointments.filter((appt: any) => {
        const appointmentDate = new Date(appt.slotId.date).toISOString().split('T')[0];
        return appointmentDate === filterDate;
      })
    : appointments;

  const formatTime = (time24: any) => {
    const [hours, minutes] = time24.split(":");
    const period = hours >= 12 ? "PM" : "AM";
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes} ${period}`;
  };

  const onSubmit = async (data: any) => {
    const payload = {
      ...data,
      appointmentId: rescheduleAppointmentId,
    };
    console.log(payload);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_DOCTOR_BACKEND_URL}/appointments`,
        payload,
        { withCredentials: true }
      );
  
      setShowSlots(false);
      if(response.data){
        setChange(true);
      }
    } catch (error) {
      console.error("Error while creating the appointment:", error);
      Swal.fire('Error', 'There was an issue while rescheduling the appointment', 'error');
    }
  };

  

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>, appointmentId: string) => {
      const action = e.target.value;
    
      if (action === "reschedule") {
        Swal.fire({
          title: 'Reschedule Appointment',
          text: 'Are you sure you want to reschedule this appointment?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, reschedule it!'
        }).then((result) => {
          if (result.isConfirmed) {
            setRescheduleAppointmentId(appointmentId);
            setShowSlots(true);
            Swal.fire('Rescheduled!', 'The appointment has been marked for rescheduling.', 'success');
          }
        });
      } else if (action === "complete") {
        Swal.fire({
          title: 'Complete Appointment',
          text: 'Are you sure you want to mark this appointment as completed?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, mark as completed!'
        }).then((result) => {
          if (result.isConfirmed) {
            handleComplete(appointmentId);
            Swal.fire('Completed!', 'The appointment has been marked as completed.', 'success');
          }
        });
      } else if (action === "cancel") {
        Swal.fire({
          title: 'Cancel Appointment',
          text: 'Are you sure you want to cancel this appointment?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, cancel it!'
        }).then((result) => {
          if (result.isConfirmed) {
            handleCancel(appointmentId);
            Swal.fire('Canceled!', 'The appointment has been marked as canceled.', 'success'); 
          }
        });
      }
    };
  const handleComplete = async (appointmentId: string) => {
    try {
      
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_DOCTOR_BACKEND_URL}/appointments`,
        { appointmentId },
        { withCredentials: true }
      );
  
      setShowSlots(false);
      if (response.data) {
        setChange(true);
      }
    } catch (error) {
      console.error("Error while completing the appointment:", error);
    }
  };

  const handleCancel = async (appointmentId: any) => {
    
    try {
      
        const response = await axios.put(
          `${process.env.NEXT_PUBLIC_DOCTOR_BACKEND_URL}/appointments`,
          { appointmentId },
          { withCredentials: true }
        );

        setShowSlots(false);

        if (response.data) {
        
          
          setChange(true);
          Swal.fire('Cancelled!', 'The appointment has been cancelled.', 'success');
        }
      }
     catch (error) {
      console.error('Error while cancelling the appointment:', error);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 py-10 px-6">
        <h1 className="text-4xl font-extrabold text-center text-blue-900 mb-8">Appointments</h1>

        <div className="max-w-md mx-auto mb-6">
          <label className="block text-lg font-semibold text-blue-900 mb-2">Filter by Date:</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full p-3 border border-blue-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
          />
        </div>

        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold text-blue-700 mb-6">Scheduled Appointments</h2>
          <ul className="space-y-4">
            {filteredAppointments.map((appt: any) => (
              <li key={appt._id} className="p-4 border border-gray-300 rounded-lg shadow-md hover:shadow-lg transition duration-300 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <img
                    src={appt.userId.profilePic}
                    alt={`${appt.patientId.firstName} ${appt.patientId.lastName}`}
                    className="w-16 h-16 rounded-full object-cover shadow-md"
                  />
                  <div>
                    <p className="text-lg font-semibold text-gray-800">{appt.patientId.firstName} {appt.patientId.lastName}</p>
                    <p className="text-sm text-gray-500">Date: {new Date(appt.slotId.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
                    <p className="text-sm text-gray-500">Time: {formatTime(appt.slotId.startTime)} - {formatTime(appt.slotId.endTime)}</p>
                    <p className="text-sm text-gray-500">Reason: {appt.patientId.reason}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {appt.status === "completed" ? (
                    <span className="text-green-600 font-medium">Completed</span>
                  ) : appt.status === "canceled" ? (
                    <span className="text-red-600 font-medium">Canceled</span>
                  ) : (
                    <select
                      onChange={(e) => handleSelectChange(e, appt._id)}
                      className="p-2 border border-gray-300 rounded-md bg-white shadow-sm focus:ring-2 focus:ring-blue-500 transition duration-200"
                    >
                      <option value="default">Select Action</option>
                      <option value="complete">Complete</option>
                      <option value="cancel">Cancel</option>
                      <option value="reschedule">Reschedule</option>
                    </select>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {showSlots && (
        <div className="modal">
          <form onSubmit={handleSubmit(onSubmit)}>
            <label htmlFor="newSlot" className="block text-lg font-semibold mb-2">Choose a new Slot:</label>
            <input
              type="datetime-local"
              id="newSlot"
              {...register("newSlot", { required: "This field is required" })}
              className="w-full p-3 border border-blue-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            />
            {errors.newSlot && <p className="text-red-500">{errors.newSlot.message}</p>}
            <button
              type="submit"
              className="w-full py-3 bg-blue-500 text-white rounded-lg mt-4 hover:bg-blue-600 focus:outline-none transition duration-300"
            >
              Reschedule Appointment
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default AppointmentsList;
