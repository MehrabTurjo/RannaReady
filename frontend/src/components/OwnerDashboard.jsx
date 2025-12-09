import React, { useState, useEffect } from "react";
import Nav from "./Nav.jsx";
import axios from "axios";
import { serverUrl } from "../App";
import { useSelector } from "react-redux";
// Safe Imports: Switched to standard icons to avoid version conflicts
import {
  FaUtensils,
  FaPen,
  FaStore,
  FaCalendar,
  FaClipboardList,
  FaClock,
  FaExclamationCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// FIX 1: Ensure Import matches File Name exactly (Capital 'O')
import OwnerItemCard from "./OwnerItemCard";
import WeeklyMenuCard from "./WeeklyMenuCard";
import OwnerSubscriptionCard from "./OwnerSubscriptionCard";

function OwnerDashboard() {
  const { myShopData } = useSelector((state) => state.owner);
  const { userData } = useSelector((state) => state.user);
  const navigate = useNavigate();

  // State for Tabs and Data
  const [activeTab, setActiveTab] = useState("items"); // 'items', 'weekly', 'subs'
  const [weeklyMenus, setWeeklyMenus] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);

  // Check if owner is approved
  const isPending = userData?.approvalStatus === "pending";
  const isRejected = userData?.approvalStatus === "rejected";

  // Fetch Data when tab changes
  useEffect(() => {
    if (!myShopData?._id) return;

    const fetchData = async () => {
      try {
        if (activeTab === "weekly") {
          const res = await axios.get(
            `${serverUrl}/api/weekly/menu/${myShopData._id}`,
            { withCredentials: true }
          );
          setWeeklyMenus(res.data || []); // Safety check
        } else if (activeTab === "subs") {
          const res = await axios.get(
            `${serverUrl}/api/weekly/subscriptions/${myShopData._id}`,
            { withCredentials: true }
          );
          setSubscriptions(res.data || []); // Safety check
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
    };
    fetchData();
  }, [activeTab, myShopData?._id]);

  const refreshSubscriptions = async () => {
    if (myShopData?._id) {
      try {
        const res = await axios.get(
          `${serverUrl}/api/weekly/subscriptions/${myShopData._id}`,
          { withCredentials: true }
        );
        setSubscriptions(res.data || []);
      } catch (error) {
        console.error("Error refreshing subs:", error);
      }
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#fff9f6] flex flex-col items-center pt-[90px] pb-10">
      <Nav />

      {/* Pending Approval Banner */}
      {isPending && (
        <div className="w-full max-w-6xl mx-auto px-4 mb-6">
          <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-6 shadow-md">
            <div className="flex items-start gap-4">
              <FaClock className="text-yellow-600 text-3xl flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-yellow-800 mb-2">
                  Account Pending Approval
                </h3>
                <p className="text-yellow-700 mb-3">
                  Your shop owner account is awaiting admin approval. You can
                  view your dashboard but cannot create or manage shops until
                  approved.
                </p>
                <div className="bg-yellow-100 rounded-lg p-3 text-sm text-yellow-800">
                  <strong>What happens next?</strong> An administrator will
                  review your application and approve your account. You'll be
                  able to create your shop once approved.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejected Banner */}
      {isRejected && (
        <div className="w-full max-w-6xl mx-auto px-4 mb-6">
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6 shadow-md">
            <div className="flex items-start gap-4">
              <FaExclamationCircle className="text-red-600 text-3xl flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-red-800 mb-2">
                  Account Application Rejected
                </h3>
                <p className="text-red-700">
                  Unfortunately, your shop owner application has been rejected
                  by the administrator. Please contact support for more
                  information.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {!myShopData && !isPending && !isRejected ? (
        <div className="flex justify-center items-center w-full px-4 mt-10">
          {/* Fallback if no shop data found yet */}
          <div className="text-center p-10 bg-white rounded-xl shadow-lg">
            <h2 className="text-xl font-bold mb-4">No Shop Found</h2>
            <button
              onClick={() => navigate("/create-edit-shop")}
              className="bg-red-600 text-white px-6 py-2 rounded-full font-bold"
            >
              Create Shop
            </button>
          </div>
        </div>
      ) : isPending || isRejected ? (
        <div className="flex justify-center items-center w-full px-4 mt-10">
          <div className="text-center p-10 bg-white rounded-xl shadow-lg max-w-md">
            <FaStore className="text-gray-300 text-6xl mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">
              Shop Management Unavailable
            </h2>
            <p className="text-gray-600">
              {isPending
                ? "Your account needs admin approval before you can create or manage a shop."
                : "Your application has been rejected. Please contact support."}
            </p>
          </div>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center gap-8 px-4 sm:px-6 max-w-6xl">
          {/* Shop Header */}
          <div className="w-full bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100 relative group">
            <div className="h-48 sm:h-64 w-full relative">
              <img
                src={myShopData.image}
                className="w-full h-full object-cover"
                alt="Shop Cover"
              />
              <div className="absolute inset-0 bg-black/40"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <h1 className="text-3xl font-bold">{myShopData.name}</h1>
                <p>
                  {typeof myShopData.address === "string"
                    ? myShopData.address
                    : myShopData.address?.text || myShopData.address}
                </p>
              </div>
              <button
                className="absolute top-4 right-4 bg-white/90 p-2.5 rounded-full shadow-lg hover:bg-[#D40000] hover:text-white transition"
                onClick={() => navigate("/create-edit-shop")}
              >
                <FaPen size={18} />
              </button>
            </div>
          </div>

          {/* --- TABS --- */}
          <div className="flex flex-wrap justify-center gap-4 bg-white p-2 rounded-xl shadow-sm">
            <button
              onClick={() => setActiveTab("items")}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all ${
                activeTab === "items"
                  ? "bg-[#D40000] text-white"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              <FaUtensils /> Menu Items
            </button>
            <button
              onClick={() => setActiveTab("weekly")}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all ${
                activeTab === "weekly"
                  ? "bg-[#D40000] text-white"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              <FaCalendar /> Weekly Plans
            </button>
            <button
              onClick={() => setActiveTab("subs")}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all ${
                activeTab === "subs"
                  ? "bg-[#D40000] text-white"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              <FaClipboardList /> Subscriptions
            </button>
          </div>

          {/* --- TAB CONTENT --- */}

          {/* 1. Items Tab */}
          {activeTab === "items" && (
            <div className="w-full">
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => navigate("/add-item")}
                  className="bg-black text-white px-4 py-2 rounded-lg font-bold"
                >
                  + Add Item
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
                {/* FIX 2: Added optional chaining (?.) and length check */}
                {myShopData.items && myShopData.items.length > 0 ? (
                  myShopData.items.map((item, index) => (
                    <OwnerItemCard data={item} key={item._id || index} />
                  ))
                ) : (
                  <div className="col-span-3 text-center text-gray-500 py-10">
                    <p>No items found. Add your first dish!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. Weekly Plans Tab */}
          {activeTab === "weekly" && (
            <div className="w-full">
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => navigate("/create-weekly-menu")}
                  className="bg-black text-white px-4 py-2 rounded-lg font-bold"
                >
                  + Create Weekly Plan
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
                {weeklyMenus && weeklyMenus.length > 0 ? (
                  weeklyMenus.map((menu) => (
                    <WeeklyMenuCard key={menu._id} menu={menu} isOwner={true} />
                  ))
                ) : (
                  <p className="text-gray-500 col-span-3 text-center py-10">
                    No weekly plans created yet.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* 3. Subscriptions Tab */}
          {activeTab === "subs" && (
            <div className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {subscriptions && subscriptions.length > 0 ? (
                  subscriptions.map((sub) => (
                    <OwnerSubscriptionCard
                      key={sub._id}
                      sub={sub}
                      refreshData={refreshSubscriptions}
                    />
                  ))
                ) : (
                  <p className="text-gray-500 col-span-2 text-center py-10">
                    No subscriptions received yet.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default OwnerDashboard;
