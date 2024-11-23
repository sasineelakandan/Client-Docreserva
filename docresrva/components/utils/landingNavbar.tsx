'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { deleteCookie } from './deleteCookie';

const Navbar: React.FC = () => {
  const [userName, setUserName] = useState<string|null>(null);

  useEffect(() => {
    
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser); 
        setUserName(parsedUser.username); 
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
      }
    }
  }, []);

  const handleLogout = () => {
   
    localStorage.removeItem('user');
    setUserName(null);
    deleteCookie('accessToken');
  };

  return (
    <nav className="bg-teal-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <a href="/" className="text-2xl font-bold hover:text-yellow-400 transition">
          DoctorReserva
        </a>

        {/* Buttons */}
        <div className="flex space-x-4">
          {userName ? (
            <>
              {/* Welcome Message */}
              <span className="px-4 py-2 bg-white text-teal-600 font-semibold rounded-lg shadow-md">
                Welcome, {userName}
              </span>
              <motion.button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition"
                whileHover={{ scale: 1.1 }}
              >
                Logout
              </motion.button>
            </>
          ) : (
            <>
              <motion.a
                href="/login"
                className="px-4 py-2 bg-white text-teal-600 font-semibold rounded-lg shadow-md hover:bg-gray-100 transition"
                whileHover={{ scale: 1.1 }}
              >
                Login
              </motion.a>
              <motion.a
                href="/signup"
                className="px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg shadow-md hover:bg-yellow-500 transition"
                whileHover={{ scale: 1.1 }}
              >
                Sign Up
              </motion.a>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
