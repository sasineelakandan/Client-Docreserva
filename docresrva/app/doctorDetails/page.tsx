'use client';

import Navbar from "@/components/utils/Navbar";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import axios from "axios";

const DoctorDetails: React.FC = () => {
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const searchParams = useSearchParams();
  const doctorId = searchParams.get("id");

  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.patch(
          `${process.env.NEXT_PUBLIC_BOOKING_BACKEND_URL}/getdoctors`,
          { doctorId },
          { withCredentials: true }
        );
        setDoctor(response.data);
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorDetails();
  }, [doctorId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-100 to-gray-300">
        <p className="text-gray-700 text-lg font-semibold">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-100 to-blue-50">
      <Navbar />

      <div className="container mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="flex items-center gap-8 bg-gradient-to-r from-teal-600 to-teal-800 p-6 rounded-lg shadow-lg text-white">
          <img
            src={doctor?.profilePic}
            alt={doctor?.name || "Doctor"}
            className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-lg"
          />
          <div>
            <h1 className="text-4xl font-bold">{doctor?.name || "Doctor Name"}</h1>
            <p className="text-lg">MBBS, MD</p>
            <p className="text-lg font-semibold">{doctor?.specialization || "Specialization"}</p>
            <p className="mt-2">Experience: {doctor?.experience || "0"} Years</p>
            <p>Hospital: {doctor?.hospitalName || "N/A"}</p>
            <div className="mt-3 flex items-center">
              <span className="mr-2 text-xl">⭐</span> 4.5
            </div>
          </div>
        </div>

        {/* Clinic Visit Section */}
        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center">
            <p className="text-gray-700">
              <strong>Clinic Address:</strong> {doctor?.hospitalName || "Not Available"}
             <br /> {doctor?.street || "Not Available"}
             <br /> {doctor?.city || "Not Available"}
             <br /> {doctor?.state || "Not Available"}
            </p>
            <p className="text-teal-700 font-bold text-lg">
              Consulting Fee: ₹{doctor?.fees || "0"}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-6">
          <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg shadow hover:scale-105 transform transition">
            Book Now
          </button>
          <button className="px-6 py-3 bg-gray-600 text-white rounded-lg shadow hover:scale-105 transform transition">
            Message
          </button>
        </div>

        {/* About Section */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">About Doctor</h2>
          <p className="text-gray-600">Dr. {doctor?.name} is a highly skilled medical professional specializing in {doctor?.specialization}. With over {doctor?.specialization} of experience, they are dedicated to providing exceptional care and fostering long-term patient relationships.  Dr. {doctor?.name} is known for their compassionate approach, clinical expertise, and commitment to staying updated with the latest advancements in their field. They are affiliated with {doctor?.hospitalName} and strive to make a positive impact on the lives of their patients every day.
          </p>
        </div>

        {/* Footer Section */}
        <footer className="mt-12 border-t pt-6 bg-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 py-4">
            <div>
              <h3 className="text-gray-700 font-bold">Accessories</h3>
              <ul className="mt-2 text-gray-600">
                <li>Body Care</li>
                <li>Chambray</li>
                <li>Floral</li>
                <li>Rejuvenation</li>
              </ul>
            </div>
            <div>
              <h3 className="text-gray-700 font-bold">Brands</h3>
              <ul className="mt-2 text-gray-600">
                <li>Barbour</li>
                <li>Brioni</li>
                <li>Oliver Spencer</li>
              </ul>
            </div>
            <div>
              <h3 className="text-gray-700 font-bold">Get In Touch</h3>
              <ul className="mt-2 text-gray-600">
                <li>Call us: (555)-555-5555</li>
                <li>Email: support@domain.com</li>
                <li className="mt-2">
                  Follow us:
                  <span className="text-blue-500 ml-2">Twitter Facebook Instagram</span>
                </li>
              </ul>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default DoctorDetails;
