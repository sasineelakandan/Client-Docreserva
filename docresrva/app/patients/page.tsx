'use client';
import React, { useState } from "react";
import { FaSearch, FaLock, FaUnlock } from "react-icons/fa";
import Swal from "sweetalert2";
import AdminSidebar from "@/components/utils/Sidebar";
import EditModal from "../EditModal/page";

type Patient = {
  id: number;
  name: string;
  age: number;
  condition: string;
  isBlocked: boolean;
};

const PatientManagement: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([
    { id: 1, name: "John Doe", age: 30, condition: "Flu", isBlocked: false },
    { id: 2, name: "Jane Smith", age: 40, condition: "Diabetes", isBlocked: false },
    { id: 3, name: "Mike Johnson", age: 25, condition: "Hypertension", isBlocked: false },
  ]);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const handleEdit = (patient: Patient): void => {
    setSelectedPatient(patient);
    setIsModalOpen(true);
  };

  const handleUpdate = (updatedPatient: Patient): void => {
    setPatients((prevPatients) =>
      prevPatients.map((patient) =>
        patient.id === updatedPatient.id ? updatedPatient : patient
      )
    );
    setIsModalOpen(false); // Close the modal after updating
    Swal.fire('Updated!', 'The patient details have been updated.', 'success');
  };

  const handleDelete = (id: number): void => {
    Swal.fire({
      title: 'Are you sure?',
      text: "This action cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        setPatients((prevPatients) =>
          prevPatients.filter((patient) => patient.id !== id)
        );
        Swal.fire('Deleted!', 'The patient has been deleted.', 'success');
      }
    });
  };

  const toggleBlock = (id: number): void => {
    const patient = patients.find((p) => p.id === id);
    if (!patient) return;

    Swal.fire({
      title: `Are you sure you want to ${
        patient.isBlocked ? "unblock" : "block"
      } this patient?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: patient.isBlocked ? '#28a745' : '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: patient.isBlocked ? 'Yes, unblock!' : 'Yes, block!',
    }).then((result) => {
      if (result.isConfirmed) {
        setPatients((prevPatients) =>
          prevPatients.map((p) =>
            p.id === id ? { ...p, isBlocked: !p.isBlocked } : p
          )
        );
        Swal.fire(
          `${patient.isBlocked ? "Unblocked" : "Blocked"}!`,
          `The patient has been ${
            patient.isBlocked ? "unblocked" : "blocked"
          }.`,
          'success'
        );
      }
    });
  };

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
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
              <th className="border border-gray-300 px-4 py-2">ID</th>
              <th className="border border-gray-300 px-4 py-2">Name</th>
              <th className="border border-gray-300 px-4 py-2">Age</th>
              <th className="border border-gray-300 px-4 py-2">Condition</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((patient) => (
              <tr key={patient.id}>
                <td className="border border-gray-300 px-4 py-2">{patient.id}</td>
                <td className="border border-gray-300 px-4 py-2">{patient.name}</td>
                <td className="border border-gray-300 px-4 py-2">{patient.age}</td>
                <td className="border border-gray-300 px-4 py-2">{patient.condition}</td>
                <td className="border border-gray-300 px-4 py-2 space-x-2">
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    onClick={() => handleEdit(patient)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded"
                    onClick={() => handleDelete(patient.id)}
                  >
                    Delete
                  </button>
                  <button
                    className={`${
                      patient.isBlocked ? "bg-green-500" : "bg-gray-500"
                    } text-white px-4 py-2 rounded`}
                    onClick={() => toggleBlock(patient.id)}
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
        {isModalOpen && selectedPatient && (
          <EditModal
            patient={selectedPatient}
            onClose={() => setIsModalOpen(false)}
            onUpdate={handleUpdate} // Pass handleUpdate to the EditModal
          />
        )}
      </div>
    </div>
  );
};

export default PatientManagement;
