
import React, { useState } from 'react';
import { IoIosArrowRoundBack } from "react-icons/io";
import { useDispatch } from 'react-redux'; 
import { useNavigate } from 'react-router-dom';
import { FaUtensils, FaCloudUploadAlt } from "react-icons/fa";
import axios from 'axios';
import { serverUrl } from '../App';
import { setMyShopData } from '../redux/ownerSlice';
import { ClipLoader } from 'react-spinners';

function AddItem() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [frontendImage, setFrontendImage] = useState(null);
    const [backendImage, setBackendImage] = useState(null);
    const [category, setCategory] = useState("");
    const [foodType, setFoodType] = useState("veg");
    
    const brandColor = "#D40000";

    const categories = [
        "Snacks", "Main Course", "Desserts", "Pizza", "Burgers", 
        "Sandwiches", "Others"
    ];

    const handleImage = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBackendImage(file);
            setFrontendImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("category", category);
            formData.append("foodType", foodType);
            formData.append("price", price);
            if (backendImage) {
                formData.append("image", backendImage);
            }
            const result = await axios.post(`${serverUrl}/api/item/add-item`, formData, { withCredentials: true });
            dispatch(setMyShopData(result.data));
            setLoading(false);
            navigate("/");
        } catch (error) {
            console.log(error);
            setLoading(false);
        }
    };

    return (
        <div className='min-h-screen bg-[#fff9f6] py-10 px-4 flex justify-center items-center'>
            
            <div className='max-w-xl w-full bg-white shadow-2xl rounded-2xl p-8 border border-gray-100 relative'>
                
                {/* Back Button */}
                <div 
                    className='absolute top-6 left-6 p-2 rounded-full hover:bg-gray-100 transition duration-200 cursor-pointer' 
                    onClick={() => navigate("/")}
                >
                    <IoIosArrowRoundBack size={35} style={{ color: brandColor }} />
                </div>

                {/* Header */}
                <div className='flex flex-col items-center mb-8 mt-4'>
                    <div className='w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 shadow-sm'>
                        <FaUtensils size={28} style={{ color: brandColor }} />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Add Food Item</h1>
                    <p className='text-gray-500 mt-2 text-sm'>Expand your menu with delicious options</p>
                </div>

                <form className='space-y-6' onSubmit={handleSubmit}>
                    
                    {/* Name Input */}
                    <div>
                        <label className='block text-sm font-semibold text-gray-700 mb-2 ml-1'>Dish Name</label>
                        <input 
                            type="text" 
                            placeholder='e.g. Chicken Biryani' 
                            className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-100 transition-all bg-white text-gray-800'
                            style={{ borderColor: '#e5e7eb' }}
                            onFocus={(e) => e.target.style.borderColor = brandColor}
                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                            onChange={(e) => setName(e.target.value)}
                            value={name}
                            required
                        />
                    </div>

                    {/* Image Upload Area */}
                    <div>
                        <label className='block text-sm font-semibold text-gray-700 mb-2 ml-1'>Food Image</label>
                        <label 
                            htmlFor="food-image-upload" 
                            className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors relative overflow-hidden ${frontendImage ? 'border-red-200' : 'border-gray-300'}`}
                        >
                            {frontendImage ? (
                                <img src={frontendImage} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <FaCloudUploadAlt size={32} className="text-gray-400 mb-3" />
                                    <p className="text-sm text-gray-500"><span className="font-semibold" style={{color: brandColor}}>Click to upload</span> photo</p>
                                    <p className="text-xs text-gray-400">SVG, PNG, JPG or GIF</p>
                                </div>
                            )}
                            <input id="food-image-upload" type="file" accept='image/*' className="hidden" onChange={handleImage} />
                        </label>
                    </div>

                    {/* Price Input */}
                    <div>
                        <label className='block text-sm font-semibold text-gray-700 mb-2 ml-1'>Price (₹)</label>
                        <input 
                            type="number" 
                            placeholder='0' 
                            className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-100 transition-all bg-white text-gray-800'
                            onFocus={(e) => e.target.style.borderColor = brandColor}
                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                            onChange={(e) => setPrice(e.target.value)}
                            value={price}
                            required
                        />
                    </div>

                    {/* Category & Type Grid */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        {/* Category Select */}
                        <div>
                            <label className='block text-sm font-semibold text-gray-700 mb-2 ml-1'>Category</label>
                            <div className="relative">
                                <select 
                                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-100 transition-all bg-white text-gray-800 appearance-none'
                                    onFocus={(e) => e.target.style.borderColor = brandColor}
                                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                    onChange={(e) => setCategory(e.target.value)}
                                    value={category}
                                    required
                                >
                                    <option value="" disabled>Select Category</option>
                                    {categories.map((cate, index) => (
                                        <option value={cate} key={index}>{cate}</option>
                                    ))}
                                </select>
                                {/* Custom Arrow */}
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                </div>
                            </div>
                        </div>

                        {/* Food Type Select */}
                        <div>
                            <label className='block text-sm font-semibold text-gray-700 mb-2 ml-1'>Food Type</label>
                            <div className="flex gap-2 bg-gray-50 p-1.5 rounded-lg border border-gray-200">
                                <button
                                    type="button"
                                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${foodType === 'veg' ? 'bg-white text-green-600 shadow-sm border border-gray-100' : 'text-gray-500 hover:bg-white/50'}`}
                                    onClick={() => setFoodType('veg')}
                                >
                                    Veg
                                </button>
                                <button
                                    type="button"
                                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${foodType === 'non veg' ? 'bg-white text-red-600 shadow-sm border border-gray-100' : 'text-gray-500 hover:bg-white/50'}`}
                                    onClick={() => setFoodType('non veg')}
                                >
                                    Non-Veg
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button 
                        className='w-full text-white font-bold py-3.5 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 mt-6 flex justify-center items-center'
                        style={{ backgroundColor: brandColor }}
                        disabled={loading}
                    >
                        {loading ? <ClipLoader size={24} color='white' /> : "Save Item"}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default AddItem