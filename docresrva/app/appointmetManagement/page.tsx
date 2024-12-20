'use client'

import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import Swal from "sweetalert2";
import AdminSidebar from "@/components/utils/Sidebar";
import axios from "axios";
import { jsPDF } from "jspdf";

// Define types for the appointment object
interface Appointment {
  _id: string;
  doctorId: {
    name: string;
  };
  patientId?: {
    firstName: string;
  };
  paymentId: {
    transactionId: string;
    transactionDate: string;
    amount: number;  // Adding amount field for payment
  };
  slotId: {
    date: string;
  };
  status: string;
}

const AppointmentManagement: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(5);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const { data } = await axios.get<Appointment[]>(
          `${process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL}/appointments`,
          { withCredentials: true }
        );
        setAppointments(data);
      } catch (err) {
        Swal.fire("Error!", "Unable to fetch appointments.", "error");
      }
    };
    fetchAppointments();
  }, []);

  // Filter appointments by search term and date range
  const filteredAppointments = appointments.filter((appointment) => {
    const transactionDate = new Date(appointment.paymentId.transactionDate);
    const withinDateRange =
      (!startDate || transactionDate >= new Date(startDate)) &&
      (!endDate || transactionDate <= new Date(endDate));

    return (
      withinDateRange &&
      (appointment.patientId?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.doctorId.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  // Calculate total revenue
  const totalRevenue = filteredAppointments.reduce(
    (sum, appointment) => sum + (appointment.paymentId.amount || 0),
    0
  );

  // Paginate appointments
  const indexOfLastAppointment = currentPage * itemsPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - itemsPerPage;
  const currentAppointments = filteredAppointments.slice(
    indexOfFirstAppointment,
    indexOfLastAppointment
  );

  // Handle page change
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Download filtered data as PDF
  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.text("Appointments Report", 14, 10);

    const headers = ["Doctor Name", "Patient Name", "Payment ID", "Date", "Status"];
    const tableData = filteredAppointments.map((appointment) => [
      appointment.doctorId.name,
      appointment.patientId?.firstName || "N/A",
      appointment.paymentId.transactionId,
      new Date(appointment.slotId.date).toLocaleDateString(),
      appointment.status,
    ]);

    const columnWidths = [50, 50, 60, 40, 60]; // Column widths

    // Set styles for header
    doc.setFont("helvetica", "bold");
    let xOffset = 14;
    doc.setFillColor(0, 123, 255); // Header background color
    doc.rect(14, 20, columnWidths.reduce((a, b) => a + b), 10, "F"); // Header background
    doc.setTextColor(255, 255, 255); // White text color
    doc.setFontSize(12);
    headers.forEach((header, index) => {
      doc.text(header, xOffset + 5, 25);
      xOffset += columnWidths[index];
    });

    // Set styles for data rows
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0); // Black text color
    tableData.forEach((row, rowIndex) => {
      let yOffset = 35 + rowIndex * 10;
      xOffset = 14;
      row.forEach((cell, cellIndex) => {
        doc.text(cell, xOffset + 5, yOffset);
        xOffset += columnWidths[cellIndex];
      });
    });

    // Draw table grid
    doc.setLineWidth(0.1);
    doc.setDrawColor(0, 0, 0);

    let yOffset = 25;
    doc.rect(14, yOffset - 4, columnWidths.reduce((a, b) => a + b), 10); // Header box
    tableData.forEach((row, rowIndex) => {
      yOffset = 35 + rowIndex * 10;
      doc.rect(14, yOffset - 4, columnWidths.reduce((a, b) => a + b), 10); // Row box
    });

    // Draw vertical lines for column separation
    let columnXOffset = 14;
    columnWidths.forEach((width) => {
      doc.line(columnXOffset, 20, columnXOffset, yOffset + 10); // Vertical grid lines
      columnXOffset += width;
    });

    // Add total revenue at the bottom of the table
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(`Total Revenue: $${totalRevenue.toFixed(2)}`, 14, yOffset + 15);

    doc.save("appointments_report.pdf");
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="w-full p-6 bg-gray-50">
        <h1 className="text-3xl font-extrabold mb-6 text-blue-600">Appointment Management</h1>

        {/* Date Filter Section */}
        <div className="mb-6 flex items-center space-x-4">
          <input
            type="date"
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="date"
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <button
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition duration-200"
            onClick={downloadPDF}
          >
            Download PDF
          </button>
        </div>

        {/* Search Input */}
        <div className="mb-6 flex items-center space-x-4">
          <input
            type="text"
            placeholder="Search for a patient"
            className="p-3 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition duration-200"
          >
            <FaSearch />
          </button>
        </div>

        {/* Total Revenue */}
        <div className="mb-6 text-xl font-semibold text-gray-700">
          Total Revenue: ₹{totalRevenue.toFixed(2)}
        </div>

        {/* Appointments Table */}
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-6 py-3 text-left text-sm font-semibold text-gray-700">Doctor Name</th>
              <th className="border px-6 py-3 text-left text-sm font-semibold text-gray-700">Patient Name</th>
              <th className="border px-6 py-3 text-left text-sm font-semibold text-gray-700">Payment ID</th>
              <th className="border px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
              <th className="border px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {currentAppointments.length > 0 ? (
              currentAppointments.map((appointment) => (
                <tr key={appointment._id} className="hover:bg-gray-50">
                  <td className="border px-6 py-3">{appointment.doctorId.name}</td>
                  <td className="border px-6 py-3">{appointment.patientId?.firstName || "N/A"}</td>
                  <td className="border px-6 py-3">{appointment.paymentId.transactionId}</td>
                  <td className="border px-6 py-3">{new Date(appointment.paymentId.transactionDate).toLocaleDateString()}</td>
                  <td className="border px-6 py-3">{appointment.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-500">No appointments found</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination Controls */}
        <div className="mt-6 flex justify-center space-x-4">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            disabled={currentPage === 1}
            onClick={() => paginate(currentPage - 1)}
          >
            Previous
          </button>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            disabled={currentPage === Math.ceil(filteredAppointments.length / itemsPerPage)}
            onClick={() => paginate(currentPage + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentManagement;
