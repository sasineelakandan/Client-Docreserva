'use client'

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import io from 'socket.io-client';
import axios from 'axios';
import { FaPaperPlane, FaVideo, FaUserCircle } from 'react-icons/fa';
import axiosInstance from '@/components/utils/axiosInstence';

let socket: ReturnType<typeof io>;

const ChatRoom = () => {
    const [messages, setMessages] = useState<any[]>([]);
    const [message, setMessage] = useState('');
    const [activeUser, setActiveUser] = useState<string | null>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [selectedUserProfile, setSelectedUserProfile] = useState<any>(null);
    const searchParams = useSearchParams();
    const roomId = searchParams.get('id');
    const userId = searchParams.get('userId');
    const messageEndRef = useRef<HTMLDivElement | null>(null);
    const [onlineUsers, setOnlineUsers] = useState<Record<string, boolean>>({});
    const [videoLink, setVideoLink] = useState<string | null>(null);

    useEffect(() => {
        socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!);

        if (userId) {
            socket.emit("userOnline", userId);
        }

        socket.on("updateUserStatus", (users: any) => {
            setOnlineUsers(users);
        });

        return () => {
            socket.disconnect();
        };
    }, [userId]);

    useEffect(() => {
        if (roomId) {
            setActiveUser(roomId);
        }
    }, [roomId]);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoadingUsers(true);
            try {
                const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_USER_BACKEND_URL}/chatroom`, {
                    withCredentials: true,
                });
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
        const fetchMessages = async () => {
            if (!activeUser) return;
            setLoadingMessages(true);
            try {
                const response = await axiosInstance.get(
                    `${process.env.NEXT_PUBLIC_USER_BACKEND_URL}/chat?roomId=${activeUser}`,
                    { withCredentials: true }
                );
                setMessages(
                    response.data.map((msg: any) => ({
                        ...msg,
                        timestamp: new Date(msg.timestamp),
                    }))
                );
                socket.emit('joinRoom', activeUser);
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

    useEffect(() => {
        socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!);

        socket.on('receiveMessage', (msg: any) => {
            const messageWithTimestamp = {
                ...msg,
                timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
            };
            socket.on('linkNotification', (data: any) => {
                console.log("Incoming video call link:", data);
                setVideoLink(data.link);
            });
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
    }, []);
    console.log(onlineUsers)
    const sendMessage = async () => {
        if (!message.trim() || !activeUser) return;

        const newMessage: any = {
            sender: 'patient',
            receiver: 'Doctor',
            content: message,
            timestamp: new Date(),
        };

        try {
            socket.emit('sendMessage', { roomId: activeUser, message: newMessage });

            setMessage('');

            await axiosInstance.put(
                `${process.env.NEXT_PUBLIC_USER_BACKEND_URL}/chat`,
                { roomId: activeUser, message: newMessage },
                { withCredentials: true }
            );
        } catch (error) {
            console.log(error);
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

    const key = Object.keys(onlineUsers);
    const isOnline = key.includes(selectedUserProfile?.doctor?._id);

    const handleJoinRoom = () => {
        if (videoLink) {
            console.log("Joining video room:", videoLink);
            window.open(videoLink, "_blank");
            setVideoLink(null); // Clear the video link after joining
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            {/* Sidebar */}
            <div className="w-1/4 bg-white shadow-lg p-6 overflow-y-auto">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Chats</h2>
                {loadingUsers ? (
                    <p className="text-gray-500">Loading users...</p>
                ) : users.length > 0 ? (
                    <ul>
                        {users.map((user: any) => {
                            const keys = Object.keys(onlineUsers);
                            const isUserOnline = keys.includes(user?.doctor?._id);
                            return (
                                <li
                                    key={user._id}
                                    className={`flex items-center p-3 mb-3 cursor-pointer rounded-lg transition-all duration-200 ${activeUser === user._id ? 'bg-blue-50' : 'hover:bg-gray-100'}`}
                                    onClick={() => handleUserSelect(user)}
                                >
                                    <div className="relative w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-white mr-3">
                                        {user?.doctor?.profilePic ? (
                                            <>
                                                <img
                                                    src={user?.doctor?.profilePic}
                                                    alt="Profile"
                                                    className="w-full h-full object-cover rounded-full"
                                                />
                                                <span
                                                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${isUserOnline ? 'bg-green-500' : 'bg-gray-400'}`}
                                                ></span>
                                            </>
                                        ) : (
                                            <FaUserCircle className="w-8 h-8 text-gray-400" />
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <span className="font-semibold text-gray-800">{user?.doctor?.name}</span>
                                        <p className="text-sm text-gray-500 truncate">
                                            {user?.lastMessage || 'No messages yet'}
                                        </p>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p className="text-gray-500">No users available.</p>
                )}
            </div>

            {/* Chat Window */}
            <div className="w-3/4 flex flex-col p-6  bg-white shadow-lg">
                {selectedUserProfile && (
                    <div className="flex items-center mb-6  bg-white " >
                        <div className="relative">
                            <img
                                src={selectedUserProfile?.doctor?.profilePic || 'default-profile-pic.jpg'}
                                alt="Profile"
                                className="w-12 h-12 rounded-full border-2 border-gray shadow-sm"
                            />
                            <span
                                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-500'}`}
                                title={isOnline ? 'Online' : 'Offline'}
                            ></span>
                            {videoLink && (
                                <div className="fixed top-5 right-5 bg-green-500 text-white p-4 rounded-lg cursor-pointer z-50 shadow-lg">
                                    <p className="font-bold">Incoming Video Call</p>
                                    <p>Click here to join the call</p>
                                    <button className='p-2 mt-4 bg-green-600 mr-7 rounded-lg hover:bg-green-700 transition-all duration-200' onClick={handleJoinRoom}>Answer</button>
                                    <button className='p-2 mt-4 bg-red-600 rounded-lg hover:bg-red-700 transition-all duration-200' onClick={() => setVideoLink(null)}>Reject</button>
                                </div>
                            )}
                        </div>
                        <div className="ml-3">
                            <h3 className="text-xl font-semibold text-gray-800">
                                {selectedUserProfile?.doctor?.name || 'Unknown User'}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {isOnline ? 'Online' : 'Offline'}
                            </p>
                        </div>
                    </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto mb-6">
                    {loadingMessages ? (
                        <p className="white">Loading messages...</p>
                    ) : messages.length > 0 ? (
                        messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex ${
                                    msg.sender === 'patient' ? 'justify-end' : 'justify-start'
                                } mb-4`}
                            >
                                <div
                                    className={`max-w-xs p-3 rounded-lg shadow-sm ${
                                        msg.sender === 'patient'
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
                    <div className="flex items-center space-x-3 bg-white p-4 rounded-lg shadow-sm">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-all duration-200"
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        />
                        <button
                            onClick={sendMessage}
                            className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-all duration-200"
                        >
                            <FaPaperPlane className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default function ChatRoomWithSuspense() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen text-gray-500">Loading chat room...</div>}>
            <ChatRoom />
        </Suspense>
    );
}