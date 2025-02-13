'use client';

import React, { Suspense, useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import io from 'socket.io-client';
import axios from 'axios';
import { FaPaperPlane, FaUserCircle, FaVideo } from 'react-icons/fa';
import axiosInstance from '@/components/utils/axiosInstence';

interface Message {
    sender: string;
    receiver: string;
    content: string;
    timestamp: Date;
}

let socket: ReturnType<typeof io>;

const DoctorChatRoom = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [message, setMessage] = useState('');
    const [activeUser, setActiveUser] = useState<string | null>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [selectedUserProfile, setSelectedUserProfile] = useState<any>(null);
    const [onlineUsers, setOnlineUsers] = useState<Record<string, boolean>>({});

    const searchParams = useSearchParams();
    const roomId = searchParams.get('id');
    const userId = searchParams.get('userId'); // Unique doctor ID
    const messageEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Initialize the socket connection only on the client side
            socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!);

            if (userId) {
                socket.emit('userOnline', userId); // Mark doctor as online
            }

            socket.on('updateUserStatus', (users: any) => {
                setOnlineUsers(users);
            });

            return () => {
                socket.disconnect();
            };
        }
    }, [userId]);

    useEffect(() => {
        if (roomId) {
            setActiveUser(roomId);
        }
    }, [roomId]);

    // Fetching chat room users for the doctor
    useEffect(() => {
        const fetchUsers = async () => {
            setLoadingUsers(true);
            try {
                const response = await axiosInstance.get(
                    `${process.env.NEXT_PUBLIC_DOCTOR_BACKEND_URL}/chatroom`,
                    { withCredentials: true }
                );
                setUsers(response.data);
                if (roomId) {
                    const selectedUser = response.data.find((user: any) => user._id === roomId);
                    if (selectedUser) {
                        setSelectedUserProfile(selectedUser);
                    }
                }
            } catch (error) {
                console.error('Error fetching users:', error);
            } finally {
                setLoadingUsers(false);
            }
        };
        fetchUsers();
    }, [roomId]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!);

            socket.on('receiveMessage', (msg: any) => {
                const messageWithTimestamp = {
                    ...msg,
                    timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
                };
                setMessages((prevMessages) => {
                    if (
                        !prevMessages.some(
                            (m) =>
                                m.timestamp.getTime() === messageWithTimestamp.timestamp.getTime() &&
                                m.sender === messageWithTimestamp.sender
                        )
                    ) {
                        return [...prevMessages, messageWithTimestamp];
                    }
                    return prevMessages;
                });
            });

            return () => {
                socket.disconnect();
            };
        }
    }, []);

    // Fetch messages for the active chatroom
    useEffect(() => {
        const fetchMessages = async () => {
            if (!activeUser) return;
            setLoadingMessages(true);
            try {
                const response = await axiosInstance.get(
                    `${process.env.NEXT_PUBLIC_DOCTOR_BACKEND_URL}/chat?roomId=${activeUser}`,
                    { withCredentials: true }
                );

                setMessages(
                    response.data.map((msg: any) => ({
                        ...msg,
                        timestamp: new Date(msg.timestamp),
                    }))
                );
                socket.emit('joinRoom', activeUser); // Join the room
            } catch (error) {
                console.error('Error fetching messages:', error);
            } finally {
                setLoadingMessages(false);
            }
        };
        fetchMessages();

        return () => {
            if (activeUser) {
                socket.emit('leaveRoom', activeUser);
            }
        };
    }, [activeUser]);

    const sendMessage = async () => {
        if (!message.trim() || !activeUser) return;

        const newMessage: Message = {
            sender: 'Doctor',
            receiver: 'patient',
            content: message,
            timestamp: new Date(),
        };

        try {
            socket.emit('sendMessage', { roomId: activeUser, message: newMessage });
            setMessage('');

            await axiosInstance.put(
                `${process.env.NEXT_PUBLIC_DOCTOR_BACKEND_URL}/chat`,
                { roomId: activeUser, message: newMessage },
                { withCredentials: true }
            );
        } catch (error) {
            console.log('Error sending message:', error);
        }
    };

    useEffect(() => {
        if (messageEndRef.current) {
            messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleUserSelect = (user: any) => {
        setActiveUser(user._id);
        setSelectedUserProfile(user);
    };

    const isOnline = Object.keys(onlineUsers).includes(selectedUserProfile?.patient?._id);

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            {/* Sidebar */}
            <div className="w-1/4 bg-white shadow-lg p-6 overflow-y-auto">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Patients</h2>
                {loadingUsers ? (
                    <p className="text-gray-500">Loading patients...</p>
                ) : users.length > 0 ? (
                    <ul>
                        {users.map((user: any) => {
                            const isUserOnline = Object.keys(onlineUsers).includes(user?.patient?._id);
                            return (
                                <li
                                    key={user._id}
                                    className={`flex items-center p-3 mb-3 cursor-pointer rounded-lg transition-all duration-200 ${
                                        activeUser === user._id ? 'bg-blue-50' : 'hover:bg-gray-100'
                                    }`}
                                    onClick={() => handleUserSelect(user)}
                                >
                                    <div className="relative w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-white mr-4">
                                        {user?.patient?.profilePic ? (
                                            <>
                                                <img
                                                    src={user?.patient?.profilePic}
                                                    alt="Profile"
                                                    className="w-full h-full object-cover rounded-full"
                                                />
                                                <span
                                                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${
                                                        isUserOnline ? 'bg-green-500' : 'bg-gray-400'
                                                    }`}
                                                ></span>
                                            </>
                                        ) : (
                                            <FaUserCircle className="w-8 h-8 text-gray-400" />
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <span className="font-semibold text-gray-800">
                                            {user?.patient?.username}
                                        </span>
                                        <p className="text-sm text-gray-500 truncate">
                                            {user?.lastMessage || 'No messages yet'}
                                        </p>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p className="text-gray-500">No patients available.</p>
                )}
            </div>

            {/* Chat Window */}
            <div className="w-3/4 flex flex-col p-6 bg-white shadow-lg">
                {selectedUserProfile && (
                    <div className="flex items-center mb-6">
                        <div className="relative">
                            <img
                                src={selectedUserProfile?.patient?.profilePic || 'default-profile-pic.jpg'}
                                alt="Profile"
                                className="w-14 h-14 rounded-full border-2 border-white shadow-md"
                            />
                            <span
                                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${
                                    isOnline ? 'bg-green-500' : 'bg-gray-500'
                                }`}
                                title={isOnline ? 'Online' : 'Offline'}
                            ></span>
                        </div>
                        <div className="ml-4">
                            <h3 className="text-xl font-bold text-gray-800">
                                {selectedUserProfile?.patient?.username || 'Unknown Patient'}
                            </h3>
                            <p className="text-sm text-gray-500">{isOnline ? 'Online' : 'Offline'}</p>
                        </div>
                        <div className="ml-auto">
                            <a href={`/doctor/videoCall?id=${activeUser}`}>
                                <button className="flex items-center gap-2 p-3 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition-all duration-200">
                                    <FaVideo className="w-5 h-5" />
                                    Video Call
                                </button>
                            </a>
                        </div>
                    </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto mb-6">
                    {loadingMessages ? (
                        <p className="text-gray-500">Loading messages...</p>
                    ) : messages.length > 0 ? (
                        messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex ${
                                    msg.sender === 'Doctor' ? 'justify-end' : 'justify-start'
                                } mb-4`}
                            >
                                <div
                                    className={`max-w-xs p-3 rounded-lg shadow-sm ${
                                        msg.sender === 'Doctor'
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-100 text-gray-800'
                                    }`}
                                >
                                    <p className="text-sm">{msg.content}</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {msg.timestamp.toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: true,
                                        })}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500">No messages yet.</p>
                    )}
                    <div ref={messageEndRef} />
                </div>

                {/* Message Input and Send Button (Conditional Rendering) */}
                {activeUser && (
                    <div className="flex items-center mt-6">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="flex-1 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Type a message..."
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        />
                        <button
                            onClick={sendMessage}
                            className="ml-3 p-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-all duration-200"
                        >
                            <FaPaperPlane className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const ChatRoomWithSuspense = () => (
    <Suspense fallback={<div className="flex justify-center items-center h-screen text-gray-500">Loading...</div>}>
        <DoctorChatRoom />
    </Suspense>
);

export default ChatRoomWithSuspense;