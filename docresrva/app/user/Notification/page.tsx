'use client';

import Navbar from '@/components/utils/Navbar';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

type Notification = {
  _id: string;
  type: string;
  roomId: string;
  doctorId: {
    profilePic: string;
    name: string;
  };
  message: string;
  time: string;
};

const NotificationPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_USER_BACKEND_URL}/Notification`,
          { withCredentials: true }
        );
        if (response.data && Array.isArray(response.data)) {
          setNotifications(response.data);
        } else {
          setError('Invalid notifications format.');
        }
      } catch (err) {
        setError('Failed to fetch notifications.');
        console.error('Error fetching notifications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    const socket = io(`${process.env.NEXT_PUBLIC_SOCKET_URL}`);

    socket.on("Notifications", (data:any) => {
      console.log("Received Notification:", data);

      setNotifications((prevNotifications) => {
        const newNotification = data;

        if (!newNotification) return prevNotifications;

        return prevNotifications.map((notif) =>
          notif.roomId === newNotification.roomId
            ? { ...notif, message: newNotification.message } // Update only message
            : notif
        ).concat(
          prevNotifications.some((notif) => notif.roomId === newNotification.roomId)
            ? [] // Don't add if roomId already exists
            : [newNotification]
        );
      });
    });

    return () => {
      socket.disconnect(); // Cleanup socket connection
    };
  }, []);

  const handleMarkAsRead = (_id: string) => {
    console.log(`Marked notification ${_id} as read`);
  };

  const handleDelete = (_id: string) => {
    console.log(`Deleted notification ${_id}`);
  };

  if (loading) return <div className="text-center mt-6">Loading...</div>;
  if (error) return <div className="text-center mt-6 text-red-500">{error}</div>;

  return (
    <div className="notification-page bg-gray-100 p-6">
      <Navbar />
      <h1 className="text-3xl m-10 font-semibold text-gray-800 text-center mb-6">
        Notifications
      </h1>
      <div className="notification-list space-y-4 max-h-[500px] overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map((notification, index) => (
            <div
              key={notification?._id || `notif-${index}`} // Ensuring unique key
              className="notification-card bg-white p-4 rounded-lg shadow-md"
            >
              <div className="notification-header flex items-center mb-4">
                <img
                  src={notification?.doctorId?.profilePic}
                  alt="User Profile"
                  className="rounded-full w-16 h-16 mr-4"
                />
                <div className="flex flex-col">
                  <span className="notification-doctor-name font-semibold text-blue-500">
                    {notification?.doctorId?.name}
                  </span>
                  <span className="notification-type font-semibold text-blue-500">
                    {notification?.type}
                  </span>
                  <span className="notification-time text-sm text-gray-600">
                    {notification?.time}
                  </span>
                </div>
              </div>
              <p className="notification-message text-gray-800">
                {notification?.message}
              </p>
              <div className="notification-actions flex justify-end gap-4 mt-4">
                <a href={`/user/message?id=${notification?.roomId}`}><button
                  onClick={() => handleMarkAsRead(notification?._id)}
                  className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
                >
                  View
                </button>
                </a>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-600">No notifications available.</div>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;
