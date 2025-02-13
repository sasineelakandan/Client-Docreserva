'use client';
import Navbar from "@/components/utils/Navbar";
import React, { Suspense, useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { useDispatch } from 'react-redux';
import { setPatientDetails } from "@/Store/slices/patientDetails";
import { useRouter } from "next/navigation";
import axiosInstance from "@/components/utils/axiosInstence";

// Define a type for the form data
interface FormData {
  firstName: string;
  lastName?: string;
  slotId: string;
  day: number;
  month: number;
  year: number;
  reason: string;
  terms: boolean;
  age: number; // Added
  gender: string; // Added
}

interface Doctor {
  _id: string;
  name: string;
  email: string;
  password: string;
  specialization: string;
  experience: number;
  phone: string;
  isVerified: boolean;
  isOtpVerified: boolean;
  isBlocked: boolean;
  isDeleted: boolean;
  hospitalName: string;
  licenseNumber: string;
  street: string;
  city: string;
  state: string;
  licenseImage: string;
  createdAt: string;
  updatedAt: string;
  profilePic?: string; // Optional field
  fees: number;
  isAuthenticated: boolean;
}

const DoctorPage: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>(); // Pass the FormData type to useForm
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const searchParams = useSearchParams();
  const slotId = searchParams.get('id');
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    const savedUserDetails = localStorage.getItem('Doctor');
    if (savedUserDetails) {
      const parsedDetails: Doctor = JSON.parse(savedUserDetails);
      setDoctor(parsedDetails);
    }
  }, []);

  const onSubmit: SubmitHandler<FormData> = async (data: any) => {
    data.slotId = slotId;
    data.doctorId = doctor?._id;

    try {
      const response = await axiosInstance.post(`${process.env.NEXT_PUBLIC_BOOKING_BACKEND_URL}/bookings`, data, { withCredentials: true });
      const patientData = response.data;

      if (response.data) {
        dispatch(
          setPatientDetails({
            _id: patientData._id,
            userId: patientData.userId,
            doctorId: patientData.doctorId,
            firstName: patientData.firstName.trim(),
            lastName: patientData.lastName.trim(),
            age: patientData.age,
            gender: patientData.gender,
            reason: patientData.reason,
            slotId: patientData.slotId,
          })
        );
        router.push(`/user/confirmBooking?id=${slotId}`);
      }
    } catch (error: any) {
      console.error('Error submitting data:', error);
      if (axios.isAxiosError(error)) {
        console.log('Axios error response:', error.response?.data);
      }
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header */}
      <Navbar />

      {/* Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Doctor Info */}
          <div className="bg-white shadow-lg rounded-lg p-4 flex flex-col items-center">
            <img
              src={doctor?.profilePic}
              alt="Doctor"
              className="rounded-full w-32 h-32 mb-4"
            />
            <h2 className="text-xl font-bold">{doctor?.name}</h2>
            <p className="text-gray-600">MBBS, MD</p>
            <p className="text-gray-600">{doctor?.specialization}</p>
            <p className="text-gray-600">{doctor?.experience}, Years' Experience</p>
            <p className="text-gray-600">
              {doctor?.hospitalName}
            </p>
            <p className="text-gray-600">
              {doctor?.street}
            </p>
            <p className="text-gray-600">
              {doctor?.city}
            </p>
            <p className="text-gray-600">
              {doctor?.state}
            </p>
            <p className="text-teal-600 font-bold text-lg mt-4">
              Consulting Fee: ₹ {doctor?.fees}
            </p>
          </div>

          {/* Patient Form */}
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4 text-teal-600">
              Patient Details
            </h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Enter First Name"
                  {...register("firstName", { required: "First Name is required" })}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm">{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium">
                  Last Name (Optional)
                </label>
                <input
                  type="text"
                  id="lastName"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Enter Last Name"
                  {...register("lastName")}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="age" className="block text-sm font-medium">
                    Age
                  </label>
                  <input
                    type="number"
                    id="age"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Enter Age"
                    {...register("age", {
                      required: "Age is required",
                      min: { value: 0, message: "Age cannot be negative" },
                      max: { value: 120, message: "Please enter a realistic age" },
                    })}
                  />
                  {errors.age && (
                    <p className="text-red-500 text-sm">{errors.age.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium">
                    Gender
                  </label>
                  <select
                    id="gender"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    {...register("gender", { required: "Gender is required" })}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.gender && (
                    <p className="text-red-500 text-sm">{errors.gender.message}</p>
                  )}
                </div>
              </div>
              <div>
                <label htmlFor="reason" className="block text-sm font-medium">
                  Health Issue
                </label>
                <textarea
                  id="reason"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Describe the health issue..."
                  {...register("reason", { required: "Please describe the health issue" })}
                />
                {errors.reason && (
                  <p className="text-red-500 text-sm">{errors.reason.message}</p>
                )}
              </div>
              <div>
                <label>
                  <input
                    type="checkbox"
                    {...register("terms", { required: "You must agree to share files" })}
                    className="form-checkbox"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    Share all previous medical files with the doctor
                  </span>
                </label>
                {errors.terms && (
                  <p className="text-red-500 text-sm">{errors.terms.message}</p>
                )}
              </div>
              <button
                type="submit"
                className="w-full bg-teal-600 text-white py-2 rounded-md hover:bg-teal-700"
              >
                Save
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

const DoctorPageWithSuspense: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DoctorPage />
    </Suspense>
  );
};

export default DoctorPageWithSuspense;
