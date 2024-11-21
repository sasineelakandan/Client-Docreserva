'use client';

import Navbar from "@/components/utils/Navbar";
import React, { useState, useEffect, useRef } from "react";
import { FaStar, FaCheckCircle, FaCamera } from "react-icons/fa";
import DoctorModal from "../modal/page";
import axios from "axios";
import { toast } from "react-toastify";

const DoctorProfile: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchDoctorProfile = async () => {
        try {
            const response = await axios.get('http://localhost:8001/api/doctor/profile', { withCredentials: true });
            if(response.data){
              console.log(response.data)
              setUser(response.data)
            }
            
        } catch (error) {
            console.error("Error fetching doctor profile:", error); 
        }
    };

    fetchDoctorProfile();
}, []);



 



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

      localStorage.setItem("profilePic", response.data.url);
      
      toast.success("File uploaded successfully!");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(`Upload failed: ${error.response?.data || error.message}`);
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
            src={user?.profilePic}
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
          <p className="text-gray-500">{user?.experience || '42 Years Experience'}</p>
          <p className="flex justify-center md:justify-start items-center gap-2 text-gray-500">
            {user?.hospitalName || 'Apollo Hospital, West Ham'}
            <FaCheckCircle className="text-teal-500" />
          </p>
          <div className="flex justify-center md:justify-start items-center gap-1 text-yellow-500 mt-2">
            <FaStar /> 4.5
          </div>
        </div>
        <div className="mt-4 md:mt-0">
          <button
            className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
            onClick={handleOpenModal}
          >
            Rigister
          </button>
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
        <p className="font-bold text-teal-700">{user?.fees}</p>
      </div>
      <div className="flex justify-center gap-6 mt-6">
        <button className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700">
          Change Password
        </button>
        <button className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700">
          Change Profile
        </button>
      </div>
    </div>
  );
};

export default DoctorProfile;
