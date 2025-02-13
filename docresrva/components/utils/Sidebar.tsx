'use client'

import React from "react";
import { FaHome, FaCalendarAlt, FaUserMd, FaUsers, FaCog, FaSignOutAlt } from "react-icons/fa";
import { deleteCookie } from './deleteCookie';
import Cookies from 'js-cookie';
import axiosInstance from "./axiosInstence";
// Define a type for the navigation link
type NavLink = {
  label: string;
  icon: React.ReactNode;
  href: string;
};

const navLinks: NavLink[] = [
  { label: "Dashboard", icon: <FaHome />, href: "/admin/adminHome" },
  { label: "Appointments", icon: <FaCalendarAlt />, href: "/admin/appointmetManagement" },
  { label: "Doctors", icon: <FaUserMd />, href: "/admin/doctors" },
  { label: "VerifiedDoctors", icon: <FaUserMd />, href: "/admin/verifiedDoctors" },
  { label: "Patients", icon: <FaUsers />, href: "/admin/patients" },
  { label: "Reviews", icon: <FaCog />, href: "/admin/reviews" },
];

const handleLogout = async (event: React.MouseEvent<HTMLAnchorElement>) => {
  event.preventDefault();

  try {
      await axiosInstance.post(`${process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL}/logout`,{},{withCredentials:true});// Call backend logout route
      localStorage.removeItem('user'); // Clear user data from localStorage
      window.location.href = '/admin/adminLogin'; // Redirect after logout
  } catch (error) {
      console.error('Logout failed:', error);
  }
}

const AdminSidebar: React.FC = () => {
  return (
    <div className="h-screen bg-gray-900 text-white w-64 flex flex-col shadow-lg">
      {/* Header */}
      <div className="px-6 py-4 text-2xl font-semibold text-center text-teal-400">
        Admin Panel
      </div>

      {/* Navigation */}
      <nav className="flex-1">
        <ul className="space-y-3">
          {navLinks.map((link, index) => (
            <li key={index}>
              <a
                href={link.href}
                className="flex items-center px-4 py-3 rounded-lg text-gray-200 hover:bg-teal-600 hover:text-white transition-all duration-200"
              >
                <span className="mr-3">{link.icon}</span>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="px-4 py-3 mt-auto border-t border-gray-700">
        <a
          href="#"
          onClick={handleLogout}
          className="flex items-center space-x-2 text-gray-400 hover:text-red-500 transition-all duration-200"
        >
          <FaSignOutAlt className="text-lg" />
          <span className="hidden md:inline font-medium">Logout</span>
        </a>
      </div>
    </div>
  );
};

export default AdminSidebar;
