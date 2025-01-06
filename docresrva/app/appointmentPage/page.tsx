'use client'

import React, { useState, useEffect, ChangeEvent,useMemo } from 'react';
import Navbar from '@/components/utils/doctorNavbar';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useForm, SubmitHandler, FieldValues } from "react-hook-form";
import { useRouter } from 'next/navigation';
interface Appointment {
  _id: string;
  doctorId:{
    _id:string
    name:string
  }
  slotId: {
    date: string;
    slot:string
  };
  userId: {
    profilePic: string;
  };
  patientId: {
    firstName: string;
    lastName: string;
    reason:string
  };
  reason: string;
  status: 'completed' | 'canceled' | 'pending';
}

interface FormValues {
  date: string;
  startTime: string;
  endTime: string;
}

const AppointmentsList: React.FC = () => {
  const [filterDate, setFilterDate] = useState<string>('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showSlots, setShowSlots] = useState<boolean>(false);
  const [rescheduleAppointmentId, setRescheduleAppointmentId] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterPatient, setFilterPatient] = useState("");
  const router=useRouter()

 

  const { register, handleSubmit, formState: { errors },watch } = useForm<FormValues>();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const response = await axios.get<Appointment[]>(
          `${process.env.NEXT_PUBLIC_DOCTOR_BACKEND_URL}/appointments`,
          { withCredentials: true }
        );
        setAppointments(response.data);
      } catch (err) {
        console.error("Error fetching appointments:", err);
        setError("Failed to fetch appointments.");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);
   
  const [currentPage, setCurrentPage] = useState(1);
  const doctorsPerPage = 1;
  const filteredAppointments = useMemo(() => {
    return appointments.filter(appt => {
      const appointmentDate = new Date(appt.slotId.date).toDateString();
      const matchesDate = !filterDate || appointmentDate === filterDate;
      const matchesPatient = !filterPatient || appt.patientId.firstName.toLowerCase().includes(filterPatient.toLowerCase());
      return matchesDate && matchesPatient;
    });
  }, [appointments, filterDate, filterPatient]);
  

  const formatTime = (time24: string): string => {
    const [hours, minutes] = time24.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const payload = {
      ...data,
      appointmentId: rescheduleAppointmentId,
    };

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_DOCTOR_BACKEND_URL}/appointments`,
        payload,
        { withCredentials: true }
      );

      setShowSlots(false);
      if (response.data) {
        setAppointments(prev =>
          prev.map(appt =>
            appt._id === rescheduleAppointmentId
              ? {
                  ...appt,
                  slotId: {
                    ...appt.slotId,
                    date:data.date,
                    startTime: data.startTime,
                    endTime: data.endTime
                  }
                }
              : appt
          )
        )
        Swal.fire('Success', 'Appointment successfully rescheduled!', 'success');
      }
    } catch (err) {
      console.error("Error rescheduling the appointment:", err);
      Swal.fire('Error', 'Failed to reschedule the appointment.', 'error');
    }
  };

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>, appointmentId: string) => {
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
      }).then(result => {
        if (result.isConfirmed) {
          setRescheduleAppointmentId(appointmentId);
          setShowSlots(true);
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
        confirmButtonText: 'Yes, complete it!'
      }).then(result => {
        if (result.isConfirmed) {
          handleComplete(appointmentId);
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
      }).then(result => {
        if (result.isConfirmed) {
          handleCancel(appointmentId);
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

      if (response.data) {
        setAppointments(prev =>
          prev.map(appt => (appt._id === appointmentId ? { ...appt, status: "completed" } : appt))
        );
        Swal.fire('Completed!', 'Your appointment has been completed.', 'success');
      }
    } catch (err) {
      console.error("Error completing appointment:", err);
      Swal.fire('Error', 'Failed to complete the appointment.', 'error');
    }
  };

  const handleCancel = async (appointmentId: string) => {
    try {
      console.log(appointmentId)
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_DOCTOR_BACKEND_URL}/appointments`,
        { appointmentId },
        { withCredentials: true }
      );

      if (response.data) {
        setAppointments(prev =>
          prev.map(appt => (appt._id === appointmentId ? { ...appt, status: "canceled" } : appt))
        );
        Swal.fire('Cancelled!', 'Your appointment has been cancelled.', 'success');
      }
    } catch (err) {
      console.error("Error cancelling appointment:", err);
      Swal.fire('Error', 'Failed to cancel the appointment.', 'error');
    }
  };

 
  const appointmentsPerPage = 3; 
  
  const totalPages = Math.ceil(filteredAppointments.length / appointmentsPerPage);
  
  const paginatedAppointments = useMemo(() => {
    const startIndex = (currentPage - 1) * appointmentsPerPage;
    const endIndex = startIndex + appointmentsPerPage;
    return filteredAppointments.slice(startIndex, endIndex);
  }, [filteredAppointments, currentPage, appointmentsPerPage]);
  
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  }

  const getNextTwoDays = () => {
    const today = new Date();
    const nextTwoDays = new Date(today);
    nextTwoDays.setDate(today.getDate() + 2);
    return nextTwoDays.toISOString().split('T')[0]; // Returns the date in 'YYYY-MM-DD' format
  };
  
  const today = new Date().toISOString().split('T')[0];

  // Watch the specific fields
  const handleChat=async(apptId:string,doctorId:string)=>{
    try {
      console.log(apptId,doctorId)
      const response = await axios.post(`${process.env.NEXT_PUBLIC_DOCTOR_BACKEND_URL}/chat`, {
        apptId },{withCredentials:true});
  
      if(response.data){
        const roomId=response?.data?.data?.status
        router.push(`/chatroomDoctor?id=${roomId}&&userId=${doctorId}`)
      }
  
      
      
    } catch (error:any) {
      console.error("Error starting chat:", error.message);
  
      
      if (error.response) {
        alert(`Error: ${error.response.data.message}`);
      } else {
        alert("Unable to start chat. Please try again later.");
      }
    }
  }


  

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 py-10 px-6">
        <h1 className="text-4xl font-extrabold text-center text-blue-900 mb-8">Appointments</h1>

        <div className="max-w-md mx-auto">
  {/* Filter by Date */}
  <div className="mb-6">
    <label className="block text-lg font-semibold text-blue-900 mb-2">Filter by Date:</label>
    <input
      type="date"
      value={filterDate}
      onChange={(e) => setFilterDate(e.target.value)}
      className="w-full p-3 border border-blue-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
      aria-label="Filter appointments by date"
    />
  </div>

  {/* Filter by Doctor Name */}
  <div className="mb-6">
    <label className="block text-lg font-semibold text-blue-900 mb-2">Filter by Patient Name:</label>
    <input
      type="text"
      id="doctor"
      name="doctor"
      placeholder="Search by Patient name"
      value={filterPatient}
      onChange={(e) => setFilterPatient(e.target.value)}
      className="w-full p-3 border border-blue-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
      aria-label="Filter appointments by doctor name"
    />
  </div>
</div>


        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold text-blue-700 mb-6">Scheduled Appointments</h2>
          {loading ? (
            <p>Loading appointments...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : filteredAppointments.length > 0 ? (
            <ul className="space-y-4">
              {paginatedAppointments.map(appt => (
  <li key={appt._id} className="p-4 border border-gray-300 rounded-lg shadow-md hover:shadow-lg transition duration-300 flex justify-between items-center">
    <div className="flex items-center gap-4">
      <img
        src={appt.userId.profilePic}
        alt={`${appt.patientId.firstName} ${appt.patientId.lastName}`}
        className="w-16 h-16 rounded-full object-cover shadow-md"
      />
      <div>
        <p className="text-lg font-semibold text-gray-800">{appt.patientId.firstName} {appt.patientId.lastName}</p>
        <p className="text-sm text-gray-500">Date: {new Date(appt.slotId.date).toDateString()}</p>
        <p className="text-sm text-gray-500">Time: {appt?.slotId?.slot}</p>
        <p className="text-sm text-gray-500">Reason: {appt.patientId.reason}</p>
      </div>
    </div>
    <div className="flex items-center gap-4">
      {appt.status !== "completed" && appt.status !== "canceled" ? (
        <div className="flex items-center space-x-4">
        {/* Action Selector */}
        <select
          onChange={(e) => handleSelectChange(e, appt._id)}
          className="bg-gray-100 text-black p-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
        >
          <option value="">Actions</option>
         
          <option value="complete">Complete</option>
          <option value="cancel">Cancel</option>
        </select>
      
        {/* Chat Button */}
        <button
          onClick={() => handleChat(appt._id, appt?.doctorId?._id)}
          className="bg-black text-white px-4 py-2 rounded-md shadow-md hover:bg-gray-800 focus:ring-2 focus:ring-blue-500 transition duration-300"
        >
          Chat
        </button>
      </div>
        
      ) : (
        <span
          className={`px-4 py-2 rounded-lg shadow ${
            appt.status === "completed" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
          }`}
        >
          {appt.status === "completed" ? "Completed" : "Canceled"}
        </span>
      )}
    </div>
  </li>
))}<div className="flex justify-center items-center mt-6">
<button
  onClick={() => handlePageChange(currentPage - 1)}
  disabled={currentPage === 1}
  className={`px-4 py-2 mx-1 border rounded ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'bg-blue-500 text-white'}`}
>
  Previous
</button>
{Array.from({ length: totalPages }, (_, index) => (
  <button
    key={index}
    onClick={() => handlePageChange(index + 1)}
    className={`px-4 py-2 mx-1 border rounded ${
      currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-white text-blue-500'
    }`}
  >
    {index + 1}
  </button>
))}
<button
  onClick={() => handlePageChange(currentPage + 1)}
  disabled={currentPage === totalPages}
  className={`px-4 py-2 mx-1 border rounded ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'bg-blue-500 text-white'}`}
>
  Next
</button>
</div>

            </ul>
          ) : (
            <p>No appointments available.</p>
          )}
        </div>
        {showSlots && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
      <h2 className="text-xl font-semibold mb-4">Select Your Slot</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Date Picker */}
        <div>
          <label htmlFor="date" className="block text-sm font-semibold">
            Select Date:
          </label>
          <input
            type="date"
            id="date"
            {...register("date", {
              required: "Date is required",
              validate: (value) => {
                const selectedDate = new Date(value).setHours(0, 0, 0, 0);
                const minDate = new Date(today).setHours(0, 0, 0, 0); // Today
                const maxDate = new Date(getNextTwoDays()).setHours(0, 0, 0, 0); // Next two days

                if (selectedDate < minDate || selectedDate > maxDate) {
                  return `Date must be between ${today} and ${getNextTwoDays()}.`;
                }
                return true;
              },
            })}
            min={today} // Minimum date: today
            max={getNextTwoDays()} // Maximum date: next two days
            className="w-full px-4 py-2 border rounded-lg"
          />
          {errors.date && (
            <span className="text-red-500 text-sm">{errors.date.message}</span>
          )}
        </div>

        {/* Start Time Picker */}
        <div>
          <label htmlFor="startTime" className="block text-sm font-semibold">
            Start Time (AM/PM):
          </label>
          <input
            type="time"
            id="startTime"
            step="3600" // 3600 seconds = 1 hour
            {...register("startTime", {
              required: "Start time is required",
              validate: (value) => {
                const selectedDate = watch("date");
                if (selectedDate) {
                  const currentDate = new Date();
                  const selectedDateTime = new Date(`${selectedDate}T${value}`);
                  return (
                    selectedDateTime > currentDate || "Start time must be in the future."
                  );
                }
                return true;
              },
            })}
            className="w-full px-4 py-2 border rounded-lg"
          />
          {errors.startTime && (
            <span className="text-red-500 text-sm">{errors.startTime.message}</span>
          )}
        </div>

        {/* End Time Picker */}
        <div>
          <label htmlFor="endTime" className="block text-sm font-semibold">
            End Time (AM/PM):
          </label>
          <input
            type="time"
            id="endTime"
            step="3600" // 3600 seconds = 1 hour
            {...register("endTime", {
              required: "End time is required",
              validate: (value) => {
                const startTime = watch("startTime");
                if (startTime) {
                  return value > startTime || "End time must be after start time.";
                }
                return true;
              },
            })}
            className="w-full px-4 py-2 border rounded-lg"
          />
          {errors.endTime && (
            <span className="text-red-500 text-sm">{errors.endTime.message}</span>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setShowSlots(false)}
            type="button"
            className="bg-gray-500 text-white px-4 py-2 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-teal-600 text-white px-4 py-2 rounded-lg"
          >
            Save
          </button>
        </div>
      </form>
    </div>
    
  </div>
)}



      </div>
    </>
  );
};

export default AppointmentsList;
