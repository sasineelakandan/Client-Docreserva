'use client';

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
  location:any
}

const App: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filters, setFilters] = useState({
    name: "",
    location: "",
    specialization: "",
    experience: "",
    fees: "",
  });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const doctorsPerPage = 6;

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!process.env.NEXT_PUBLIC_BOOKING_BACKEND_URL) {
          throw new Error("Backend URL is missing in environment variables");
        }
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BOOKING_BACKEND_URL}/getdoctors`,
          { withCredentials: true }
        );
        setDoctors(response.data || []);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleFilterChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const filteredDoctors = doctors.filter((doctor) => {
    return (
      (!filters.name || doctor.name.toLowerCase().includes(filters.name.toLowerCase())) &&
      (!filters.location ||
        doctor?.location?.address?.toLowerCase().includes(filters.location.toLowerCase())) &&
      (!filters.specialization ||
        doctor.specialization?.toLowerCase().includes(filters.specialization.toLowerCase())) &&
      (!filters.experience || doctor.experience >= parseInt(filters.experience || "0", 10)) &&
      (!filters.fees || doctor.fees <= parseInt(filters.fees || "0", 10))
    );
  });

  const indexOfLastDoctor = currentPage * doctorsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;
  const currentDoctors = filteredDoctors.slice(indexOfFirstDoctor, indexOfLastDoctor);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  if (currentDoctors.length === 0 && filteredDoctors.length > 0) {
    setCurrentPage(1); // Reset to page 1 if filtered results are empty for the current page
  }

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-teal-600 text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  const handleCardClick = (doctorId: string) => {
    router.push(`/doctorDetails?id=${doctorId}`);
  };

  const handleResetFilters = () => {
    setFilters({
      name: "",
      location: "",
      specialization: "",
      experience: "",
      fees: "",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-teal-50 to-teal-100">
      <Navbar />
      <div className="container mx-auto p-6 flex gap-8">
        {/* Sidebar */}
        <aside className="w-1/4 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-teal-600 mb-6">Filters</h2>

          {/* Filter Fields */}
          {["name", "location", "experience", "fees"].map((filter) => (
            <div className="mb-5" key={filter}>
              <label
                htmlFor={filter}
                className="block text-gray-700 font-semibold mb-2 capitalize"
              >
                {filter === "fees" ? "Max Fees" : `Search by ${filter}`}
              </label>
              <input
                type={filter === "experience" || filter === "fees" ? "number" : "text"}
                id={filter}
                name={filter}
                placeholder={`Enter ${filter}`}
                className="border border-gray-300 p-3 w-full rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 transition duration-200"
                onChange={handleFilterChange}
              />
            </div>
          ))}

          {/* Specialization Dropdown */}
          <div className="mb-5">
            <label
              htmlFor="specialization"
              className="block text-gray-700 font-semibold mb-2"
            >
              Specialization
            </label>
            <select
              id="specialization"
              name="specialization"
              className="border border-gray-300 p-3 w-full rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 transition duration-200"
              value={filters.specialization}
              onChange={handleFilterChange}
            >
              <option value="">All Specializations</option>
              <option value="cardiology">Cardiology</option>
              <option value="dermatology">Dermatology</option>
              <option value="pediatrics">Pediatrics</option>
              <option value="neurology">Neurology</option>
              <option value="orthopedics">Orthopedics</option>
            </select>
          </div>

          {/* Reset Filters */}
          <button
            className="bg-teal-500 text-white px-4 py-2 rounded-lg w-full hover:bg-teal-600 transition duration-200"
            onClick={handleResetFilters}
          >
            Reset Filters
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <h2 className="text-3xl font-bold text-teal-700 mb-8">Available Doctors</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentDoctors.map((doctor) => (
              <div
                key={doctor._id}
                className="bg-white rounded-lg shadow-lg p-6 flex items-center gap-6 hover:scale-105 hover:shadow-xl transition-all cursor-pointer"
                onClick={() => handleCardClick(doctor._id)}
              >
                <img
                  src={doctor.profilePic || "/default-avatar.png"}
                  alt={doctor.name}
                  className="w-28 h-28 rounded-full object-cover border-4 border-teal-600"
                />
                <div className="flex flex-col">
                  <h3 className="text-xl font-bold text-gray-800 hover:text-teal-700 transition">
                    {doctor.name}
                  </h3>
                  <p className="text-gray-600">{doctor.specialization}</p>
                  <p className="text-gray-500">Experience: {doctor.experience} years</p>
                  <p className="text-gray-500">Fees: ₹{doctor.fees}</p>
                  <p className="text-gray-500">Location: {doctor?.hospitalName}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center gap-4 mt-10">
            {Array.from(
              { length: Math.ceil(filteredDoctors.length / doctorsPerPage) },
              (_, index) => (
                <button
                  key={index + 1}
                  className={`px-4 py-2 rounded-lg text-lg font-medium transition-all 
                    ${
                      currentPage === index + 1
                        ? "bg-teal-600 text-white"
                        : "bg-gray-300 text-gray-700"
                    } hover:bg-teal-700 hover:text-white`}
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </button>
              )
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
