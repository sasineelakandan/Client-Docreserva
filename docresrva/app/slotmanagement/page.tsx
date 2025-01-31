'use client'

import React, { useState, useEffect } from "react";
import Navbar from "../../components/utils/doctorNavbar"; // Assuming Navbar is in the same directory
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css"; // Import styles
import axios from "axios";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

const Page = () => {
  const [isClient, setIsClient] = useState(false); // Track if it's client-side
  const [selectedDates, setSelectedDates] = useState<Date[]>([]); // Store an array of selected dates
  const [availableSlots, setAvailableSlots] = useState<{ [key: string]: any[] }>({}); // Store available slots per date
  const [currentSelectedDate, setCurrentSelectedDate] = useState<Date | null>(null); // Store the currently selected date for slot display
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility state
  const [leaveDays, setLeaveDays] = useState<Date[]>([]); // Store selected leave days
 const [fromTime, setFromTime] = useState("");
const [toTime, setToTime] = useState("");
const [workingDays, setWorkingDays] = useState([]);
const [isModalOpen2, setIsModalOpen2] = useState(false);
 
  useEffect(() => {
    setIsClient(true); // Ensure the calendar only renders on the client side
  }, []);
  const user:any = localStorage.getItem(`user`);
  const userData = JSON.parse(user as string);
  console.log(userData)
  // Fetch available slots from the backend when a date is selected
  useEffect(() => {
    if (currentSelectedDate) {
      const selectedDateString = currentSelectedDate.toISOString().split("T")[0]; // Format to 'YYYY-MM-DD'
      axios
        .get(
          `${process.env.NEXT_PUBLIC_DOCTOR_BACKEND_URL}/available-slots`,
          { withCredentials: true }
        )
        .then((response) => {
          // Store available slots for the specific date
          setAvailableSlots((prevSlots) => ({
            ...prevSlots,
            [selectedDateString]: response.data, // Assuming response.data is an array of slot objects
          }));
        })
        .catch((error) => {
          console.error("Error fetching available slots:", error);
        });
    }
  }, [currentSelectedDate]);

  if (!isClient) return null; // Prevent SSR mismatch

  const handleDateChange = (date: Date) => {
    const dateExists = selectedDates.some(
      (selectedDate) => selectedDate.toDateString() === date.toDateString()
    );

    if (!dateExists) {
      setSelectedDates((prevDates) => [...prevDates, date]); // Add the date if it's not already in the array
    }

    setCurrentSelectedDate(date); // Set the current selected date to fetch available slots
  };
  const handleSubmit2 = async (e: React.FormEvent, doctorId: string) => {
    e.preventDefault();
  
    // Retrieve existing slot data from localStorage
    const slotDataString = localStorage.getItem(`doctorSlotData${doctorId}`);
    const existingSlotData = slotDataString ? JSON.parse(slotDataString) : { workingDays: [] };
  
    // Merge existing workingDays with the new ones
    const updatedWorkingDays = [...new Set([...existingSlotData.workingDays, ...workingDays])];
  
    const slotData = { fromTime, toTime, workingDays: updatedWorkingDays, doctorId };
  
    // Store updated slot data in localStorage
    localStorage.setItem(`doctorSlotData${doctorId}`, JSON.stringify(slotData));
  
    try {
      // Call backend API
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_DOCTOR_BACKEND_URL}/createslots`,
        slotData,
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );
  
      if (response.data) {
        toast.success('Slots created successfully!');
        handleCloseModal2();
      }
    } catch (error: any) {
      Swal.fire({
        title: 'Slot Already Created',
        text: 'A slot is already created. If you want to modify it, please go to Slot Management.',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Ok',
        cancelButtonText: 'Cancel',
        customClass: {
          confirmButton: 'bg-blue-500 text-white px-4 py-2 rounded-md',
          cancelButton: 'bg-gray-300 text-black px-4 py-2 rounded-md',
        },
      });
    }
  };
  

  const handleLeaveDaysChange = (date: Date) => {
    const leaveExists = leaveDays.some(
      (leaveDay) => leaveDay.toDateString() === date.toDateString()
    );

    if (!leaveExists) {
      setLeaveDays((prevLeaveDays) => [...prevLeaveDays, date]);
    }
  };

  const formatDate = (date: any) => {
    return date.toISOString().split("T")[0]; // Formats the date to YYYY-MM-DD
  };

  // Disable past dates including today
  const tileDisabled = ({ date }: { date: Date }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date to avoid time issues
    return date < today;
  };

  
  
  const handleBlockSlot = async (slotId: string) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "Do you really want to block this slot?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, block it!",
      });

      if (result.isConfirmed) {
        const response = await axios.patch(
          `${process.env.NEXT_PUBLIC_DOCTOR_BACKEND_URL}/createslots`,
          { slotId }, // Sending as an object
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );

        // Update the state to reflect the blocked slot
        setAvailableSlots((prevSlots) => {
          const updatedSlots = { ...prevSlots };

          // Find the slot in each category and update its blocked status
          Object.keys(updatedSlots).forEach((key) => {
            updatedSlots[key] = updatedSlots[key].map((slot) =>
              slot.id === slotId ? { ...slot, blocked: true } : slot
            );
          });

          return updatedSlots;
        });
         window.location.reload()
        Swal.fire("Blocked!", "The slot has been blocked.", "success");
      }
    } catch (err: any) {
      console.error("Error blocking slot:", err.response?.data || err.message);
      Swal.fire("Error", "Failed to block the slot. Please try again.", "error");
    }
  };
  ;

  // Filter slots based on selected date
  const filteredSlots =
    availableSlots[formatDate(currentSelectedDate || new Date())] || [];

  // Handle opening and closing modal
  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    leaveDays.length=0
    setIsModalOpen(false);
  };

  const handleLeaveDaysSubmit = () => {
    const leaveDaysFormatted = leaveDays.map((date) => new Date(date));
    axios
      .put(
        `${process.env.NEXT_PUBLIC_DOCTOR_BACKEND_URL}/available-slots`,
        { leaveDays: leaveDaysFormatted },
        { withCredentials: true }
      )
      .then((response) => {
        Swal.fire({
          title: 'Leave Assigned!',
          text: 'The leave days have been successfully assigned.',
          icon: 'success', // Use 'success' icon for a happy face
          confirmButtonText: 'OK',
          customClass: {
            popup: 'swal-custom-popup', // Optional: Customize the popup with your own styles
          },
        }).then(() => {
          closeModal();
          leaveDays.length=0 // Close modal after SweetAlert confirmation
        });
      })
      .catch((error) => {
        Swal.fire({
          title: 'Error!',
          text: 'There was an error adding leave days. Please try again.',
          icon: 'error', // Use 'error' icon for failure
          confirmButtonText: 'OK',
        });
        console.error('Error adding leave days:', error);
      });
  };
  const slotDataString = localStorage.getItem(`doctorSlotData${user?.userId}`);
   
  const existingSlotData =JSON.parse(slotDataString as any);
  console.log(existingSlotData.fromTime)
  console.log(existingSlotData.toTime)
  console.log( existingSlotData.workingDays)
  const remainingDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].filter(
    (day) => !existingSlotData.workingDays?.includes(day)
  );
  
  const handleOpenModal2=()=>setIsModalOpen2(true)
  const handleCloseModal2 = () => setIsModalOpen2(false);

  return (
    <div className="bg-gradient-to-r from-blue-500 to-blue-700 min-h-screen">
      <Navbar />
      <div className="container mx-auto p-8">
        <div className="flex space-x-4">
          {/* Left side - Calendar with Buttons */}
          <div className="rounded-lg shadow-lg p-2 bg-white flex-grow relative">
            {/* Calendar */}
            <Calendar
              onChange={handleDateChange as any}
              value={selectedDates[selectedDates.length - 1] || null}
              tileClassName={({ date }) => {
                const isSelected = selectedDates.some(
                  (selectedDate) =>
                    selectedDate.toDateString() === date.toDateString()
                );
                const selectedDateString = date.toISOString().split("T")[0];
                const isAvailable = availableSlots[selectedDateString]?.length > 0;
                return isSelected
                  ? "bg-blue-600 text-black rounded-full"
                  : isAvailable
                  ? "bg-green-500 text-black"
                  : "";
              }}
              tileDisabled={tileDisabled}
              className="react-calendar"
              selectRange={false}
            />
            {/* Button Container */}
            <div className="absolute top-4 right-4 flex flex-col space-y-4">
              <button onClick={handleOpenModal2} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300">
                Add workingDays
              </button>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all duration-300"
                onClick={openModal} // Open modal on button click
              >
                Add leaveDays
              </button>
            </div>
            {isModalOpen2 && (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 transform scale-95 transition-transform duration-300">
        <h2 className="block text-4xl font-extrabold bg-gradient-to-r from-blue-500 to-indigo-600 text-center mb-8 hover:bg-gradient-to-l hover:from-indigo-600 hover:to-blue-500">
  Create Slots
</h2>

          <form onSubmit={handleSubmit2 as any} className="space-y-8">
          <label className="block text-xl font-semibold text-gray-800 mb-2">
                Working Hours
              </label>
            <div>
              <label className="block text-xl font-semibold text-gray-800 mb-2">
                From Time
              </label>
              <input
                type="time"
                className="w-full px-5 py-3 rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 bg-gradient-to-r from-gray-50 to-white shadow-md transition duration-300"
                value={existingSlotData?.fromTime}
                onChange={(e) => setFromTime(e.target.value)}
                required
              />
            </div>

            {/* To Time Input */}
            <div>
              <label className="block text-xl font-semibold text-gray-800 mb-2">
                To Time
              </label>
              <input
                type="time"
                value={existingSlotData?.toTime}
                className="w-full px-5 py-3 rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 bg-gradient-to-r from-gray-50 to-white shadow-md transition duration-300"
                onChange={(e) => setToTime(e.target.value)}
                required
              />
            </div>

            {/* Working Days Input */}
            <div>
              <label className="block text-xl font-semibold text-gray-800 mb-2">
                Working Days
              </label>
              <select
                multiple
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 bg-gradient-to-r from-gray-50 to-white shadow-md transition duration-300"
                onChange={(e) => {
                  const selectedDays:any = Array.from(
                    e.target.selectedOptions,
                    (option) => option.value
                  );
                  setWorkingDays(selectedDays);
                }}
              >
                {remainingDays.map((day) => (
                  <option key={day} value={day} className="text-lg font-medium">
                    {day}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-4 text-lg font-bold bg-gradient-to-r from-green-400 to-teal-500 text-white rounded-xl shadow-lg hover:from-green-500 hover:to-teal-600 hover:scale-105 transition-all duration-300"
            >
              Save Slot
            </button>
          </form>

          <button
            className="w-full mt-4 text-sm text-gray-500 hover:text-gray-700 underline transition-all duration-300"
            onClick={handleCloseModal2}
          >
            Close
          </button>
        </div>
      </div>
    )}
            
            {currentSelectedDate && (
              <div className="mt-4 p-4 bg-gradient-to-r from-red-500 via-red-600 to-red-700 rounded-lg shadow-lg">
                <h3 className="font-semibold text-lg text-white">
                  Available Slots for {currentSelectedDate.toLocaleDateString("en-US")}:
                </h3>

                {filteredSlots.length > 0 ? (
                  <ul className="space-y-4 mt-4">
                    {filteredSlots
                      .filter(
                        (slot) =>
                          new Date(slot.date).toDateString() ===
                          currentSelectedDate.toDateString()
                      )
                      .map((slot, index) => {
                        const slotDate = new Date(slot.date);
                        const currentDate = new Date();

                        // Define cutoff time as 12:00 PM
                        const cutoffTime = new Date(currentDate.setHours(9, 0, 0, 0));

                        // Check expiration logic
                        const isExpired =
                          slotDate.toDateString() === currentDate.toDateString()
                            ? slotDate.getTime() <= cutoffTime.getTime() // Expire slots before cutoff today
                            : slotDate < currentDate; // Expire if date is before today

                        return (
                          <li
                            key={index}
                            className={`p-4 rounded-lg shadow-md transition-shadow duration-300 ${
                              isExpired ? "bg-gray-300" : "bg-white hover:shadow-xl"
                            }`}
                          >
                            <p className="text-gray-700">
                              <strong>Slot ID:</strong> {slot._id}
                            </p>
                            <p className="text-gray-700">
                              <strong>Date:</strong> {slotDate.toLocaleDateString("en-US")}
                            </p>
                            <p className="text-gray-700">
                              <strong>Day:</strong> {slot.day}
                            </p>
                            <p className="text-gray-700">
                              <strong>Slot:</strong> {slot.slot}
                            </p>
                            <p className="text-gray-700">
                              <strong>Is Booked:</strong> {slot.isBooked ? "Yes" : "No"}
                            </p>
                            <p className="text-gray-700">
                              <strong>Is Unavailable:</strong> {slot.isUnavail ? "Yes" : "No"}
                            </p>
                            <p className={`text-gray-700 ${isExpired ? "text-red-600" : ""}`}>
                              <strong>Is Expired:</strong> {isExpired ? "Yes" : "No"}
                            </p>

                            {!slot.isBooked && !slot.isUnavail && !isExpired && (
                              <button
                                className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all duration-300"
                                onClick={() => handleBlockSlot(slot._id)}
                              >
                                Block Slot
                              </button>
                            )}
                          </li>
                        );
                      })}
                  </ul>
                ) : (
                  <p className="text-gray-700">No slots available for this date.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal for selecting leave days */}
      {isModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
      <h3 className="text-xl font-semibold">Select Leave Days</h3>

      {/* Calendar component */}
      <Calendar
        onChange={handleLeaveDaysChange as any} // Handle leave days selection
        value={leaveDays.length > 0 ? leaveDays[leaveDays.length - 1] : null}
        tileClassName={({ date }) => {
          const isSelected = leaveDays.some(
            (leaveDay) => leaveDay.toDateString() === date.toDateString()
          );
          return isSelected ? "bg-blue-600 text-black rounded-full" : "";
        }}
        tileDisabled={tileDisabled}
        className="react-calendar"
        selectRange={false}
      />

      {/* Display selected leave days */}
      {leaveDays.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold">Selected Leave Days:</h4>
          <ul className="list-disc pl-5">
            {leaveDays.map((leaveDay, index) => (
              <li key={index}>{leaveDay.toDateString()}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 flex justify-between">
        <button
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
          onClick={closeModal} // Close modal
        >
          Cancel
        </button>
        <button
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
          onClick={handleLeaveDaysSubmit} // Submit leave days
        >
          Save Leave Days
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default Page;
