'use client';

import React, { useState, useEffect } from "react";
import { FaSearch, FaLock, FaUnlock } from "react-icons/fa";
import Swal from "sweetalert2";
import AdminSidebar from "@/components/utils/Sidebar";
import axios from "axios";

type Patient = {
  _id: string;
  email: string;
  username: string;
  phone: string;
  profilePic?: string;
  isBlocked: boolean;
};

const PatientManagement: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch patients on component mount
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const { data } = await axios.get<Patient[]>(
          "http://localhost:8001/api/admin/patients",
          { withCredentials: true }
        );
        
        setPatients(data);
      } catch (err) {
        console.error("Failed to fetch patients:", err);
      }
    };
    fetchPatients();
  }, []);
 console.log(patients)
  // Handle delete
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
          const { data } =  await axios.delete(`http://localhost:8001/api/admin/patients?userId=${_id}`, {
            withCredentials: true,
          });
          
          Swal.fire("Deleted!", "Patient deleted successfully.", "success");
          window.location.reload()
        } catch (err) {
          console.error("Failed to delete patient:", err);
          Swal.fire("Error!", "Could not delete patient.", "error");
        }
      }
    });
  };

  // Toggle block/unblock
  const toggleBlock = async (_id: string) => {
    const patient = patients.find((p) => p._id === _id);
    if (!patient) return;

    const updatedBlockStatus = !patient.isBlocked;
    Swal.fire({
      title: `Are you sure you want to ${
        updatedBlockStatus ? "block" : "unblock"
      } this patient?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: updatedBlockStatus ? "#d33" : "#28a745",
      cancelButtonColor: "#3085d6",
      confirmButtonText: updatedBlockStatus ? "Yes, block!" : "Yes, unblock!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.patch(
            `http://localhost:8001/api/admin/patients`,
            { userId:_id },
            { withCredentials: true }
          );
          setPatients((prev) =>
            prev.map((patient) =>
              patient._id === _id
                ? { ...patient, isBlocked: updatedBlockStatus }
                : patient
            )
          );
          Swal.fire(
            updatedBlockStatus ? "Blocked!" : "Unblocked!",
            `Patient has been ${updatedBlockStatus ? "blocked" : "unblocked"}.`,
            "success"
          );
        } catch (err) {
          console.error("Failed to update block status:", err);
          Swal.fire("Error!", "Could not update block status.", "error");
        }
      }
    });
  };

  // Filter patients based on search term
  const filteredPatients = patients.filter((patient) =>
    patient.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="w-full p-6">
        <h1 className="text-2xl font-bold mb-4">Patient Management</h1>
        <div className="mb-4 flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search for a patient"
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
            <tr className="bg-gray-200">
              <th className="border px-4 py-2">Profile Picture</th>
              <th className="border px-4 py-2">Name</th>
              <th className="border px-4 py-2">Email</th>
              <th className="border px-4 py-2">Phone</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((patient) => (
              <tr key={patient._id}>
                <td className="border px-4 py-2">
                  <img
                    src={patient.profilePic || "/default-avatar.png"}
                    alt="Profile"
                    className="h-10 w-10 rounded-full"
                  />
                </td>
                <td className="border px-4 py-2">{patient.username}</td>
                <td className="border px-4 py-2">{patient.email}</td>
                <td className="border px-4 py-2">{patient.phone}</td>
                <td className="border px-4 py-2 space-x-2">
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded"
                    onClick={() => handleDelete(patient._id)}
                  >
                    Delete
                  </button>
                  <button
                    className={`${
                      patient.isBlocked ? "bg-gray-500" : "bg-green-500"
                    } text-white px-4 py-2 rounded`}
                    onClick={() => toggleBlock(patient._id)}
                  >
                    {patient.isBlocked ? (
                      <>
                        <FaUnlock className="inline mr-2" /> Unblock
                      </>
                    ) : (
                      <>
                        <FaLock className="inline mr-2" /> Block
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

export default PatientManagement;
