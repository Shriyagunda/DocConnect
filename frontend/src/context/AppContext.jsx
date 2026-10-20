import { createContext, useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const AppContext = createContext();

const AppContextProvider = (props) => {
    const currencySymbol = "$";
    let backendUrl = import.meta.env.VITE_BACKEND_URL || "https://doc-connect-y1ps.vercel.app";
    if (typeof backendUrl === "string" && backendUrl.includes("doc-connect-y1ps-") && backendUrl.includes(".vercel.app")) {
        backendUrl = "https://doc-connect-y1ps.vercel.app";
    }
    backendUrl = typeof backendUrl === "string" ? backendUrl.replace(/\/+$/, "") : backendUrl;

    const [doctors, setDoctors] = useState([]);
    const [doctorsLoading, setDoctorsLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : false);
    const [userData, setUserData] = useState(false);  
    const [profileLoading, setProfileLoading] = useState(false);
   
    const getDoctorsData = useCallback(async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/doctor/list');
           
            if (data.success) {
                setDoctors(data.doctors);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        } finally {
            setDoctorsLoading(false);
        }
    }, [backendUrl]);

    const loadUserProfileData = useCallback(async () => {
        if (!token) {
            setUserData(false);
            return;
        }

        setProfileLoading(true);
        try {
            const { data } = await axios.get(backendUrl + '/api/user/get-profile', { headers: { token } });

            if (data.success) {
                setUserData(data.userData);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        } finally {
            setProfileLoading(false);
        }
    }, [backendUrl, token]);

    const value = {
        doctors,
        getDoctorsData,
        doctorsLoading,
        currencySymbol,
        token,
        setToken,
        backendUrl,
        userData,
        profileLoading,
        setUserData,
        loadUserProfileData
    };

    useEffect(() => {
        getDoctorsData();
    }, [getDoctorsData]);

    useEffect(() => {
        if (token) {
            loadUserProfileData();
        } else {
            setUserData(false);
        }
    }, [token, loadUserProfileData]);
        
    return <AppContext.Provider value={value}>{props.children}</AppContext.Provider>;
};

export default AppContextProvider;