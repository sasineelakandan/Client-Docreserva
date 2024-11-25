'use client'

import React from "react";
import { FaHome, FaCalendarAlt, FaUserMd, FaUsers, FaCog, FaSignOutAlt } from "react-icons/fa";
import { deleteCookie } from './deleteCookie';
// Define a type for the navigation link
type NavLink = {
  label: string;
  icon: React.ReactNode;
  href: string;
};

const navLinks: NavLink[] = [
  { label: "Dashboard", icon: <FaHome />, href: "/dashboard" },
  { label: "Appointments", icon: <FaCalendarAlt />, href: "/appointments" },
  { label: "Doctors", icon: <FaUserMd />, href: "/doctors" },
  { label: "Patients", icon: <FaUsers />, href: "/patients" },
  { label: "Settings", icon: <FaCog />, href: "/settings" },
];
const handleLogout = (event: React.MouseEvent<HTMLAnchorElement>) => {
  event.preventDefault(); 

  try {
      
      localStorage.removeItem('user');

      
  

      
      deleteCookie('accessToken');

      window.location.href = '/';
      
  } catch (error) {
      console.error('Error during logout:', error);
  }
};
const AdminSidebar: React.FC = () => {
  return (
    <div className="h-screen bg-teal-600 text-white w-64 flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 text-2xl font-bold text-center">Admin Panel</div>

      {/* Navigation */}
      <nav className="flex-1">
        <ul className="space-y-2">
          {navLinks.map((link, index) => (
            <li key={index}>
              <a
                href={link.href}
                className="flex items-center px-4 py-3 hover:bg-teal-700 transition-colors"
              >
                <span className="mr-3">{link.icon}</span>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="px-4 py-3 border-t border-teal-500">
      <a
            href="#"
            onClick={handleLogout}
            className="flex items-center space-x-2 text-gray-600 hover:text-teal-700 transition duration-200"
          >
            
            <span className="hidden md:inline font-medium">Logout</span>
          </a>
      </div>
    </div>
  );
};

export default AdminSidebar;
