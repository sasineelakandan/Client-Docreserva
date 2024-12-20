import React, { useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa"; // Import FaTrash for the delete icon
import Swal from "sweetalert2";
import axios from "axios";

type Review = {
  _id: string;
  doctorId: string;
  userId: string;
  comment: string;
  rating: number;
};

const ReviewManagement: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL}/reviews`, { withCredentials: true });
        setReviews(response.data);
      } catch (error) {
        Swal.fire("Error!", "Could not fetch reviews.", "error");
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
          await axios.delete(`${process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL}/reviews?reviewId=${_id}`, {
            withCredentials: true,
          });
          Swal.fire("Deleted!", "Review deleted successfully.", "success");
        
          setReviews((prev) => prev.filter((review) => review._id !== _id));
        } catch (err) {
          console.error("Failed to delete review:", err);
          Swal.fire("Error!", "Could not delete review.", "error");
        }
      }
    });
  };

  return (
    <div className="w-full p-6">
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
          {reviews.map((review) => (
            <tr key={review._id}>
              <td className="border px-4 py-2">{review.doctorId}</td>
              <td className="border px-4 py-2">{review.userId}</td>
              <td className="border px-4 py-2">{review.comment}</td>
              <td className="border px-4 py-2">{review.rating}</td>
              <td className="border px-4 py-2 flex justify-center">
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded"
                  onClick={() => handleDeleteReview(review._id)}
                >
                  <FaTrash className="inline mr-2" /> Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReviewManagement;
