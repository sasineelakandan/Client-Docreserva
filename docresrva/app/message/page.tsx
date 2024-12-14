'use client'
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import io, { Socket } from 'socket.io-client';
import axios from 'axios';

interface Message {
    sender: string;
    receiver: string;
    content: string;
    timestamp: Date;
    
}

// Socket initialization
let socket: ReturnType<typeof io>;

const ChatRoom = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [message, setMessage] = useState('');
    const [activeUser, setActiveUser] = useState<string | null>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const[noti,setNoti]=useState(0)
    const searchParams = useSearchParams();
    const roomId = searchParams.get('id');
    const messageEndRef = useRef<HTMLDivElement | null>(null); // Ref for scrolling

    useEffect(() => {
        if (roomId) {
            setActiveUser(roomId); // Set the active user based on roomId from search params
        }
    }, [roomId]);

    useEffect(() => {
        socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!);

        socket.on("receiveMessage", (msg: Message) => {
            const messageWithTimestamp = {
                ...msg,
                timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
            };

            setMessages((prevMessages) => {
                if (!prevMessages.some((m) => m.timestamp.getTime() === messageWithTimestamp.timestamp.getTime() && m.sender === messageWithTimestamp.sender)) {
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
                setUsers((prevUsers) =>
                    prevUsers.map((user) =>
                        user._id === activeUser ? { ...user, isReadUc: 0 } : user
                    )
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

    const sendMessage = async () => {
        if (!message.trim() || !activeUser) return;

        const newMessage: Message = {
            sender: 'patient',
            receiver: 'Doctor',
            content: message,
            timestamp: new Date(),
        };

        try {
          // Emit the message to the server
          socket.emit('sendMessage', { roomId: activeUser, message: newMessage });
          setMessage('');
          
          await axios.put(
              `${process.env.NEXT_PUBLIC_USER_BACKEND_URL}/chat`,
              { roomId: activeUser, message: newMessage },
              { withCredentials: true }
          );
      } catch (error) {
        console.log(error)
      }
    };

    // Scroll to the bottom when messages change
    useEffect(() => {
        if (messageEndRef.current) {
            messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-1/4 bg-white shadow-md p-4 overflow-y-auto">
                <h2 className="text-xl font-semibold mb-4">Chats</h2>
                {loadingUsers ? (
                    <p>Loading users...</p>
                ) : users.length > 0 ? (
                    <ul>
                        {users.map((user: any) => (
                            <li
                                key={user._id}
                                className={`flex items-center p-2 mb-2 cursor-pointer rounded-lg hover:bg-gray-200 ${
                                    activeUser === user._id ? 'bg-gray-300' : ''
                                }`}
                                
                                onClick={() => setActiveUser(user._id,)}
                            >
                                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white mr-3">
                                    {user?.doctor?.profilePic ? (
                                        <img
                                            src={user?.doctor?.profilePic}
                                            alt="Profile"
                                            className="w-full h-full object-cover rounded-full"
                                        />
                                    ) : (
                                        user?.doctor?.name?.charAt(0)
                                    )}
                                </div>
                                <div className="flex-1">
    <span  className="font-bold">{user?.doctor?.name} </span>
    <p className="text-sm text-gray-500 truncate flex items-center">
    <span>{user?.lastMessage || 'No messages yet'}</span>
    {user?.isReadUc > 0 && (
        
        <span className="relative inline-block ml-4">
            {/* Notification Badge */}
            <span className="flex items-center justify-center text-xs text-white bg-green-700 rounded-full w-5 h-5">
                {user?.isReadUc}
            </span>
        </span>
    )}
</p>


    
</div>

                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No users available.</p>
                )}
            </div>

            {/* Chat Window */}
            <div className="w-3/4 flex flex-col p-4">
                <div className="flex-1 overflow-y-auto mb-4">
                    {loadingMessages ? (
                        <p>Loading messages...</p>
                    ) : messages.length > 0 ? (
                        messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.sender === 'patient' ? 'text-right' : 'text-left'}`}>
                                <div
                                    className={`inline-block max-w-xs p-2 rounded-lg ${
                                        msg.sender === 'patient' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'
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
                    {/* Scroll to the bottom */}
                    <div ref={messageEndRef} />
                </div>
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
