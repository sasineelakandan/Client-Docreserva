'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/utils/Navbar';

interface Transaction {
  id: number;
  date: string;
  type: string;
  amount: number;
  status: string;
}

export default function DoctorEwalletPage() {
  const transactions: Transaction[] = [
    { id: 1, date: '2025-01-05', type: 'Consultation Fee', amount: 5000, status: 'Completed' },
    { id: 2, date: '2025-01-04', type: 'Refund', amount: -2000, status: 'Pending' },
    { id: 3, date: '2025-01-03', type: 'Surgery Fee', amount: 12000, status: 'Completed' },
    { id: 4, date: '2025-01-02', type: 'Consultation Fee', amount: 4000, status: 'Completed' },
    { id: 5, date: '2025-01-01', type: 'Refund', amount: -1500, status: 'Completed' },
    { id: 6, date: '2024-12-31', type: 'Consultation Fee', amount: 6000, status: 'Pending' },
    { id: 7, date: '2024-12-30', type: 'Surgery Fee', amount: 15000, status: 'Completed' },
    { id: 8, date: '2024-12-29', type: 'Refund', amount: -5000, status: 'Pending' },
    { id: 9, date: '2024-12-28', type: 'Consultation Fee', amount: 3500, status: 'Completed' },
    { id: 10, date: '2024-12-27', type: 'Surgery Fee', amount: 10000, status: 'Completed' },
  ];

  const formatCurrency = (amount: number): string => {
    return amount > 0 ? `+ ₹${amount.toFixed(2)}` : `- ₹${Math.abs(amount).toFixed(2)}`;
  };

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 5;

  // Filter state
  const [filter, setFilter] = useState<string>('All'); // All, Consultations, Refunds

  // Get current transactions based on page
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;

  // Filter transactions based on selected filter
  const filteredTransactions = transactions.filter((transaction) => {
    if (filter === 'Consultations') {
      return transaction.type === 'Consultation Fee';
    } else if (filter === 'Refunds') {
      return transaction.type === 'Refund';
    }
    return true; // All transactions
  });

  const currentTransactions = filteredTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);

  // Calculate total amount for filtered transactions
  const totalAmount = filteredTransactions.reduce((total, transaction) => total + transaction.amount, 0);

  return (
    <div className="min-h-screen bg-white text-black p-8">
      {/* Navbar */}
      <Navbar />

      {/* Doctor Profile Section */}
      <div className="flex items-center mb-8 space-x-6 mt-8">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-700">
          <img
            src="/doctor-profile.jpg"
            alt="Doctor Profile Picture"
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h1 className="text-4xl font-bold">Dr. John Doe</h1>
          <p className="text-lg text-gray-400">Cardiologist</p>
        </div>
      </div>

      {/* eWallet Overview */}
      <div className="mb-8">
        <h2 className="text-3xl font-semibold">eWallet Balance</h2>
        <p className="text-2xl font-semibold mt-2">₹15,230.45
          <span className="text-sm text-gray-400 ml-2">(Equivalent in BTC: 0.30 BTC)</span>
        </p>
      </div>

      {/* Filters and Search */}
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
        <input
          type="text"
          placeholder="Search transactions..."
          className="px-4 py-2 rounded bg-gray-100 text-black w-64 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Total Amount */}
      <div className="mb-6">
        <h3 className="text-2xl font-semibold">Total Amount: {formatCurrency(totalAmount)}</h3>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-lg p-4 shadow-lg">
        <h2 className="text-2xl mb-4">Transaction History</h2>
        {currentTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex justify-between items-center p-3 mb-2 bg-gray-100 rounded hover:bg-gray-200 transition duration-300 ease-in-out"
          >
            <div>
              <p className="font-semibold">{transaction.date}</p>
              <p className="text-sm text-gray-400">{transaction.type}</p>
            </div>
            <div>
              <p
                className={`font-bold text-lg ${
                  transaction.amount > 0 ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {formatCurrency(transaction.amount)}
              </p>
              <p className="text-sm text-gray-400">{transaction.status}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center space-x-4 mt-6">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <p className="self-center text-lg">{currentPage} / {totalPages}</p>
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}
