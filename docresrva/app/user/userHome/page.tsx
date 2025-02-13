'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/utils/Navbar';

const UserHome: React.FC = () => {
  interface User {
    userId: string;
    username: string;
    email: string;
    profilePicture?: string;
  }

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUserDetails = localStorage.getItem('user');
    if (savedUserDetails) {
      const parsedDetails: User = JSON.parse(savedUserDetails);
      setUser(parsedDetails);
    }
  }, []);

  const categories = [
    { title: 'Cardiologist', icon: '❤️', description: 'Heart and blood vessel specialists.' },
    { title: 'Dermatologist', icon: '🌟', description: 'Skin, hair, and nail experts.' },
    { title: 'Pediatrician', icon: '👶', description: 'Healthcare for children and infants.' },
    { title: 'Neurologist', icon: '🧠', description: 'Specialists in brain and nerve systems.' },
    { title: 'Orthopedic', icon: '🦴', description: 'Bone and joint care experts.' },
  ];

  const appointments = [
    {
      doctor: 'Dr. John Doe',
      specialty: 'Cardiologist',
      date: '2024-11-30',
      time: '10:00 AM',
      status: 'Confirmed',
    },
    {
      doctor: 'Dr. Jane Smith',
      specialty: 'Dermatologist',
      date: '2024-12-05',
      time: '3:00 PM',
      status: 'Pending',
    },
  ];

  return (
    <div className="bg-gradient-to-b from-teal-500 to-blue-600 text-white min-h-screen">
      <Navbar />
      <div className="text-center py-10">
        <motion.h1
          className="text-4xl font-bold"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Welcome, <span className="text-yellow-400">{user?.username}</span>
        </motion.h1>
        <p className="mt-2 text-lg">Manage your appointments and access our services easily.</p>
      </div>

      {/* Categories Section */}
      <div className="py-10 bg-white text-black">
        <h2 className="text-center text-3xl font-bold mb-6">Our Doctors Specialties</h2>
        <div className="flex flex-wrap justify-center gap-6 px-4">
          {categories.map((category, index) => (
            <motion.div
              key={index}
              className="w-64 p-6 bg-gray-100 rounded-lg shadow-md text-center"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-4xl mb-4">{category.icon}</div>
              <h3 className="text-xl font-bold">{category.title}</h3>
              <p className="mt-2">{category.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

     

      {/* Call to Action */}
      <div className="py-10 bg-yellow-400 text-black text-center">
        <h2 className="text-2xl font-bold">Ready for Your Next Appointment?</h2>
        <p className="mt-2">Browse and book available slots with top doctors.</p>
        <a href="/user/alldoctors">
          <motion.button
            className="mt-6 px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg shadow-lg hover:bg-teal-700 transition"
            whileHover={{ scale: 1.1 }}
          >
            Book Now
          </motion.button>
        </a>
      </div>
    </div>
  );
};

export default UserHome;
