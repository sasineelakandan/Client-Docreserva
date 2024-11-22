'use client';

import Navbar from "@/components/utils/Navbar";
import React, { useState, useEffect, useRef } from "react";
import { FaStar, FaCheckCircle, FaCamera } from "react-icons/fa";
import DoctorModal from "../modal/page";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const userProfile: React.FC = () => {
 
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [user, setUser] = useState<any>(null)
  const [profilePic,setProfile1]=useState<string>()
  const user1=localStorage.getItem('user')
  console.log(user1)
  const profilePic1=localStorage.getItem('profilePic')
  console.log(profilePic)
  useEffect(() => {
    const fetchUserProfile = async () => {
        try {
            const response = await axios.post('http://localhost:8001/api/user/profile',{profilePic1}, { withCredentials: true });
            if(response.data){
              console.log(response.data)
              setUser(response.data)
            }
            
        } catch (error) {
            console.error("Error fetching user profile:", error); 
        }
    };

    fetchUserProfile();
}, []);



 



 

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
        setProfile1(response.data.url)
        localStorage.setItem("profilePic", response.data.url);
        toast.success(" Profile upload success message!", {
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
            src={user?.profilePic||profilePic1}
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
          <h2 className="text-xl font-semibold">{user?.username || 'Dr. Denies Martine'}</h2>
          <p className="text-gray-600">{user?.phone || 'MBBS, MD'}</p>
          <p className="text-teal-500">{user?.email || 'Cardiologist'}</p>
          <p className="text-gray-500">{user?.experience || ''}</p>
          <p className="flex justify-center md:justify-start items-center gap-2 text-gray-500">
            {user?.hospitalName || 'Verified'}
            <FaCheckCircle className="text-teal-500" />
          </p>
          <div className="flex justify-center md:justify-start items-center gap-1 text-yellow-500 mt-2">
            <FaStar /> 4.5
          </div>
        </div>
        
        
      </div>
      <ToastContainer />
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

export default userProfile;
