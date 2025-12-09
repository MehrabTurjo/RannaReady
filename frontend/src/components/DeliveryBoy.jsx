// import React, { useEffect, useState } from "react";
// import Nav from "./Nav";
// import { useSelector } from "react-redux";
// import axios from "axios";
// import { serverUrl } from "../App";
// import DeliveryBoyTracking from "./DeliveryBoyTracking";
// import {
//   Bar,
//   BarChart,
//   CartesianGrid,
//   ResponsiveContainer,
//   Tooltip,
//   XAxis,
//   YAxis,
// } from "recharts";
// // Using FA6 icons as per your environment
// import {
//   FaCalendarDays,
//   FaStore,
//   FaUser,
//   FaPhone,
//   FaClock,
//   FaMapLocationDot,
// } from "react-icons/fa6";
// import { FaSync } from "react-icons/fa";
// import WeekDaysCard from "./WeekDaysCard";

// function DeliveryBoy() {
//   const { userData, socket } = useSelector((state) => state.user);
//   const [currentOrder, setCurrentOrder] = useState();
//   const [showOtpBox, setShowOtpBox] = useState(false);
//   const [availableAssignments, setAvailableAssignments] = useState(null);

//   // Weekly State
//   const [weeklyAssignments, setWeeklyAssignments] = useState([]);
//   const [weeklyLoading, setWeeklyLoading] = useState(false);
//   const [weeklyError, setWeeklyError] = useState("");

//   const [otp, setOtp] = useState("");
//   const [todayDeliveries, setTodayDeliveries] = useState([]);
//   const [deliveryBoyLocation, setDeliveryBoyLocation] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");

//   // --- Location Tracking ---
//   useEffect(() => {
//     if (!socket || userData?.role !== "deliveryBoy") return;
//     let watchId;
//     if (navigator.geolocation) {
//       (watchId = navigator.geolocation.watchPosition((position) => {
//         const latitude = position.coords.latitude;
//         const longitude = position.coords.longitude;
//         setDeliveryBoyLocation({ lat: latitude, lon: longitude });
//         socket.emit("updateLocation", {
//           latitude,
//           longitude,
//           userId: userData._id,
//         });
//       })),
//         (error) => {
//           console.log(error);
//         },
//         {
//           enableHighAccuracy: true,
//         };
//     }
//     return () => {
//       if (watchId) navigator.geolocation.clearWatch(watchId);
//     };
//   }, [socket, userData]);

//   const ratePerDelivery = 50;
//   const totalEarning = todayDeliveries.reduce(
//     (sum, d) => sum + d.count * ratePerDelivery,
//     0
//   );

//   // --- API Calls ---

//   const getAssignments = async () => {
//     try {
//       const result = await axios.get(`${serverUrl}/api/order/get-assignments`, {
//         withCredentials: true,
//       });
//       setAvailableAssignments(result.data);
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const getCurrentOrder = async () => {
//     try {
//       const result = await axios.get(
//         `${serverUrl}/api/order/get-current-order`,
//         { withCredentials: true }
//       );
//       setCurrentOrder(result.data);
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   // --- NEW: Fetch Weekly Assignments with Enhanced Debugging ---
//   const getWeeklyAssignments = async () => {
//     setWeeklyLoading(true);
//     setWeeklyError("");
//     try {
//       console.log("🚀 Frontend: Requesting Weekly Assignments...");
//       const result = await axios.get(
//         `${serverUrl}/api/weekly/rider/my-subscriptions`,
//         { withCredentials: true }
//       );

//       console.log("✅ Frontend: Weekly Data Received:", result.data);
//       setWeeklyAssignments(result.data);
//     } catch (error) {
//       // Capture the exact error message from backend
//       const errorMsg = error.response?.data?.message || error.message;
//       console.error("❌ Frontend Error:", error.response || error);
//       setWeeklyError(`Error: ${errorMsg}`);
//     } finally {
//       setWeeklyLoading(false);
//     }
//   };

//   const handleTodayDeliveries = async () => {
//     try {
//       const result = await axios.get(
//         `${serverUrl}/api/order/get-today-deliveries`,
//         { withCredentials: true }
//       );
//       console.log(result.data);
//       setTodayDeliveries(result.data);
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   // --- MASTER REFRESH FUNCTION ---
//   const refreshDashboard = () => {
//     console.log("🔄 Refreshing Dashboard...");
//     getCurrentOrder(); // Check for new "Out for Delivery" meals
//     getAssignments(); // Check for new standard orders
//     getWeeklyAssignments(); // Check for new weekly commitments
//     handleTodayDeliveries(); // Update stats
//   };

//   const acceptOrder = async (assignmentId) => {
//     try {
//       const result = await axios.get(
//         `${serverUrl}/api/order/accept-order/${assignmentId}`,
//         { withCredentials: true }
//       );
//       console.log(result.data);
//       await getCurrentOrder();
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const sendOtp = async () => {
//     setLoading(true);
//     try {
//       const result = await axios.post(
//         `${serverUrl}/api/order/send-delivery-otp`,
//         {
//           orderId: currentOrder._id,
//           shopOrderId: currentOrder.shopOrder._id,
//         },
//         { withCredentials: true }
//       );
//       setLoading(false);
//       setShowOtpBox(true);
//       console.log(result.data);
//     } catch (error) {
//       console.log(error);
//       setLoading(false);
//     }
//   };

//   const verifyOtp = async () => {
//     setMessage("");
//     try {
//       const result = await axios.post(
//         `${serverUrl}/api/order/verify-delivery-otp`,
//         {
//           orderId: currentOrder._id,
//           shopOrderId: currentOrder.shopOrder._id,
//           otp,
//         },
//         { withCredentials: true }
//       );
//       console.log(result.data);
//       setMessage(result.data.message);
//       location.reload();
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   useEffect(() => {
//     if (!socket) return;

//     const handleNewAssignment = (data) => {
//       console.log("🔔 New Assignment Received:", data);
//       setAvailableAssignments((prev) => [...prev, data]);
//       // Optionally refresh to check for current order updates
//       getCurrentOrder();
//     };

//     socket.on("newAssignment", handleNewAssignment);
//     return () => {
//       socket.off("newAssignment", handleNewAssignment);
//     };
//   }, [socket]);

//   useEffect(() => {
//     if (userData?._id) {
//       refreshDashboard(); // Initial load
//     }
//   }, [userData?._id]);

//   return (
//     <div className="w-screen min-h-screen flex flex-col gap-5 items-center bg-[#fff9f6] overflow-y-auto pb-10">
//       <Nav />
//       <div className="w-full max-w-[800px] flex flex-col gap-5 items-center">
//         {/* Welcome Section */}
//         <div className="bg-white rounded-2xl shadow-md p-5 flex flex-col justify-start items-center w-[90%] border border-orange-100 text-center gap-2">
//           <h1 className="text-xl font-bold text-[#D40000] ">
//             Welcome, {userData?.fullName}
//           </h1>
//           <p className="text-[#ff4d2d] ">
//             <span className="font-semibold">Latitude:</span>{" "}
//             {deliveryBoyLocation?.lat},{" "}
//             <span className="font-semibold">Longitude:</span>{" "}
//             {deliveryBoyLocation?.lon}
//           </p>
//         </div>

//         {/* Stats Section */}
//         <div className="bg-white rounded-2xl shadow-md p-5 w-[90%] mb-2 border border-orange-100">
//           <h1 className="text-lg font-bold mb-3 text-[#D40000] ">
//             Today Deliveries
//           </h1>
//           <ResponsiveContainer width="100%" height={200}>
//             <BarChart data={todayDeliveries}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="hour" tickFormatter={(h) => `${h}:00`} />
//               <YAxis allowDecimals={false} />
//               <Tooltip
//                 formatter={(value) => [value, "orders"]}
//                 labelFormatter={(label) => `${label}:00`}
//               />
//               <Bar dataKey="count" fill="#D40000" />
//             </BarChart>
//           </ResponsiveContainer>
//           <div className="max-w-sm mx-auto mt-6 p-6 bg-white rounded-2xl shadow-lg text-center">
//             <h1 className="text-xl font-semibold text-gray-800 mb-2">
//               Today's Earning
//             </h1>
//             <span className="text-3xl font-bold text-green-600">
//               ৳{totalEarning}
//             </span>
//           </div>
//         </div>

//         {/* NEW SECTION: Weekly Commitments */}
//         <div className="bg-white rounded-2xl p-5 shadow-md w-[90%] border border-orange-100">
//           <div className="flex justify-between items-center mb-4">
//             <h1 className="text-lg font-bold flex items-center gap-2 text-gray-800">
//               <FaCalendarDays className="text-[#D40000]" /> Weekly Commitments
//             </h1>
//             <button
//               onClick={refreshDashboard}
//               className="text-sm flex items-center gap-1 bg-gray-100 px-3 py-1 rounded hover:bg-gray-200 transition"
//             >
//               <FaSync className={weeklyLoading ? "animate-spin" : ""} /> Refresh
//             </button>
//           </div>

//           <div className="space-y-4">
//             {weeklyError && (
//               <p className="text-red-500 text-sm text-center">{weeklyError}</p>
//             )}

//             {weeklyAssignments.length > 0 ? (
//               weeklyAssignments.map((sub) => (
//                 <div
//                   key={sub._id}
//                   className="border border-l-4 border-l-[#D40000] rounded-lg p-4 bg-gray-50 hover:shadow-md transition-shadow space-y-3"
//                 >
//                   <div className="flex justify-between items-start mb-2">
//                     <h3 className="font-bold text-gray-800 flex items-center gap-2">
//                       <FaStore className="text-gray-500" /> {sub.shop?.name}
//                     </h3>
//                     <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold uppercase">
//                       {sub.status}
//                     </span>
//                   </div>

//                   <div className="text-sm text-gray-600 space-y-1">
//                     <p className="flex items-center gap-2">
//                       <FaUser className="text-gray-400" /> {sub.user?.fullName}
//                     </p>
//                     <p className="flex items-center gap-2">
//                       <FaPhone className="text-gray-400" /> {sub.user?.mobile}
//                     </p>
//                     <p className="flex items-center gap-2">
//                       <FaClock className="text-gray-400" />{" "}
//                       <span className="font-semibold">Delivery Time:</span>{" "}
//                       {sub.deliveryTime || "12:00"}
//                     </p>
//                     <p className="pl-6 text-xs text-gray-500">
//                       Plan: {sub.menu?.name}
//                     </p>
//                   </div>

//                   {/* Delivery Days Card */}
//                   {sub.deliveryDays && sub.deliveryDays.length > 0 && (
//                     <div className="bg-white border border-gray-200 rounded-lg p-2">
//                       <p className="text-xs font-bold text-gray-500 uppercase mb-2">
//                         Delivery Days
//                       </p>
//                       <WeekDaysCard activeDays={sub.deliveryDays} />
//                     </div>
//                   )}

//                   {/* Customer Location */}
//                   {sub.deliveryAddress && (
//                     <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
//                       <p className="text-xs font-bold text-gray-600 uppercase mb-1 flex items-center gap-1">
//                         <FaMapLocationDot className="text-blue-500" /> Customer
//                         Location
//                       </p>
//                       <p className="text-sm text-gray-700 mb-2">
//                         {sub.deliveryAddress.text}
//                       </p>
//                       {sub.deliveryAddress.latitude &&
//                         sub.deliveryAddress.longitude && (
//                           <a
//                             href={`https://www.google.com/maps?q=${sub.deliveryAddress.latitude},${sub.deliveryAddress.longitude}`}
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             className="inline-block bg-blue-600 text-white text-xs px-3 py-1.5 rounded font-semibold hover:bg-blue-700 transition"
//                           >
//                             Open in Maps
//                           </a>
//                         )}
//                     </div>
//                   )}

//                   {/* Shop Location */}
//                   {sub.shop?.address && (
//                     <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
//                       <p className="text-xs font-bold text-gray-600 uppercase mb-1 flex items-center gap-1">
//                         <FaStore className="text-orange-500" /> Shop Location
//                       </p>
//                       <p className="text-sm text-gray-700 mb-2">
//                         {typeof sub.shop.address === "string"
//                           ? sub.shop.address
//                           : sub.shop.address.text || sub.shop.address}
//                       </p>
//                       {sub.shop.address.latitude &&
//                       sub.shop.address.longitude ? (
//                         <a
//                           href={`https://www.google.com/maps?q=${sub.shop.address.latitude},${sub.shop.address.longitude}`}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           className="inline-block bg-orange-600 text-white text-xs px-3 py-1.5 rounded font-semibold hover:bg-orange-700 transition"
//                         >
//                           Open in Maps
//                         </a>
//                       ) : (
//                         <a
//                           href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
//                             typeof sub.shop.address === "string"
//                               ? sub.shop.address
//                               : sub.shop.address.text || ""
//                           )}`}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           className="inline-block bg-orange-600 text-white text-xs px-3 py-1.5 rounded font-semibold hover:bg-orange-700 transition"
//                         >
//                           Search in Maps
//                         </a>
//                       )}
//                     </div>
//                   )}

//                   <div className="text-xs text-gray-500 border-t pt-2 flex justify-between">
//                     <span>
//                       Start: {new Date(sub.startDate).toLocaleDateString()}
//                     </span>
//                     <span>
//                       End: {new Date(sub.endDate).toLocaleDateString()}
//                     </span>
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <p className="text-gray-400 text-sm text-center py-4">
//                 {weeklyLoading
//                   ? "Loading..."
//                   : "No active weekly subscriptions assigned."}
//               </p>
//             )}
//           </div>
//         </div>

//         {/* Current Order Section */}
//         {currentOrder && (
//           <div className="bg-white rounded-2xl p-5 shadow-md w-[90%] border border-orange-100">
//             <h2 className="text-lg font-bold mb-3">
//               📦 Current Order (Out for Delivery)
//             </h2>
//             <div className="border rounded-lg p-4 mb-3">
//               <p className="font-semibold text-sm">
//                 {currentOrder?.shopOrder.shop.name}
//               </p>
//               <p className="text-sm text-gray-500">
//                 {currentOrder.deliveryAddress.text}
//               </p>
//               <p className="text-xs text-gray-400">
//                 {currentOrder.shopOrder.shopOrderItems.length} items |{" "}
//                 {currentOrder.shopOrder.subtotal}
//               </p>
//             </div>

//             <DeliveryBoyTracking
//               data={{
//                 deliveryBoyLocation: deliveryBoyLocation || {
//                   lat: userData?.location?.coordinates[1],
//                   lon: userData?.location?.coordinates[0],
//                 },
//                 customerLocation: {
//                   lat: currentOrder.deliveryAddress.latitude,
//                   lon: currentOrder.deliveryAddress.longitude,
//                 },
//               }}
//             />
//             {!showOtpBox ? (
//               <button
//                 className="mt-4 w-full bg-green-500 text-white font-semibold py-2 px-4 rounded-xl shadow-md hover:bg-green-600 active:scale-95 transition-all duration-200"
//                 onClick={sendOtp}
//                 disabled={loading}
//               >
//                 {loading ? "Sending..." : "Mark As Delivered"}
//               </button>
//             ) : (
//               <div className="mt-4 p-4 border rounded-xl bg-gray-50">
//                 <p className="text-sm font-semibold mb-2">
//                   Enter Otp send to{" "}
//                   <span className="text-[#E60000]">
//                     {currentOrder.user.fullName}
//                   </span>
//                 </p>
//                 <input
//                   type="text"
//                   className="w-full border px-3 py-2 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
//                   placeholder="Enter OTP"
//                   onChange={(e) => setOtp(e.target.value)}
//                   value={otp}
//                 />
//                 {message && (
//                   <p className="text-center text-green-400 text-2xl mb-4">
//                     {message}
//                   </p>
//                 )}

//                 <button
//                   className="w-full bg-[#D40000] text-white py-2 rounded-lg font-semibold hover:bg-[#E60000] transition-all"
//                   onClick={verifyOtp}
//                 >
//                   Submit OTP
//                 </button>
//               </div>
//             )}
//           </div>
//         )}

//         {/* Available Assignments (Standard Orders) */}
//         {!currentOrder && (
//           <div className="bg-white rounded-2xl p-5 shadow-md w-[90%] border border-orange-100">
//             <h1 className="text-lg font-bold mb-4 flex items-center gap-2">
//               Available Orders
//             </h1>

//             <div className="space-y-4">
//               {availableAssignments?.length > 0 ? (
//                 availableAssignments.map((a, index) => (
//                   <div
//                     className="border rounded-lg p-4 flex justify-between items-center"
//                     key={index}
//                   >
//                     <div>
//                       <p className="text-sm font-semibold">{a?.shopName}</p>
//                       <p className="text-sm text-gray-500">
//                         <span className="font-semibold">Delivery Address:</span>{" "}
//                         {a?.deliveryAddress.text}
//                       </p>
//                       <p className="text-xs text-gray-400">
//                         {a.items.length} items | {a.subtotal}
//                       </p>
//                     </div>
//                     <button
//                       className="bg-[#D40000] text-white px-4 py-1 rounded-lg text-sm hover:bg-[#E60000]"
//                       onClick={() => acceptOrder(a.assignmentId)}
//                     >
//                       Accept
//                     </button>
//                   </div>
//                 ))
//               ) : (
//                 <p className="text-gray-400 text-sm">No Available Orders</p>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default DeliveryBoy;

import React, { useEffect, useState, useCallback } from "react";
import Nav from "./Nav";
import { useSelector } from "react-redux";
import axios from "axios";
import { serverUrl } from "../App";
import DeliveryBoyTracking from "./DeliveryBoyTracking";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
// Using FA6 icons as per your environment
import {
  FaCalendarDays,
  FaStore,
  FaUser,
  FaPhone,
  FaClock,
  FaMapLocationDot,
} from "react-icons/fa6";
import { FaSync, FaExclamationCircle } from "react-icons/fa";
import WeekDaysCard from "./WeekDaysCard";

function DeliveryBoy() {
  const { userData, socket } = useSelector((state) => state.user);
  const [currentOrder, setCurrentOrder] = useState();
  const [showOtpBox, setShowOtpBox] = useState(false);
  const [availableAssignments, setAvailableAssignments] = useState(null);

  // Weekly State
  const [weeklyAssignments, setWeeklyAssignments] = useState([]);
  const [weeklyLoading, setWeeklyLoading] = useState(false);
  const [weeklyError, setWeeklyError] = useState("");
  const [showMaps, setShowMaps] = useState({}); // Track which maps to show: {subscriptionId: {customer: bool, shop: bool}}

  const [otp, setOtp] = useState("");
  const [todayDeliveries, setTodayDeliveries] = useState([]);
  const [deliveryBoyLocation, setDeliveryBoyLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // --- Location Tracking ---
  useEffect(() => {
    if (!socket || userData?.role !== "deliveryBoy") return;
    let watchId;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          setDeliveryBoyLocation({ lat: latitude, lon: longitude });
          socket.emit("updateLocation", {
            latitude,
            longitude,
            userId: userData._id,
          });
        },
        (error) => {
          console.log(error);
        },
        {
          enableHighAccuracy: true,
        }
      );
    }
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [socket, userData]);

  const ratePerDelivery = 50;
  const totalEarning = todayDeliveries.reduce(
    (sum, d) => sum + d.count * ratePerDelivery,
    0
  );

  // --- API Calls (Wrapped in useCallback to stabilize them) ---

  const getAssignments = useCallback(async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/order/get-assignments`, {
        withCredentials: true,
      });
      setAvailableAssignments(result.data);
    } catch (error) {
      console.log(error);
    }
  }, []);

  const getCurrentOrder = useCallback(async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/order/get-current-order`,
        { withCredentials: true }
      );
      setCurrentOrder(result.data);
    } catch (error) {
      console.log(error);
    }
  }, []);

  const getWeeklyAssignments = useCallback(async () => {
    setWeeklyLoading(true);
    setWeeklyError("");
    try {
      console.log("🚀 Frontend: Requesting Weekly Assignments...");
      const result = await axios.get(
        `${serverUrl}/api/weekly/rider/my-subscriptions`,
        { withCredentials: true }
      );

      console.log("✅ Frontend: Weekly Data Received:", result.data);
      setWeeklyAssignments(result.data);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      console.error("❌ Frontend Error:", error.response || error);
      setWeeklyError(`Error: ${errorMsg}`);
    } finally {
      setWeeklyLoading(false);
    }
  }, []);

  const handleTodayDeliveries = useCallback(async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/order/get-today-deliveries`,
        { withCredentials: true }
      );
      console.log(result.data);
      setTodayDeliveries(result.data);
    } catch (error) {
      console.log(error);
    }
  }, []);

  // --- MASTER REFRESH FUNCTION (Wrapped in useCallback) ---
  // Now this function is stable and can be added to useEffect dependencies
  const refreshDashboard = useCallback(() => {
    console.log("🔄 Refreshing Dashboard...");
    getCurrentOrder();
    getAssignments();
    getWeeklyAssignments();
    handleTodayDeliveries();
  }, [
    getCurrentOrder,
    getAssignments,
    getWeeklyAssignments,
    handleTodayDeliveries,
  ]);

  const acceptOrder = async (assignmentId) => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/order/accept-order/${assignmentId}`,
        { withCredentials: true }
      );
      console.log(result.data);
      await getCurrentOrder();
    } catch (error) {
      console.log(error);
    }
  };

  const sendOtp = async () => {
    setLoading(true);
    try {
      const result = await axios.post(
        `${serverUrl}/api/order/send-delivery-otp`,
        {
          orderId: currentOrder._id,
          shopOrderId: currentOrder.shopOrder._id,
        },
        { withCredentials: true }
      );
      setLoading(false);
      setShowOtpBox(true);
      console.log(result.data);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setMessage("");
    try {
      const result = await axios.post(
        `${serverUrl}/api/order/verify-delivery-otp`,
        {
          orderId: currentOrder._id,
          shopOrderId: currentOrder.shopOrder._id,
          otp,
        },
        { withCredentials: true }
      );
      console.log(result.data);
      setMessage(result.data.message);
      location.reload();
    } catch (error) {
      console.log(error);
    }
  };

  const toggleMap = (subscriptionId, type) => {
    setShowMaps((prev) => ({
      ...prev,
      [subscriptionId]: {
        ...prev[subscriptionId],
        [type]: !prev[subscriptionId]?.[type],
      },
    }));
  };

  // Socket Listener
  useEffect(() => {
    if (!socket) return;

    const handleNewAssignment = (data) => {
      console.log("🔔 New Assignment Received:", data);
      setAvailableAssignments((prev) => [...prev, data]);
      // Optionally refresh to check for current order updates
      getCurrentOrder();
    };

    socket.on("newAssignment", handleNewAssignment);
    return () => {
      socket.off("newAssignment", handleNewAssignment);
    };
  }, [socket, getCurrentOrder]); // Added getCurrentOrder since it's used inside

  // Initial Load Effect - FIXED
  useEffect(() => {
    if (userData?._id) {
      refreshDashboard();
    }
  }, [userData?._id, refreshDashboard]); // Included refreshDashboard

  // Check if rider is approved
  const isPending = userData?.approvalStatus === "pending";
  const isRejected = userData?.approvalStatus === "rejected";

  return (
    <div className="w-screen min-h-screen flex flex-col gap-5 items-center bg-[#fff9f6] overflow-y-auto pb-10">
      <Nav />
      <div className="w-full max-w-[800px] flex flex-col gap-5 items-center">
        {/* Pending Approval Banner */}
        {isPending && (
          <div className="w-[90%] bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-5 shadow-md mt-5">
            <div className="flex items-start gap-3">
              <FaClock className="text-yellow-600 text-2xl flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-yellow-800 mb-2">
                  Account Pending Approval
                </h3>
                <p className="text-yellow-700 text-sm">
                  Your delivery rider account is awaiting admin approval. You
                  cannot accept orders until your account is approved by an
                  administrator.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Rejected Banner */}
        {isRejected && (
          <div className="w-[90%] bg-red-50 border-l-4 border-red-500 rounded-lg p-5 shadow-md mt-5">
            <div className="flex items-start gap-3">
              <FaExclamationCircle className="text-red-600 text-2xl flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-800 mb-2">
                  Account Application Rejected
                </h3>
                <p className="text-red-700 text-sm">
                  Unfortunately, your delivery rider application has been
                  rejected. Please contact support for more information.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Show content only if approved */}
        {!isPending && !isRejected && (
          <>
            {/* Welcome Section */}
            <div className="bg-white rounded-2xl shadow-md p-5 flex flex-col justify-start items-center w-[90%] border border-orange-100 text-center gap-2">
              <h1 className="text-xl font-bold text-[#D40000] ">
                Welcome, {userData?.fullName}
              </h1>
              <p className="text-[#ff4d2d] ">
                <span className="font-semibold">Latitude:</span>{" "}
                {deliveryBoyLocation?.lat},{" "}
                <span className="font-semibold">Longitude:</span>{" "}
                {deliveryBoyLocation?.lon}
              </p>
            </div>

            {/* Stats Section */}
            <div className="bg-white rounded-2xl shadow-md p-5 w-[90%] mb-2 border border-orange-100">
              <h1 className="text-lg font-bold mb-3 text-[#D40000] ">
                Today Deliveries
              </h1>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={todayDeliveries}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" tickFormatter={(h) => `${h}:00`} />
                  <YAxis allowDecimals={false} />
                  <Tooltip
                    formatter={(value) => [value, "orders"]}
                    labelFormatter={(label) => `${label}:00`}
                  />
                  <Bar dataKey="count" fill="#D40000" />
                </BarChart>
              </ResponsiveContainer>
              <div className="max-w-sm mx-auto mt-6 p-6 bg-white rounded-2xl shadow-lg text-center">
                <h1 className="text-xl font-semibold text-gray-800 mb-2">
                  Today's Earning
                </h1>
                <span className="text-3xl font-bold text-green-600">
                  ৳{totalEarning}
                </span>
              </div>
            </div>

            {/* NEW SECTION: Weekly Commitments */}
            <div className="bg-white rounded-2xl p-5 shadow-md w-[90%] border border-orange-100">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-lg font-bold flex items-center gap-2 text-gray-800">
                  <FaCalendarDays className="text-[#D40000]" /> Weekly
                  Commitments
                </h1>
                <button
                  onClick={refreshDashboard}
                  className="text-sm flex items-center gap-1 bg-gray-100 px-3 py-1 rounded hover:bg-gray-200 transition"
                >
                  <FaSync className={weeklyLoading ? "animate-spin" : ""} />{" "}
                  Refresh
                </button>
              </div>

              <div className="space-y-4">
                {weeklyError && (
                  <p className="text-red-500 text-sm text-center">
                    {weeklyError}
                  </p>
                )}

                {weeklyAssignments.length > 0 ? (
                  weeklyAssignments.map((sub) => {
                    // Debug logging
                    console.log("Weekly Assignment:", {
                      id: sub._id,
                      deliveryAddress: sub.deliveryAddress,
                      shopAddress: sub.shop?.address,
                    });

                    return (
                      <div
                        key={sub._id}
                        className="border border-l-4 border-l-[#D40000] rounded-lg p-4 bg-gray-50 hover:shadow-md transition-shadow space-y-3"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <FaStore className="text-gray-500" />{" "}
                            {sub.shop?.name}
                          </h3>
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold uppercase">
                            {sub.status}
                          </span>
                        </div>

                        <div className="text-sm text-gray-600 space-y-1">
                          <p className="flex items-center gap-2">
                            <FaUser className="text-gray-400" />{" "}
                            {sub.user?.fullName}
                          </p>
                          <p className="flex items-center gap-2">
                            <FaPhone className="text-gray-400" />{" "}
                            {sub.user?.mobile}
                          </p>
                          <p className="flex items-center gap-2">
                            <FaClock className="text-gray-400" />{" "}
                            <span className="font-semibold">
                              Delivery Time:
                            </span>{" "}
                            {sub.deliveryTime || "12:00"}
                          </p>
                          <p className="pl-6 text-xs text-gray-500">
                            Plan: {sub.menu?.name}
                          </p>
                        </div>

                        {/* Delivery Days Card */}
                        {sub.deliveryDays && sub.deliveryDays.length > 0 && (
                          <div className="bg-white border border-gray-200 rounded-lg p-2">
                            <p className="text-xs font-bold text-gray-500 uppercase mb-2">
                              Delivery Days
                            </p>
                            <WeekDaysCard activeDays={sub.deliveryDays} />
                          </div>
                        )}

                        {/* Locations Side by Side */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {/* Customer Location */}
                          {sub.deliveryAddress && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <div className="flex justify-between items-center mb-2">
                                <p className="text-xs font-bold text-gray-600 uppercase flex items-center gap-1">
                                  <FaMapLocationDot className="text-blue-500" />
                                  Customer
                                </p>
                                {sub.deliveryAddress?.latitude &&
                                  sub.deliveryAddress?.longitude &&
                                  sub.deliveryAddress.latitude !== 0 &&
                                  sub.deliveryAddress.longitude !== 0 && (
                                    <button
                                      onClick={() =>
                                        toggleMap(sub._id, "customer")
                                      }
                                      className="text-xs text-blue-600 font-semibold hover:underline"
                                    >
                                      {showMaps[sub._id]?.customer
                                        ? "Hide Map"
                                        : "Show Map"}
                                    </button>
                                  )}
                              </div>
                              <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                                {sub.deliveryAddress?.text ||
                                  "Address not provided"}
                              </p>
                              {!sub.deliveryAddress?.latitude && (
                                <p className="text-xs text-gray-500 italic">
                                  Customer coordinates not available
                                </p>
                              )}
                              {showMaps[sub._id]?.customer &&
                                sub.deliveryAddress?.latitude &&
                                sub.deliveryAddress?.longitude &&
                                sub.deliveryAddress.latitude !== 0 &&
                                sub.deliveryAddress.longitude !== 0 && (
                                  <div className="rounded-lg border overflow-hidden h-48 mt-2">
                                    <MapContainer
                                      className="w-full h-full"
                                      center={[
                                        sub.deliveryAddress.latitude,
                                        sub.deliveryAddress.longitude,
                                      ]}
                                      zoom={16}
                                      scrollWheelZoom={false}
                                    >
                                      <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                      />
                                      <Marker
                                        position={[
                                          sub.deliveryAddress.latitude,
                                          sub.deliveryAddress.longitude,
                                        ]}
                                      />
                                    </MapContainer>
                                  </div>
                                )}
                            </div>
                          )}

                          {/* Shop Location */}
                          {sub.shop?.address && (
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                              <div className="flex justify-between items-center mb-2">
                                <p className="text-xs font-bold text-gray-600 uppercase flex items-center gap-1">
                                  <FaStore className="text-orange-500" /> Shop
                                </p>
                                {typeof sub.shop.address === "object" &&
                                  sub.shop.address?.latitude &&
                                  sub.shop.address?.longitude &&
                                  sub.shop.address.latitude !== 0 &&
                                  sub.shop.address.longitude !== 0 && (
                                    <button
                                      onClick={() => toggleMap(sub._id, "shop")}
                                      className="text-xs text-orange-600 font-semibold hover:underline"
                                    >
                                      {showMaps[sub._id]?.shop
                                        ? "Hide Map"
                                        : "Show Map"}
                                    </button>
                                  )}
                              </div>
                              <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                                {typeof sub.shop.address === "string"
                                  ? sub.shop.address
                                  : sub.shop.address?.text || sub.shop.address}
                              </p>
                              {typeof sub.shop.address !== "string" &&
                                !sub.shop.address?.latitude && (
                                  <p className="text-xs text-gray-500 italic">
                                    Shop coordinates not available
                                  </p>
                                )}
                              {showMaps[sub._id]?.shop &&
                                typeof sub.shop.address === "object" &&
                                sub.shop.address.latitude &&
                                sub.shop.address.longitude && (
                                  <div className="rounded-lg border overflow-hidden h-48 mt-2">
                                    <MapContainer
                                      className="w-full h-full"
                                      center={[
                                        sub.shop.address.latitude,
                                        sub.shop.address.longitude,
                                      ]}
                                      zoom={16}
                                      scrollWheelZoom={false}
                                    >
                                      <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                      />
                                      <Marker
                                        position={[
                                          sub.shop.address.latitude,
                                          sub.shop.address.longitude,
                                        ]}
                                      />
                                    </MapContainer>
                                  </div>
                                )}
                            </div>
                          )}
                        </div>

                        <div className="text-xs text-gray-500 border-t pt-2 flex justify-between">
                          <span>
                            Start:{" "}
                            {new Date(sub.startDate).toLocaleDateString()}
                          </span>
                          <span>
                            End: {new Date(sub.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-400 text-sm text-center py-4">
                    {weeklyLoading
                      ? "Loading..."
                      : "No active weekly subscriptions assigned."}
                  </p>
                )}
              </div>
            </div>

            {/* Current Order Section */}
            {currentOrder && (
              <div className="bg-white rounded-2xl p-5 shadow-md w-[90%] border border-orange-100">
                <h2 className="text-lg font-bold mb-3">
                  📦 Current Order (Out for Delivery)
                </h2>
                <div className="border rounded-lg p-4 mb-3">
                  <p className="font-semibold text-sm">
                    {currentOrder?.shopOrder.shop.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {currentOrder.deliveryAddress.text}
                  </p>
                  <p className="text-xs text-gray-400">
                    {currentOrder.shopOrder.shopOrderItems.length} items |{" "}
                    {currentOrder.shopOrder.subtotal}
                  </p>
                </div>

                <DeliveryBoyTracking
                  data={{
                    deliveryBoyLocation: deliveryBoyLocation || {
                      lat: userData?.location?.coordinates[1],
                      lon: userData?.location?.coordinates[0],
                    },
                    customerLocation: {
                      lat: currentOrder.deliveryAddress.latitude,
                      lon: currentOrder.deliveryAddress.longitude,
                    },
                  }}
                />

                {/* Shop Location */}
                {currentOrder?.shopOrder?.shop?.address && (
                  <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <p className="text-xs font-bold text-gray-600 uppercase mb-1 flex items-center gap-1">
                      <FaStore className="text-orange-500" /> Shop Location
                    </p>
                    <p className="text-sm text-gray-700 mb-2">
                      {typeof currentOrder.shopOrder.shop.address === "string"
                        ? currentOrder.shopOrder.shop.address
                        : currentOrder.shopOrder.shop.address.text ||
                          currentOrder.shopOrder.shop.address}
                    </p>
                    {currentOrder.shopOrder.shop.address.latitude &&
                    currentOrder.shopOrder.shop.address.longitude ? (
                      <a
                        href={`https://www.google.com/maps?q=${currentOrder.shopOrder.shop.address.latitude},${currentOrder.shopOrder.shop.address.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-orange-600 text-white text-xs px-3 py-1.5 rounded font-semibold hover:bg-orange-700 transition"
                      >
                        Open in Maps
                      </a>
                    ) : (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          typeof currentOrder.shopOrder.shop.address ===
                            "string"
                            ? currentOrder.shopOrder.shop.address
                            : currentOrder.shopOrder.shop.address.text || ""
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-orange-600 text-white text-xs px-3 py-1.5 rounded font-semibold hover:bg-orange-700 transition"
                      >
                        Search in Maps
                      </a>
                    )}
                  </div>
                )}

                {!showOtpBox ? (
                  <button
                    className="mt-4 w-full bg-green-500 text-white font-semibold py-2 px-4 rounded-xl shadow-md hover:bg-green-600 active:scale-95 transition-all duration-200"
                    onClick={sendOtp}
                    disabled={loading}
                  >
                    {loading ? "Sending..." : "Mark As Delivered"}
                  </button>
                ) : (
                  <div className="mt-4 p-4 border rounded-xl bg-gray-50">
                    <p className="text-sm font-semibold mb-2">
                      Enter Otp send to{" "}
                      <span className="text-[#E60000]">
                        {currentOrder.user.fullName}
                      </span>
                    </p>
                    <input
                      type="text"
                      className="w-full border px-3 py-2 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                      placeholder="Enter OTP"
                      onChange={(e) => setOtp(e.target.value)}
                      value={otp}
                    />
                    {message && (
                      <p className="text-center text-green-400 text-2xl mb-4">
                        {message}
                      </p>
                    )}

                    <button
                      className="w-full bg-[#D40000] text-white py-2 rounded-lg font-semibold hover:bg-[#E60000] transition-all"
                      onClick={verifyOtp}
                    >
                      Submit OTP
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Available Assignments (Standard Orders) */}
            {!currentOrder && (
              <div className="bg-white rounded-2xl p-5 shadow-md w-[90%] border border-orange-100">
                <h1 className="text-lg font-bold mb-4 flex items-center gap-2">
                  Available Orders
                </h1>

                <div className="space-y-4">
                  {availableAssignments?.length > 0 ? (
                    availableAssignments.map((a, index) => (
                      <div
                        className="border rounded-lg p-4 flex justify-between items-center"
                        key={index}
                      >
                        <div>
                          <p className="text-sm font-semibold">{a?.shopName}</p>
                          <p className="text-sm text-gray-500">
                            <span className="font-semibold">
                              Delivery Address:
                            </span>{" "}
                            {a?.deliveryAddress.text}
                          </p>
                          <p className="text-xs text-gray-400">
                            {a.items.length} items | {a.subtotal}
                          </p>
                        </div>
                        <button
                          className="bg-[#D40000] text-white px-4 py-1 rounded-lg text-sm hover:bg-[#E60000]"
                          onClick={() => acceptOrder(a.assignmentId)}
                        >
                          Accept
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm">No Available Orders</p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default DeliveryBoy;
