'use client'

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import io from 'socket.io-client';
import axios from 'axios';

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

    useEffect(() => {
        // Initialize the socket connection
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
                const response = await axios.get(`${process.env.NEXT_PUBLIC_USER_BACKEND_URL}/chatroom`, {
                    withCredentials: true,
                });
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
        const fetchMessages = async () => {
            if (!activeUser) return;
            setLoadingMessages(true);
            try {
                const response = await axios.get(
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

        socket.on('receiveMessage', (msg:any) => {
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
    }, []);

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

            await axios.put(
                `${process.env.NEXT_PUBLIC_DOCTOR_BACKEND_URL}/chat`,
                { roomId: activeUser, message: newMessage },
                { withCredentials: true }
            );
        } catch (error) {
            console.log(error)
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
    const key=Object.keys(onlineUsers)
    const isOnline=key.includes(selectedUserProfile?.doctor?._id)

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-1/4 bg-white shadow-md p-4 overflow-y-auto">
                <h2 className="text-xl font-semibold mb-4">Chats</h2>
                {loadingUsers ? (
                    <p>Loading users...</p>
                ) : users.length > 0 ? (
                    <ul>
                    {users.map((user: any) => {
                        const keys = Object.keys(onlineUsers);
                        const isUserOnline = keys.includes(user?.doctor?._id);
                        return (
                            <li
                                key={user._id}
                                className={`flex items-center p-2 mb-2 cursor-pointer rounded-lg hover:bg-gray-200 ${activeUser === user._id ? 'bg-gray-300' : ''}`}
                                onClick={() => handleUserSelect(user)}
                            >
                                <div className="relative w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white mr-3">
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
                                        user?.doctor?.name?.charAt(0)
                                    )}
                                </div>
                
                                <div className="flex-1">
                                    <span className="font-bold">{user?.doctor?.name}</span>
                                    <p className="text-sm text-black-500 truncate">
                                        {user?.lastMessage || 'No messages yet'}
                                    </p>
                                </div>
                            </li>
                        );
                    })}
                </ul>
                
                ) : (
                    <p>No users available.</p>
                )}
            </div>

            {/* Chat Window */}
            <div className="w-3/4 flex flex-col p-4">
                {selectedUserProfile && (
                    <div className="flex items-center mb-4">
                        <div className="relative">
                            <img
                                src={selectedUserProfile?.doctor?.profilePic || 'default-profile-pic.jpg'}
                                alt="Profile"
                                className="w-12 h-12 rounded-full border-2 border-white"
                            />
                            <span
                                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-500'}`}
                                title={isOnline ? 'Online' : 'Offline'}
                            ></span>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-lg font-semibold text-gray-800">
                                {selectedUserProfile?.doctor?.name || 'Unknown User'}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {isOnline ? 'Online' : 'Offline'}
                            </p>
                        </div>
                    </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto mb-4">
                    {loadingMessages ? (
                        <p>Loading messages...</p>
                    ) : messages.length > 0 ? (
                        messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.sender === 'patient' ? 'text-right' : 'text-left'}`}>
                                <div
                                    className={`inline-block max-w-xs p-2 rounded-lg ${msg.sender === 'patient' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'}`}
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
                <div className="flex items-center space-x-3">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                    <button
                        onClick={sendMessage}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatRoom;
