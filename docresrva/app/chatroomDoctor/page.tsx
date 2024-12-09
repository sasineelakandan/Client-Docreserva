'use client'

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';


interface Message {
  sender: string;
  content: string;
  timestamp: Date;
}

const ChatRoom = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [activeUser, setActiveUser] = useState<string>(''); // Default empty string for active user
  const [users, setUsers] = useState<any>([]); 
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const searchParams = useSearchParams();
  const doctorId = searchParams.get('doctorId');
  console.log(doctorId);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_DOCTOR_BACKEND_URL}/chatroom`, {
          withCredentials: true, 
        });
        console.log(response.data);
        setUsers(response.data); 
        
        
        if (doctorId) {
          setActiveUser(doctorId);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [doctorId]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeUser) return; 
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_DOCTOR_BACKEND_URL}/chat?roomId=${activeUser}`, {
          withCredentials: true,
        });
        console.log(response.data);
        const fetchedMessages = response.data.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp), // Convert timestamp string to Date
        }));
        setMessages(fetchedMessages);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [activeUser]);

  const sendMessage = async () => {
    if (!message.trim()) return; // Prevent sending empty messages

    try {
      const response = await axios.put(`${process.env.NEXT_PUBLIC_DOCTOR_BACKEND_URL}/chat`, {
        activeUser,
        message,
      }, { withCredentials: true });

      console.log(response.data);
      setMessage(''); // Clear input after sending the message
      // Optionally, update messages state here to append the new message immediately
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  useEffect(() => {
    // Find the selected user from the users list
    if (activeUser) {
      const user = users.find((user: any) => user._id === activeUser);
      setSelectedUser(user);
    }
  }, [activeUser, users]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/4 bg-white shadow-md p-4 overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Chats</h2>
        <ul>
          {users.map((user: any) => (
            <li
              key={user._id}
              className={`flex items-center p-2 mb-2 cursor-pointer rounded-lg hover:bg-gray-200 ${
                activeUser === user._id ? 'bg-gray-300' : ''
              }`}
              onClick={() => setActiveUser(user._id)} // Compare _id here
            >
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white mr-3">
                {user?.patient?.profilePic ? (
                  <img
                    src={user?.patient?.profilePic}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  user?.patient?.name?.charAt(0)
                )}
              </div>
              <div>
  <span className={user?.lastMessage ? "font-bold" : "text-gray-500"}>
    {user?.patient?.username}
  </span>
  {user?.lastMessage && (
    <p className="text-sm text-gray-600 mt-1">
      {user.lastMessage}
    </p>
  )}
</div>
            </li>
          ))}
        </ul>
      </div>

      {/* Chat Window */}
      <div className="w-3/4 flex flex-col p-4">
        {/* User Navbar */}
        {selectedUser ? (
          <div className="flex items-center justify-between p-4 bg-white shadow-md rounded-lg mb-4">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                {selectedUser?.patient?.profilePic ? (
                  <img
                    src={selectedUser?.patient?.profilePic}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  selectedUser?.patient?.username?.charAt(0)
                )}
              </div>
              <div>
                <span className="font-semibold">{selectedUser?.patient?.username}</span>
                {/* Online status */}
                <div className="text-xs text-green-500">Online</div>
              </div>
            </div>
          </div>
        ) : (
          // Display a welcome message if no user is selected
          <div className="flex justify-center items-center h-full text-2xl font-semibold text-gray-500 hover:text-blue-500 transition duration-300 ease-in-out">
            <span>Welcome to the chat! Please select a user to start chatting.</span>
          </div>
        )}

        {/* Messages */}
        {selectedUser && (
          <div className="flex-1 overflow-y-auto mb-4">
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div key={index} className={`message ${msg.sender === 'Patient' ? 'text-right' : 'text-left'}`}>
                  <div
                    className={`inline-block max-w-xs p-2 rounded-lg ${
                      msg.sender === 'Patient' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'
                    }`}
                  >
                    <strong>{msg.content}</strong>
                  </div>
                  <div className="text-xs text-gray-500">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Message Input */}
        {selectedUser && (
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={sendMessage}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200"
            >
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatRoom;
