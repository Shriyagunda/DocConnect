import React, { useCallback, useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { handleImageError } from "../assets/assets";

const MyAppointments = () => {
  const { backendUrl, token, getDoctorsData } = useContext(AppContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const navigate = useNavigate();

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const slotDateFormat = (slotDate) => {
    const dateArray = slotDate?.split("_") || [];
    if (dateArray.length !== 3) return slotDate || 'Date unavailable';
    return (
      dateArray[0] + " " + months[Number(dateArray[1]) - 1] + " " + dateArray[2]
    );
  };

  // Getting User Appointments Data Using API
  const getUserAppointments = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const { data } = await axios.get(backendUrl + "/api/user/appointments", {
        headers: { token },
      });
      setAppointments([...(data.appointments || [])].reverse());
    } catch (error) {
      setLoadError(true);
      toast.error(error.response?.data?.message || error.message || 'Unable to load appointments.');
    } finally {
      setLoading(false);
    }
  }, [backendUrl, token]);

  // Function to cancel appointment Using API
  const cancelAppointment = async (appointmentId) => {
    if (cancellingId) return;
    setCancellingId(appointmentId);
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/cancel-appointment",
        { appointmentId },
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message);
        await Promise.all([getUserAppointments(), getDoctorsData()]);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Unable to cancel this appointment.');
    } finally {
      setCancellingId(null);
    }
  };

  useEffect(() => {
    if (token) {
      getUserAppointments();
    }
  }, [token, getUserAppointments]);

  if (!token) {
    return (
      <div className="py-20 text-center">
        <p className="text-xl font-medium text-gray-700">Log in to manage your appointments.</p>
        <button type="button" onClick={() => navigate('/login')} className="mt-4 rounded-full bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 transition-colors">
          Log in
        </button>
      </div>
    );
  }

  if (loading) {
    return <p className="py-20 text-center text-gray-500" role="status">Loading your appointments…</p>;
  }

  if (loadError) {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-600">Your appointments could not be loaded.</p>
        <button type="button" onClick={getUserAppointments} className="mt-4 rounded-full bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 transition-colors">
          Try again
        </button>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-xl font-medium text-gray-700">You have no appointments yet.</p>
        <button type="button" onClick={() => navigate('/doctors')} className="mt-4 rounded-full bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 transition-colors">
          Find a doctor
        </button>
      </div>
    );
  }

  return (
    <div className='mt-6 grid gap-6'>
      {appointments.map((item) => (
        <div 
          key={item._id}
          className='p-6 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100'
        >
          {/* Top Section - Doctor Info */}
          <div className='flex gap-6 items-center'>
            <img 
              className='w-28 h-28 object-cover rounded-xl border border-slate-200 bg-[#F1F5F9]' 
              src={item.docData?.image} 
              alt={item.docData?.name || 'Doctor'} 
              onError={handleImageError}
            />
            <div className='flex-1'>
              <p className='text-xl font-semibold text-gray-800'>{item.docData?.name || 'Doctor information unavailable'}</p>
              <p className='text-sm text-blue-600 font-medium'>{item.docData?.speciality}</p>
              <p className='text-sm text-gray-500 mt-1'>{item.docData?.experience ? `${item.docData.experience}+ years experience` : ''}</p>
              <p className='text-sm text-gray-500'>Fees: ${item.docData?.fees}</p>
              <p className='text-sm text-gray-500'>Education: {item.docData?.degree || item.docData?.education || 'Not provided'}</p>
            </div>
          </div>

          {/* Divider */}
          <hr className='my-4 border-gray-200' />

          {/* Appointment Details */}
          <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3'>
            <div>
              <p className='text-sm text-gray-500'>Date & Time</p>
              <p className='text-base font-medium text-gray-700'>
                {slotDateFormat(item.slotDate)} | {item.slotTime || 'Time unavailable'}
              </p>
            </div>
            <div>
              <p className='text-sm text-gray-500'>Location</p>
              <p className='text-base font-medium text-gray-700'>{item.docData?.address?.line1}{item.docData?.address?.line1 && item.docData?.address?.line2 ? ', ' : ''}{item.docData?.address?.line2 || 'Location not provided'}</p>
            </div>
          </div>

          {/* Divider */}
          <hr className='my-4 border-gray-200' />

          {/* Actions */}
          <div className='flex flex-wrap gap-3 items-center justify-end'>
            {!item.cancelled && !item.isCompleted && !item.isConfirmed && (
              <span className='px-4 py-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 font-medium text-xs flex items-center gap-1.5'>
                <span className='w-2 h-2 rounded-full bg-amber-500 animate-pulse'></span>
                Pending Doctor Confirmation
              </span>
            )}

            {!item.cancelled && !item.isCompleted && item.isConfirmed && (
              <span className='px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium text-xs flex items-center gap-1'>
                ✓ Doctor confirmed your appointment
              </span>
            )}

            {!item.cancelled && item.payment && (
              <span className='px-4 py-2 rounded-xl bg-gray-50 text-gray-600 border border-gray-200 font-medium text-xs'>
                Payment previously recorded. Contact the clinic for billing questions.
              </span>
            )}
            {item.isCompleted && (
              <span className='px-5 py-2 rounded-xl bg-green-50 text-green-600 border border-green-200 font-medium'>Completed</span>
            )}
            {!item.cancelled && !item.isCompleted && !item.payment && (
              <button 
                type="button"
                disabled={cancellingId === item._id}
                onClick={() => cancelAppointment(item._id)} 
                className='px-5 py-2 rounded-xl border text-gray-600 hover:bg-red-600 hover:text-white transition-all disabled:cursor-wait disabled:opacity-50 cursor-pointer'
              >
                {cancellingId === item._id ? 'Cancelling…' : 'Cancel'}
              </button>
            )}
            {item.cancelled && !item.isCompleted && (
              <span className='px-5 py-2 rounded-xl bg-red-50 text-red-600 border border-red-200 font-medium'>
                Appointment Cancelled
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MyAppointments;
