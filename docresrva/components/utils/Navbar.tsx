import React, { useEffect, useState } from 'react';
import {
  Home,
  Mail,
  Event,
  Notifications,
  ExitToApp,
  LocalHospital,
  Search,
  AccountCircle, // Profile icon
} from '@mui/icons-material';
import Image from 'next/image';
import Img from '../../public/1600w--HXaczhPPfU.webp';
import Img2 from '../../public/flat-male-doctor-avatar-in-medical-face-protection-mask-and-stethoscope-healthcare-vector-illustration-people-cartoon-avatar-profile-character-icon-2FJR92X.jpg';
import { deleteCookie } from './deleteCookie';


const Navbar: React.FC = () => {
  interface User {
    userId:string;
    username: string;
    email: string;
    profilePicture?: string;
  }

  ;
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUserDetails = localStorage.getItem('user');
    if (savedUserDetails) {
      const parsedDetails: User = JSON.parse(savedUserDetails);
      setUser(parsedDetails);
    }
  }, []);

 
  const handleLogout = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault(); 

    try {
        
        localStorage.removeItem('user');

        
        setUser(null);

        
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
          href="/userHome"
          className="flex items-center space-x-2 hover:text-teal-700 transition duration-200"
        >
          <Home className="text-2xl" />
          <span className="font-medium">Home</span>
        </a>
        <a
          href="#"
          className="flex items-center space-x-2 hover:text-teal-700 transition duration-200"
        >
          <Mail className="text-2xl" />
          <span className="font-medium">Messages</span>
        </a>
        <a
          href="/appointmentPageuser"
          className="flex items-center space-x-2 hover:text-teal-700 transition duration-200"
        >
          <Event className="text-2xl" />
          <span className="font-medium">Appointments</span>
        </a>
        <a
          href="/alldoctors"
          className="flex items-center space-x-2 hover:text-teal-700 transition duration-200"
        >
          <LocalHospital className="text-2xl" />
          <span className="font-medium">All Doctors</span>
        </a>
      </div>

      {/* Right Section: User Profile and Actions */}
      <div className="flex items-center space-x-4">
        <a
          href="#"
          className="relative text-gray-600 hover:text-teal-700 transition duration-200"
        >
          <Notifications className="text-2xl" />
          <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
        </a>

        {user ? (
  <a href={'/userProfile'}
    className="hidden md:flex items-center space-x-3 cursor-pointer"
  >
    <Image
      src={user.profilePicture || Img2}
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
            <AccountCircle className="text-lg" />
            <span className="hidden md:inline font-medium">Login</span>
          </a>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

