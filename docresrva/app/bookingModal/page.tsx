"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

const AppointmentBooking: React.FC<any> = ({ doctorId, isModalOpen, setIsModalOpen }) => {
  const router = useRouter();
  const [allSlots, setAllSlots] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<any[]>([]);

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_USER_BACKEND_URL}/createslots?doctorId=${doctorId}`,
          { withCredentials: true }
        );
        setAllSlots(response.data);
      } catch (err: any) {
        setError("Failed to fetch available slots.");
      } finally {
        setLoading(false);
      }
    };
    fetchSlots();
  }, [doctorId]);

  useEffect(() => {
    const fetchBookedSlots = async () => {
      try {
        setLoading(true);
        const response = await axios.put(
          `${process.env.NEXT_PUBLIC_BOOKING_BACKEND_URL}/getdoctors`,
          { doctorId },
          { withCredentials: true }
        );
        setBookedSlots(response.data);
      } catch (err: any) {
        setError("Failed to fetch booked slots.");
      } finally {
        setLoading(false);
      }
    };
    fetchBookedSlots();
  }, [doctorId]);

  const availableSlots = allSlots.map((slot) => {
    const isBooked = slot.isBooked || bookedSlots.some(
      (bookedSlot) =>
        new Date(bookedSlot.date).toISOString().split("T")[0] ===
          new Date(slot.date).toISOString().split("T")[0] &&
        bookedSlot.slot === slot.slot
    );
    return { ...slot, isBooked };
  });

  const uniqueDates = Array.from(
    new Set(availableSlots.map((slot) => new Date(slot.date).toDateString()))
  );

  const slotsForSelectedDate = availableSlots.filter((slot) => {
    const slotDate = new Date(slot.date).toDateString();
    return selectedDate === slotDate;
  });

  const handleBooking = async (slot: any) => {
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
        router.push(`/patientDetails?id=${slot._id}`);
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
            {slotsForSelectedDate.map((slot) => (
              <button
                key={slot._id}
                className={`px-4 py-3 text-sm font-semibold border rounded-lg ${
                  slot.isBooked
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gray-50 hover:bg-blue-50 text-gray-800"
                }`}
                onClick={() => !slot.isBooked && handleBooking(slot)}
                disabled={slot.isBooked || loading}
              >
                {slot.day} - {slot.slot}
              </button>
            ))}
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
