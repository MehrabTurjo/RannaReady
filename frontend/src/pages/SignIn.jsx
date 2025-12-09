

import React, { useState } from 'react';
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { IoClose } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { serverUrl } from '../App';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../firebase';
import { ClipLoader } from 'react-spinners';
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';
import rannareadylogo from '../assets/rannareadylogo.jpg' // <-- LOGO IMPORTED

function SignIn() {
    // Brand Colors
    const brandColor = "#D40000";
    const hoverColor = "#b30000"; 
    
    // State
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);
    
    // Hooks
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleSignIn = async () => {
        setLoading(true);
        try {
            const result = await axios.post(`${serverUrl}/api/auth/signin`, {
                email, password
            }, { withCredentials: true });
            
            dispatch(setUserData(result.data));
            setErr("");
            setLoading(false);
            // Navigate to home or dashboard after success
            navigate('/'); 
        } catch (error) {
            setErr(error?.response?.data?.message || "Login failed");
            setLoading(false);
        }
    }

    const handleGoogleAuth = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const { data } = await axios.post(`${serverUrl}/api/auth/google-auth`, {
                email: result.user.email,
            }, { withCredentials: true });
            dispatch(setUserData(data));
            navigate('/');
        } catch (error) {
            console.log(error);
        }
    }

    return (
        // Background Container (Overlay look)
        <div className='min-h-screen w-full flex items-center justify-center p-4 bg-gray-50/50 backdrop-blur-sm'>
            
            {/* Main Card */}
            <div className='bg-white rounded-2xl shadow-2xl w-full max-w-[500px] p-8 relative'>
                
                {/* Close Button (X) */}
                <button 
                    onClick={() => navigate('/')} 
                    className='absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors'
                >
                    <IoClose size={24} />
                </button>

                {/* Header with Logo */}
                <div className="text-center mb-8 mt-2">
                    {/* LOGO PLACEMENT */}
                    <img 
                        src={rannareadylogo} 
                        alt="RannaReady Logo" 
                        className='mx-auto mb-4' 
                        style={{ width: '132px', height: '66px' }} // Using fixed size for guaranteed resolution
                    />
                    <h1 className='text-3xl font-bold text-gray-900 mb-2'>Welcome Back!</h1>
                </div>

                {/* Form Fields */}
                <div className='space-y-5'>
                    
                    {/* Email */}
                    <div>
                        <label htmlFor="email" className='block text-gray-600 font-medium mb-2 ml-1'>Email Id</label>
                        <input 
                            type="email" 
                            className='w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 transition-all text-gray-700 placeholder-gray-400'
                            placeholder='Enter your E-Mail address'
                            style={{ '--tw-ring-color': brandColor }}
                            onChange={(e) => setEmail(e.target.value)} 
                            value={email} 
                            required
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label htmlFor="password" className='block text-gray-600 font-medium mb-2 ml-1'>Password</label>
                        <div className='relative'>
                            <input 
                                type={`${showPassword ? "text" : "password"}`} 
                                className='w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 transition-all pr-12 text-gray-700 placeholder-gray-400'
                                placeholder='Enter your password'
                                style={{ '--tw-ring-color': brandColor }}
                                onChange={(e) => setPassword(e.target.value)} 
                                value={password} 
                                required
                            />
                            <button 
                                className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600' 
                                onClick={() => setShowPassword(prev => !prev)}
                                type="button"
                            >
                                {!showPassword ? <FaRegEye size={18} /> : <FaRegEyeSlash size={18} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {err && <p className='text-red-500 text-sm text-center mt-4 bg-red-50 p-2 rounded'>*{err}</p>}

                {/* Main Action Buttons */}
                <div className='mt-8 space-y-4'>
                    {/* Login Button */}
                    <button 
                        className={`w-full font-bold py-3.5 rounded-lg transition duration-300 text-white shadow-md flex justify-center items-center`}
                        style={{ backgroundColor: brandColor }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = hoverColor}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = brandColor}
                        onClick={handleSignIn} 
                        disabled={loading}
                    >
                        {loading ? <ClipLoader size={24} color='white' /> : "Log In"}
                    </button>

                    {/* Google Auth Button (Placed after login as requested) */}
                    <button 
                        className='w-full font-medium py-3.5 rounded-lg border border-gray-300 flex items-center justify-center gap-3 transition duration-300 hover:bg-gray-50 text-gray-700'
                        onClick={handleGoogleAuth}
                    >
                        <FcGoogle size={22}/>
                        <span>Sign In with Google</span>
                    </button>
                </div>

                {/* Footer Links */}
                <div className='mt-6 text-center space-y-2'>
                    <div 
                        className='text-sm font-medium hover:underline cursor-pointer'
                        style={{ color: brandColor }}
                        onClick={() => navigate("/forgot-password")}
                    >
                        Forgot Password?
                    </div>
                    
                    <p className='text-gray-500 text-sm'>
                        Didn't have an account? 
                        <span 
                            className='font-bold ml-1 cursor-pointer hover:underline'
                            style={{ color: brandColor }} 
                            onClick={() => navigate("/signup")}
                        >
                            Sign Up
                        </span>
                    </p>
                </div>

            </div>
        </div>
    )
}

export default SignIn