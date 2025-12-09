

import React, { useEffect, useState } from 'react'
import { FaLocationDot, FaPlus } from "react-icons/fa6";
import { IoIosSearch } from "react-icons/io";
import { FiShoppingCart } from "react-icons/fi";
import { useDispatch, useSelector } from 'react-redux';
import { RxCross2 } from "react-icons/rx";
import axios from 'axios';
import { serverUrl } from '../App';
import { setSearchItems, setUserData } from '../redux/userSlice';
import { TbReceipt2 } from "react-icons/tb";
import { IoLogOutOutline } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import rannareadylogo from '../assets/rannareadylogo.jpg'

function Nav() {
    const { userData, currentCity, cartItems } = useSelector(state => state.user)
    const { myShopData } = useSelector(state => state.owner)
    
    const [showInfo, setShowInfo] = useState(false)
    const [showSearch, setShowSearch] = useState(false)
    const [query, setQuery] = useState("")
    
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const brandColor = "#D40000";

    const handleLogOut = async () => {
        try {
            await axios.get(`${serverUrl}/api/auth/signout`, { withCredentials: true })
            dispatch(setUserData(null))
            navigate('/signin')
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        const handleSearchItems = async () => {
            try {
                const result = await axios.get(`${serverUrl}/api/item/search-items?query=${query}&city=${currentCity}`, { withCredentials: true })
                dispatch(setSearchItems(result.data))
            } catch (error) {
                console.log(error)
            }
        }

        if (query) {
            handleSearchItems()
        } else {
            dispatch(setSearchItems(null))
        }
    }, [query, dispatch, currentCity])

    // Helper to get name safely
    const getUserName = () => {
        return userData?.fullName || (userData?.user && userData?.user.fullName) || "User";
    }

    return (
        <div className='w-full h-[80px] flex items-center justify-between md:justify-between gap-[30px] px-[30px] fixed top-0 z-[9999] bg-white shadow-sm'>

            {/* --- Mobile Search Bar Overlay --- */}
            {showSearch && userData?.role === "user" && (
                <div className='w-[90%] h-[70px] bg-white shadow-xl rounded-lg items-center gap-[15px] flex fixed top-[85px] left-[5%] md:hidden border border-gray-100 z-50 p-2'>
                    <div className='flex items-center w-[35%] overflow-hidden gap-[8px] px-[8px] border-r border-gray-200'>
                        <FaLocationDot size={18} style={{ color: brandColor }} />
                        <div className='truncate text-gray-600 text-sm font-medium'>{currentCity}</div>
                    </div>
                    <div className='flex-1 flex items-center gap-[10px]'>
                        <IoIosSearch size={22} style={{ color: brandColor }} />
                        <input 
                            type="text" 
                            placeholder='Search food...' 
                            className='text-gray-700 outline-none w-full text-sm' 
                            onChange={(e) => setQuery(e.target.value)} 
                            value={query}
                        />
                    </div>
                </div>
            )}

            {/* --- Logo --- */}
            <div className='flex-shrink-0 cursor-pointer' onClick={() => navigate('/')}>
                <img src={rannareadylogo} alt="RannaReady" className="h-10 md:h-12 object-contain" />
            </div>

            {/* --- Desktop Search Bar (User Only) --- */}
            {userData?.role === "user" && (
                <div className='hidden md:flex md:w-[45%] lg:w-[40%] h-[50px] bg-gray-50 border border-gray-200 rounded-full items-center px-4 gap-4 transition-all focus-within:bg-white focus-within:shadow-md focus-within:border-gray-300 mx-auto'>
                    <div className='flex items-center gap-2 border-r border-gray-300 pr-4'>
                        <FaLocationDot size={18} style={{ color: brandColor }} />
                        <div className='truncate text-gray-600 text-sm font-medium max-w-[100px]'>{currentCity || "Dhaka"}</div>
                    </div>
                    <div className='flex-1 flex items-center gap-2'>
                        <IoIosSearch size={20} className='text-gray-400' />
                        <input 
                            type="text" 
                            placeholder='Search for delicious food...' 
                            className='bg-transparent outline-none w-full text-sm text-gray-700 placeholder-gray-400' 
                            onChange={(e) => setQuery(e.target.value)} 
                            value={query}
                        />
                    </div>
                </div>
            )}

            {/* --- Right Actions Group (Spread Out Icons) --- */}
            <div className='flex items-center gap-6 md:gap-8'> {/* Increased spacing here */}
                
                {/* Mobile Search Toggle */}
                {userData?.role === "user" && (
                    showSearch 
                    ? <RxCross2 size={24} style={{ color: brandColor }} className='md:hidden cursor-pointer' onClick={() => setShowSearch(false)} /> 
                    : <IoIosSearch size={24} style={{ color: brandColor }} className='md:hidden cursor-pointer' onClick={() => setShowSearch(true)} />
                )}

                {/* Owner Actions */}
                {userData?.role === "owner" ? (
                    <>
                        {myShopData && (
                            <>
                                {/* Desktop Add Item Button */}
                                <button 
                                    className='hidden md:flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors duration-200 hover:bg-red-50'
                                    style={{ color: brandColor, backgroundColor: 'rgba(212, 0, 0, 0.08)' }}
                                    onClick={() => navigate("/add-item")}
                                >
                                    <FaPlus size={16} />
                                    <span>Add Item</span>
                                </button>
                                
                                {/* Mobile Add Item Icon */}
                                <button 
                                    className='md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-red-50'
                                    style={{ color: brandColor }} 
                                    onClick={() => navigate("/add-item")}
                                >
                                    <FaPlus size={18} />
                                </button>
                            </>
                        )}

                        {/* My Orders Button */}
                        <div 
                            className='flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg hover:bg-gray-100 transition'
                            onClick={() => navigate("/my-orders")}
                        >
                            <TbReceipt2 size={24} className='text-gray-600' />
                            <span className='hidden md:block text-gray-700 font-medium'>Orders</span>
                        </div>
                    </>
                ) : (
                    /* User Actions */
                    <>
                        {userData?.role === "user" && (
                            <div className='relative cursor-pointer hover:opacity-80 transition' onClick={() => navigate("/cart")}>
                                <FiShoppingCart size={26} style={{ color: brandColor }} />
                                {cartItems?.length > 0 && (
                                    <span 
                                        className='absolute -top-2 -right-2 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center'
                                        style={{ backgroundColor: brandColor }}
                                    >
                                        {cartItems.length}
                                    </span>
                                )}
                            </div>
                        )}

                        <button 
                            className='hidden md:block font-medium text-gray-600 hover:text-gray-900 transition' 
                            onClick={() => navigate("/my-orders")}
                        >
                            My Orders
                        </button>
                    </>
                )}

                {/* Profile Avatar */}
                <div className='relative'>
                    <div 
                        className='w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-md cursor-pointer hover:opacity-90 transition'
                        style={{ backgroundColor: brandColor }}
                        onClick={() => setShowInfo(prev => !prev)}
                    >
                        {userData?.fullName?.charAt(0).toUpperCase()}
                    </div>

                    {/* Profile Dropdown */}
                    {showInfo && (
                        <div className={`fixed top-[75px] right-[20px] w-[220px] bg-white shadow-xl rounded-xl border border-gray-100 overflow-hidden z-[9999] animate-fade-in`}>
                            <div className='px-5 py-4 border-b border-gray-100 bg-gray-50'>
                                <p className='text-xs text-gray-400 uppercase font-bold tracking-wider mb-1'>Signed in as</p>
                                <div className='text-gray-800 font-semibold truncate'>{getUserName()}</div>
                            </div>
                            
                            {userData?.role === "user" && (
                                <div 
                                    className='md:hidden px-5 py-3 text-gray-700 font-medium hover:bg-gray-50 cursor-pointer border-b border-gray-100 flex items-center gap-2' 
                                    onClick={() => navigate("/my-orders")}
                                >
                                    <TbReceipt2 size={18}/> My Orders
                                </div>
                            )}
                            
                            <div 
                                className='px-5 py-3 text-red-600 font-medium hover:bg-red-50 cursor-pointer flex items-center gap-2 transition' 
                                onClick={handleLogOut}
                            >
                                <IoLogOutOutline size={20}/> Log Out
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Nav