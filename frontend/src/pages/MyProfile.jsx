import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { handleImageError } from '../assets/assets';

const MyProfile = () => {
    const { token, backendUrl, userData, setUserData, loadUserProfileData, profileLoading } = useContext(AppContext);
    const [isEdit, setIsEdit] = useState(false);
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();

    // Function to update user profile data using API
    const updateUserProfileData = async () => {
        if (saving) return;
        setSaving(true);
        try {
            const { data } = await axios.post(backendUrl + '/api/user/update-profile', {
                name: userData.name,
                phone: userData.phone,
                address: userData.address,
                gender: userData.gender,
                dob: userData.dob,
            }, { headers: { token } });

            if (data.success) {
                toast.success(data.message);
                await loadUserProfileData();
                setIsEdit(false);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Unable to save your profile.');
        } finally {
            setSaving(false);
        }
    };

    if (!token) {
        return (
            <div className="py-20 text-center">
                <p className="text-xl font-medium text-gray-700">Log in to view your profile.</p>
                <button type="button" onClick={() => navigate('/login')} className="mt-4 rounded-full bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 transition-colors">
                    Log in
                </button>
            </div>
        );
    }

    if (!userData && profileLoading) {
        return <p className="py-20 text-center text-gray-500" role="status">Loading your profile…</p>;
    }

    if (!userData) {
        return (
            <div className="py-20 text-center">
                <p className="text-gray-600">Your profile could not be loaded.</p>
                <button type="button" onClick={loadUserProfileData} className="mt-4 rounded-full bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 transition-colors">
                    Try again
                </button>
            </div>
        );
    }

    const cancelEdit = () => {
        setIsEdit(false);
        loadUserProfileData();
    };

    return (
        <div className='max-w-lg flex flex-col gap-2 text-sm pt-5'>

            <img className='w-36 rounded shadow-sm' src={userData.image} alt={`${userData.name} profile`} onError={handleImageError} />

            {isEdit
                ? <input aria-label="Full name" className='bg-gray-50 text-3xl font-medium max-w-60 p-1 border rounded' type="text" onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))} value={userData.name || ''} required />
                : <p className='font-medium text-3xl text-[#262626] mt-4'>{userData.name}</p>
            }

            <hr className='bg-[#ADADAD] h-[1px] border-none my-1' />

            <div>
                <p className='text-gray-600 underline mt-3 font-medium'>CONTACT INFORMATION</p>
                <div className='grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-[#363636]'>
                    <p className='font-medium'>Email id:</p>
                    <p className='text-blue-500'>{userData.email}</p>
                    <p className='font-medium'>Phone:</p>

                    {isEdit
                        ? <input aria-label="Phone number" className='bg-gray-50 max-w-52 p-1 border rounded' type="tel" onChange={(e) => setUserData(prev => ({ ...prev, phone: e.target.value }))} value={userData.phone || ''} />
                        : <p className='text-blue-500'>{userData.phone}</p>
                    }

                    <p className='font-medium'>Address:</p>

                    {isEdit
                        ? <p className="space-y-1">
                            <input aria-label="Address line 1" className='bg-gray-50 p-1 border rounded w-full' type="text" onChange={(e) => setUserData(prev => ({ ...prev, address: { ...prev.address, line1: e.target.value } }))} value={userData.address?.line1 || ''} />
                            <br />
                            <input aria-label="Address line 2" className='bg-gray-50 p-1 border rounded w-full' type="text" onChange={(e) => setUserData(prev => ({ ...prev, address: { ...prev.address, line2: e.target.value } }))} value={userData.address?.line2 || ''} /></p>
                        : <p className='text-gray-500'>{userData.address?.line1} <br /> {userData.address?.line2}</p>
                    }

                </div>
            </div>
            <div>
                <p className='text-[#797979] underline mt-3 font-medium'>BASIC INFORMATION</p>
                <div className='grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-gray-600'>
                    <p className='font-medium'>Gender:</p>

                    {isEdit
                        ? <select aria-label="Gender" className='max-w-32 bg-gray-50 p-1 border rounded' onChange={(e) => setUserData(prev => ({ ...prev, gender: e.target.value }))} value={userData.gender || 'Not Selected'} >
                            <option value="Not Selected">Not Selected</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                        : <p className='text-gray-500'>{userData.gender}</p>
                    }

                    <p className='font-medium'>Birthday:</p>

                    {isEdit
                        ? <input aria-label="Birthday" className='max-w-36 bg-gray-50 p-1 border rounded' type='date' onChange={(e) => setUserData(prev => ({ ...prev, dob: e.target.value }))} value={userData.dob || ''} />
                        : <p className='text-gray-500'>{userData.dob}</p>
                    }

                </div>
            </div>
            <div className='mt-10'>

                {isEdit
                    ? <div className="flex gap-3">
                        <button type="button" disabled={saving || !userData.name?.trim()} onClick={updateUserProfileData} className='border border-blue-600 px-8 py-2 rounded-full hover:bg-blue-600 hover:text-white transition-all disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer'>{saving ? 'Saving…' : 'Save information'}</button>
                        <button type="button" disabled={saving} onClick={cancelEdit} className='border border-gray-300 px-6 py-2 rounded-full hover:bg-gray-100 transition-all disabled:opacity-50 cursor-pointer'>Cancel</button>
                    </div>
                    : <button type="button" onClick={() => setIsEdit(true)} className='border border-blue-600 px-8 py-2 rounded-full hover:bg-blue-600 hover:text-white transition-all cursor-pointer'>Edit</button>
                }

            </div>
        </div>
    );
};

export default MyProfile;