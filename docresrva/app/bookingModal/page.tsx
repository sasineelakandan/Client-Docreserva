import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

interface BookingModalProps {
  doctorId: string;
  isOpen: boolean;
  onClose: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, doctorId }) => {
  const [selectedDate, setSelectedDate] = useState<string>("Today");
  const [slots, setSlots] = useState<any[]>([]); // Store slot objects
  const [bookedSlots, setBookedSlots] = useState<string[]>([]); // Booked slots
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Convert 24-hour time to 12-hour AM/PM format
  const convertTo12HourFormat = (time: string): string => {
    const [hour, minute] = time.split(":").map(Number);
    const period = hour >= 12 ? "PM" : "AM";
    const newHour = hour % 12 || 12; // Converts 0 to 12 for midnight
    return `${newHour}:${minute < 10 ? "0" + minute : minute} ${period}`;
  };

  // Generate dynamic dates
  const getDynamicDates = () => {
    const today = new Date();
    const dates = [];
    let count = 0; // Counter for 5 weekdays
  
    for (let i = 0; count < 5; i++) {
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + i);
  
      // Check if the day is not Saturday (6) or Sunday (0)
      if (futureDate.getDay() !== 0 && futureDate.getDay() !== 6) {
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
        count++;
      }
    }
  
    return dates;
  };

  const dates = getDynamicDates();

  // Fetch available slots
  useEffect(() => {
    if (!doctorId) return;

    const fetchSlots = async () => {
      setLoading(true);
      try {
        const response = await axios.put(`${process.env.NEXT_PUBLIC_BOOKING_BACKEND_URL}/getdoctors`, { doctorId }, { withCredentials: true });
        
        const formattedSlots = response.data.map((slot: any) => ({
          ...slot,
          formattedDate: new Date(slot.date).toLocaleDateString("en-US"),
          formattedStartTime: convertTo12HourFormat(slot.startTime),
          formattedEndTime: convertTo12HourFormat(slot.endTime),
        }));
        setSlots(formattedSlots);
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [doctorId]);

  // Filter slots based on selected date
  const filteredSlots = slots.filter(slot => {
    const selectedFullDate = dates.find(d => d.label === selectedDate)?.date;
    return selectedFullDate && new Date(slot.date).toDateString() === selectedFullDate.toDateString();
  });

  // Toggle slot selection logic
  const toggleSlotSelection = (slot: string) => {
    if (bookedSlots.includes(slot)) return;
    setSelectedSlots((prev) =>
      prev.includes(slot)
        ? prev.filter((s) => s !== slot)
        : [...prev, slot]
    );
  };

  // Calculate start and finish time
  const calculateTimeRange = () => {
    if (selectedSlots.length === 0) return { start: null, finish: null };
    const sortedSlots = selectedSlots.sort(
      (a, b) => slots.indexOf(a) - slots.indexOf(b)
    );
    return {
      start: sortedSlots[0],
      finish: sortedSlots[sortedSlots.length - 1],
    };
  };

  const { start, finish } = calculateTimeRange();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
      {/* Modal */}
      <div className="bg-white rounded-lg shadow-lg p-6 w-3/4 max-w-lg relative">
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
          onClick={onClose}
        >
          ✕
        </button>
        {/* Modal Content */}
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
        <div className="mt-4 text-center">
          <p className="text-gray-600">Selected Date:</p>
          <p className="text-lg font-semibold">
            {dates.find((d) => d.label === selectedDate)?.date.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            }) || "Not selected"}
          </p>
          <p className="text-sm text-gray-500">
            {selectedSlots.length} Slots Selected
          </p>
          {start && finish && (
            <p className="text-sm text-gray-600">
              Timing: {start} - {finish}
            </p>
          )}
        </div>
        <div className="grid grid-cols-4 gap-2 mt-6">
          {loading && <p>Loading available slots...</p>}
          {!loading && filteredSlots.map((slot) => (
            <button
              key={slot._id}
              onClick={() => toggleSlotSelection(slot.formattedStartTime)}
              disabled={bookedSlots.includes(slot.formattedStartTime)}
              className={`px-3 py-1 rounded-md ${
                bookedSlots.includes(slot.formattedStartTime)
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : selectedSlots.includes(slot.formattedStartTime)
                  ? "bg-teal-600 text-white"
                  : "bg-teal-200 text-teal-700"
              }`}
            >
              {slot.formattedStartTime} - {slot.formattedEndTime}
            </button>
          ))}
        </div>
        <div className="mt-6 flex justify-between">
          <button
            className="px-6 py-2 bg-red-500 text-white rounded-lg"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-6 py-2 bg-teal-600 text-white rounded-lg"
            onClick={() =>
              alert(
                `Selected Slots: ${selectedSlots.join(", ")}\nTiming: ${
                  start && finish ? `${start} - ${finish}` : "Not selected"
                }`
              )
            }
          >
            Ok
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
