'use client';

import React, { useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";

import AdminSidebar from "@/components/utils/Sidebar";
import axiosInstance from "@/components/utils/axiosInstence";
import { getreviewsApi } from "@/Service/adminapi/page";

const ReviewManagement: React.FC = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await getreviewsApi()
         
        setReviews(response.data);
      } catch (error) {
        Swal.fire("Error!", "Could not fetch reviews.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const handleDeleteReview = (_id: string) => {
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
          await axiosInstance.delete(
            `${process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL}/reviews?reviewId=${_id}`,
            {
              withCredentials: true,
            }
          );
          Swal.fire("Deleted!", "Review deleted successfully.", "success");
          setReviews((prev) => prev.filter((review) => review?._id !== _id));
        } catch (err) {
          console.error("Failed to delete review:", err);
          Swal.fire("Error!", "Could not delete review.", "error");
        }
      }
    });
  };

  const totalPages = Math.ceil(reviews.length / itemsPerPage);

  const currentReviews = reviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  if (loading) {
    return <div>Loading reviews...</div>;
  }

  return (
    <div className="flex h-screen">
      {/* Admin Sidebar */}
      <AdminSidebar />

      {/* Review Management Content */}
      <div className="flex-1 p-6 overflow-auto">
        <h1 className="text-2xl font-bold mb-4">Review Management</h1>
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-4 py-2">Doctor</th>
              <th className="border px-4 py-2">User</th>
              <th className="border px-4 py-2">Comment</th>
              <th className="border px-4 py-2">Rating</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentReviews.map((review) => (
              <tr key={review?._id}>
                <td className="border px-4 py-2">{review?.doctorId?.name}</td>
                <td className="border px-4 py-2">{review?.userId?.username}</td>
                <td className="border px-4 py-2">{review?.reviewText}</td>
                <td className="border px-4 py-2">{review?.rating}</td>
                <td className="border px-4 py-2 flex justify-center">
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    onClick={() => handleDeleteReview(review?._id)}
                    aria-label={`Delete review by user ${review?.userId}`}
                  >
                    <FaTrash className="inline mr-2" /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-center mt-4">
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
            <button
              key={page}
              className={`px-4 py-2 mx-1 border rounded ${
                page === currentPage
                  ? "bg-blue-500 text-white"
                  : "bg-white text-blue-500 border-blue-500 hover:bg-blue-100"
              }`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReviewManagement;
