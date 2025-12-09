import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { serverUrl } from "../App";
import Nav from "../components/Nav";
import {
  FaUsers,
  FaStore,
  FaBicycle,
  FaClipboardList,
  FaBars,
  FaTimes,
} from "react-icons/fa";

function AdminDashboard() {
  const { userData } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOwners: 0,
    totalRiders: 0,
    pendingOwners: 0,
    pendingRiders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!userData || userData.role !== "admin") {
      navigate("/admin/login");
      return;
    }
    fetchStats();
  }, [userData, navigate]);

  const fetchStats = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/admin/stats`, {
        withCredentials: true,
      });
      setStats(result.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: IconComponent, label, value, color, onClick }) => (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-6 shadow-md border-l-4 ${color} ${
        onClick ? "cursor-pointer hover:shadow-lg transition-shadow" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`p-4 rounded-full ${color.replace("border", "bg")}`}>
          <IconComponent className="text-white text-2xl" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">
              Manage users, owners, and delivery riders
            </p>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 transition"
          >
            {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>

        <div className="flex gap-6">
          {/* Main Content */}
          <div className="flex-1">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Loading statistics...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard
                  icon={FaUsers}
                  label="Total Users"
                  value={stats.totalUsers}
                  color="border-blue-500"
                />
                <StatCard
                  icon={FaStore}
                  label="Total Shop Owners"
                  value={stats.totalOwners}
                  color="border-orange-500"
                />
                <StatCard
                  icon={FaBicycle}
                  label="Total Riders"
                  value={stats.totalRiders}
                  color="border-green-500"
                />
                <StatCard
                  icon={FaClipboardList}
                  label="Pending Owners"
                  value={stats.pendingOwners}
                  color="border-red-500"
                  onClick={() => navigate("/admin/pending-owners")}
                />
                <StatCard
                  icon={FaClipboardList}
                  label="Pending Riders"
                  value={stats.pendingRiders}
                  color="border-purple-500"
                  onClick={() => navigate("/admin/pending-riders")}
                />
              </div>
            )}
          </div>

          {/* Sidebar - Desktop */}
          <div className="hidden lg:block w-64">
            <div className="bg-white rounded-2xl shadow-md p-6 sticky top-20">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <button
                  onClick={() => navigate("/admin/pending-owners")}
                  className="w-full text-left px-4 py-3 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 font-semibold transition flex items-center gap-2"
                >
                  <FaStore />
                  Pending Owners ({stats.pendingOwners})
                </button>
                <button
                  onClick={() => navigate("/admin/pending-riders")}
                  className="w-full text-left px-4 py-3 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold transition flex items-center gap-2"
                >
                  <FaBicycle />
                  Pending Riders ({stats.pendingRiders})
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Mobile */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 bg-black/50 z-50">
            <div className="fixed right-0 top-0 h-full w-64 bg-white shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-800">
                  Quick Actions
                </h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="text-gray-600 hover:text-red-600"
                >
                  <FaTimes size={20} />
                </button>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    navigate("/admin/pending-owners");
                    setSidebarOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 font-semibold transition flex items-center gap-2"
                >
                  <FaStore />
                  Pending Owners ({stats.pendingOwners})
                </button>
                <button
                  onClick={() => {
                    navigate("/admin/pending-riders");
                    setSidebarOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold transition flex items-center gap-2"
                >
                  <FaBicycle />
                  Pending Riders ({stats.pendingRiders})
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
