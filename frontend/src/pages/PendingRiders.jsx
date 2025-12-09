import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { serverUrl } from "../App";
import Nav from "../components/Nav";
import {
  FaBicycle,
  FaEnvelope,
  FaPhone,
  FaCheck,
  FaTimes,
  FaArrowLeft,
  FaClock,
} from "react-icons/fa";

function PendingRiders() {
  const { userData } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [pendingRiders, setPendingRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedRider, setSelectedRider] = useState(null);

  useEffect(() => {
    if (!userData || userData.role !== "admin") {
      navigate("/admin/login");
      return;
    }
    fetchPendingRiders();
  }, [userData, navigate]);

  const fetchPendingRiders = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/admin/pending-riders`, {
        withCredentials: true,
      });
      setPendingRiders(result.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (riderId) => {
    setActionLoading(riderId);
    try {
      await axios.put(
        `${serverUrl}/api/admin/approve/${riderId}`,
        {},
        { withCredentials: true }
      );
      setPendingRiders(pendingRiders.filter((r) => r._id !== riderId));
      setSelectedRider(null);
    } catch (error) {
      console.log(error);
      alert("Failed to approve rider");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (riderId) => {
    if (!confirm("Are you sure you want to reject this rider?")) return;

    setActionLoading(riderId);
    try {
      await axios.put(
        `${serverUrl}/api/admin/reject/${riderId}`,
        {},
        { withCredentials: true }
      );
      setPendingRiders(pendingRiders.filter((r) => r._id !== riderId));
      setSelectedRider(null);
    } catch (error) {
      console.log(error);
      alert("Failed to reject rider");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="p-2 hover:bg-gray-200 rounded-lg transition"
          >
            <FaArrowLeft className="text-gray-600" size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-1">
              Pending Delivery Riders
            </h1>
            <p className="text-gray-600">
              Review and approve delivery rider applications
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading pending riders...</p>
          </div>
        ) : pendingRiders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <FaBicycle className="text-gray-300 text-6xl mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              No Pending Riders
            </h2>
            <p className="text-gray-600">
              All delivery rider applications have been reviewed
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* List View */}
            <div className="space-y-4">
              {pendingRiders.map((rider) => (
                <div
                  key={rider._id}
                  onClick={() => setSelectedRider(rider)}
                  className={`bg-white rounded-xl shadow-md p-5 cursor-pointer transition-all hover:shadow-lg ${
                    selectedRider?._id === rider._id
                      ? "ring-2 ring-purple-500"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-100 p-3 rounded-full">
                        <FaBicycle className="text-purple-600 text-xl" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg">
                          {rider.fullName}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full mt-1">
                          <FaClock size={10} />
                          Pending Approval
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaEnvelope className="text-gray-400" />
                      {rider.email}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaPhone className="text-gray-400" />
                      {rider.mobile}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApprove(rider._id);
                      }}
                      disabled={actionLoading === rider._id}
                      className="flex-1 bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <FaCheck />
                      {actionLoading === rider._id
                        ? "Processing..."
                        : "Approve"}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReject(rider._id);
                      }}
                      disabled={actionLoading === rider._id}
                      className="flex-1 bg-red-500 text-white py-2 rounded-lg font-semibold hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <FaTimes />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Detail View */}
            <div className="lg:sticky lg:top-20 h-fit">
              {selectedRider ? (
                <div className="bg-white rounded-2xl shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-6">
                    Rider Details
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">
                        Full Name
                      </label>
                      <p className="text-lg font-semibold text-gray-800">
                        {selectedRider.fullName}
                      </p>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">
                        Email Address
                      </label>
                      <p className="text-gray-700">{selectedRider.email}</p>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">
                        Phone Number
                      </label>
                      <p className="text-gray-700">{selectedRider.mobile}</p>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">
                        Account Created
                      </label>
                      <p className="text-gray-700">
                        {new Date(selectedRider.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">
                        Status
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-semibold">
                          Pending Approval
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t flex gap-3">
                    <button
                      onClick={() => handleApprove(selectedRider._id)}
                      disabled={actionLoading === selectedRider._id}
                      className="flex-1 bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <FaCheck />
                      Approve Rider
                    </button>
                    <button
                      onClick={() => handleReject(selectedRider._id)}
                      disabled={actionLoading === selectedRider._id}
                      className="flex-1 bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <FaTimes />
                      Reject
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-md p-12 text-center">
                  <FaBicycle className="text-gray-300 text-6xl mx-auto mb-4" />
                  <p className="text-gray-600">
                    Select a rider to view details
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PendingRiders;
