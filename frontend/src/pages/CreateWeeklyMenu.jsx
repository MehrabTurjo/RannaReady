import React, { useState } from "react";
import axios from "axios";
import { serverUrl } from "../App"; // Importing from src/App.jsx
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaCalendarAlt, FaArrowLeft } from "react-icons/fa";
import Nav from "../components/Nav";

function CreateWeeklyMenu() {
  const { myShopData } = useSelector((state) => state.owner);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [frontendImage, setFrontendImage] = useState(null);
  const [backendImage, setBackendImage] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    pricePerWeek: "",
    category: "Veg",
    weeklySchedule: [
      { day: "Monday", description: "" },
      { day: "Tuesday", description: "" },
      { day: "Wednesday", description: "" },
      { day: "Thursday", description: "" },
      { day: "Friday", description: "" },
      { day: "Saturday", description: "" },
      { day: "Sunday", description: "" },
    ],
  });

  const handleScheduleChange = (index, value) => {
    const updatedSchedule = [...formData.weeklySchedule];
    updatedSchedule[index].description = value;
    setFormData({ ...formData, weeklySchedule: updatedSchedule });
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    setBackendImage(file);
    setFrontendImage(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!myShopData?._id) return alert("Shop not found");

    try {
      setLoading(true);
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("description", formData.description);
      submitData.append("pricePerWeek", formData.pricePerWeek);
      submitData.append("category", formData.category);
      submitData.append(
        "weeklySchedule",
        JSON.stringify(formData.weeklySchedule)
      );
      if (backendImage) {
        submitData.append("image", backendImage);
      }

      await axios.post(
        `${serverUrl}/api/weekly/menu/${myShopData._id}`,
        submitData,
        { withCredentials: true }
      );
      setLoading(false);
      navigate("/owner-dashboard");
    } catch (error) {
      console.error(error);
      setLoading(false);
      alert("Failed to create menu");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-[90px] pb-10">
      <Nav />
      <div className="max-w-4xl mx-auto px-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 mb-6 hover:text-black"
        >
          <FaArrowLeft /> Back to Dashboard
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-10">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FaCalendarAlt className="text-[#D40000]" /> Create Weekly Plan
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plan Name
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Corporate Lunch"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-200 outline-none"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weekly Price (৳)
                </label>
                <input
                  required
                  type="number"
                  placeholder="e.g. 1500"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-200 outline-none"
                  value={formData.pricePerWeek}
                  onChange={(e) =>
                    setFormData({ ...formData, pricePerWeek: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-200 outline-none"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                >
                  <option value="Veg">Veg</option>
                  <option value="Non-Veg">Non-Veg</option>
                  <option value="Diet">Diet</option>
                  <option value="Premium">Premium</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cover Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-200 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                  onChange={handleImage}
                />
              </div>
            </div>

            {frontendImage && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image Preview
                </label>
                <img
                  src={frontendImage}
                  alt="Cover preview"
                  className="w-full h-48 object-cover rounded-lg border"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                required
                rows="2"
                placeholder="Brief description of this plan..."
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-200 outline-none"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            {/* Weekly Schedule Inputs */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Weekly Menu Schedule
              </h3>
              <div className="grid gap-4">
                {formData.weeklySchedule.map((dayItem, index) => (
                  <div
                    key={dayItem.day}
                    className="flex flex-col sm:flex-row gap-3 items-start sm:items-center"
                  >
                    <span className="w-28 font-medium text-gray-700 bg-gray-100 py-2 px-3 rounded-md text-center">
                      {dayItem.day}
                    </span>
                    <input
                      type="text"
                      required
                      placeholder={`What's on the menu for ${dayItem.day}?`}
                      className="flex-1 p-2 border rounded-md focus:border-red-500 outline-none"
                      value={dayItem.description}
                      onChange={(e) =>
                        handleScheduleChange(index, e.target.value)
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#D40000] text-white rounded-xl font-bold hover:bg-[#b00000] transition"
            >
              {loading ? "Creating..." : "Create Weekly Menu"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateWeeklyMenu;
