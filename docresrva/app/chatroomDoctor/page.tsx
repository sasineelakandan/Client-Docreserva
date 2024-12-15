'use client';
import React, { useState, useEffect, useRef } from 'react';
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

const ChatRoom = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [message, setMessage] = useState('');
    const [activeUser, setActiveUser] = useState<string | null>(null);
    const [users, setUsers] = useState<any[]>([]);

    const searchParams = useSearchParams();
    const roomId = searchParams.get('id');

    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!);

        socket.on('receiveMessage', (msg: Message) => {
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

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_DOCTOR_BACKEND_URL}/chatroom`, {
                    withCredentials: true,
                });
              
                setUsers(response.data);
                
                if (roomId) setActiveUser(roomId); // Automatically set active user if roomId exists
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };
        
        fetchUsers();
    }, [roomId]);

    useEffect(() => {
        const fetchMessages = async () => {
            if (!activeUser) return;
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_DOCTOR_BACKEND_URL}/chat?roomId=${activeUser}`,
                    { withCredentials: true }
                );
                setUsers((prevUsers) =>
                    prevUsers.map((user) =>
                        user._id === activeUser ? { ...user, isReadDc: -1 } : user
                    ))
                setMessages(
                    response.data.map((msg: any) => ({
                        ...msg,
                        timestamp: new Date(msg.timestamp),
                    }))
                );
                
                socket.emit('joinRoom', activeUser); // Emit joinRoom event
            } catch (error) {
                console.log(error);
            }
        };
        fetchMessages();
    }, [activeUser]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

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
            console.log(error)
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <div className="w-1/4 bg-white shadow-md p-4 overflow-y-auto">
                <h2 className="text-xl font-semibold mb-4">Chats</h2>
                {users.length > 0 ? (
                    <ul>
                        {users.map((user: any) => (
                            <li
                                key={user._id}
                                className={`flex items-center p-2 mb-2 cursor-pointer rounded-lg hover:bg-gray-200 ${
                                    activeUser === user._id ? 'bg-gray-300' : ''
                                }`}
                                onClick={() => setActiveUser(user._id)}
                            >
                                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white mr-3">
                                    {user?.patient?.profilePic ? (
                                        <img
                                            src={user?.patient?.profilePic}
                                            alt="Profile"
                                            className="w-full h-full object-cover rounded-full"
                                        />
                                    ) : (
                                        user?.patient?.username?.charAt(0)
                                    )}
                                </div>
                                <div className="flex-1">
                                    <span className="font-bold">{user?.patient?.username}</span>
                                    <p className="text-sm text-black-500 truncate flex items-center">
    <span>{user?.lastMessage || 'No messages yet'}</span>
   
</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No users available.</p>
                )}
            </div>

            <div className="w-3/4 flex flex-col p-4">
                {activeUser ? (
                    <>
                        <div className="flex-1 overflow-y-auto mb-4">
                            {messages.length > 0 ? (
                                messages.map((msg, index) => (
                                    <div key={index} className={`message ${msg.sender === 'Doctor' ? 'text-right' : 'text-left'}`}>
                                        <div
                                            className={`inline-block max-w-xs p-2 rounded-lg ${
                                                msg.sender === 'Doctor' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'
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
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="flex items-center space-x-3">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type your message..."
                                className="w-full p-2 border border-gray-300 rounded-lg"
                            />
                            <button onClick={sendMessage} className="px-4 py-2 bg-blue-500 text-white rounded-lg">
                                Send
                            </button>
                        </div>
                    </>
                ) : (
                    <p>Select a user to start chatting.</p>
                )}
            </div>
        </div>
    );
};

export default ChatRoom;
