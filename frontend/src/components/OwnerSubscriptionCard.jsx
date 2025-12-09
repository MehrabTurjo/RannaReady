
import React, { useState } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import {
  FaCheck,
  FaMotorcycle,
  FaTimes,
  FaMapMarkerAlt,
  FaPhone,
  FaClock,
} from "react-icons/fa";
import WeekDaysCard from "./WeekDaysCard";

function OwnerSubscriptionCard({ sub, refreshData }) {
  const [showRiderModal, setShowRiderModal] = useState(false);
  const [availableRiders, setAvailableRiders] = useState([]);
  const [loadingRiders, setLoadingRiders] = useState(false);

  // 1. Approve Subscription
  const handleApprove = async () => {
    try {
      await axios.put(
        `${serverUrl}/api/weekly/subscription/${sub._id}/approve`,
        {},
        { withCredentials: true }
      );
      refreshData();
    } catch (error) {
      console.error(error);
      alert("Error approving");
    }
  };

  // 2. Fetch Available Riders
  const fetchRiders = async () => {
    setShowRiderModal(true);
    setLoadingRiders(true);
    try {
      const res = await axios.get(
        `${serverUrl}/api/weekly/riders/available?latitude=0&longitude=0`,
        { withCredentials: true }
      );
      setAvailableRiders(res.data);
    } catch (error) {
      console.error(error);
      alert("Could not fetch riders");
    } finally {
      setLoadingRiders(false);
    }
  };

  // 3. Assign Rider
  const assignRider = async (riderId) => {
    try {
      await axios.put(
        `${serverUrl}/api/weekly/subscription/assign-rider`,
        {
          subscriptionId: sub._id,
          riderId: riderId,
        },
        { withCredentials: true }
      );
      setShowRiderModal(false);
      refreshData();
    } catch (error) {
      alert(error.response?.data?.message || "Assignment Failed");
    }
  };

  // 4. Dispatch Today's Meal
  const handleDailyDispatch = async () => {
    try {
      await axios.post(
        `${serverUrl}/api/weekly/dispatch-daily`,
        { subscriptionId: sub._id },
        { withCredentials: true }
      );
      alert("Meal Dispatched for Today!");
      refreshData();
    } catch (error) {
      console.error(error);
      alert("Error dispatching meal");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-5 border border-gray-100 flex flex-col gap-3 relative">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-bold text-gray-800 text-lg">
            Sub #{sub._id.slice(-6)}
          </h4>
          <p className="text-sm text-gray-500">Menu: {sub.menu?.name}</p>
        </div>
        <span
          className={`px-2 py-1 rounded text-xs font-bold uppercase 
          ${
            sub.status === "active"
              ? "bg-green-100 text-green-700"
              : sub.status === "pending_approval"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {sub.status.replace("_", " ")}
        </span>
      </div>

      <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
        {/* FIX: Use fullName for User */}
        <p>
          <span className="font-semibold">Customer:</span>{" "}
          {sub.user?.fullName || "User"}
        </p>
        <p className="flex items-start gap-1">
          <FaMapMarkerAlt className="mt-1 text-gray-400" />{" "}
          {sub.deliveryAddress?.text}
        </p>
        <p className="flex items-center gap-1">
          <FaClock className="text-gray-400" />
          <span className="font-semibold">Delivery Time:</span>{" "}
          {sub.deliveryTime || "12:00"}
        </p>
        <p>
          <span className="font-semibold text-red-500">Allergies:</span>{" "}
          {sub.allergies}
        </p>
        <p>
          <span className="font-semibold">Start:</span>{" "}
          {new Date(sub.startDate).toLocaleDateString()}
        </p>
      </div>

      {/* Delivery Days Card */}
      {sub.deliveryDays && sub.deliveryDays.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <p className="text-xs font-bold text-gray-500 uppercase mb-2">
            Delivery Days
          </p>
          <WeekDaysCard activeDays={sub.deliveryDays} />
        </div>
      )}

      {/* --- Action Buttons --- */}

      {sub.status === "pending_approval" && (
        <button
          onClick={handleApprove}
          className="w-full py-2 bg-black text-white rounded-lg font-bold hover:bg-gray-800"
        >
          Accept Subscription
        </button>
      )}

      {sub.status === "approved" && (
        <button
          onClick={fetchRiders}
          className="w-full py-2 bg-[#D40000] text-white rounded-lg font-bold hover:bg-[#b00000] flex justify-center items-center gap-2"
        >
          <FaMotorcycle /> Assign Rider
        </button>
      )}

      {sub.status === "active" && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-green-50 p-2 rounded">
            {/* FIX: Use fullName for assigned rider */}
            <FaMotorcycle /> Rider:{" "}
            <span className="font-bold">{sub.assignedRider?.fullName}</span>
          </div>
          <button
            onClick={handleDailyDispatch}
            className="w-full py-2 border-2 border-[#D40000] text-[#D40000] rounded-lg font-bold hover:bg-red-50"
          >
            Dispatch Today's Meal
          </button>
        </div>
      )}

      {/* --- RIDER SELECTION MODAL --- */}
      {showRiderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl h-[500px] flex flex-col">
            <div className="flex justify-between mb-4">
              <h3 className="text-xl font-bold">Select Available Rider</h3>
              <button onClick={() => setShowRiderModal(false)}>
                <FaTimes />
              </button>
            </div>

            {loadingRiders ? (
              <p className="text-center py-10">Finding riders...</p>
            ) : (
              <div className="overflow-y-auto flex-1 space-y-3">
                {availableRiders.length === 0 ? (
                  <p className="text-center text-gray-500 mt-10">
                    No riders found available for weekly duties.
                  </p>
                ) : (
                  availableRiders.map((rider) => (
                    <div
                      key={rider._id}
                      className="flex justify-between items-center p-3 border rounded-lg hover:border-red-500 cursor-pointer bg-gray-50"
                      onClick={() => assignRider(rider._id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold">
                          {rider.fullName ? rider.fullName[0] : "R"}
                        </div>
                        <div>
                          {/* FIX: Use fullName and mobile */}
                          <p className="font-bold text-gray-800">
                            {rider.fullName}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <FaPhone size={10} /> {rider.mobile}
                          </p>
                        </div>
                      </div>
                      <button className="text-xs bg-black text-white px-3 py-1.5 rounded font-bold">
                        Select
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default OwnerSubscriptionCard;
