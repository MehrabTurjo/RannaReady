


import React from 'react'
import { IoIosArrowRoundBack } from "react-icons/io";
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import CartItemCard from '../components/CartItemCard';

function CartPage() {
    const navigate = useNavigate()
    const { cartItems, totalAmount } = useSelector(state => state.user)
    
    // Brand Color
    const brandColor = "#D40000";

    return (
        <div className='min-h-screen bg-[#fff9f6] flex justify-center p-4 md:p-6 pt-8'>
            <div className='w-full max-w-[800px]'>
                
                {/* Header - Compact */}
                <div className='flex items-center gap-2 mb-6'>
                    <div 
                        className='cursor-pointer hover:opacity-80 transition flex items-center justify-center' 
                        onClick={() => navigate("/")}
                    >
                        <IoIosArrowRoundBack size={35} style={{ color: brandColor }} />
                    </div>
                    <h1 className='text-2xl font-bold text-gray-900'>Your Cart</h1>
                </div>

                {/* Content */}
                {(!cartItems || cartItems.length === 0) ? (
                    <div className='flex flex-col items-center justify-center mt-16 animate-fade-in'>
                        <div className='bg-white p-6 rounded-full shadow-sm mb-4 border border-dashed border-gray-200'>
                            <span className='text-4xl'>🛒</span>
                        </div>
                        <p className='text-gray-800 text-lg font-bold mb-1'>Your Cart is Empty</p>
                        <p className='text-gray-500 text-sm mb-6'>Add some delicious items to get started.</p>
                        <button 
                            className='px-6 py-2 rounded-lg text-sm font-semibold border transition hover:bg-red-50'
                            style={{ borderColor: brandColor, color: brandColor }}
                            onClick={() => navigate("/")}
                        >
                            Browse Food
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Cart Items List */}
                        <div className='space-y-4 mb-24'>
                            {cartItems?.map((item, index) => (
                                <CartItemCard data={item} key={index} />
                            ))}
                        </div>

                        {/* Order Summary & Checkout - Refined & Proportionate */}
                        <div className='fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] p-4'>
                            <div className='max-w-[800px] mx-auto flex items-center justify-between'>
                                
                                {/* Total Amount Display */}
                                <div className='flex flex-col'>
                                    <span className='text-xs text-gray-500 font-medium uppercase tracking-wide'>Total to pay</span>
                                    <span className='text-xl font-bold' style={{ color: brandColor }}>
                                        ৳{totalAmount}
                                    </span>
                                </div>
                                
                                {/* Checkout Button - Standard Size */}
                                <button 
                                    className='px-8 py-3 rounded-lg text-white text-base font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 active:scale-95'
                                    style={{ backgroundColor: brandColor }}
                                    onClick={() => navigate("/checkout")}
                                >
                                    Proceed to Checkout
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default CartPage