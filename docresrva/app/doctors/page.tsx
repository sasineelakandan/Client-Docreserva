'use client';

import React, { useState, useEffect } from "react";
import { FaSearch, FaLock, FaUnlock } from "react-icons/fa";
import Swal from "sweetalert2";
import AdminSidebar from "@/components/utils/Sidebar";

import axiosInstance from "@/components/utils/axiosInstence";
import { getallverifydoctorssApi } from "@/Service/adminapi/page";

type Doctor = {
  _id: string;
  email: string;
  name: string;
  phone: string;
  fees:string
  licenseNumber:number
  hospitalName?:string
  profilePic?: string;
  isVerified: boolean;
};

const DoctorManagement: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL}/doctors`, { withCredentials: true });
        setDoctors(response.data);
      } catch (error) {
        Swal.fire("Empty!", " No data availaple in doctors Verification.", "warning");
       
      }
    };

    fetchDoctors();
  }, [])
 
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
          await axiosInstance.delete(`${process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL}/doctors?userId=${_id}`, {
            withCredentials: true,
          });
          Swal.fire("Deleted!", "Doctor deleted successfully.", "success");
          setDoctors((prev) => prev.filter((doctor) => doctor._id !== _id)); // Update state without refreshing
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

    const updatedStatus = !doctor.isVerified;
    Swal.fire({
      title: `Are you sure you want to ${updatedStatus ? "verify" : "verified"} this doctor?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: updatedStatus ? "#d33" : "#28a745",
      cancelButtonColor: "#3085d6",
      confirmButtonText: updatedStatus ? "Yes, verify!" : "Yes, verified!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await getallverifydoctorssApi({ userId: _id })
          axiosInstance.patch(
            `${process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL}/doctors`,
            { userId: _id },
            { withCredentials: true }
          );
          
          Swal.fire(
            updatedStatus ? "verified!" : "Unblocked!",
            `Doctor has been ${updatedStatus ? "verified" : "verify"}.`,
            "success"
          );
          window.location.reload()
        } catch (err) {
          console.error("Failed to update verify status:", err);
          Swal.fire("Error!", "Could not update verify status.", "error");
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
        <h1 className="text-2xl font-bold mb-4">Doctor Verification</h1>
        <div className="mb-4 flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search for a doctor"
            className="p-2 border border-gray-300 rounded w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="bg-blue-500 text-white px-4 py-2 rounded">
            <FaSearch />
          </button>
        </div>
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray- 200">
              <th className="border px-4 py-2">Profile Picture</th>
              <th className="border px-4 py-2">Name</th>
              <th className="border px-4 py-2">Email</th>
              <th className="border px-4 py-2">licenseNumber</th>
              <th className="border px-4 py-2">Phone</th>
              <th className="border px-4 py-2">licenseImage</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDoctors.map((doctor) => (
              <tr key={doctor?._id}>
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
                  {doctor?.fees}
                </td>
                <td className="border px-4 py-2 space-x-2">
                  
                  <button
                    className={`${doctor.isVerified ? "bg-gray-500" : "bg-green-500"} text-white px-4 py-2 rounded`}
                    onClick={() => toggleBlock(doctor._id)}
                  >
                    {doctor.isVerified ? (
                      <>
                        <FaUnlock className="inline mr-2" /> verified
                      </>
                    ) : (
                      <>
                        <FaLock className="inline mr-2" /> verify
                      </>
                    )}
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