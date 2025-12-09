import React, { useState } from "react";
import {
  FaLeaf,
  FaDrumstickBite,
  FaStar,
  FaShoppingCart,
  FaMinus,
  FaPlus,
  FaStore,
} from "react-icons/fa";
import { FaRegStar } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addToCart } from "../redux/userSlice";

function FoodCard({ data }) {
  const [quantity, setQuantity] = useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const brandColor = "#D40000"; // Brand Red

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= rating ? (
          <FaStar key={i} className="text-yellow-500 text-lg" />
        ) : (
          <FaRegStar key={i} className="text-yellow-500 text-lg" />
        )
      );
    }
    return stars;
  };

  const handleIncrease = () => {
    const newQty = quantity + 1;
    setQuantity(newQty);
  };

  const handleDecrease = () => {
    if (quantity > 0) {
      const newQty = quantity - 1;
      setQuantity(newQty);
    }
  };

  const handleAddToCart = () => {
    if (quantity > 0) {
      dispatch(
        addToCart({
          id: data._id,
          name: data.name,
          price: data.price,
          image: data.image,
          shop: data.shop?._id || data.shop,
          quantity,
          foodType: data.foodType,
        })
      );
      // FIX: Reset quantity to 0 after adding
      setQuantity(0);
    }
  };

  return (
    <div className="w-[250px] rounded-2xl border border-gray-100 bg-white shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group">
      {/* Image Section */}
      <div
        className="relative w-full h-[170px] flex justify-center items-center bg-gray-50 overflow-hidden cursor-pointer"
        onClick={() => navigate(`/shop/${data.shop._id || data.shop}`)}
      >
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm rounded-lg px-2 py-1 shadow-sm z-10 flex items-center gap-1">
          <FaStore className="text-[#D40000] text-xs" />
          <span className="text-xs font-semibold text-gray-700 truncate max-w-[100px]">
            {data.shop?.name || "Shop"}
          </span>
        </div>
        <div className="absolute top-3 right-3 bg-white rounded-full p-1.5 shadow-sm z-10">
          {data.foodType == "veg" ? (
            <FaLeaf className="text-green-600 text-sm" />
          ) : (
            <FaDrumstickBite className="text-red-600 text-sm" />
          )}
        </div>
        <img
          src={data.image}
          alt=""
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      {/* Content Section */}
      <div className="flex-1 flex flex-col p-4">
        <h1 className="font-bold text-gray-900 text-base truncate mb-1">
          {data.name}
        </h1>

        <div className="flex items-center gap-1">
          {renderStars(data.rating?.average || 0)}
          <span className="text-xs text-gray-500 ml-1">
            ({data.rating?.count || 0})
          </span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between mt-auto p-4 pt-0">
        <span className="font-bold text-gray-900 text-lg">৳{data.price}</span>

        <div className="flex items-center border border-gray-200 rounded-full overflow-hidden shadow-sm bg-white">
          <button
            className="px-2.5 py-1.5 hover:bg-gray-100 transition text-gray-600"
            onClick={handleDecrease}
          >
            <FaMinus size={10} />
          </button>

          <span className="w-6 text-center text-sm font-semibold text-gray-700">
            {quantity}
          </span>

          <button
            className="px-2.5 py-1.5 hover:bg-gray-100 transition text-gray-600"
            onClick={handleIncrease}
          >
            <FaPlus size={10} />
          </button>

          {/* Add Button - Always Red, does not turn Gray */}
          <button
            className={`text-white px-3 py-2 transition-colors duration-200 ml-1`}
            style={{ backgroundColor: brandColor }}
            onClick={handleAddToCart}
            disabled={quantity === 0} // Optional: Disable if 0 to prevent empty adds, but keep color
          >
            <FaShoppingCart size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default FoodCard;
