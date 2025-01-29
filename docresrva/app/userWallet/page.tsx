'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/utils/Navbar';
import { toast } from 'react-toastify';
import axios from 'axios';
import Image from 'next/image';

interface Transaction {
  id: number;
  date: string;
  type: string;
  doctor: {
    profilePic: string;
    name: string;
  };
  amount: number;
  status: string;
}

interface PatientProfile {
  profilePic: string;
  username: string;
  eWallet: number;
}

export default function PatientEwalletPage() {
  const [user, setUser] = useState<PatientProfile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [filter, setFilter] = useState<string>('All');

  const transactionsPerPage = 5;
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;

  const filteredTransactions = transactions.filter((transaction) => {
    if (filter === 'Consultations') {
      return transaction.type === 'Consultation Fee';
    } else if (filter === 'Refunds') {
      return transaction.type === 'Refund';
    }
    return true;
  });

  const currentTransactions = filteredTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);
  const totalAmount = filteredTransactions.reduce((total, transaction) => total + transaction.amount, 0);

  const formatCurrency = (amount: number): string => {
    return amount > 0 ? `+ ₹${amount.toFixed(2)}` : `- ₹${Math.abs(amount).toFixed(2)}`;
  };

  useEffect(() => {
    const fetchPatientProfile = async () => {
      try {
        const response = await axios.get<PatientProfile>(`${process.env.NEXT_PUBLIC_USER_BACKEND_URL}/profile`, {
          withCredentials: true,
        });
        if (response?.data) {
          setUser(response.data);
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to fetch patient profile.');
      }
    };

    const fetchTransactions = async () => {
      try {
        const response = await axios.get<Transaction[]>(`${process.env.NEXT_PUBLIC_USER_BACKEND_URL}/transactions`, {
          withCredentials: true,
        });
        if (response.data) {
          setTransactions(response.data);
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to fetch transactions.');
      }
    };

    fetchPatientProfile();
    fetchTransactions();
  }, []);

  const formatDate = (dateString: any) => {
    const options: any = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="min-h-screen bg-white text-black p-8">
      <Navbar />

      <div className="flex items-center mb-8 space-x-6 mt-8">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-700">
          {user?.profilePic ? (
            <Image
              src={user.profilePic}
              alt={`${user.username}'s Profile Picture`}
              width={128}
              height={128}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-700">
              No Image
            </div>
          )}
        </div>
        <div>
          <h1 className="text-4xl font-bold">{user?.username || 'Patient Name'}</h1>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-3xl font-semibold">eWallet Balance</h2>
        <p className="text-2xl font-semibold mt-2">₹{user?.eWallet || '0.00'}</p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="space-x-2">
          <button
            className={`px-6 py-3 ${filter === 'All' ? 'bg-blue-600' : 'bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700'} text-white rounded-lg shadow-md transform transition duration-300 hover:scale-105 focus:outline-none`}
            onClick={() => setFilter('All')}
          >
            All
          </button>
          <button
            className={`px-6 py-3 ${filter === 'Consultations' ? 'bg-green-600' : 'bg-gradient-to-r from-green-500 via-green-600 to-green-700'} text-white rounded-lg shadow-md transform transition duration-300 hover:scale-105 focus:outline-none`}
            onClick={() => setFilter('Consultations')}
          >
            Consultations
          </button>
          <button
            className={`px-6 py-3 ${filter === 'Refunds' ? 'bg-red-600' : 'bg-gradient-to-r from-red-500 via-red-600 to-red-700'} text-white rounded-lg shadow-md transform transition duration-300 hover:scale-105 focus:outline-none`}
            onClick={() => setFilter('Refunds')}
          >
            Refunds
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-2xl font-semibold">Total Amount: {formatCurrency(totalAmount)}</h3>
      </div>

      <div className="bg-white rounded-lg p-4 shadow-lg">
        <h2 className="text-2xl mb-4">Transaction History</h2>
        {currentTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex justify-between items-center p-3 mb-2 bg-gray-100 rounded hover:bg-gray-200 transition duration-300 ease-in-out"
          >
            <div className="flex items-center gap-4">
              <Image
                src={transaction?.doctor?.profilePic}
                alt={`${transaction?.doctor?.name}'s profile`}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold">{transaction?.doctor?.name}</p>
                <p className="text-sm text-black">{formatDate(transaction.date)}</p>
                <p className="text-sm text-black">{transaction.type}</p>
              </div>
            </div>
            <div>
              <p className={`font-bold text-lg ${transaction.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatCurrency(transaction.amount)}
              </p>
              <p className="text-sm text-black">{transaction.status}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center space-x-4 mt-6">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <p className="self-center text-lg">
          {currentPage} / {totalPages}
        </p>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}
