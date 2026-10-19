import React from 'react';
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';

const Banner = () => {
  const navigate = useNavigate();
  const { token } = useContext(AppContext);

  return (
    <div className="flex flex-col md:flex-row items-center justify-between bg-gradient-to-r from-[#1e40af] via-[#2563eb] to-[#0ea5e9] rounded-2xl px-6 sm:px-8 md:px-10 lg:px-14 my-8 md:mx-10 overflow-hidden min-h-[180px] md:min-h-[220px] lg:min-h-[250px] shadow-md transition-all duration-300 hover:shadow-lg">
      
      {/* Left Text Section */}
      <div className="flex-1 py-6 sm:py-8 md:py-10">
        <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-white leading-tight">
          <p>Book Appointment</p>
          <p className="mt-2">With 100+ Trusted Doctors</p>
        </div>
        <button
          type="button"
          onClick={() => {
            navigate(token ? '/doctors' : '/login');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="bg-white text-sm sm:text-base text-blue-700 font-semibold px-8 py-3 rounded-full mt-6 hover:scale-105 active:scale-95 transition-all duration-300 shadow-sm hover:shadow hover:bg-blue-50 hover:text-blue-800 cursor-pointer"
        >
          {token ? 'Find a doctor' : 'Create account'}
        </button>
      </div>

      {/* Right Image Section */}
      <div className="hidden md:flex md:w-1/2 justify-center relative">
        <img
          className="w-full max-w-[200px] md:max-w-[250px] lg:max-w-[300px] transition-transform duration-500 hover:scale-105"
          src={assets.appointment_img}
          alt="appointment"
        />
      </div>
    </div>
  );
};

export default Banner;
