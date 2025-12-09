import React, { useState, useEffect } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaStore } from "react-icons/fa";
import { IoSearchOutline } from "react-icons/io5";
import { TbCurrentLocation } from "react-icons/tb";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import axios from "axios";
import { serverUrl } from "../App";
import { setMyShopData } from "../redux/ownerSlice";
import { ClipLoader } from "react-spinners";
import "leaflet/dist/leaflet.css";

function RecenterMap({ location }) {
  const map = useMap();

  useEffect(() => {
    if (location.lat && location.lon) {
      map.setView([location.lat, location.lon], 16, { animate: true });
    }
  }, [location.lat, location.lon, map]);

  return null;
}

function CreateEditShop() {
  const navigate = useNavigate();
  const { myShopData } = useSelector((state) => state.owner);
  const { currentCity, currentState, currentAddress } = useSelector(
    (state) => state.user
  );

  const [name, setName] = useState(myShopData?.name || "");
  const [address, setAddress] = useState(
    typeof myShopData?.address === "string"
      ? myShopData.address
      : myShopData?.address?.text || currentAddress || ""
  );
  const [city, setCity] = useState(myShopData?.city || currentCity || "");
  const [state, setState] = useState(myShopData?.state || currentState || "");
  const [frontendImage, setFrontendImage] = useState(myShopData?.image || null);
  const [backendImage, setBackendImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState({
    lat:
      typeof myShopData?.address === "object" &&
      myShopData.address.latitude !== 0
        ? myShopData.address.latitude
        : 23.8103,
    lon:
      typeof myShopData?.address === "object" &&
      myShopData.address.longitude !== 0
        ? myShopData.address.longitude
        : 90.4125,
  });
  const [showMap, setShowMap] = useState(false);
  const apiKey = import.meta.env.VITE_GEOAPIKEY;

  const dispatch = useDispatch();
  const brandColor = "#D40000";

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBackendImage(file);
      setFrontendImage(URL.createObjectURL(file));
    }
  };

  const onDragEnd = (e) => {
    const { lat, lng } = e.target._latlng;
    setLocation({ lat, lon: lng });
    getAddressByLatLng(lat, lng);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          setLocation({ lat: latitude, lon: longitude });
          getAddressByLatLng(latitude, longitude);
        },
        (error) => console.log(error)
      );
    }
  };

  const getAddressByLatLng = async (lat, lng) => {
    try {
      const result = await axios.get(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&format=json&apiKey=${apiKey}`
      );
      setAddress(result?.data?.results[0].address_line2 || "");
    } catch (error) {
      console.log(error);
    }
  };

  const getLatLngByAddress = async () => {
    try {
      const result = await axios.get(
        `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
          address
        )}&apiKey=${apiKey}`
      );
      const { lat, lon } = result.data.features[0].properties;
      setLocation({ lat, lon });
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("city", city);
      formData.append("state", state);
      formData.append("address", address);
      formData.append("latitude", location.lat);
      formData.append("longitude", location.lon);
      if (backendImage) {
        formData.append("image", backendImage);
      }
      const result = await axios.post(
        `${serverUrl}/api/shop/create-edit`,
        formData,
        { withCredentials: true }
      );
      dispatch(setMyShopData(result.data));
      setLoading(false);
      navigate("/");
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fff9f6] py-10 px-4 flex justify-center items-center">
      <div className="max-w-xl w-full bg-white shadow-2xl rounded-2xl p-8 border border-gray-100 relative">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="absolute top-6 left-6 p-2 rounded-full hover:bg-gray-100 transition duration-200"
        >
          <IoIosArrowRoundBack size={35} style={{ color: brandColor }} />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center mb-8 mt-4">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 shadow-sm">
            <FaStore size={30} style={{ color: brandColor }} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {myShopData ? "Edit Restaurant" : "Add Restaurant"}
          </h1>
          <p className="text-gray-500 mt-2 text-center text-sm">
            {myShopData
              ? "Update your kitchen details below"
              : "Let's set up your kitchen profile to start selling."}
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Shop Image Upload Area */}
          <div className="flex flex-col items-center justify-center w-full">
            <label
              htmlFor="dropzone-file"
              className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors relative overflow-hidden ${
                frontendImage ? "border-red-200" : "border-gray-300"
              }`}
            >
              {frontendImage ? (
                <img
                  src={frontendImage}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className="w-8 h-8 mb-4 text-gray-400"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 16"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                    />
                  </svg>
                  <p className="text-sm text-gray-500">
                    <span
                      className="font-semibold"
                      style={{ color: brandColor }}
                    >
                      Click to upload
                    </span>{" "}
                    shop image
                  </p>
                  <p className="text-xs text-gray-400">SVG, PNG, JPG or GIF</p>
                </div>
              )}
              <input
                id="dropzone-file"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImage}
              />
            </label>
            {frontendImage && (
              <p className="text-xs text-gray-400 mt-2">
                Click image to change
              </p>
            )}
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
              Restaurant Name
            </label>
            <input
              type="text"
              placeholder="e.g. Grandma`s Kitchen"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-100 transition-all bg-white text-gray-800"
              style={{ borderColor: "#e5e7eb" }}
              onFocus={(e) => (e.target.style.borderColor = brandColor)}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
              onChange={(e) => setName(e.target.value)}
              value={name}
              required
            />
          </div>

          {/* City & State Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
                City
              </label>
              <input
                type="text"
                placeholder="Dhaka"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-100 transition-all bg-white text-gray-800"
                onFocus={(e) => (e.target.style.borderColor = brandColor)}
                onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                onChange={(e) => setCity(e.target.value)}
                value={city}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
                Area/State
              </label>
              <input
                type="text"
                placeholder="Gulshan"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-100 transition-all bg-white text-gray-800"
                onFocus={(e) => (e.target.style.borderColor = brandColor)}
                onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                onChange={(e) => setState(e.target.value)}
                value={state}
                required
              />
            </div>
          </div>

          {/* Address Input with Map */}
          <div>
            <div className="flex justify-between items-center mb-2 ml-1">
              <label className="block text-sm font-semibold text-gray-700">
                Full Address
              </label>
              <button
                type="button"
                onClick={() => setShowMap(!showMap)}
                className="text-xs font-semibold hover:underline"
                style={{ color: brandColor }}
              >
                {showMap ? "Hide Map" : "Show Map"}
              </button>
            </div>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="House No, Road No, Block..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-100 transition-all bg-white text-gray-800"
                onFocus={(e) => (e.target.style.borderColor = brandColor)}
                onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                onChange={(e) => setAddress(e.target.value)}
                value={address}
                required
              />
              <button
                type="button"
                className="px-3 py-2 rounded-lg text-white hover:opacity-90 transition"
                style={{ backgroundColor: brandColor }}
                onClick={getLatLngByAddress}
              >
                <IoSearchOutline size={20} />
              </button>
              <button
                type="button"
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg transition"
                onClick={getCurrentLocation}
              >
                <TbCurrentLocation size={20} />
              </button>
            </div>
            {showMap && (
              <div className="rounded-lg border overflow-hidden h-64 mb-2">
                <MapContainer
                  className="w-full h-full"
                  center={[location.lat, location.lon]}
                  zoom={16}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <RecenterMap location={location} />
                  <Marker
                    position={[location.lat, location.lon]}
                    draggable
                    eventHandlers={{ dragend: onDragEnd }}
                  />
                </MapContainer>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            className="w-full text-white font-bold py-3.5 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 mt-4 flex justify-center items-center"
            style={{ backgroundColor: brandColor }}
            disabled={loading}
          >
            {loading ? (
              <ClipLoader size={24} color="white" />
            ) : myShopData ? (
              "Save Changes"
            ) : (
              "Create Restaurant"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateEditShop;
