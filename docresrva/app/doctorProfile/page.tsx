'use client';

import Navbar from "@/components/utils/doctorNavbar";
import React, { useState, useEffect, useRef } from "react";
import { FaStar, FaCheckCircle, FaCamera } from "react-icons/fa";
import DoctorModal from "../modal/page";
import axios, { AxiosError } from "axios";
import { toast ,ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from "next/navigation";
import { deleteCookie } from "@/components/utils/deleteCookie";
import { useForm } from "react-hook-form";
import Img from '../../public/flat-male-doctor-avatar-in-medical-face-protection-mask-and-stethoscope-healthcare-vector-illustration-people-cartoon-avatar-profile-character-icon-2FJR92X.jpg'
import Image from "next/image";
interface SlotFormData {
  
  date: string;
  startTime: string;
  endTime: string;
}
const DoctorProfile: React.FC = () => {
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profilePic1, setProfilePic] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [user, setUser] = useState<any>(null)
  const [fromTime, setFromTime] = useState("");
const [toTime, setToTime] = useState("");
const [workingDays, setWorkingDays] = useState([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const router=useRouter()
  const [showSlots, setShowSlots] = useState(false);
  const [address,setAddress]=useState<string>('')
  // React Hook Form setup
  const { register,watch, handleSubmit, formState: { errors } } = useForm<SlotFormData>();

  // Handle open modal for slots
  const handleOpenSlots = () => {
    setShowSlots(true);
  };
  const passwordForm = useForm({
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const profileForm = useForm({
    defaultValues: {
      name: "",
      phone: "",
      hospitalName: "",
      fees: "",
      location:'',
      experience: "" 
    },
  });
  
  const handleSubmit2 = async (e:any) => {
    e.preventDefault();
  
    const slotData = { fromTime, toTime, workingDays };
  
    // Call backend API
    try {
      const response = await axios.post('/api/slots', slotData, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true, // Include credentials in the request
      });
  
      if (response.status === 200) {
        alert("Slot saved successfully!");
        handleCloseModal();
      } else {
        alert("Failed to save the slot.");
      }
     
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred.");
    }
  };
  
  useEffect(() => {
    const fetchDoctorProfile = async () => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_DOCTOR_BACKEND_URL}/profile`, { withCredentials: true });
            if(response?.data){
              console.log(response?.data)
              setUser(response?.data)
              setAddress(response?.data?.location?.address)
              profileForm.reset({
                name: response?.data?.name || "",
                phone: response?.data?.phone || "", 
                hospitalName: response?.data?.hospitalName || "", 
                fees: response?.data?.fees || "",
                location:response?.data?.location||'', 
                experience: response?.data?.experience || "", 
              });
            }
            
        }catch (error:any) {
          
          if (error?.response) {
              const message = error.response.data?.message || "An error occurred while fetching doctor profile.";

              if(message=='Internal server error.'){
                deleteCookie('accessToken')
               
              }
             
        
              

              
          } else {
              toast.error("An error occurred. Please try again later.");
          }
          console.log(error)
      }
    };

    fetchDoctorProfile();
}, []);



const getWeekStart = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set time to 00:00:00
  return today.toISOString().split("T")[0]; // Return date in YYYY-MM-DD format
};

// Function to get the last day of a 7-day period (including weekends)
const getNext7Weekdays = () => {
  const today = new Date();
  const next7Days = new Date(today.setDate(today.getDate() + 7)); // Add 7 days
  next7Days.setHours(0, 0, 0, 0); // Set time to 00:00:00
  return next7Days.toISOString().split("T")[0]; // Return date in YYYY-MM-DD format
};;


function splitAddress(address:string) {
  const parts = address.split(',').map(part => part.trim());
  return {
      street: parts.slice(0, parts.length - 4).join(', '),
      city: parts[parts.length - 4],
      state: parts[parts.length - 3],
      pincode: parts[parts.length - 2],
      country: parts[parts.length - 1]
  };
}

const result = splitAddress(address);
console.log(result);

  

const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) {
    toast.error("Please select a file!");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("file", file);

    // Upload file to backend
    const response = await axios.post<{ url: string }>(
      "https://www.docreserva.site/api/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.data) {
      setProfilePic(response.data.url)
      const uploadedUrl = response.data.url;
      console.log(uploadedUrl)
      
      const getResponse = await axios.post(`${process.env.NEXT_PUBLIC_DOCTOR_BACKEND_URL}/profile`,{uploadedUrl}, {withCredentials:true});

      // Handle the response from the s
      console.log("URL saved response:", getResponse.data);

      ; // Set the profile picture state
      toast.success("Profile upload success message!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      toast.error(`Upload failed: ${error.response?.data?.message || error.message}`);
    } else {
      toast.error("Upload failed due to an unknown error.");
    }
  }
};


  const handleCameraClick = () => fileInputRef.current?.click();
  const handlePasswordChange = async (data: any) => {
    try {
      
      if (data.newPassword !== data.confirmPassword) {
        toast.error("New password and confirmation do not match!");
        return;
      }
      let response=await axios.patch(`${process.env.NEXT_PUBLIC_DOCTOR_BACKEND_URL}/profile`,
        data,
        { withCredentials: true }
      );
      if(response.data){
        toast.success("Password changed successfully!");
        
      }
      setShowPasswordModal(false);
        passwordForm.reset();
      
    } catch (error) {
      toast.error("Failed to change password.");
    }
  };

  const handleProfileUpdate = async (data: any) => {
    try {
      let response=await axios.put(`${process.env.NEXT_PUBLIC_DOCTOR_BACKEND_URL}/profile`,
          data,
          { withCredentials: true }
        );
        if (response.data) {
          setUser(response.data);
          setAddress(response?.data?.location?.address)
          toast.success("Profile updated successfully!");
        }
      
      setShowProfileModal(false);
      profileForm.reset()
    } catch (error) {
      toast.error("Failed to update profile.");
    }
  };
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleOpenModal2 = () => setIsModalOpen(true);
  const handleCloseModal2 = () => setIsModalOpen(false);
  const onSubmit = async(data:any) => {
    try {
      let response=await axios.post("http://localhost:8001/api/doctor/createslots",
          data,
          { withCredentials: true }
        );
        if (response.data) {
          
          toast.success("Slot updated successfully!");
          setShowSlots(false)
        }
      
      setShowProfileModal(false);
      profileForm.reset()
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
      
         toast.error(error.response?.data.error)
      } else {
        
        console.error("An unexpected error occurred:", error.message);
      }
    }
  };
  
  return (
    <div className="max-w-full">
      <Navbar />
      <div className="flex flex-col md:flex-row items-center text-teal-500 shadow-lg rounded-lg p-6 mt-6">
     
        <div className="relative">
          <Image
            src={profilePic1||user?.profilePic||Img}
            alt="Doctor's profile picture"
            width={128}
            height={128}
            className="w-32 h-32 rounded-lg object-cover"
          />
          <button
            type="button"
            className="absolute bottom-0 right-0 p-2 bg-teal-500 text-white rounded-full shadow-lg hover:bg-teal-600"
            onClick={handleCameraClick}
          >
            
            <FaCamera className="w-6 h-6" />
          </button>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleUpload}
          />
        </div>
        
        <div className="ml-0 md:ml-6 mt-4 md:mt-0 flex-1 text-center md:text-left">
          <h2 className="text-xl font-semibold">{user?.name || 'Dr. Denies Martine'}</h2>
          <p className="text-gray-600">{user?.degree || 'MBBS, MD'}</p>
          <p className="text-teal-500">{user?.specialization || 'Cardiologist'}</p>
          <p className="text-gray-500">{user?.experience }'Years Experience'</p>
          {user?.isVerified && (
  <p className="flex justify-center md:justify-start items-center gap-2 text-gray-500">
    verified
    <FaCheckCircle className="text-teal-500" />
  </p>
)}
          <div className="flex justify-center md:justify-start items-center gap-1 text-yellow-500 mt-2">
            <FaStar /> 4.5
          </div>
        </div>
        <div className="mt-4 md:mt-0">
        {!user?.isVerified && (
  <>
    <button
      className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
      onClick={handleOpenModal}
    >
      Register
    </button>
    
  </>
)}
{user?.isVerified && (
  <>
    <button
      className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      onClick={handleOpenModal2}
    >
      Create Slot
    </button>

    {isModalOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-lg font-bold mb-4">Create Slot</h2>

          <form onSubmit={handleSubmit2}>
            {/* From Time Input */}
            <label className="block mb-2">
              From Time:
              <input
                type="time"
                className="w-full px-3 py-2 border rounded-lg mt-1"
                onChange={(e) => setFromTime(e.target.value)}
                required
              />
            </label>

            {/* To Time Input */}
            <label className="block mb-2">
              To Time:
              <input
                type="time"
                className="w-full px-3 py-2 border rounded-lg mt-1"
                onChange={(e) => setToTime(e.target.value)}
                required
              />
            </label>

            {/* Working Days Input */}
            <label className="block mb-2">
              Select Working Days:
              <select
                multiple
                className="w-full px-3 py-2 border rounded-lg mt-1"
                onChange={(e) => {
                  const selectedDays:any = Array.from(
                    e.target.selectedOptions,
                    (option) => option.value
                  );
                  setWorkingDays(selectedDays);
                }}
              >
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </select>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
            >
              Save Slot
            </button>
          </form>

          <button
            className="mt-2 text-gray-500 underline"
            onClick={handleCloseModal2}
          >
            Close
          </button>
        </div>
      </div>
    )}
  </>
)}




          <DoctorModal isOpen={isModalOpen} onClose={handleCloseModal} userId={user?._id}/>
        </div>
      </div>
      <div className="bg-teal-100 rounded-lg p-4 mt-6">
      <h2 className="text-teal-600 font-semibold">Clinic visit</h2>
        <h3 className="text-teal-600 font-semibold">{user?.hospitalName}</h3>
        <p className="text-gray-600">
         street: {result?.street}
        </p>
        <p className="text-gray-600">
          City:  {result?.city}
        </p>
        <p className="text-gray-600">
          State: {result?.state}
        </p>
        <p className="text-gray-600">
          Pincode: {result?.pincode}
        </p>
        <p className="font-bold text-teal-700">₹ {user?.fees}</p>
      </div>
      <div className="flex justify-center gap-6 mt-6">
        <button
          onClick={() => setShowPasswordModal(true)}
          className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700"
        >
          Change Password
        </button>
        <button
          onClick={() => setShowProfileModal(true)}
          className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700"
        >
          Change Profile
        </button>
      </div>

      {showPasswordModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Change Password</h2>
      <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)}>
        <input
          type="password"
          placeholder="Old Password"
          {...passwordForm.register("oldPassword", { required: "Old Password is required" })}
          className={`w-full mb-3 p-2 border rounded ${
            passwordForm.formState.errors.oldPassword ? "border-red-500" : ""
          }`}
        />
        {passwordForm.formState.errors.oldPassword && (
          <p className="text-red-500 text-sm">{passwordForm.formState.errors.oldPassword.message}</p>
        )}
        <input
          type="password"
          placeholder="New Password"
          {...passwordForm.register("newPassword", {
            required: "New Password is required",
            minLength: { value: 8, message: "Password must be at least 8 characters long" },
          })}
          className={`w-full mb-3 p-2 border rounded ${
            passwordForm.formState.errors.newPassword ? "border-red-500" : ""
          }`}
        />
        {passwordForm.formState.errors.newPassword && (
          <p className="text-red-500 text-sm">{passwordForm.formState.errors.newPassword.message}</p>
        )}
        <input
          type="password"
          placeholder="Confirm Password"
          {...passwordForm.register("confirmPassword", {
            required: "Confirm Password is required",
            validate: (value) =>
              value === passwordForm.getValues("newPassword") || "Passwords do not match",
          })}
          className={`w-full mb-3 p-2 border rounded ${
            passwordForm.formState.errors.confirmPassword ? "border-red-500" : ""
          }`}
        />
        {passwordForm.formState.errors.confirmPassword && (
          <p className="text-red-500 text-sm">{passwordForm.formState.errors.confirmPassword.message}</p>
        )}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setShowPasswordModal(false)}
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
{showSlots && user?.isVerified && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
    <div className="bg-white p-6 rounded-lg shadow-lg">
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
        const minDate = new Date(getWeekStart()).setHours(0, 0, 0, 0);
        const maxDate = new Date(getNext7Weekdays()).setHours(0, 0, 0, 0);

        if (selectedDate < minDate || selectedDate > maxDate) {
          return `Date must be between ${getWeekStart()} and ${getNext7Weekdays()}.`;
        }

        return true;
      },
    })}
    min={getWeekStart()} // Minimum date: start of the 7-day period
    max={getNext7Weekdays()} // Maximum date: end of the 7-day period
    className="w-full px-4 py-2 border rounded-lg"
  />
  {errors.date && (
    <span className="text-red-500 text-sm">{errors.date.message}</span>
  )}
</div>

        {/* Start Time Picker */}
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
    <span className="text-red-500 text-sm">
      {errors.startTime.message}
    </span>
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
    <span className="text-red-500 text-sm">
      {errors.endTime.message}
    </span>
  )}
</div>


        {/* Submit Button */}
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

{showProfileModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Update Profile</h2>
      <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)}>
        {/* Name */}
        <input
          type="text"
          placeholder="Name"
          defaultValue={user?.name || ""}
          {...profileForm.register("name", { required: "Name is required" })}
          className={`w-full mb-3 p-2 border rounded ${
            profileForm.formState.errors.name ? "border-red-500" : ""
          }`}
        />
        {profileForm.formState.errors.name && (
          <p className="text-red-500 text-sm">{profileForm.formState.errors.name.message}</p>
        )}

        {/* Phone */}
        <input
          type="text"
          placeholder="Phone"
          defaultValue={user?.phone || ""}
          {...profileForm.register("phone", {
            required: "Phone is required",
            pattern: { value: /^[0-9]{10}$/, message: "Invalid phone number" },
          })}
          className={`w-full mb-3 p-2 border rounded ${
            profileForm.formState.errors.phone ? "border-red-500" : ""
          }`}
        />
        {profileForm.formState.errors.phone && (
          <p className="text-red-500 text-sm">{profileForm.formState.errors.phone.message}</p>
        )}

        {/* Hospital Name */}
        <input
          type="text"
          placeholder="Hospital Name"
          defaultValue={user?.hospitalName || ""}
          {...profileForm.register("hospitalName", { required: "Hospital name is required" })}
          className={`w-full mb-3 p-2 border rounded ${
            profileForm.formState.errors.hospitalName ? "border-red-500" : ""
          }`}
        />
        {profileForm.formState.errors.hospitalName && (
          <p className="text-red-500 text-sm">{profileForm.formState.errors.hospitalName.message}</p>
        )}

        {/* Fees */}
        <input
          type="number"
          placeholder="Fees"
          defaultValue={user?.fees || ""}
          {...profileForm.register("fees", {
            required: "Fees are required",
            min: { value: 0, message: "Fees cannot be negative" },
          })}
          className={`w-full mb-3 p-2 border rounded ${
            profileForm.formState.errors.fees ? "border-red-500" : ""
          }`}
        />
        

        {/* Experience */}
        <input
          type="number"
          placeholder="Experience (Years)"
          defaultValue={user?.experience || ""}
          {...profileForm.register("experience", {
            required: "Experience is required",
            min: { value: 0, message: "Experience cannot be negative" },
            max: { value: 50, message: "Experience seems too high" },
          })}
          className={`w-full mb-3 p-2 border rounded ${
            profileForm.formState.errors.experience ? "border-red-500" : ""
          }`}
        />
        {profileForm.formState.errors.experience && (
          <p className="text-red-500 text-sm">{profileForm.formState.errors.experience.message}</p>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setShowProfileModal(false)}
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


      <ToastContainer />
    </div>
  );
};

export default DoctorProfile;