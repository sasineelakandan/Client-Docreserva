import React from 'react';
import DoctorNavbar from '../../components/utils/doctorNavbar';

const Page: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
     

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <DoctorNavbar />
        {/* Dashboard Content */}
        <main className="p-6 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Stats Cards */}
            <div className="bg-white p-4 shadow rounded-lg">
              <h3 className="text-xl font-semibold">Today's Appointments</h3>
              <p className="mt-2 text-2xl font-bold text-blue-800">12</p>
            </div>
            <div className="bg-white p-4 shadow rounded-lg">
              <h3 className="text-xl font-semibold">New Patients</h3>
              <p className="mt-2 text-2xl font-bold text-blue-800">5</p>
            </div>
            <div className="bg-white p-4 shadow rounded-lg">
              <h3 className="text-xl font-semibold">Pending Prescriptions</h3>
              <p className="mt-2 text-2xl font-bold text-blue-800">3</p>
            </div>
            <div className="bg-white p-4 shadow rounded-lg">
              <h3 className="text-xl font-semibold">Earnings (Today)</h3>
              <p className="mt-2 text-2xl font-bold text-blue-800">$450</p>
            </div>
          </div>

          {/* Recent Appointments */}
          <section className="mt-8">
            <h2 className="text-2xl font-semibold">Recent Appointments</h2>
            <div className="mt-4 bg-white shadow rounded-lg p-4">
              <table className="w-full text-left">
                <thead>
                  <tr>
                    <th className="border-b py-2">Patient</th>
                    <th className="border-b py-2">Time</th>
                    <th className="border-b py-2">Status</th>
                    <th className="border-b py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2 border-b">John Doe</td>
                    <td className="py-2 border-b">10:00 AM</td>
                    <td className="py-2 border-b text-green-500">Confirmed</td>
                    <td className="py-2 border-b">
                      <button className="bg-blue-600 text-white px-3 py-1 rounded-md">
                        View
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 border-b">Jane Smith</td>
                    <td className="py-2 border-b">11:30 AM</td>
                    <td className="py-2 border-b text-yellow-500">Pending</td>
                    <td className="py-2 border-b">
                      <button className="bg-blue-600 text-white px-3 py-1 rounded-md">
                        View
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 border-b">Emily Davis</td>
                    <td className="py-2 border-b">1:00 PM</td>
                    <td className="py-2 border-b text-red-500">Cancelled</td>
                    <td className="py-2 border-b">
                      <button className="bg-blue-600 text-white px-3 py-1 rounded-md">
                        View
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Page;
