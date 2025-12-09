

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import FoodCard from "./FoodCard";
import CategoryCard from "./CategoryCard";
import { useNavigate } from "react-router-dom";
// Icons
import {
  FaSearch,
  FaUserCircle,
  FaShoppingCart,
  FaMapMarkerAlt,
  FaClipboardList,
} from "react-icons/fa";
import { FaCalendarDays } from "react-icons/fa6"; // Added for Weekly
import { HiOutlineMenuAlt2 } from "react-icons/hi";
import { IoLogOutOutline } from "react-icons/io5";
import { BsGridFill, BsListUl } from "react-icons/bs";
import { IoOptionsOutline } from "react-icons/io5";
// Images
import rannareadylogo from "../assets/rannareadylogo.jpg";
import hero from "../assets/hero.png";
// API & Redux
import axios from "axios";
import { serverUrl } from "../App";
import { setUserData } from "../redux/userSlice";
// New Components for Weekly Plans
import WeeklyMenuCard from "./WeeklyMenuCard";
import SubscribeModal from "./SubscribeModal";

function UserDashboard() {
  // Redux State
  const { currentCity, shopInMyCity, itemsInMyCity, userData, cartItems } =
    useSelector((state) => state.user);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Local State
  const [activeTab, setActiveTab] = useState("suggested");
  const [searchTerm, setSearchTerm] = useState("");
  const [displayItems, setDisplayItems] = useState([]);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Weekly Plan States
  const [weeklyMenus, setWeeklyMenus] = useState([]);
  const [userSubscriptions, setUserSubscriptions] = useState([]);
  const [selectedMenuForSub, setSelectedMenuForSub] = useState(null); // For Modal

  // Initialize display items
  useEffect(() => {
    if (itemsInMyCity) {
      setDisplayItems(itemsInMyCity);
    }
  }, [itemsInMyCity]);

  // Fetch User's Subscriptions on mount
  useEffect(() => {
    const fetchUserSubs = async () => {
      try {
        const res = await axios.get(
          `${serverUrl}/api/weekly/user/my-subscriptions`,
          { withCredentials: true }
        );
        setUserSubscriptions(res.data);
      } catch (error) {
        console.error("Error fetching user subscriptions", error);
      }
    };
    if (userData?._id) {
      fetchUserSubs();
    }
  }, [userData]);

  // Fetch Weekly Menus when tab changes to 'weekly'
  useEffect(() => {
    if (activeTab === "weekly") {
      const fetchWeekly = async () => {
        try {
          // Fetch all menus, optionally passing currentCity if you implemented the filter
          const res = await axios.get(
            `${serverUrl}/api/weekly/all?city=${currentCity || ""}`,
            { withCredentials: true }
          );
          setWeeklyMenus(res.data);
        } catch (error) {
          console.error("Error fetching weekly plans", error);
        }
      };
      fetchWeekly();
    }
  }, [activeTab, currentCity]);

  // Search Logic
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setDisplayItems(itemsInMyCity);
    } else {
      const filtered = itemsInMyCity?.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setDisplayItems(filtered);
    }
  }, [searchTerm, itemsInMyCity]);

  // Logout Logic
  const handleLogout = async (e) => {
    e.stopPropagation();
    try {
      await axios.get(`${serverUrl}/api/auth/signout`, {
        withCredentials: true,
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      dispatch(setUserData(null));
      navigate("/signin");
    }
  };

  return (
    <div className="absolute top-0 left-0 w-full min-h-screen flex flex-col bg-[#fff9f6] z-50">
      {/* --- 1. Navbar --- */}
      <div className="w-full bg-white py-2 px-4 md:px-8 shadow-sm flex justify-between items-center z-30 sticky top-0 h-[70px]">
        {/* Left: Logo */}
        <div
          className="flex items-center cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img
            src={rannareadylogo}
            alt="RannaReady"
            className="h-12 object-contain"
          />
        </div>

        {/* Right: Menu Group */}
        <div className="flex items-center justify-end gap-6 text-gray-600">
          {/* My Orders */}
          <div
            className="hidden sm:flex items-center gap-2 cursor-pointer hover:text-[#D40000] transition font-medium text-gray-700"
            onClick={() => navigate("/my-orders")}
          >
            <FaClipboardList size={18} />
            <span>My Orders</span>
          </div>

          {/* Cart with Counter */}
          <div
            className="relative cursor-pointer hover:text-[#D40000] transition"
            onClick={() => navigate("/cart")}
          >
            <FaShoppingCart size={22} />
            {cartItems && cartItems.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#D40000] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartItems.length}
              </span>
            )}
          </div>

          {/* Profile */}
          <div className="relative">
            <div
              className="cursor-pointer text-[#D40000] hover:opacity-80 transition"
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            >
              <FaUserCircle size={32} />
            </div>

            {/* Dropdown */}
            {showProfileDropdown && (
              <div className="absolute right-0 top-12 w-56 bg-white shadow-xl rounded-lg border border-gray-100 overflow-hidden z-50 animate-fade-in">
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">
                    Signed in as
                  </p>
                  <p className="font-semibold text-gray-800 truncate text-base mt-1">
                    {userData?.fullName || "User"}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition cursor-pointer font-medium"
                >
                  <IoLogOutOutline size={20} />
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- 2. Hero Section --- */}
      <div
        className=" w-full relative px-4 flex flex-col items-center justify-start text-center shadow-md z-10 bg-center bg-no-repeat pt-8 md:pt-[10px] min-h-[400px] bg-cover md:bg-contain md:h-[460px]"
        style={{ backgroundImage: `url(${hero})`, backgroundColor: "#D40000" }}
      >
        <h1 className="text-3xl md:text-5xl font-bold text-yellow-400 tracking-wide uppercase mt-3 mb-3 drop-shadow-md font-[fantasy]">
          Discover Home-Cooked Meals
        </h1>

        <p className="text-white text-sm md:text-lg max-w-xl mb-10 opacity-95">
          Connect with talented home cooks in your neighborhood and enjoy fresh,
          delicious meals made with love.
        </p>

        {/* Search & Location */}
        <div className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-center gap-3">
          {/* Location */}
          <div className="bg-white rounded-full px-5 py-3.5 flex items-center gap-2 shadow-lg min-w-[180px] justify-center md:justify-start">
            <FaMapMarkerAlt className="text-[#D40000] text-lg" />
            <span className="text-gray-700 font-bold text-sm whitespace-nowrap">
              {currentCity || "Select Location"}
            </span>
          </div>

          {/* Search Bar */}
          <div className="w-full max-w-lg relative group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
              <HiOutlineMenuAlt2 size={22} />
            </div>
            <input
              type="text"
              placeholder="Search for your food..."
              className="w-full py-3.5 pl-14 pr-12 rounded-full outline-none text-gray-700 shadow-lg placeholder-gray-400 text-base transition-colors duration-200 bg-white focus:bg-gray-100"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (activeTab !== "suggested") setActiveTab("suggested");
              }}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full cursor-pointer text-gray-500 hover:text-[#D40000] transition">
              <FaSearch size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* --- 3. Tabs --- */}
      <div className="w-full max-w-6xl mx-auto mt-10 px-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4 border-gray-200">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                setActiveTab("suggested");
                setSearchTerm("");
              }}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm ${
                activeTab === "suggested"
                  ? "bg-[#D40000] text-white"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
            >
              Suggested Food Items
            </button>

            <button
              onClick={() => setActiveTab("shops")}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm ${
                activeTab === "shops"
                  ? "bg-[#D40000] text-white"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
            >
              Best Shop in {currentCity || "Dhaka"}
            </button>

            <button
              onClick={() => setActiveTab("weekly")}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm flex items-center gap-2 ${
                activeTab === "weekly"
                  ? "bg-[#D40000] text-white"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
            >
              <FaCalendarDays /> Weekly Plans
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[#D40000]">
            <div className="bg-white p-2 rounded shadow-sm cursor-pointer border border-gray-100">
              <BsGridFill size={20} />
            </div>
            <div className="bg-red-50 p-2 rounded shadow-sm cursor-pointer border border-red-100">
              <BsListUl size={20} />
            </div>
            <div className="bg-white p-2 rounded shadow-sm cursor-pointer border border-gray-100">
              <IoOptionsOutline size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* --- 4. Content --- */}
      <div className="w-full max-w-6xl mx-auto p-4 mb-10 min-h-[400px]">
        {/* Food Items */}
        {activeTab === "suggested" && (
          <div className="animate-fade-in">
            {searchTerm && (
              <p className="mb-4 text-gray-500 font-medium">
                Results for:{" "}
                <span className="text-[#D40000]">"{searchTerm}"</span>
              </p>
            )}
            <div className="flex flex-wrap gap-6 justify-center sm:justify-start">
              {displayItems?.length > 0 ? (
                displayItems.map((item, index) => (
                  <FoodCard key={index} data={item} />
                ))
              ) : (
                <div className="w-full text-center mt-12">
                  <p className="text-gray-400 text-xl font-medium">
                    No food items found matching your criteria.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Best Shops */}
        {activeTab === "shops" && (
          <div className="animate-fade-in">
            <div className="flex flex-wrap gap-6 justify-center sm:justify-start">
              {shopInMyCity?.length > 0 ? (
                shopInMyCity.map((shop, index) => (
                  <div
                    key={index}
                    onClick={() => navigate(`/shop/${shop._id}`)}
                  >
                    <CategoryCard name={shop.name} image={shop.image} />
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center w-full mt-10">
                  No shops found in {currentCity}.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Weekly Plans - NEW CONTENT */}
        {activeTab === "weekly" && (
          <div className="animate-fade-in">
            {weeklyMenus.length > 0 ? (
              <div className="flex flex-wrap gap-8 justify-center sm:justify-start">
                {weeklyMenus.map((menu) => {
                  // Check if user is subscribed to this menu
                  const isSubscribed = userSubscriptions.some(
                    (sub) =>
                      String(sub.menu._id) === String(menu._id) &&
                      ["pending_approval", "approved", "active"].includes(
                        sub.status
                      )
                  );

                  return (
                    <WeeklyMenuCard
                      key={menu._id}
                      menu={menu}
                      isOwner={false}
                      isSubscribed={isSubscribed}
                      onSubscribe={(m) => setSelectedMenuForSub(m)}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="w-full flex flex-col items-center justify-center h-64 bg-white rounded-2xl shadow-sm border border-gray-100">
                <FaCalendarDays className="text-gray-200 text-6xl mb-4" />
                <h2 className="text-xl font-bold text-gray-400">
                  No Weekly Plans Available Yet
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  Check back later or change your location!
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Subscribe Modal */}
      {selectedMenuForSub && (
        <SubscribeModal
          menu={selectedMenuForSub}
          // Since we populated 'shop' in the backend, menu.shop is an object. We need its _id.
          shopId={selectedMenuForSub.shop?._id}
          onClose={() => setSelectedMenuForSub(null)}
        />
      )}
    </div>
  );
}

export default UserDashboard;
