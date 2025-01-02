import React, { useEffect, useState } from 'react';
import { Home, Mail, Event, Notifications, ExitToApp, LocalHospital, Search, AccountCircle, Cookie } from '@mui/icons-material';
import Image from 'next/image';
import Img from '../../public/PngItem_93782.png';
import Img2 from '../../public/flat-male-doctor-avatar-in-medical-face-protection-mask-and-stethoscope-healthcare-vector-illustration-people-cartoon-avatar-profile-character-icon-2FJR92X.jpg';
import io from 'socket.io-client';
import axios from 'axios';
import { deleteCookie } from './deleteCookie';
import Cookies from 'js-cookie';

interface Message {
  id: string;
  content: string;
  isRead: boolean;
  timestamp: Date;
}

interface User {
  userId: string;
  username: string;
  email: string;
  profilePicture?: string;
}

let socket: ReturnType<typeof io>;

const Navbar: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [chatrooms, setChatrooms] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch user from localStorage
  useEffect(() => {
    const savedUserDetails = localStorage.getItem('user');
    if (savedUserDetails) {
      const parsedDetails: User = JSON.parse(savedUserDetails);
      setUser(parsedDetails);
    }
  }, []);

  // Fetch chatrooms on load
  useEffect(() => {
    const fetchChatrooms = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_USER_BACKEND_URL}/chatroom`, {
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

    socket.on('updateUnreadCount', (unreadCount: number) => {
      
      setUnreadCount(unreadCount); 
    });
    // Cleanup WebSocket connection on component unmount
    return () => {
      if (socket) socket.disconnect();
    };
  }, []);
   console.log(unreadCount)
   
  

const handleLogout = async (event: React.MouseEvent<HTMLAnchorElement>) => {
  event.preventDefault();
  try {
    
    localStorage.removeItem('user');
    setUser(null);
    Cookies.remove('accessToken');
    deleteCookie('accessToken'); 
    window.location.href = '/';
  } catch (error) {
    console.error('Error during logout:', error);
  }
};

  

  return (
    <nav className="flex items-center justify-between p-4 bg-white shadow-md">
      {/* Left Section: Logo and Search Bar */}
      <div className="flex items-center space-x-4">
        <Image src={Img} alt="Logo" className="h-20 w-auto" priority />
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
        <a href="/userHome" className="flex items-center space-x-2 hover:text-teal-700 transition duration-200">
          <Home className="text-2xl" />
          <span className="font-medium">Home</span>
        </a>

        <a href={`/message/?userId=${user?.userId}`} className="relative flex items-center space-x-2">
          <Mail className="text-2xl" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
              {unreadCount}
            </span>
          )}
          <span  className="font-medium">Messages</span>
        </a>

        <a href="/appointmentPageuser" className="flex items-center space-x-2 hover:text-teal-700 transition duration-200">
          <Event className="text-2xl" />
          <span className="font-medium">Appointments</span>
        </a>
        <a href="/alldoctors" className="flex items-center space-x-2 hover:text-teal-700 transition duration-200">
          <LocalHospital className="text-2xl" />
          <span className="font-medium">All Doctors</span>
        </a>
      </div>

      {/* Right Section: Notifications, User Profile, and Logout */}
      <div className="flex items-center space-x-4">
        <a href="/Notification" className="relative text-gray-600 hover:text-teal-700 transition duration-200">
          <Notifications className="text-2xl" />
        </a>

        {user ? (
          <a href={'/userProfile'} className="hidden md:flex items-center space-x-3 cursor-pointer">
            <Image
              src={Img2}
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
            href="/login"
            className="flex items-center space-x-2 text-gray-600 hover:text-teal-700 transition duration-200"
          >
            <ExitToApp className="text-lg" />
            <span className="hidden md:inline font-medium">Login</span>
          </a>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
