import React, { useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { handleImageError } from '../assets/assets';

const RelatedDoctors = ({ speciality, docId }) => {
  const navigate = useNavigate();
  const { doctors } = useContext(AppContext);

  const relDoc = useMemo(() => doctors.filter(
    (doc) => doc.speciality === speciality && doc._id !== docId && doc.id !== docId
  ), [doctors, speciality, docId]);

  return (
    <div className="flex flex-col items-center gap-4 my-16 text-[#262626] px-4">
      <h1 className="text-3xl font-semibold">Related Doctors</h1>
      <p className="sm:w-1/3 text-center text-sm text-gray-600">
        Simply browse through our extensive list of trusted doctors.
      </p>

      {/* Horizontal Doctor Cards */}
      <div className="w-full flex flex-wrap justify-center gap-6 pt-8">
        {relDoc.map((item) => (
          <button
            type="button"
            onClick={() => {
              navigate(`/appointment/${item._id || item.id}`);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            key={item._id || item.id}
            className="flex w-60 flex-col items-center overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:border-blue-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 cursor-pointer group"
          >
            {/* Doctor Image */}
            <div className="w-full h-40 flex items-center justify-center bg-[#F1F5F9]">
              <img
                className="h-32 w-32 object-cover rounded-full shadow-md transition-transform duration-300 group-hover:scale-105"
                src={item.image}
                alt={item.name}
                onError={handleImageError}
              />
            </div>

            {/* Doctor Info */}
            <div className="p-4 text-center space-y-1">
              <div
                className={`flex items-center justify-center gap-2 text-sm ${
                  item.available ? 'text-green-500' : 'text-gray-400'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    item.available ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                  }`}
                ></span>
                <p>{item.available ? 'Available' : 'Not Available'}</p>
              </div>

              <p className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                {item.name}
              </p>
              <p className="text-sm text-gray-600">{item.speciality}</p>
            </div>
          </button>
        ))}
      </div>
      {relDoc.length === 0 && <p className="pt-4 text-sm text-gray-500">No other doctors in this speciality yet.</p>}
    </div>
  );
};

export default RelatedDoctors;
