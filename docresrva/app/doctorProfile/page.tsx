'use client';

import Navbar from "@/components/utils/Navbar";
import React, { useState, useEffect, useRef } from "react";
import { FaStar, FaCheckCircle, FaCamera } from "react-icons/fa";
import DoctorModal from "../modal/page";
import axios from "axios";
import { toast ,ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from "next/navigation";
import { deleteCookie } from "@/components/utils/deleteCookie";
const DoctorProfile: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profilePic1, setProfilePic] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [user, setUser] = useState<any>(null)
  const profilePic=localStorage.getItem('profilePic')
  const router=useRouter()
  useEffect(() => {
    const fetchDoctorProfile = async () => {
        try {
            const response = await axios.post('http://localhost:8001/api/doctor/profile',{profilePic}, { withCredentials: true });
            if(response.data){
              console.log(response.data)
              setUser(response.data)
            }
            
        }catch (error:any) {
          // Check if the error response exists and display it using toast
          if (error?.response) {
              const message = error.response.data?.message || "An error occurred while fetching doctor profile.";

              if(message=='Internal server error.'){
                deleteCookie('accessToken')
                window.location.reload()
              }
             
        
              

              
          } else {
              toast.error("An error occurred. Please try again later.");
          }
          console.log(error)
      }
    };

    fetchDoctorProfile();
}, []);

console.log(user?.profilePic)

 



  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      toast.error("Please select a file!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post<{ url: string }>(
        "http://localhost:3000/api/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if(response.data){
        localStorage.setItem("profilePic", response.data.url);
        setProfilePic(response.data.url);
        toast.success(" Profile upload success message!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        })
         
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

  return (
    <div className="max-w-full">
      <Navbar />
      <div className="flex flex-col md:flex-row items-center text-teal-500 shadow-lg rounded-lg p-6 mt-6">
     
        <div className="relative">
          <img
            src={profilePic||profilePic1}
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
  <button
    className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
    onClick={handleOpenModal}
  >
    Register
  </button>
)}
          <DoctorModal isOpen={isModalOpen} onClose={handleCloseModal} userId={user?._id}/>
        </div>
      </div>
      <div className="bg-teal-100 rounded-lg p-4 mt-6">
      <h2 className="text-teal-600 font-semibold">Clinic visit</h2>
        <h3 className="text-teal-600 font-semibold">{user?.hospitalName}</h3>
        <p className="text-gray-600">
         street: {user?.street}
        </p>
        <p className="text-gray-600">
          City:  {user?.city}
        </p>
        <p className="text-gray-600">
          State: {user?.state}
        </p>
        <p className="font-bold text-teal-700">₹ {user?.fees}</p>
      </div>
      {/* <div className="flex justify-center gap-6 mt-6">
        <button className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700">
          Change Password
        </button>
        <button className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700">
          Change Profile
        </button>
      </div> */}
      <ToastContainer />
    </div>
  );
};

export default DoctorProfile;