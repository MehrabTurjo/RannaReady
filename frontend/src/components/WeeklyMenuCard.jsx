import React, { useState } from "react";
import {
  FaLeaf,
  FaDrumstickBite,
  FaChevronDown,
  FaChevronUp,
  FaPen,
  FaStore,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function WeeklyMenuCard({ menu, isOwner, isSubscribed, onSubscribe }) {
  const navigate = useNavigate();
  const [showSchedule, setShowSchedule] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 w-full max-w-sm flex flex-col">
      <div
        className="h-48 overflow-hidden relative shrink-0 cursor-pointer"
        onClick={() =>
          !isOwner && navigate(`/shop/${menu.shop._id || menu.shop}`)
        }
      >
        <img
          src={menu.image}
          alt={menu.name}
          className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm rounded-lg px-2 py-1.5 shadow-sm z-10 flex items-center gap-1.5">
          <FaStore className="text-[#D40000] text-sm" />
          <span className="text-sm font-semibold text-gray-700 truncate max-w-[150px]">
            {menu.shop?.name || "Shop"}
          </span>
        </div>
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1">
          {menu.category === "Veg" ? (
            <FaLeaf className="text-green-500" />
          ) : (
            <FaDrumstickBite className="text-red-500" />
          )}
          {menu.category}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-gray-800 leading-tight">
            {menu.name}
          </h3>
          <span className="text-lg font-bold text-[#D40000]">
            ৳{menu.pricePerWeek}
          </span>
        </div>
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">
          {menu.description}
        </p>

        {/* Schedule Dropdown */}
        <div className="mb-4 flex-1">
          <button
            onClick={() => setShowSchedule(!showSchedule)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#D40000] font-medium transition"
          >
            {showSchedule ? (
              <>
                <FaChevronUp /> Hide Weekly Schedule
              </>
            ) : (
              <>
                <FaChevronDown /> View Weekly Schedule
              </>
            )}
          </button>

          {showSchedule && (
            <div className="mt-3 bg-gray-50 p-3 rounded-lg space-y-2 text-sm">
              {menu.weeklySchedule.map((day) => (
                <div
                  key={day._id || day.day}
                  className="flex gap-2 border-b border-gray-200 last:border-0 pb-1 last:pb-0"
                >
                  <span className="font-bold text-gray-700 w-20">
                    {day.day}:
                  </span>
                  <span className="text-gray-600 truncate">
                    {day.description}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {isOwner ? (
          <button
            onClick={() => navigate(`/edit-weekly-menu/${menu._id}`)}
            className="w-full py-2.5 bg-gray-700 text-white rounded-lg font-semibold shadow-md hover:bg-gray-800 transition flex items-center justify-center gap-2"
          >
            <FaPen size={14} /> Edit Menu
          </button>
        ) : isSubscribed ? (
          <button
            disabled
            className="w-full py-2.5 bg-green-600 text-white rounded-lg font-semibold shadow-md cursor-not-allowed flex items-center justify-center gap-2"
          >
            ✓ Subscribed
          </button>
        ) : (
          <button
            onClick={() => onSubscribe(menu)}
            className="w-full py-2.5 bg-[#D40000] text-white rounded-lg font-semibold shadow-md hover:bg-[#b00000] transition"
          >
            Subscribe Now
          </button>
        )}
      </div>
    </div>
  );
}

export default WeeklyMenuCard;
