import React, { useState, useEffect } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { IoSearchOutline } from "react-icons/io5";
import { TbCurrentLocation } from "react-icons/tb";
import "leaflet/dist/leaflet.css";
//import { useSelector } from 'react-redux';

function RecenterMap({ location }) {
  const map = useMap();

  useEffect(() => {
    if (location.lat && location.lon) {
      map.setView([location.lat, location.lon], 16, { animate: true });
    }
  }, [location.lat, location.lon, map]);

  return null;
}

function SubscribeModal({ menu, shopId, onClose }) {
  // const { userData } = useSelector((state) => state.user);
  const [allergies, setAllergies] = useState("None");
  const [address, setAddress] = useState("");
  const [startDate, setStartDate] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("12:00");
  const [selectedDays, setSelectedDays] = useState({
    Monday: true,
    Tuesday: true,
    Wednesday: true,
    Thursday: true,
    Friday: true,
    Saturday: false,
    Sunday: false,
  });
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState({ lat: 23.8103, lon: 90.4125 }); // Default Dhaka
  const [showMap, setShowMap] = useState(false);
  const apiKey = import.meta.env.VITE_GEOAPIKEY;

  const toggleDay = (day) => {
    setSelectedDays((prev) => ({ ...prev, [day]: !prev[day] }));
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

  const handleSubscribe = async () => {
    const deliveryDays = Object.keys(selectedDays).filter(
      (day) => selectedDays[day]
    );

    if (!startDate || !address) return alert("Please fill all fields");
    if (deliveryDays.length === 0)
      return alert("Please select at least one delivery day");

    try {
      setLoading(true);
      // NOTE: Ensure the route /api/weekly/subscribe exists in your backend
      await axios.post(
        `${serverUrl}/api/weekly/subscribe`,
        {
          menuId: menu._id,
          shopId: shopId,
          allergies,
          deliveryAddress: {
            text: address,
            latitude: location.lat,
            longitude: location.lon,
          },
          startDate,
          deliveryTime,
          deliveryDays,
          paymentMethod: "cod",
        },
        { withCredentials: true }
      );

      alert("Subscription Request Sent!");
      onClose();
    } catch (error) {
      console.error(error);
      alert("Subscription failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-1">Confirm Subscription</h2>
        <p className="text-gray-500 mb-4 text-sm">
          You are subscribing to{" "}
          <span className="font-semibold text-black">{menu.name}</span>
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">
              Start Date
            </label>
            <input
              type="date"
              className="w-full p-2 border rounded-lg"
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase block mb-2">
              Delivery Days
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.keys(selectedDays).map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`py-2 px-3 rounded-lg text-sm font-semibold transition ${
                    selectedDays[day]
                      ? "bg-[#D40000] text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {day.substring(0, 3)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">
              Delivery Time
            </label>
            <input
              type="time"
              className="w-full p-2 border rounded-lg"
              value={deliveryTime}
              onChange={(e) => setDeliveryTime(e.target.value)}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-gray-500 uppercase">
                Delivery Address
              </label>
              <button
                type="button"
                onClick={() => setShowMap(!showMap)}
                className="text-xs text-[#D40000] font-semibold hover:underline"
              >
                {showMap ? "Hide Map" : "Show Map"}
              </button>
            </div>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                className="flex-1 p-2 border rounded-lg text-sm"
                placeholder="Enter delivery address..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              <button
                type="button"
                className="bg-[#D40000] hover:bg-[#B30000] text-white px-3 rounded-lg"
                onClick={getLatLngByAddress}
              >
                <IoSearchOutline size={17} />
              </button>
              <button
                type="button"
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 rounded-lg"
                onClick={getCurrentLocation}
              >
                <TbCurrentLocation size={17} />
              </button>
            </div>
            {showMap && (
              <div className="rounded-lg border overflow-hidden h-48">
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

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">
              Allergies / Notes
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded-lg"
              placeholder="e.g. No Peanuts"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
            />
          </div>

          <div className="bg-orange-50 p-3 rounded-lg flex justify-between items-center text-sm">
            <span className="text-gray-700">Total (Pay on First Delivery)</span>
            <span className="font-bold text-lg">৳{menu.pricePerWeek}</span>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-gray-300 font-semibold text-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="flex-1 py-2 rounded-lg bg-[#D40000] text-white font-bold shadow-md"
            >
              {loading ? "Processing..." : "Confirm"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubscribeModal;
