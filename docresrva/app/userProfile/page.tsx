'use client';

import Navbar from "@/components/utils/Navbar";
import React, { useState, useEffect, useRef } from "react";
import { FaStar, FaCheckCircle, FaCamera } from "react-icons/fa";
import { useRouter } from "next/navigation";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { deleteCookie } from "@/components/utils/deleteCookie";
import { useForm } from "react-hook-form";
import Img from '../../public/flat-male-doctor-avatar-in-medical-face-protection-mask-and-stethoscope-healthcare-vector-illustration-people-cartoon-avatar-profile-character-icon-2FJR92X.jpg'
import Image from "next/image";
const UserProfile: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [user, setUser] = useState<any>(null);
  const [profilePic, setProfilePic] = useState<string>();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  const router = useRouter();

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
    },
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_USER_BACKEND_URL}/profile`,
          
          { withCredentials: true }
        );

        if (response.data) {
          setUser(response.data);
          profileForm.reset({
            name: response.data.username,
            phone: response.data.phone,
          });
        }
      } catch (error: any) {
        if (error?.response) {
          const message =
            error.response.data?.message ||
            "An error occurred while fetching user profile.";
          if (message === "Internal server error.") {
            toast.error(message);
            deleteCookie("accessToken");
            router.replace("/login");
          }
        } else {
          toast.error("An error occurred. Please try again later.");
        }
      }
    };

    fetchUserProfile();
  }, [profileForm, profilePic, router]);

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
        
        const getResponse = await axios.post(`${process.env.NEXT_PUBLIC_USER_BACKEND_URL}/profile`,{uploadedUrl}, {withCredentials:true});
  
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
      let response=await axios.put(`${process.env.NEXT_PUBLIC_USER_BACKEND_URL}/profile`,
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
      let response=await axios.patch(`${process.env.NEXT_PUBLIC_USER_BACKEND_URL}/profile`,
          data,
          { withCredentials: true }
        );
        if (response.data) {
          setUser(response.data);
          toast.success("Profile updated successfully!");
        }
      
      setShowProfileModal(false);
      profileForm.reset()
    } catch (error) {
      toast.error("Failed to update profile.");
    }
  };
  console.log(user)

  return (
    <div className="max-w-full">
      <Navbar />
      <div className="flex flex-col md:flex-row items-center text-teal-500 shadow-lg rounded-lg p-6 mt-6">
        <div className="relative">
          <Image
            src={user?.profilePic||profilePic||Img}
            alt="Profile picture"
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
          <h2 className="text-xl font-semibold">{user?.username || "User Name"}</h2>
          <p className="text-gray-600">{user?.phone || "Phone"}</p>
          <p className="text-teal-500">{user?.email || "Email"}</p>
        </div>
      </div>
      <ToastContainer />
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

{showProfileModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Change Profile</h2>
      <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)}>
        <input
          type="text"
          placeholder="Name"
          {...profileForm.register("name", { required: "Name is required" })}
          className={`w-full mb-3 p-2 border rounded ${
            profileForm.formState.errors.name ? "border-red-500" : ""
          }`}
        />
        {profileForm.formState.errors.name && (
          <p className="text-red-500 text-sm">{profileForm.formState.errors.name.message}</p>
        )}
        <input
          type="text"
          placeholder="Phone"
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
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setShowProfileModal(false)}
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
    </div>
  );
};

export default UserProfile;
