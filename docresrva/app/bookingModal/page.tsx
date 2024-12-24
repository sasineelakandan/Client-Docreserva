'use client'

import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";



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
      isBooked: false,
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

const AppointmentBooking: React.FC<any> = ({
  doctorId,
  isModalOpen,
  setIsModalOpen,
}) => {
  const router = useRouter();
  const allSlots = generateSlots(doctorId);
  const uniqueDates = Array.from(new Set(allSlots.map((slot) => slot.date)));
  const [selectedDate, setSelectedDate] = useState<string | null>(uniqueDates[0] || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<any[]>([]);
  const slotsForSelectedDate = allSlots.filter(
    (slot) => slot.date === selectedDate
  );

  useEffect(() => {
    const fetchBookedSlots = async () => {
      try {
        setLoading(true);
        const response = await axios.put(
          `${process.env.NEXT_PUBLIC_BOOKING_BACKEND_URL}/getdoctors`,{doctorId},{withCredentials:true});
          
        setBookedSlots(response.data);
      } catch (err: any) {
        setError("Failed to fetch booked slots.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookedSlots();
  }, [doctorId]);

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
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_USER_BACKEND_URL}/createslots`,
        slot,
        { withCredentials: true }
      );

      if (response.data) {
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: "Appointment booked successfully!",
          confirmButtonText: "OK",
        });

        setIsModalOpen(false);
        router.push(`/patientDetails?id=${response.data._id}`);
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "There was an error booking your appointment. Please try again.";

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

  const filterFutureSlots = (slots: any[]) => {
    const now = new Date();
    return slots.filter((slot) => {
      const slotDate = new Date(slot.date);
      if (slotDate < now) return false;

      if (slotDate.toDateString() === now.toDateString()) {
        const [hour, minute] = slot.startTime.split(":");
        const slotStartTime = new Date(now);
        slotStartTime.setHours(Number(hour), Number(minute.split(" ")[0]));

        return slotStartTime > now; // Only show future time slots for today
      }

      return true; // For future dates, show all slots
    });
  };

  const futureSlots = filterFutureSlots(slotsForSelectedDate);

  return (
    isModalOpen && (
      <div
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
        role="dialog"
        aria-labelledby="modal-title"
        aria-modal="true"
      >
        <div className="p-6 bg-white shadow-2xl rounded-xl max-w-lg w-full relative">
          <h1
            id="modal-title"
            className="text-3xl font-semibold text-gray-800 mb-6 text-center"
          >
            Book an Appointment Slot
          </h1>

          <div className="flex space-x-2 mb-4 overflow-x-auto">
            {uniqueDates.map((date) => (
              <button
                key={date}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
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

          {error && <p className="text-red-500 text-center font-medium mb-4">{error}</p>}

          <div className="grid grid-cols-2 gap-4">
            {futureSlots.map((slot) => {
              const isBooked = bookedSlots.some(
                (bookedSlot) =>
                  new Date(bookedSlot.date).toISOString().split("T")[0] === slot.date &&
                  bookedSlot.startTime === slot.startTime
              );

              return (
                <button
                  key={slot.startTime}
                  className={`px-4 py-3 text-sm font-semibold border rounded-lg ${
                    isBooked
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gray-50 hover:bg-blue-50 text-gray-800"
                  }`}
                  onClick={() => !isBooked && handleBooking(slot)}
                  disabled={isBooked || loading}
                >
                  {slot.startTime} - {slot.endTime}
                </button>
              );
            })}
          </div>

          <button
            className="mt-6 px-6 py-3 rounded-lg bg-red-600 text-white font-medium text-lg w-full shadow-lg hover:bg-red-700"
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
