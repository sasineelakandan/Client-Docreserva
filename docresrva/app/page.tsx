'use client'
import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/utils/landingNavbar';
import Img1 from '../public/DALL·E 2024-12-13 19.06.00 - A 30-year-old female doctor wearing a white lab coat and stethoscope, standing in a modern medical clinic. She has a professional yet friendly demeano.webp'
import Img2 from '../public/DALL·E 2024-12-13 19.06.24 - A 30-year-old male doctor wearing a white lab coat and stethoscope, standing in a modern medical clinic. He has a professional yet friendly demeanor w.webp'
import Img3 from '../public/DALL·E 2024-12-13 19.06.00 - A 30-year-old female doctor wearing a white lab coat and stethoscope, standing in a modern medical clinic. She has a professional yet friendly demeano.webp'
import Image from 'next/image';
export default function Home() {
  const steps = [
    { step: 'Search', description: 'Find doctors based on specialty or location.', icon: '🔍' },
    { step: 'Choose', description: 'Pick the best doctor from our trusted list.', icon: '👨‍⚕️' },
    { step: 'Book', description: 'Select a time slot that works for you.', icon: '📅' },
  ];

  const doctors = [
    {
      name: 'Dr. John Doe',
      specialty: 'Cardiologist',
      rating: '⭐⭐⭐⭐⭐',
      image: Img3, // Placeholder for missing images
    },
    {
      name: 'Dr. Jane Smith',
      specialty: 'Dermatologist',
      rating: '⭐⭐⭐⭐',
      image: Img2, // Placeholder for missing images
    },
    {
      name: 'Dr. Emily White',
      specialty: 'Pediatrician',
      rating: '⭐⭐⭐⭐⭐',
      image:Img1 , // Placeholder for missing images
    },
  ];

  const faqs = [
    {
      question: 'How do I book an appointment?',
      answer: 'Search for a doctor, choose a time slot, and confirm your booking.',
    },
    {
      question: 'Can I cancel or reschedule?',
      answer: 'Yes, cancellations and rescheduling are available before 24 hours of the appointment.',
    },
  ];

  return (
    <div className="bg-gradient-to-b from-teal-500 to-blue-600 text-white">
      <Navbar />
      
      {/* Hero Section */}
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <motion.h1
          className="text-5xl md:text-7xl font-bold"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Find & Book the <span className="text-yellow-400">Best Doctors</span> Near You
        </motion.h1>
        <p className="mt-4 text-lg md:text-xl">
          Trusted by thousands of patients for online appointments.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-4">
          <input
            type="text"
            placeholder="Search by specialty, doctor, or location..."
            className="px-4 py-3 w-full sm:w-80 rounded-lg shadow-md text-black"
          />
          <motion.button
            className="px-6 py-3 bg-yellow-400 text-black font-semibold rounded-lg shadow-lg hover:bg-yellow-500 transition"
            whileHover={{ scale: 1.1 }}
          >
            Search
          </motion.button>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-16 bg-white text-black">
        <h2 className="text-center text-4xl font-bold mb-10">How It Works</h2>
        <div className="flex flex-wrap justify-center gap-8 px-4">
          {steps.map((step) => (
            <div key={step.step} className="w-64 p-6 bg-gray-100 rounded-lg shadow-md text-center">
              <div className="text-4xl mb-4">{step.icon}</div>
              <h3 className="text-xl font-bold">{step.step}</h3>
              <p className="mt-2">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Doctors Section */}
      <div className="py-16 bg-gray-900 text-white">
        <h2 className="text-center text-4xl font-bold mb-10">Top Doctors</h2>
        {/* Horizontal Scrolling */}
        <div className="flex justify-center overflow-x-auto scroll-smooth px-4">
          <div className="flex gap-8">
            {doctors.map((doctor) => (
              <div
                key={doctor.name}
                className="w-64 p-6 bg-gray-800 rounded-lg shadow-md text-center flex-shrink-0"
              >
                <Image
                  src={doctor.image}
                  alt={doctor.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4"
                />
                <h3 className="text-xl font-bold">{doctor.name}</h3>
                <p>{doctor.specialty}</p>
                <p className="mt-2">{doctor.rating}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-16 bg-teal-500">
        <h2 className="text-center text-4xl font-bold mb-10">Frequently Asked Questions</h2>
        <div className="max-w-4xl mx-auto space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold">{faq.question}</h3>
              <p className="mt-2 text-gray-700">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="py-16 bg-yellow-400 text-black text-center">
        <h2 className="text-4xl font-bold">Ready to Book an Appointment?</h2>
        <p className="mt-4">Find the best doctors and schedule your appointment in minutes.</p>
        <a href="/user/userHome">
          <motion.button
            className="mt-6 px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg shadow-lg hover:bg-teal-700 transition"
            whileHover={{ scale: 1.1 }}
          >
            Get Started
          </motion.button>
        </a>
      </div>
    </div>
  );
}
