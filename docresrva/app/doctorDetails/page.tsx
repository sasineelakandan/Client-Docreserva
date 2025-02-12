'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Navbar from "@/components/utils/Navbar";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import axios from "axios";
import AppointmentBooking from "../bookingModal/page";
import { setUserDetails } from '../../Store/slices/doctorSlice';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../Store';
import MapComponent from '../viewDirection/page';
import axiosInstance from '@/components/utils/axiosInstence';
import Swal from 'sweetalert2';
import { getdoctorDetail } from '@/Service/userApi/page';
const DoctorDetails: React.FC = () => {
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [address, setAddress] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen1, setIsModalOpen1] = useState(false);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(1);
  const searchParams = useSearchParams();
  const doctorId = searchParams.get("id");
  const user = useSelector((state: RootState) => state.doctor);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!doctorId) return; // Ensure that doctorId exists
    const fetchDoctorDetails = async () => {
      try {
        setLoading(true);
        const response = await getdoctorDetail({doctorId})
        
        if (response.data) {
          dispatch(
            setUserDetails({
              _id: response.data._id,
              name: response.data.name,
              email: response.data.email,
              password: response.data.password,
              specialization: response.data.specialization,
              experience: response.data.experience,
              phone: response.data.phone,
              isVerified: response.data.isVerified,
              isOtpVerified: response.data.isOtpVerified,
              isBlocked: response.data.isBlocked,
              isDeleted: response.data.isDeleted,
              hospitalName: response.data.hospitalName,
              licenseNumber: response.data.licenseNumber,
              location: response.data.location,
              licenseImage: response.data.licenseImage,
              createdAt: response.data.createdAt,
              updatedAt: response.data.updatedAt,
              profilePic: response.data.profilePic,
              fees: response.data.fees,
              isAuthenticated: false,
            })
          );
          setDoctor(response.data);
          setAddress(response.data.location.address);
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorDetails();
  }, [doctorId]);

  function splitAddress(address: string) {
    const parts = address.split(',').map(part => part.trim());
    return {
      street: parts.slice(0, parts.length - 4).join(', '),
      city: parts[parts.length - 4],
      state: parts[parts.length - 3],
      pincode: parts[parts.length - 2],
      country: parts[parts.length - 1]
    };
  }

  const result = splitAddress(address);
  const handleSave = async (): Promise<void> => {
    try {
      // Send the comment and rating to the backend via a POST request
      const response = await axiosInstance.post(`${process.env.NEXT_PUBLIC_USER_BACKEND_URL}/reviews`, {
        doctorId,
        comment,
        rating,
      },{withCredentials:true});

      // Log the response from the backend (optional)
      console.log('Review saved:', response.data);

      // Close the modal after saving
      setIsModalOpen1(false);

      
      Swal.fire({
        icon: 'success',
        title: 'Review Submitted!',
        text: `Comment: ${comment}\nRating: ${'⭐'.repeat(rating)}`,
        confirmButtonText: 'OK',
      });
      window.location.reload()
    } catch (error) {
      // Handle any errors
      console.error('Error saving review:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'There was an issue submitting your review. Please try again.',
        confirmButtonText: 'OK',
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(
          `${process.env.NEXT_PUBLIC_USER_BACKEND_URL}/reviews?doctorId=${doctorId}`,
          { withCredentials: true }
        );
        setReviews(response.data); // Assuming response.data is an array of reviews
      } catch (err) {
        console.log(err);
      }
    };

    if (doctorId) fetchData(); // Only fetch reviews when doctorId is available
  }, [doctorId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-100 to-gray-300">
        <p className="text-gray-700 text-lg font-semibold">Loading...</p>
      </div>
    );
  }
  const toggleview = () => {
    
  };

 

  

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-100 to-blue-50">
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="flex items-center gap-8 bg-gradient-to-r from-teal-600 to-teal-800 p-6 rounded-lg shadow-lg text-white">
          <img
            src={doctor?.profilePic}
            alt={doctor?.name || "Doctor"}
            className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-lg"
          />
          <div>
            <h1 className="text-4xl font-bold">{doctor?.name || "Doctor Name"}</h1>
            <p className="text-lg">MBBS, MD</p>
            <p className="text-lg font-semibold">{doctor?.specialization || "Specialization"}</p>
            <p className="mt-2">Experience: {doctor?.experience || "0"} Years</p>
            <p>Hospital: {doctor?.hospitalName || "N/A"}</p>
            <div className="mt-3 flex items-center">
              <span className="mr-2 text-xl">⭐</span> 4.5
            </div>
          </div>
        </div>

        {/* Clinic Visit Section */}
        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center">
            <p className="text-gray-700">
              <strong>Clinic Address:</strong>
              <br /> {doctor?.hospitalName || "Not Available"}
              <br /> {result?.street || "Not Available"}
              <br /> {result?.city || "Not Available"}
              <br /> {result?.state || "Not Available"}
              <br /> {result?.pincode || "Not Available"}
              <br /> {result?.country || "Not Available"}
            </p>
            <p className="text-teal-700 font-bold text-lg">
              Consulting Fee: ₹{doctor?.fees || "0"}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg shadow hover:scale-105 transform transition"
          >
            Book Now
          </button>
          <MapComponent location={doctor.location} company={doctor} toggleview={toggleview}/>

          <button
            onClick={() => setIsModalOpen1(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg shadow hover:scale-105 transform transition"
          >
            Add Review
          </button>
          {isModalOpen1 && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-2xl mb-4">Add Review</h2>

            {/* Comment Section */}
            <div className="mb-4">
              <label htmlFor="comment" className="block text-sm font-semibold">
                Comment
              </label>
              <textarea
                id="comment"
                rows={4}
                className="w-full p-2 border rounded-lg"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            {/* Star Rating Section */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Rating</label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setRating(rate)}
                    className={`text-2xl ${
                      rating >= rate ? 'text-yellow-500' : 'text-gray-300'
                    } hover:text-yellow-500 focus:outline-none transition-colors`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
              {/* Display Selected Rating */}
              <div className="mt-2 text-sm text-gray-600">
                Selected Rating: {rating} {rating === 1 ? 'star' : 'stars'}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between">
              <button
                onClick={() => setIsModalOpen1(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
        </div>
        
        <AppointmentBooking
          doctorId={doctor?._id}
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
        />

        {/* About Section */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">About Doctor</h2>
          <p className="text-gray-600">
            Dr. {doctor?.name} is a highly skilled medical professional specializing in {doctor?.specialization}.
            With over {doctor?.specialization} of experience, they are dedicated to providing exceptional care and
            fostering long-term patient relationships. Dr. {doctor?.name} is known for their compassionate approach,
            clinical expertise, and commitment to staying updated with the latest advancements in their field. They are
            affiliated with {doctor?.hospitalName} and strive to make a positive impact on the lives of their patients
            every day.
          </p>
        </div>

        {/* Reviews Section */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Reviews</h2>
          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-h-80 overflow-y-auto">
              {reviews.map((review: any) => (
                <div key={review._id} className="bg-gray-200 rounded-lg shadow-md p-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={review?.userId?.profilePic || "/default-avatar.png"}
                      alt={review?.userId?.username || "User"}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{review?.userId?.username || "Anonymous"}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(review?.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-gray-700">
                      <span className="font-semibold">Rating:</span> {review?.rating} ⭐
                    </p>
                    <p className="mt-1 text-gray-600">{review?.reviewText}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No reviews available yet.</p>
          )}
        </div>

        {/* Footer Section */}
        <footer className="mt-12 border-t pt-6 bg-gradient-to-r from-teal-50 to-teal-100 shadow-inner">
          <p className="text-center text-gray-600">© 2024 HealthCare</p>
        </footer>
      </div>
    </div>
  );
};

export default function DoctorDetailsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DoctorDetails />
    </Suspense>
  );
}
