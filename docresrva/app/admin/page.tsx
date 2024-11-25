import React from 'react';
import AdminSidebar from '@/components/utils/Sidebar';
const AdminHome: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
     <AdminSidebar/>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {/* Top Bar */}
        <header className="flex justify-between items-center bg-white p-4 shadow-md">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div>
            <button className="mx-2">🔔</button>
            <button className="mx-2">👤</button>
          </div>
        </header>

        {/* Dashboard Content */}
        <section className="mt-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded shadow-md">
              <h2 className="text-xl">Total Doctors</h2>
              <p className="text-2xl font-bold">45</p>
            </div>
            <div className="bg-white p-4 rounded shadow-md">
              <h2 className="text-xl">Total Patients</h2>
              <p className="text-2xl font-bold">200</p>
            </div>
            <div className="bg-white p-4 rounded shadow-md">
              <h2 className="text-xl">Appointments Today</h2>
              <p className="text-2xl font-bold">25</p>
            </div>
            <div className="bg-white p-4 rounded shadow-md">
              <h2 className="text-xl">Daily Revenue</h2>
              <p className="text-2xl font-bold">$1200</p>
            </div>
          </div>

          {/* Charts Section */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded shadow-md">
              <h3 className="text-xl mb-4">Appointments by Week</h3>
              {/* Chart Component Placeholder */}
              <div>Chart Goes Here</div>
            </div>
            <div className="bg-white p-4 rounded shadow-md">
              <h3 className="text-xl mb-4">Revenue Breakdown</h3>
              {/* Chart Component Placeholder */}
              <div>Chart Goes Here</div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-6 bg-white p-4 rounded shadow-md">
            <h3 className="text-xl mb-4">Recent Appointments</h3>
            <table className="w-full">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>John Doe</td>
                  <td>Dr. Smith</td>
                  <td>10:30 AM</td>
                  <td>Confirmed</td>
                  <td>
                    <button className="text-blue-500">Reschedule</button>
                  </td>
                </tr>
                {/* Add more rows as needed */}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminHome;
