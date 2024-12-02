
'use client'
import Navbar from "@/components/utils/Navbar";
import React from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { FaHome, FaBell, FaUserAlt, FaUsers } from "react-icons/fa";
import { useEffect ,useState} from "react";
import { useSearchParams } from "next/navigation";
// Define a type for the form data
interface FormData {
  firstName: string;
  lastName?: string;
  slotId:string;
  day: number;
  month: number;
  year: number;
  reason: string;
  terms: boolean;
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
    control,
  } = useForm<FormData>(); // Pass the FormData type to useForm
  const [doctor, setDoctor] = useState<Doctor| null>(null);
  const searchParams = useSearchParams();
  const slotId = searchParams.get('id');
  useEffect(() => {
    const savedUserDetails = localStorage.getItem('Doctor');
    if (savedUserDetails) {
      const parsedDetails: Doctor = JSON.parse(savedUserDetails);
      setDoctor(parsedDetails);
    }
  }, []);
  const onSubmit: SubmitHandler<FormData> = (data:any) => {
    data.slotId=slotId
    data.doctorId=doctor?._id
    console.log(data);
   
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header */}
      <Navbar/>

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
                  <label htmlFor="day" className="block text-sm font-medium">
                    Day
                  </label>
                  <input
                    type="number"
                    id="day"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="DD"
                    {...register("day", {
                      required: "Day is required",
                      min: { value: 1, message: "Day must be between 1 and 31" },
                      max: { value: 31, message: "Day must be between 1 and 31" },
                    })}
                  />
                  {errors.day && (
                    <p className="text-red-500 text-sm">{errors.day.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="month" className="block text-sm font-medium">
                    Month
                  </label>
                  <input
                    type="number"
                    id="month"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="MM"
                    {...register("month", {
                      required: "Month is required",
                      min: { value: 1, message: "Month must be between 1 and 12" },
                      max: { value: 12, message: "Month must be between 1 and 12" },
                    })}
                  />
                  {errors.month && (
                    <p className="text-red-500 text-sm">{errors.month.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="year" className="block text-sm font-medium">
                    Year
                  </label>
                  <input
                    type="number"
                    id="year"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="YYYY"
                    {...register("year", {
                      required: "Year is required",
                      min: { value: 1900, message: "Year must be valid" },
                      max: {
                        value: new Date().getFullYear(),
                        message: "Year must be valid",
                      },
                    })}
                  />
                  {errors.year && (
                    <p className="text-red-500 text-sm">{errors.year.message}</p>
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

      {/* Footer */}
      
    </div>
  );
};

export default DoctorPage;
