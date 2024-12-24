'use client';

import React, { Suspense, useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import io from 'socket.io-client';
import axios from 'axios';

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
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_DOCTOR_BACKEND_URL}/chatroom`,
                    { withCredentials: true }
                );
                setUsers(response.data);
            } catch (error) {
                console.error('Error fetching users:', error);
            } finally {
                setLoadingUsers(false);
            }
        };
        fetchUsers();
    }, []);

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
                const response = await axios.get(
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

            await axios.put(
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
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-1/4 bg-white shadow-md p-4 overflow-y-auto">
                <h2 className="text-xl font-semibold mb-4">Patients</h2>
                {loadingUsers ? (
                    <p>Loading patients...</p>
                ) : users.length > 0 ? (
                    <ul>
                        {users.map((user: any) => {
                            const isUserOnline = Object.keys(onlineUsers).includes(user?.patient?._id);
                            return (
                                <li
                                    key={user._id}
                                    className={`flex items-center p-2 mb-2 cursor-pointer rounded-lg hover:bg-gray-200 ${
                                        activeUser === user._id ? 'bg-gray-300' : ''
                                    }`}
                                    onClick={() => handleUserSelect(user)}
                                >
                                    <div className="relative w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white mr-3">
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
                                            user?.patient?.username?.charAt(0)
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <span className="font-bold">{user?.patient?.username}</span>
                                        <p className="text-sm text-gray-500 truncate">
                                            {user?.lastMessage || 'No messages yet'}
                                        </p>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p>No patients available.</p>
                )}
            </div>

            {/* Chat Window */}
            <div className="w-3/4 flex flex-col p-4">
                {selectedUserProfile && (
                    <div className="flex items-center mb-4">
                        <div className="relative">
                            <img
                                src={selectedUserProfile?.patient?.profilePic || 'default-profile-pic.jpg'}
                                alt="Profile"
                                className="w-12 h-12 rounded-full border-2 border-white"
                            />
                            <span
                                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${
                                    isOnline ? 'bg-green-500' : 'bg-gray-500'
                                }`}
                                title={isOnline ? 'Online' : 'Offline'}
                            ></span>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-lg font-semibold text-gray-800">
                                {selectedUserProfile?.patient?.username || 'Unknown Patient'}
                            </h3>
                            <p className="text-sm text-gray-500">{isOnline ? 'Online' : 'Offline'}</p>
                        </div>
                    </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto mb-4">
                    {loadingMessages ? (
                        <p>Loading messages...</p>
                    ) : messages.length > 0 ? (
                        messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`message ${msg.sender === 'Doctor' ? 'text-right' : 'text-left'}`}
                            >
                                <div
                                    className={`inline-block max-w-xs p-2 rounded-lg ${
                                        msg.sender === 'Doctor'
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-300 text-black'
                                    }`}
                                >
                                    {msg.content}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {msg.timestamp.toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: true,
                                    })}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No messages yet.</p>
                    )}
                    <div ref={messageEndRef} />
                </div>

                {/* Message Input */}
                <div className="flex items-center mt-4">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="flex-1 p-2 border border-gray-300 rounded-lg"
                        placeholder="Type a message..."
                    />
                    <button
                        onClick={sendMessage}
                        className="ml-2 p-2 bg-blue-500 text-white rounded-lg"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

const ChatRoomWithSuspense = () => (
    <Suspense fallback={<div>Loading...</div>}>
        <DoctorChatRoom />
    </Suspense>
);

export default ChatRoomWithSuspense;
