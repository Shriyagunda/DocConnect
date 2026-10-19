import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { handleImageError } from '../assets/assets';

const TopDoctors = () => {
  const navigate = useNavigate();
  const { doctors, doctorsLoading } = useContext(AppContext);

  return (
    <div className="flex flex-col items-center gap-4 my-16 text-[#262626] md:mx-10">
      <h1 className="text-3xl font-medium text-slate-800">Top Doctors to Book</h1>
      <p className="sm:w-1/3 text-center text-sm text-slate-500">
        Simply browse through our extensive list of trusted doctors.
      </p>

      {doctorsLoading ? (
        <p className="py-12 text-sm text-slate-400" role="status">Loading doctors…</p>
      ) : doctors.length === 0 ? (
        <div className="py-12 text-center text-slate-500">
          <p>Doctor listings are currently unavailable.</p>
          <button type="button" onClick={() => navigate('/doctors')} className="mt-3 text-blue-600 underline hover:text-blue-700">
            Browse the directory
          </button>
        </div>
      ) : (
        <div className="w-full grid gap-4 pt-5 gap-y-6 px-3 sm:px-0 grid-cols-[repeat(auto-fill,minmax(200px,1fr))]">
          {doctors.slice(0, 10).map((item) => (
            <button
              type="button"
              onClick={() => {
                navigate(`/appointment/${item._id || item.id}`);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white text-left transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md hover:border-blue-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 cursor-pointer group"
              key={item._id || item.id}
            >
              <div className="w-full bg-[#F1F5F9] overflow-hidden flex items-center justify-center">
                <img
                  className="w-full transition-transform duration-500 group-hover:scale-105"
                  src={item.image}
                  alt={item.name}
                  onError={handleImageError}
                />
              </div>
              <div className="p-4">
                <div className={`flex items-center gap-2 text-xs font-medium mb-1 ${item.available ? 'text-emerald-600' : 'text-slate-400'}`}>
                  <span className={`h-2 w-2 rounded-full ${item.available ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  <span>{item.available ? 'Available' : 'Not Available'}</span>
                </div>
                <p className="text-base font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">{item.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{item.speciality}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          navigate('/doctors');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className="bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/80 px-12 py-3 rounded-full mt-10 font-medium hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer text-sm shadow-sm"
      >
        View all doctors
      </button>
    </div>
  );
};

export default TopDoctors;
