import axios from 'axios'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setCurrentAddress, setCurrentCity, setCurrentState } from '../redux/userSlice'
import { setAddress, setLocation } from '../redux/mapSlice'

function useGetCity() {
    const dispatch = useDispatch()
    const { userData } = useSelector(state => state.user)
    const apiKey = import.meta.env.VITE_GEOAPIKEY

    useEffect(() => {
        // It is good practice to check if geolocation is available
        if (!navigator.geolocation) {
            console.log("Geolocation is not supported by this browser.");
            return;
        }

        navigator.geolocation.getCurrentPosition(async (position) => {
            console.log(position)
            const latitude = position.coords.latitude
            const longitude = position.coords.longitude
            
            // Dispatch location immediately
            dispatch(setLocation({ lat: latitude, lon: longitude }))
            
            try {
                const result = await axios.get(`https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apiKey}`)
                console.log(result.data)
                
                if (result.data.results && result.data.results.length > 0) {
                    const place = result.data.results[0];
                    
                    dispatch(setCurrentCity(place.city || place.county))
                    dispatch(setCurrentState(place.state))
                    dispatch(setCurrentAddress(place.address_line2 || place.address_line1))
                    dispatch(setAddress(place.address_line2))
                }
            } catch (error) {
                console.error("Error fetching city data:", error);
            }
        })
    // ---------------------------------------------------------
    // FIXED: Added 'dispatch' and 'apiKey' to the dependency array
    // ---------------------------------------------------------
    }, [userData, dispatch, apiKey]) 
}

export default useGetCity