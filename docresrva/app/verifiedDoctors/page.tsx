'use client';

import React, { useState, useEffect } from "react";
import { FaSearch, FaLock, FaUnlock, FaTrash } from "react-icons/fa"; // Import FaTrash for the delete icon
import Swal from "sweetalert2";
import AdminSidebar from "@/components/utils/Sidebar";
import axios from "axios";

type Doctor = {
  _id: string;
  email: string;
  name: string;
  phone: string;
  licenseNumber: number;
  licenseImage?: string;
  profilePic?: string;
  isVerified: boolean;
  isBlocked: boolean;
};

const DoctorManagement: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get("http://localhost:8001/api/admin/verifieddoctors", { withCredentials: true });
        setDoctors(response.data);
      } catch (error) {
        Swal.fire("Empty!", "No data available in verified Doctors.", "warning");
      }
    };

    fetchDoctors();
  }, []);

  const handleDelete = (_id: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:8001/api/admin/verifieddoctors?doctorId=${_id}`, {
            withCredentials: true,
          });
          Swal.fire("Deleted!", "Doctor deleted successfully.", "success");
          window.location.reload()
        } catch (err) {
          console.error("Failed to delete doctor:", err);
          Swal.fire("Error!", "Could not delete doctor.", "error");
        }
      }
    });
  };

  const toggleBlock = async (_id: string) => {
    const doctor = doctors.find((d) => d._id === _id);
    if (!doctor) return;

    const updatedStatus = !doctor.isBlocked;
    Swal.fire({
      title: `Are you sure you want to ${updatedStatus ? "block" : "unblock"} this doctor?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: updatedStatus ? "#d33" : "#28a745",
      cancelButtonColor: "#3085d6",
      confirmButtonText: updatedStatus ? "Yes, block!" : "Yes, unblock!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.patch(
            `http://localhost:8001/api/admin/verifieddoctors`,
            { doctorId:_id }, 
            { withCredentials: true }
          );

          // Update local state to reflect the change
          setDoctors((prev) =>
            prev.map((doc) =>
              doc._id === _id ? { ...doc, isBlocked: updatedStatus } : doc
            )
          );

          Swal.fire(
            updatedStatus ? "Blocked!" : "Unblocked!",
            `Doctor has been ${updatedStatus ? "blocked" : "unblocked"}.`,
            "success"
          );
        } catch (err) {
          console.error("Failed to update block status:", err);
          Swal.fire("Error!", "Could not update block status.", "error");
        }
      }
    });
  };

  const filteredDoctors = doctors.filter((doctor) =>
    doctor?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="w-full p-6">
        <h1 className="text-2xl font-bold mb-4">Doctor Management</h1>
        <div className="mb-4 flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search for a doctor"
            className="p-2 border border-gray-300 rounded w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          < button className="bg-blue-500 text-white px-4 py-2 rounded">
            <FaSearch />
          </button>
        </div>
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-4 py-2">Profile Picture</th>
              <th className="border px-4 py-2">Name</th>
              <th className="border px-4 py-2">Email</th>
              <th className="border px-4 py-2">License Number</th>
              <th className="border px-4 py-2">Phone</th>
              <th className="border px-4 py-2">License Image</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDoctors.map((doctor) => (
              <tr key={doctor._id}>
                <td className="border px-4 py-2">
                  <img
                    src={doctor.profilePic || "/default-avatar.png"}
                    alt="Profile"
                    className="h-10 w-10 rounded-full"
                  />
                </td>
                <td className="border px-4 py-2">{doctor?.name}</td>
                <td className="border px-4 py-2">{doctor?.email}</td>
                <td className="border px-4 py-2">{doctor?.licenseNumber}</td>
                <td className="border px-4 py-2">{doctor?.phone}</td>
                <td className="border px-4 py-2">
                  <img
                    src={doctor?.licenseImage || "/default-avatar.png"}
                    alt="License"
                    className="h-10 w-20 rounded-full"
                  />
                </td>
                <td className="border px-4 py-2 flex space-x-2">
                  <button
                    className={`${doctor.isBlocked ? "bg-gray-500" : "bg-green-500"} text-white px-4 py-2 rounded`}
                    onClick={() => toggleBlock(doctor._id)}
                  >
                    {doctor.isBlocked ? (
                      <>
                        <FaUnlock className="inline mr-2" /> Unblock
                      </>
                    ) : (
                      <>
                        <FaLock className="inline mr-2" /> Block
                      </>
                    )}
                  </button>
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded"
                    onClick={() => handleDelete(doctor._id)}
                  >
                    <FaTrash className="inline mr-2" /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DoctorManagement;