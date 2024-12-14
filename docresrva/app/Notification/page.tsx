'use client'

import Navbar from "@/components/utils/Navbar";
import React, { useEffect, useState } from "react";
import { FaStar } from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";

type Doctor = {
  _id: string;
  name: string;
  profilePic: string;
  specialization: string;
  hospitalName: string;
  city: string;
};

type Appointment = {
  _id: string;
  title: string;
  date: string;
  doctorId: Doctor;
};

type Review = {
  appointmentId: string;
  rating: number;
  reviewText: string;
  createdAt: string; // Track review creation date
};

const Notification: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittedReviews, setSubmittedReviews] = useState<string[]>([]); // Track submitted reviews

  useEffect(() => {
    const storedReviews = localStorage.getItem('reviews');
    const storedSubmittedReviews = localStorage.getItem('submittedReviews');
    
    if (storedReviews) {
      setReviews(JSON.parse(storedReviews));
    }
    if (storedSubmittedReviews) {
      setSubmittedReviews(JSON.parse(storedSubmittedReviews));
    }

    const fetchAppointments = async () => {
      try {
        const response = await axios.get<Appointment[]>(
          `${process.env.NEXT_PUBLIC_USER_BACKEND_URL}/Notification`,
          { withCredentials: true }
        );
        setAppointments(response.data);
      } catch (err) {
        console.error("Error fetching appointments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  useEffect(() => {
    localStorage.setItem('reviews', JSON.stringify(reviews));
    localStorage.setItem('submittedReviews', JSON.stringify(submittedReviews));
  }, [reviews, submittedReviews]);

  const handleRatingChange = (appointmentId: string, rating: number) => {
    if (submittedReviews.includes(appointmentId)) return;

    setReviews((prev) => {
      const existingReview = prev.find((r) => r.appointmentId === appointmentId);
      if (existingReview) {
        return prev.map((r) =>
          r.appointmentId === appointmentId ? { ...r, rating } : r
        );
      }
      return [...prev, { appointmentId, rating, reviewText: "", createdAt: new Date().toISOString() }];
    });
  };

  const handleReviewChange = (appointmentId: string, reviewText: string) => {
    if (submittedReviews.includes(appointmentId)) return;

    setReviews((prev) => {
      const existingReview = prev.find((r) => r.appointmentId === appointmentId);
      if (existingReview) {
        return prev.map((r) =>
          r.appointmentId === appointmentId ? { ...r, reviewText } : r
        );
      }
      return [...prev, { appointmentId, rating: 0, reviewText, createdAt: new Date().toISOString() }];
    });
  };

  const handleSubmit = (appointmentId: string) => {
    const review = reviews.find((r) => r.appointmentId === appointmentId);
    const appointment = appointments.find((a) => a._id === appointmentId);

    if (review && appointment && review.rating > 0 && review.reviewText.trim() !== "") {
      const dataToSubmit = {
        doctorId: appointment.doctorId._id,
        ...review,
      };

      axios
        .post(`${process.env.NEXT_PUBLIC_USER_BACKEND_URL}/Notification`, dataToSubmit, {
          withCredentials: true,
        })
        .then((response) => {
          Swal.fire({
            title: "Thank You!",
            text: `Your feedback on "${appointment?.doctorId?.name}" has been submitted successfully.`,
            icon: "success",
            confirmButtonText: "Okay",
          });

          const updatedReview = response.data;
          setReviews((prev) => {
            return prev.map((r) =>
              r.appointmentId === appointmentId
                ? { ...r, reviewText: updatedReview.reviewText, rating: updatedReview.rating, createdAt: updatedReview.createdAt }
                : r
            );
          });

          setSubmittedReviews((prev) => [...prev, appointmentId]);
        })
        .catch((err) => {
          console.error("Error submitting review:", err);
          Swal.fire({
            title: "Error!",
            text: "Failed to submit the review. Please try again.",
            icon: "error",
            confirmButtonText: "Retry",
          });
        });
    } else {
      Swal.fire({
        title: "Warning!",
        text: "Please provide a rating and review before submitting.",
        icon: "warning",
        confirmButtonText: "Okay",
      });
    }
  };

  // Format date with time in AM/PM format
  const formatDate = (date: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true, // AM/PM format
    };
    return new Date(date).toLocaleString(undefined, options);
  };

  // Check if the review is within the last two days
  const isReviewVisible = (reviewDate: string) => {
    const reviewDateObj = new Date(reviewDate);
    const currentDate = new Date();
    const diffInTime = currentDate.getTime() - reviewDateObj.getTime();
    const diffInDays = diffInTime / (1000 * 3600 * 24); // Convert time difference to days

    return diffInDays <= 2; // Return true if the review was submitted in the last two days
  };

  // Sort reviews by createdAt date in descending order (most recent first)
  const sortedReviews = [...reviews].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <>
      <Navbar />
      <div className="w-full min-h-screen bg-gradient-to-r from-blue-50 to-blue-100 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Notifications</h1>
          {loading ? (
            <p className="text-center text-gray-600">Loading...</p>
          ) : appointments.length === 0 ? (
            <p className="text-center text-gray-600">No notifications available.</p>
          ) : (
            <div className="space-y-6">
              {appointments.map((appointment) => {
                // Only show reviews that were submitted in the last 2 days
                const review = sortedReviews.find((r) => r.appointmentId === appointment._id);
                if (review && !isReviewVisible(review.createdAt)) return null;

                return (
                  <div key={appointment._id} className="p-6 bg-white shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center mb-4">
                      <img
                        src={appointment?.doctorId?.profilePic || "/default-avatar.png"}
                        alt={appointment?.doctorId?.name || "Doctor"}
                        className="w-16 h-16 rounded-full border-2 border-blue-500"
                      />
                      <div className="ml-4">
                        <h2 className="text-xl font-semibold text-gray-800">{appointment?.doctorId?.name || "Unknown Doctor"}</h2>
                        <p className="text-sm text-gray-600">{appointment?.doctorId?.specialization || "Specialization unavailable"}</p>
                        <p className="text-sm text-gray-500">{appointment?.doctorId?.hospitalName}, {appointment?.doctorId?.city}</p>
                      </div>
                    </div>
                    <div className="space-y-4 mt-4">
                      <p className="font-medium text-gray-600">Your Rating:</p>
                      <div className="flex items-center space-x-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FaStar
                            key={`${appointment._id}-${star}`}
                            size={30}
                            className={`cursor-pointer transition-colors duration-300 ${ 
                              (reviews.find((r) => r.appointmentId === appointment._id)?.rating ?? 0) >= star 
                              ? "text-yellow-500" 
                              : "text-gray-300"}`}
                            onClick={() => handleRatingChange(appointment._id, star)}
                          />
                        ))}
                      </div>
                      <textarea
                        value={reviews.find((r) => r.appointmentId === appointment._id)?.reviewText || ""}
                        onChange={(e) => handleReviewChange(appointment._id, e.target.value)}
                        placeholder="Write a review"
                        className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => handleSubmit(appointment._id)}
                        disabled={submittedReviews.includes(appointment._id)}
                        className="w-full p-4 bg-blue-500 text-white font-semibold rounded-lg disabled:bg-gray-300 hover:bg-blue-600 transition-colors duration-300"
                      >
                        {submittedReviews.includes(appointment._id) ? "Review Submitted" : "Submit Review"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Notification;
