'use client'

import React from "react";
import { FaHome, FaCalendarAlt, FaUserMd, FaUsers, FaCog, FaSignOutAlt } from "react-icons/fa";
import { deleteCookie } from './deleteCookie';
import Cookies from 'js-cookie';
// Define a type for the navigation link
type NavLink = {
  label: string;
  icon: React.ReactNode;
  href: string;
};

const navLinks: NavLink[] = [
  { label: "Dashboard", icon: <FaHome />, href: "/dashboard" },
  { label: "Appointments", icon: <FaCalendarAlt />, href: "/appointmetManagement" },
  { label: "Doctors", icon: <FaUserMd />, href: "/doctors" },
  { label: "VerifiedDoctors", icon: <FaUserMd />, href: "/verifiedDoctors" },
  { label: "Patients", icon: <FaUsers />, href: "/patients" },
  { label: "Reviews", icon: <FaCog />, href: "/reviews" },
];

const handleLogout = (event: React.MouseEvent<HTMLAnchorElement>) => {
  event.preventDefault(); 

  try {
    
    Cookies.remove('accessToken');
    window.location.href = '/';
  } catch (error) {
    console.error('Error during logout:', error);
  }
};

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
