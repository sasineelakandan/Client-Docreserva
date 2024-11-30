'use client'

import Navbar from "@/components/utils/Navbar";
import axios from "axios";
import React, { useState, ChangeEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
// Define the Doctor interface
interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  experience: number;
  fees: number;
  hospitalName: string;
  phone: number;
  profilePic: string;
}

const App: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filters, setFilters] = useState({
    location: "",
    specialization: "",
    experience: "",
    fees: "",
  });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const doctorsPerPage = 6;

  const router=useRouter()
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BOOKING_BACKEND_URL}/getdoctors`, { withCredentials: true });
        console.log("API Response:", response.data);
        setDoctors(response.data || []);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handle filter input changes
  const handleFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // Apply filters
  const filteredDoctors = doctors.filter((doctor) => {
    return (
      (!filters.location || doctor.hospitalName?.toLowerCase().includes(filters.location.toLowerCase())) &&
      (!filters.specialization || doctor.specialization?.toLowerCase().includes(filters.specialization.toLowerCase())) &&
      (!filters.experience || doctor.experience >= parseInt(filters.experience || "0", 10)) &&
      (!filters.fees || doctor.fees <= parseInt(filters.fees || "0", 10))
    );
  });

  // Pagination logic
  const indexOfLastDoctor = currentPage * doctorsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;
  const currentDoctors = filteredDoctors.slice(indexOfFirstDoctor, indexOfLastDoctor);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  if (loading) {
    return <div className="min-h-screen flex justify-center items-center">Loading...</div>;
  }
  function handleCardClick(doctorId:string){
      router.push(`/doctorDetails?id=${doctorId}`)
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto p-6 flex gap-6">
        {/* Sidebar */}
        <aside className="w-1/4 bg-white rounded shadow p-4">
          <h2 className="text-lg font-bold text-gray-700 mb-4">Filters</h2>
          <div className="mb-4">
            <label className="block text-gray-600">Location</label>
            <input
              type="text"
              name="location"
              placeholder="Search location"
              className="border border-gray-300 p-2 w-full rounded"
              onChange={handleFilterChange}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-600">Specialization</label>
            <input
              type="text"
              name="specialization"
              placeholder="Search specialization"
              className="border border-gray-300 p-2 w-full rounded"
              onChange={handleFilterChange}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-600">Min Experience</label>
            <input
              type="number"
              name="experience"
              placeholder="Years"
              className="border border-gray-300 p-2 w-full rounded"
              onChange={handleFilterChange}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-600">Max Fees</label>
            <input
              type="number"
              name="fees"
              placeholder="Fees in ₹"
              className="border border-gray-300 p-2 w-full rounded"
              onChange={handleFilterChange}
            />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
      <h2 className="text-2xl font-bold text-gray-700 mb-6">Available Doctors</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentDoctors.map((doctor) => (
          <div
            key={doctor._id}
            className="bg-white rounded-lg shadow-lg p-6 flex items-center gap-6 transition-all transform hover:scale-105 hover:shadow-xl hover:cursor-pointer"
            onClick={() => handleCardClick(doctor._id)}
          >
            <img
              src={doctor.profilePic}
              alt={doctor.name}
              className="w-28 h-28 rounded-full object-cover border-4 border-teal-700 transition-all transform hover:scale-110"
            />
            <div className="flex flex-col">
              <h3 className="text-xl font-bold text-gray-800 hover:text-teal-700 transition-colors">
                {doctor.name}
              </h3>
              <p className="text-gray-600">{doctor.specialization}</p>
              <p className="text-gray-500">Experience: {doctor.experience} years</p>
              <p className="text-gray-500">Fees: ₹{doctor.fees}</p>
              <p className="text-gray-500">Location: {doctor?.hospitalName}</p>
              <div className="text-teal-700 flex items-center">
                <span className="mr-1"></span> {doctor.phone}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-4 mt-6">
        {Array.from({ length: Math.ceil(filteredDoctors.length / doctorsPerPage) }, (_, index) => (
          <button
            key={index + 1}
            className={`px-4 py-2 rounded-full text-lg font-semibold transition-all duration-300 
            ${currentPage === index + 1 ? "bg-teal-600 text-white" : "bg-gray-300 text-gray-700"} 
            hover:text-white hover:scale-105`}
            onClick={() => handlePageChange(index + 1)}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </main>
      </div>
    </div>
  );
};

export default App;
