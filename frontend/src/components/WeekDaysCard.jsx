import React from "react";

function WeekDaysCard({ activeDays = [] }) {
  const allDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  return (
    <div className="grid grid-cols-7 gap-1">
      {allDays.map((day) => {
        const isActive = activeDays.includes(day);
        return (
          <div
            key={day}
            className={`flex flex-col items-center justify-center p-2 rounded-lg text-xs font-semibold transition ${
              isActive
                ? "bg-green-100 text-green-700 border border-green-300"
                : "bg-gray-200 text-gray-400"
            }`}
          >
            <span className="text-[10px] uppercase">{day.substring(0, 3)}</span>
          </div>
        );
      })}
    </div>
  );
}

export default WeekDaysCard;
