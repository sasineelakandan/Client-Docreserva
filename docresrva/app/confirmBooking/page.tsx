'use client'
import Navbar from "@/components/utils/Navbar";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { useDispatch } from "react-redux";
import CryptoJS from "crypto-js";
import Image from "next/image";

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
  const dispatch = useDispatch();
  const [slotId, setSlotId] = useState<string | null>(null);
  
  // Fetch saved doctor and patient details
  useEffect(() => {
    const savedDoctor = localStorage.getItem("Doctor");
    const savedPatient = localStorage.getItem("patient");

    if (savedDoctor) setDoctor(JSON.parse(savedDoctor));
    if (savedPatient) setPatient(JSON.parse(savedPatient));

    const id = new URLSearchParams(window.location.search).get("id");
    setSlotId(id);
  }, []);

  // Transaction ID and hash state
  const [txnid, setTxnid] = useState("");
  const [hash, setHash] = useState("");

  useEffect(() => {
    setTxnid("txn" + new Date().getTime());
  }, []);

  useEffect(() => {
    if (!txnid || !patient || !doctor) return;

    const key = "4qJo1A";
    const amount = doctor?.fees?.toString() || "999";
    const productinfo = patient.userId;
    const firstname = patient.firstName || "";
    const userEmail = ""; // Add a valid email
    const salt = "MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCd8l6hYFLGr09QDBEH5TRoGBNFIbAxAHtbSRmz/DvsJejyL7J3gVXvt+Cfjpj8Kelw6mzpgF8tReZ6k8z2y6//66oMb2WADmqmpoOgBiSg9IOYB82U/mr89cz27Euq/O/TxTxJA9vIge5fSsoFfcLx4sZo96rSium5fcEUV41X8efBEclrF0t+cStBz+gyBem6lFOgYbkpjwAdxp7LzuCLZmy7yh3zaO3MXxwe4gTy62VFRF7mJfCNyDKYU1moED+31UYipJWF9r8vtNSq48kGHlDZX4G7f9xfYSauwFGofou6sCo+zrWZvIZFGU8Qs6csAPuCs7D0IUqP+GquiH9rAgMBAAECggEBAICaJES/Oga+HRTvDjrge+A5og8K0/vCCa6VAZGT0XKAl4ACKAy3yTHrBMDFiXjf40vmBBHHTTd+j5/EkgFsbXwx9P41AW7XziysrcVw2wgWrsLtr40d7hzTQjTWxvGNCvThxikpNB249U6vhXgdIspyO9yhs3vEUXOPmdMnSlWMwOprdJ6qhPJ1kyfTU/Liv2r1vcYmqekvqLzJzDNdnNOl9UCFyZZbdaxBjMuB17o0i/h+3psMHFYf+RHaMo7QZSgzyD+XKa5c57RXJTUQZa8prVm6Xyg+ztNX92WDksNE9jGnRxUBJ94bDce4w85q8qnkHTx3ZmhTxaAadf+emDECgYEAz3edvd2Ze/D1D2a8tmhUSXpo9qVgEh97H62hvF3+RLJdTQOukH1ab/SZi7thLff4sGwdiEmSvbFtzS65Q8i6o0LPwjCp00kmn1z87+gdQ8UQ8miZD8I17o94FHPt2oF1AIvI3z62E2jheX2oPFQ7Yz9oivUHpmAs4pQm+q7N6BkCgYEAwuUrTN7HocUnEenUbgKPadkpSEjYDsqDPxru04DMrb79sSEicjI6qrrQGV8rBorlZbVTHTPdqe8RFGNfmhAe23g1FxVHE4TuYIkbJYzbrv1hsABGXdmdo/B43kZ0zCkMe3pe8bUuk/cIGV5qsKGK4411A6Ru5JGOGrJEXb54ZCMCgYBjwLjIrL76l+3MfPJppho4xjGnvfZGYHqbzamBX5Q9RaGUwRty/8K3J92YEP1108/wS9ubRvzWVnRb/oY3sFEE5L/uN+W/4GFAqL45P9qqVhuC4oYNzKyPys3Kz77im/I80/k+VfHHvVsERkXY1AtF+hvzDEOkXIPYYbGoQNpiKQKBgQCKwunKaE+QgTNpEKf7z3zWaxR2b87M8SjzFDT4h5qzFenAZIwG7HZSuoGRnu2eUeQ0Px63CweGhz0M3BfkNBgUQIjkL3UUk6+5McUPPjPnamZUDk4LYfZYE82qzFU6SvulKqJQy6QnG1o73bpumgWuMDgg6ME/odagcU41xHgpKwKBgEYDs2cmfkJKbxY3UtQLL+ItbjbQ05HMb26yYKVFgK+W1el7UDZ57ySaRS1CuUYUfPLCKoW8Nn1QTP3jspQ89aKrIEcS1dXcHtOO4886lYaBwvqXgo5fpln8OQp33NRR8qcs96JutHxEj9n0E+ksd9DkwjFQaCMMrSp7LfrLloAH";
    const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${userEmail}|||||||||||${salt}`;
    const generatedHash = CryptoJS.SHA512(hashString).toString();
    setHash(generatedHash);
  }, [txnid, patient, doctor]);

  const handleConfirmBooking = async () => {
    if (!patient || !doctor) return;

    try {
      const response = await axios.put(`${process.env.NEXT_PUBLIC_BOOKING_BACKEND_URL}/bookings`, {
        slotId,
        doctorId: doctor._id,
        patientId: patient._id,
        txnid,
        amount: doctor.fees,
      }, { withCredentials: true });

      console.log("Booking confirmed:", response.data);
      handlePayment();
    } catch (error) {
      console.error("Error confirming booking:", error);
    }
  };

  const handlePayment = () => {
    if (!patient || !doctor) return;
    const formData = {
      key: "4qJo1A",
      txnid,
      productinfo: patient.userId,
      amount: doctor.fees.toString(),
      slotId,
      firstname: patient.firstName,
      lastname: patient.lastName,
      surl: "http://localhost:3000/api/paymentSuccess",
      furl: "http://localhost:3000/api/paymentFailure",
      phone: "", // Add patient phone
      hash,
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
      <main className="container mx-auto px-4 py-6">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div className="bg-white shadow-lg rounded-lg p-4 flex flex-col items-center">
      <img
        src={doctor?.profilePic}
        alt="Doctor"
        className="rounded-full w-32 h-32 mb-4"
      />
      <h2 className="text-xl font-bold">{doctor?.name}</h2>
      <p className="text-gray-600">{doctor?.specialization}</p>
      <p className="text-gray-600">{doctor?.experience} Years' Experience</p>
      <p className="text-gray-600">{doctor?.hospitalName}</p>
      <p className="text-gray-600">{doctor?.city}, {doctor?.state}</p>
      <p className="text-teal-600 font-bold text-lg mt-4">
        Consulting Fee: ₹ {doctor?.fees}
      </p>
    </div>
    {patient && (
      <div className="bg-white shadow-lg rounded-lg p-4 flex flex-col items-center">
        <h3 className="text-lg font-bold text-teal-600 mb-4">Patient Information</h3>
        <p className="text-gray-600">{patient.firstName} {patient.lastName}</p>
        <p className="text-gray-600">{patient.age} Years Old</p>
        <p className="text-gray-600">{patient.gender}</p>
        <p className="text-gray-600">{patient.reason}</p>
        <div className="mt-6 flex justify-between">
    <button
      className="bg-gradient-to-r from-teal-500 via-teal-600 to-teal-700 text-white py-3 px-6 rounded-lg shadow-xl hover:scale-105 transform transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-teal-300"
      onClick={handleConfirmBooking}
    >
      Confirm Booking
    </button>
  </div>
      </div>
      
    )}
  </div>

  
</main>

    </div>
  );
};

export default DoctorPage;
