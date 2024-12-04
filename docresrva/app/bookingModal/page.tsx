import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
interface BookingModalProps {
  doctorId: string;
  isOpen: boolean;
  onClose: () => void;
}
const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  doctorId,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>("Today");
  const [slots, setSlots] = useState<any[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router=useRouter()
  // Function to convert time to 12-hour format
  const convertTo12HourFormat = (time: string): string => {
    const [hour, minute] = time.split(":").map(Number);
    const period = hour >= 12 ? "PM" : "AM";
    const newHour = hour % 12 || 12; // Converts 0 to 12 for midnight
    return `${newHour}:${minute < 10 ? "0" + minute : minute} ${period}`;
  };

  // Function to generate upcoming weekdays
  const getDynamicDates = () => {
    const today = new Date();
    const dates = [];
  
    for (let i = 0; i < 7; i++) { // Generate 7 continuous days
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + i);
  
      dates.push({
        label:
          i === 0
            ? "Today"
            : i === 1
            ? "Tomorrow"
            : futureDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              }),
        date: futureDate,
      });
    }
  
    return dates;
  };
  
  const dates = getDynamicDates();
  
  // Fetch slots on doctorId change
  useEffect(() => {
    if (!doctorId) return;

    const fetchSlots = async () => {
      setLoading(true);
      try {
        const response = await axios.put(
          `${process.env.NEXT_PUBLIC_BOOKING_BACKEND_URL}/getdoctors`,
          { doctorId },
          { withCredentials: true }
        );

        const formattedSlots = response.data.map((slot: any) => ({
          ...slot,
          formattedDate: new Date(slot.date).toLocaleDateString("en-US"),
          formattedStartTime: convertTo12HourFormat(slot.startTime),
          formattedEndTime: convertTo12HourFormat(slot.endTime),
        }));
        setSlots(formattedSlots);
      } catch (err: any) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: err.response?.data?.message || "Something went wrong",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [doctorId]);

  // Filter slots based on selected date
  const filteredSlots = slots.filter((slot) => {
    const selectedFullDate = dates.find((d) => d.label === selectedDate)?.date;
    return selectedFullDate && new Date(slot.date).toDateString() === selectedFullDate.toDateString();
  });

  // Toggle slot selection
  const toggleSlotSelection = (slotId: string) => {
    if (bookedSlots.includes(slotId)) return;
    setSelectedSlot((prev) => (prev === slotId ? null : slotId));
  };

  // Handle booking submission
  const handleBookingSubmit = async () => {
    if (!selectedSlot) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "Please select a slot to book.",
      });
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BOOKING_BACKEND_URL}/getdoctors`,
        { doctorId, selectedSlot },
        { withCredentials: true }
      );
      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: "Appointment booked successfully!",
          
        });
        router.push(`/patientDetails?id=${selectedSlot}`)
      } else {
        Swal.fire({
          icon: 'info',
          title: 'Already exists',
          text: response?.data?.message || "Failed to book appointment.",
        });
      }

      setSelectedSlot(null);
      onClose();
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || "Failed to book appointment.",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-3/4 max-w-lg relative">
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
          onClick={onClose}
        >
          ✕
        </button>
        <h2 className="text-xl font-bold mb-4">Book Appointment</h2>
        <div className="flex gap-2 overflow-x-auto">
          {dates.map(({ label }) => (
            <button
              key={label}
              onClick={() => setSelectedDate(label)}
              className={`px-4 py-2 rounded-lg ${
                selectedDate === label
                  ? "bg-teal-600 text-white"
                  : "bg-teal-200 text-teal-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-2 mt-6">
          {loading && <p>Loading available slots...</p>}
          {!loading && filteredSlots.length === 0 && (
            <p className="text-red-500 col-span-4 text-center">No slots available for this day.</p>
          )}
          {!loading &&
            filteredSlots.map((slot) => (
              <button
                key={slot._id}
                onClick={() => toggleSlotSelection(slot._id)}
                disabled={bookedSlots.includes(slot._id)}
                className={`px-3 py-1 rounded-md ${
                  bookedSlots.includes(slot._id)
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : selectedSlot === slot._id
                    ? "bg-teal-600 text-white"
                    : "bg-teal-200 text-teal-700"
                }`}
              >
                {slot.formattedStartTime} - {slot.formattedEndTime}
              </button>
            ))}
        </div>
        <div className="mt-6 flex justify-between">
          <button className="px-6 py-2 bg-red-500 text-white rounded-lg" onClick={onClose}>
            Cancel
          </button>
          <button className="px-6 py-2 bg-teal-600 text-white rounded-lg" onClick={handleBookingSubmit}>
            Ok
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
