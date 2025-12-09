
import React, { useState } from 'react';
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { IoClose } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { serverUrl } from '../App';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../firebase';
import { ClipLoader } from "react-spinners";
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';
import rannareadylogo from '../assets/rannareadylogo.jpg' // <-- LOGO IMPORTED

function SignUp() {
    // Brand Colors
    const brandColor = "#D40000";
    const hoverColor = "#b30000";
    
    // State
    const [showPassword, setShowPassword] = useState(false);
    const [role, setRole] = useState("user");
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [mobile, setMobile] = useState("");
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);

    // Hooks
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleSignUp = async () => {
        setLoading(true);
        try {
            const result = await axios.post(`${serverUrl}/api/auth/signup`, {
                fullName, email, password, mobile, role
            }, { withCredentials: true });
            dispatch(setUserData(result.data));
            setErr("");
            setLoading(false);
            // Navigate after success (optional, based on your flow)
             navigate('/');
        } catch (error) {
            setErr(error?.response?.data?.message || "Signup failed");
            setLoading(false);
        }
    }

    const handleGoogleAuth = async () => {
        if (!mobile) {
            return setErr("Mobile number is required for Google Sign Up");
        }
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const { data } = await axios.post(`${serverUrl}/api/auth/google-auth`, {
                fullName: result.user.displayName,
                email: result.user.email,
                role,
                mobile
            }, { withCredentials: true });
            dispatch(setUserData(data));
            navigate('/');
        } catch (error) {
            console.log(error);
        }
    }

    return (
        // Background Container
        <div className='min-h-screen w-full flex items-center justify-center p-4 bg-gray-50/50 backdrop-blur-sm'>
            
            {/* Main Card */}
            <div className='bg-white rounded-2xl shadow-2xl w-full max-w-[500px] p-8 relative'>
                
                {/* Close Button */}
                <button 
                    onClick={() => navigate('/')} 
                    className='absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors'
                >
                    <IoClose size={24} />
                </button>

                {/* Header with Logo */}
                <div className="text-center mb-6 mt-2">
                    {/* LOGO PLACEMENT */}
                    <img 
                        src={rannareadylogo} 
                        alt="RannaReady Logo" 
                        className='mx-auto mb-4' 
                        style={{ width: '132px', height: '66px' }} // Using fixed size for guaranteed resolution
                    />
                    <h1 className='text-3xl font-bold text-gray-900 mb-2'>Create Account</h1>
                    <p className='text-gray-500 text-sm'>Join us to explore delicious home-cooked meals</p>
                </div>

                {/* Form Fields Container */}
                <div className='space-y-4'>
                    
                    {/* Full Name */}
                    <div>
                        <label htmlFor="fullName" className='block text-gray-600 font-medium mb-1.5 ml-1 text-sm'>Full Name</label>
                        <input 
                            type="text" 
                            className='w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 transition-all text-gray-700 placeholder-gray-400' 
                            placeholder='Enter your Full Name'
                            style={{ '--tw-ring-color': brandColor }}
                            onChange={(e) => setFullName(e.target.value)} 
                            value={fullName} 
                            required
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label htmlFor="email" className='block text-gray-600 font-medium mb-1.5 ml-1 text-sm'>Email</label>
                        <input 
                            type="email" 
                            className='w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 transition-all text-gray-700 placeholder-gray-400' 
                            placeholder='Enter your Email'
                            style={{ '--tw-ring-color': brandColor }}
                            onChange={(e) => setEmail(e.target.value)} 
                            value={email} 
                            required
                        />
                    </div>

                    {/* Mobile */}
                    <div>
                        <label htmlFor="mobile" className='block text-gray-600 font-medium mb-1.5 ml-1 text-sm'>Mobile</label>
                        <input 
                            type="tel" // Changed to tel for better mobile keyboard
                            className='w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 transition-all text-gray-700 placeholder-gray-400' 
                            placeholder='Enter your Mobile Number'
                            style={{ '--tw-ring-color': brandColor }}
                            onChange={(e) => setMobile(e.target.value)} 
                            value={mobile} 
                            required
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label htmlFor="password" className='block text-gray-600 font-medium mb-1.5 ml-1 text-sm'>Password</label>
                        <div className='relative'>
                            <input 
                                type={`${showPassword ? "text" : "password"}`} 
                                className='w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 transition-all pr-12 text-gray-700 placeholder-gray-400' 
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

                    {/* Role Selection */}
                    <div>
                        <label className='block text-gray-600 font-medium mb-2 ml-1 text-sm'>I am a</label>
                        <div className='flex gap-3 bg-gray-50 p-1.5 rounded-xl border border-gray-100'>
                            {["user", "owner", "deliveryBoy"].map((r) => (
                                <button
                                    key={r}
                                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 capitalize ${
                                        role === r 
                                        ? 'text-white shadow-md transform scale-[1.02]' 
                                        : 'text-gray-500 hover:bg-gray-200 hover:text-gray-700'
                                    }`}
                                    onClick={() => setRole(r)}
                                    style={{ 
                                        backgroundColor: role === r ? brandColor : 'transparent',
                                    }}
                                >
                                    {r === 'deliveryBoy' ? 'Rider' : r}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {err && <p className='text-red-500 text-sm text-center mt-4 bg-red-50 p-2 rounded'>*{err}</p>}

                {/* Main Action Buttons */}
                <div className='mt-6 space-y-3'>
                    <button 
                        className={`w-full font-bold py-3 rounded-lg transition duration-300 text-white shadow-md flex justify-center items-center`}
                        style={{ backgroundColor: brandColor }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = hoverColor}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = brandColor}
                        onClick={handleSignUp} 
                        disabled={loading}
                    >
                        {loading ? <ClipLoader size={20} color='white' /> : "Sign Up"}
                    </button>

                    <button 
                        className='w-full font-medium py-3 rounded-lg border border-gray-300 flex items-center justify-center gap-3 transition duration-300 hover:bg-gray-50 text-gray-700'
                        onClick={handleGoogleAuth}
                    >
                        <FcGoogle size={22}/>
                        <span>Sign up with Google</span>
                    </button>
                </div>

                {/* Footer Links */}
                <p className='text-center mt-6 text-gray-500 text-sm'>
                    Already have an account?  
                    <span 
                        className='font-bold ml-1 cursor-pointer hover:underline' 
                        style={{ color: brandColor }}
                        onClick={() => navigate("/signin")}
                    >
                        Sign In
                    </span>
                </p>

            </div>
        </div>
    )
}

export default SignUp