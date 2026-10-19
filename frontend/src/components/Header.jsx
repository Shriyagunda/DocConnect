import React from 'react';
import { assets } from '../assets/assets';

const Header = () => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between bg-gradient-to-r from-[#1e40af] via-[#2563eb] to-[#0284c7] rounded-2xl px-6 md:px-12 lg:px-20 shadow-md transition-all duration-300 hover:shadow-lg">
      
      {/* Left Content */}
      <div className="md:w-1/2 flex flex-col items-start justify-center gap-6 py-12 m-auto md:py-[8vw] md:mb-[-30px]">
        
        <p className="text-3xl md:text-4xl lg:text-5xl text-white font-bold leading-snug">
          Book Appointment <br /> With Trusted Doctors
        </p>

        <div className="flex flex-col md:flex-row items-center gap-4 text-white text-base font-light">
          <img className="w-28 drop-shadow-md transition-transform duration-300 hover:scale-105" src={assets.group_profiles} alt="profiles" />
          <p className="opacity-90">
            Simply browse through our extensive list of trusted doctors,
            <br className="hidden sm:block" />
            and schedule your appointment free.
          </p>
        </div>

        <a
          className="group flex items-center gap-2 bg-white px-8 py-3 rounded-full text-blue-700 font-semibold shadow-sm hover:bg-blue-50 hover:text-blue-800 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
          href="#speciality"
        >
          <span>Book Appointment</span>
          <img className="transition-transform duration-300 group-hover:translate-x-1.5" src={assets.arrow_icon} alt="arrow" />
        </a>
      </div>

      {/* Right Image */}
      <div className="md:w-1/2 flex justify-center">
        <img
          className="w-[90%] max-w-lg drop-shadow-xl transition-transform duration-500 hover:scale-[1.02]"
          src={assets.header_img}
          alt="header"
        />
      </div>
    </div>
  );
};

export default Header;
