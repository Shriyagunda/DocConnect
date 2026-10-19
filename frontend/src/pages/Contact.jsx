import React from 'react';
import { useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';

const Contact = () => {
  const navigate = useNavigate();

  return (
    <div>

      <div className='text-center text-2xl pt-10 text-[#707070]'>
        <p>CONTACT <span className='text-gray-700 font-semibold'>US</span></p>
      </div>

      <div className='my-10 flex flex-col justify-center md:flex-row gap-10 mb-28 text-sm'>
        <img className='w-full md:max-w-[360px] rounded-lg' src={assets.contact_image} alt="" />
        <div className='flex flex-col justify-center items-start gap-6'>
          <p className='font-semibold text-lg text-gray-600'>OUR OFFICE</p>
          <p className='text-gray-500 leading-relaxed'>54709 Willms Station <br /> Suite 350, Washington, USA</p>
          <p className='text-gray-500 leading-relaxed'>Tel: (415) 555-0132 <br /> Email: support@mediconnect.com</p>
          <p className='font-semibold text-lg text-gray-600'>FIND THE RIGHT CARE</p>
          <p className='text-gray-500 leading-relaxed'>Browse our doctor directory and find a specialist for your needs.</p>
          <button
            type="button"
            onClick={() => navigate('/doctors')}
            className='border border-black px-8 py-4 text-sm hover:bg-black hover:text-white hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer'
          >
            Explore Doctors
          </button>
        </div>
      </div>

    </div>
  );
};

export default Contact;
