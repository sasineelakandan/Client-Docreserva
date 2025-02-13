'use client'

import React, { useEffect, useState } from 'react';
import {
  Home,
  Mail,
  Event,
  Notifications,
  ExitToApp,
  Search,
  AccountCircle,
  AccountBalanceWallet // Profile icon
} from '@mui/icons-material';
import Image from 'next/image';
import Img from '../../public/PngItem_93782.png';
import Img2 from '../../public/flat-male-doctor-avatar-in-medical-face-protection-mask-and-stethoscope-healthcare-vector-illustration-people-cartoon-avatar-profile-character-icon-2FJR92X.jpg';
import { deleteCookie } from './deleteCookie';
import io from 'socket.io-client';
import axios from 'axios';
import Cookies from 'js-cookie';
import axiosInstance from './axiosInstence';
let socket: ReturnType<typeof io>;

const doctorNavbar: React.FC = () => {
  interface User {
    userId:string;
    username: string;
    email: string;
    profilePicture?: string;
  }

  ;
  const [user, setUser] = useState<User | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  useEffect(() => {
    const savedUserDetails = localStorage.getItem('user');
    if (savedUserDetails) {
      const parsedDetails: User = JSON.parse(savedUserDetails);
      setUser(parsedDetails);
    }
  }, []);

  useEffect(() => {
    const fetchChatrooms = async () => {
       setUnreadCount(0)
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_DOCTOR_BACKEND_URL}/chatroom`, {
          withCredentials: true,
        });
        

      } catch (error) {
        console.error('Error fetching chatrooms:', error);
      }
    };

    fetchChatrooms();
  }, []);

  
  useEffect(() => {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!);

    socket.on('updateDoctorUnreadCount', (unreadCountDoctor: number) => {
      
      setUnreadCount(unreadCountDoctor); 
    });
    // Cleanup WebSocket connection on component unmount
    return () => {
      if (socket) socket.disconnect();
    };
  }, []);


  const handleLogout = async (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    try {
        await axiosInstance.post(`${process.env.NEXT_PUBLIC_DOCTOR_BACKEND_URL}/logout`,{},{withCredentials:true});// Call backend logout route
        localStorage.removeItem('user'); // Clear user data from localStorage
        window.location.href = '/doctorLogin'; // Redirect after logout
    } catch (error) {
        console.error('Logout failed:', error);
    }
};

  return (
    <nav className="flex items-center justify-between p-4 bg-white shadow-md">
      {/* Left Section: Logo and Search Bar */}
      <div className="flex items-center space-x-4">
        <Image
          src={Img}
          alt="Doc Reserva Logo"
          className="h-20 w-auto"
          priority
        />
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search here..."
            className="w-full pl-10 py-2 border rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:text-teal-700"
          />
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Search className="text-xl" />
          </span>
        </div>
      </div>

      {/* Center Section: Navigation Icons */}
      <div className="hidden md:flex items-center space-x-8 text-gray-600">
        <a
          href="/doctor/doctorHome"
          className="flex items-center space-x-2 hover:text-teal-700 transition duration-200"
        >
          <Home className="text-2xl" />
          <span className="font-medium">Home</span>
        </a>
        <a href=
        {`/doctor/chatroomDoctor?userId=${user?.userId}`} className="relative flex items-center space-x-2">
          <Mail className="text-2xl" />
           
          <span className="font-medium">Messages</span>
        </a>
        <a
          href="/doctor/appointmentPage"
          className="flex items-center space-x-2 hover:text-teal-700 transition duration-200"
        >
          <Event className="text-2xl" />
          <span className="font-medium">Appointments</span>
        </a>
        <a
    href="/wallet" // Replace with your actual wallet page route
    className="flex items-center space-x-2 hover:text-teal-700 transition duration-200"
  >
    <AccountBalanceWallet className="text-2xl" />
    <span className="font-medium">Wallet</span>
  </a>

  <a
          href="/doctor/prescriptionHistory"
          className="flex items-center space-x-2 hover:text-teal-700 transition duration-200"
        >
          <Event className="text-2xl" />
          <span className="font-medium">prescriptions</span>
        </a>
      </div>

      {/* Right Section: User Profile and Actions */}
      <div className="flex items-center space-x-4">
         <a href="/doctor/Notificationdoctor" className="relative text-gray-600 hover:text-teal-700 transition duration-200">
            <Notifications className="text-2xl" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </a>
        

        {user ? (
  <a href={'/doctor/doctorProfile'}
    className="hidden md:flex items-center space-x-3 cursor-pointer"
  >
    <Image
      src={user?.profilePicture || Img2}
      alt="User Profile Picture"
      className="h-12 w-12 rounded-full border border-gray-300"
      priority
    />
    <div className="text-sm">
      <p className="font-semibold text-gray-700">Hi, {user.username}</p>
      <p className="text-gray-500">Good Morning</p>
    </div>
  </a>
) : null}

        {user ? (
          <a
            href="#"
            onClick={handleLogout}
            className="flex items-center space-x-2 text-gray-600 hover:text-teal-700 transition duration-200"
          >
            <ExitToApp className="text-lg" />
            <span className="hidden md:inline font-medium">Logout</span>
          </a>
        ) : (
          <a
            href="/doctor/doctorLogin"
            className="flex items-center space-x-2 text-gray-600 hover:text-teal-700 transition duration-200"
          >
            <AccountCircle className="text-lg" />
            <span className="hidden md:inline font-medium">Login</span>
          </a>
        )}
      </div>
    </nav>
  );
};

export default doctorNavbar;