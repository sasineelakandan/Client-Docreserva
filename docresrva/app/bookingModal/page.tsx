import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
interface AppointmentBookingProps {
  doctorId: string;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

const generateSlotsForDay = (date: Date, doctorId: string) => {
  const slots = [];
  const startTime = 9; // 9 AM
  const endTime = 17; // 5 PM
  const now = new Date();

  for (let hour = startTime; hour < endTime; hour++) {
    const slotStart = new Date(date);
    slotStart.setHours(hour, 0, 0, 0);

    // Skip slots that are in the past
    if (slotStart < now) continue;

    const startTimeStr = `${hour % 12 === 0 ? 12 : hour % 12}:00 ${hour >= 12 ? "PM" : "AM"}`;
    const endTimeStr = `${(hour + 1) % 12 === 0 ? 12 : (hour + 1) % 12}:00 ${(hour + 1) >= 12 ? "PM" : "AM"}`;
    slots.push({
      date: date.toISOString().split("T")[0],
      startTime: startTimeStr,
      endTime: endTimeStr,
      doctorId,
      isBooked:false
    });
  }

  return slots;
};

const generateSlots = (doctorId: string) => {
  const today = new Date();
  const slots = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(today.getDate() + i);
    slots.push(...generateSlotsForDay(date, doctorId));
  }

  return slots;
};

const AppointmentBooking: React.FC<AppointmentBookingProps> = ({
  doctorId,
  isModalOpen,
  setIsModalOpen,
}) => {
  const allSlots = generateSlots(doctorId); // Passing doctorId here
  const uniqueDates = Array.from(new Set(allSlots.map((slot) => slot.date)));
  const router=useRouter()
  const [selectedDate, setSelectedDate] = useState<string | null>(uniqueDates.length > 0 ? uniqueDates[0] : null); // Ensure it's not null
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const slotsForSelectedDate = allSlots.filter((slot) => slot.date === selectedDate);

 
const handleBooking = async (slot: { 
  doctorId: string; 
  startTime: string; 
  endTime: string; 
  date: string; 
  isBooked: boolean; 
}) => {
  setLoading(true);
  setError(null);

  try {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_USER_BACKEND_URL}/createslots`, slot,{withCredentials:true});

    if (response.data) {
      await Swal.fire({
        icon: "success",
        title: "Success",
        text: "Appointment booked successfully!",
        confirmButtonText: "OK",
      });
      
      setIsModalOpen(false);
      router.push(`/patientDetails?id=${response?.data?._id}`)
    }
  } catch (error: any) {
    console.error("Error booking appointment:", error);

    let errorMessage = "There was an error booking your appointment. Please try again.";
    if (error.response && error.response.data) {
      errorMessage = error.response.data.message || errorMessage;
    }

    setError(errorMessage);

    await Swal.fire({
      icon: "error",
      title: "Error",
      text: errorMessage,
      confirmButtonText: "OK",
    });
  } finally {
    setLoading(false);
  }
};

  return (
    isModalOpen && (
      <div
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
        role="dialog"
        aria-labelledby="modal-title"
        aria-modal="true"
      >
        <div className="p-6 bg-white shadow-2xl rounded-xl max-w-lg w-full relative">
          <h1 id="modal-title" className="text-3xl font-semibold text-gray-800 mb-6 text-center">
            Book an Appointment Slot
          </h1>

          {/* Date Selection */}
          <div className="flex space-x-2 mb-4 overflow-x-auto">
            {uniqueDates.map((date) => (
              <button
                key={date}
                className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-all shadow-md ${
                  selectedDate === date
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 hover:bg-blue-100 text-gray-800"
                }`}
                onClick={() => setSelectedDate(date)}
                aria-pressed={selectedDate === date}
              >
                {date}
              </button>
            ))}
          </div>

          {/* Error Message */}
          {error && <p className="text-red-500 text-center font-medium mb-4">{error}</p>}

          {/* Slots */}
          <div className="grid grid-cols-2 gap-4">
            {slotsForSelectedDate.length > 0 ? (
              slotsForSelectedDate.map((slot) => (
                <button
                  key={slot.startTime}
                  className={`px-4 py-3 text-sm font-semibold border rounded-lg shadow-md transition-all ${
                    loading ? "bg-gray-200 text-gray-400" : "bg-gray-50 hover:bg-blue-50 text-gray-800"
                  }`}
                  onClick={() => handleBooking(slot)}
                  disabled={loading}
                >
                  {slot.startTime} - {slot.endTime}
                </button>
              ))
            ) : (
              <p className="text-gray-500 text-center col-span-2">No available slots for this date</p>
            )}
          </div>

          <button
            className="mt-6 px-6 py-3 rounded-lg bg-red-600 text-white font-medium text-lg w-full shadow-lg hover:bg-red-700 transition-all"
            onClick={() => setIsModalOpen(false)}
          >
            Close
          </button>
        </div>
      </div>
    )
  );
};

export default AppointmentBooking;
