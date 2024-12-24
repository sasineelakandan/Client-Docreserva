'use client'
import Navbar from "@/components/utils/Navbar";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { useDispatch } from "react-redux";
import CryptoJS from "crypto-js";

// Define types
interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  experience: number;
  hospitalName: string;
  street: string;
  city: string;
  state: string;
  profilePic?: string;
  fees: number;
}

interface Patient {
  _id: string;
  userId: string;
  doctorId: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  reason: string;
}

const DoctorPage: React.FC = () => {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [txnid, setTxnid] = useState("");
  const [hash, setHash] = useState("");
  const [slotId, setSlotId] = useState<string | null>(null);
  const dispatch = useDispatch();

  // Fetch saved doctor and patient details
  useEffect(() => {
    const savedDoctor = localStorage.getItem("Doctor");
    const savedPatient = localStorage.getItem("patient");

    if (savedDoctor) setDoctor(JSON.parse(savedDoctor));
    if (savedPatient) setPatient(JSON.parse(savedPatient));

    // Get the search params after the component is mounted
    const searchParams = useSearchParams();
    setSlotId(searchParams.get("id"));
  }, []);

  useEffect(() => {
    setTxnid("txn" + new Date().getTime());
  }, []);

  useEffect(() => {
    if (!txnid || !patient) return;

    const key = "4qJo1A";
    const amount = doctor?.fees?.toString() || "999";
    const productinfo = patient.userId;
    const firstname = patient.firstName || "";
    const userEmail = ""; // Add a valid email
    const salt = "MIIEvgIB..."; // Salt value truncated for brevity

    const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${userEmail}|||||||||||${salt}`;
    const generatedHash = CryptoJS.SHA512(hashString).toString();
    setHash(generatedHash);
  }, [txnid, patient, doctor]);

  const handleConfirmBooking = async () => {
    if (!patient || !doctor || !slotId) return;

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BOOKING_BACKEND_URL}/bookings`,
        {
          slotId,
          doctorId: doctor._id,
          patientId: patient._id,
          txnid,
          amount: doctor.fees
        },
        { withCredentials: true }
      );

      console.log("Booking confirmed:", response.data);

      handlePayment();
    } catch (error) {
      console.error("Error confirming booking:", error);
    }
  };

  const handlePayment = () => {
    if (!patient || !doctor) return;
    console.log("hai");

    const formData = {
      key: "4qJo1A",
      txnid: txnid,
      productinfo: patient.userId,
      amount: doctor.fees.toString(),
      slotId: slotId,
      firstname: patient.firstName,
      lastname: patient.lastName,
      surl: "http://localhost:3000/api/paymentSuccess",
      furl: "http://localhost:3000/api/paymentFailure",
      phone: "", // Add patient phone
      hash: hash
    };

    const form = document.createElement("form");
    form.method = "POST";
    form.action = "https://test.payu.in/_payment";

    Object.keys(formData).forEach((key) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = formData[key as keyof typeof formData] || "";
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <Suspense fallback={<div>Loading...</div>}>
        <main className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Display doctor and patient details */}
            {doctor && patient && (
              <div className="doctor-details bg-white p-4 shadow rounded">
                <h2>{doctor?.name}</h2>
                <p>Specialization: {doctor?.specialization}</p>
                <p>Experience: {doctor?.experience} years</p>
                <p>Fees: ₹{doctor?.fees}</p>
              </div>
            )}

            <div className="patient-details bg-white p-4 shadow rounded">
              <h3>Patient Information</h3>
              <p>Name: {patient?.firstName} {patient?.lastName}</p>
              <p>Age: {patient?.age}</p>
              <p>Gender: {patient?.gender}</p>
            </div>
          </div>

          <button
            onClick={handleConfirmBooking}
            className="mt-6 px-6 py-2 bg-green-600 text-white rounded-md shadow hover:bg-green-700"
          >
            Confirm Booking
          </button>
        </main>
      </Suspense>
    </div>
  );
};

export default DoctorPage;
