import React, { useContext, useMemo, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate, useParams } from 'react-router-dom';
import { handleImageError } from '../assets/assets';

const Doctors = () => {
  const { speciality } = useParams();
  const [showFilter, setShowFilter] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState('recommended');
  const navigate = useNavigate();
  const { doctors, doctorsLoading } = useContext(AppContext);

  const filterDoc = useMemo(() => {
    let list = doctors || [];

    if (speciality) {
      list = list.filter(doc => doc.speciality?.toLowerCase() === speciality.toLowerCase());
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(doc =>
        doc.name?.toLowerCase().includes(term) ||
        doc.speciality?.toLowerCase().includes(term) ||
        doc.degree?.toLowerCase().includes(term)
      );
    }

    if (availableOnly) {
      list = list.filter(doc => doc.available);
    }

    if (sortBy === 'fee-ascending') {
      list = [...list].sort((first, second) => Number(first.fees) - Number(second.fees));
    } else if (sortBy === 'fee-descending') {
      list = [...list].sort((first, second) => Number(second.fees) - Number(first.fees));
    } else if (sortBy === 'name') {
      list = [...list].sort((first, second) => (first.name || '').localeCompare(second.name || ''));
    }

    return list;
  }, [doctors, speciality, searchTerm, availableOnly, sortBy]);

  const specialities = [
    'General physician',
    'Gynecologist',
    'Dermatologist',
    'Pediatricians',
    'Neurologist',
    'Gastroenterologist'
  ];

  return (
    <div className="px-4 sm:px-6 md:px-10 mt-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">
            {speciality || 'All Specialists'}
          </h2>
          <p className="text-gray-600 text-sm mt-1">Browse through our trusted healthcare professionals.</p>
        </div>

        {/* Search bar */}
        <div className="w-full sm:w-72">
          <label className="sr-only" htmlFor="doctor-search">Search doctors</label>
          <input
            id="doctor-search"
            type="text"
            placeholder="Search doctor or speciality..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:border-blue-500 shadow-sm transition-all focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-5 text-sm">
        <label className="flex items-center gap-2 text-gray-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={availableOnly}
            onChange={(event) => setAvailableOnly(event.target.checked)}
            className="accent-blue-600 w-4 h-4 cursor-pointer"
          />
          Show available doctors only
        </label>

        <label className="flex items-center gap-2 text-gray-700">
          Sort by
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-blue-500 cursor-pointer shadow-sm"
          >
            <option value="recommended">Recommended</option>
            <option value="fee-ascending">Price: Low to high</option>
            <option value="fee-descending">Price: High to low</option>
            <option value="name">Doctor name</option>
          </select>
        </label>

        <p className="text-gray-500 sm:ml-auto" aria-live="polite">
          {filterDoc.length} {filterDoc.length === 1 ? 'doctor' : 'doctors'} found
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-start gap-6 mt-6">
        {/* Filter button for mobile */}
        <button
          type="button"
          onClick={() => setShowFilter(!showFilter)}
          className={`py-1.5 px-4 border rounded text-sm transition-all sm:hidden ${showFilter ? 'bg-blue-600 text-white' : ''}`}
        >
          {showFilter ? 'Hide Filters' : 'Filters'}
        </button>

        {/* Filter list */}
        <div className={`flex-col gap-3 text-sm text-gray-600 min-w-48 ${showFilter ? 'flex' : 'hidden sm:flex'}`}>
          <button
            type="button"
            onClick={() => navigate('/doctors')}
            aria-current={!speciality ? 'page' : undefined}
            className={`w-full pl-3 py-2 pr-10 border border-gray-300 rounded-lg text-left transition-all hover:bg-gray-50 cursor-pointer ${!speciality ? 'bg-blue-600 text-white font-medium border-blue-600 hover:bg-blue-600 shadow-sm' : ''}`}
          >
            All Doctors ({doctors?.length || 0})
          </button>

          {specialities.map((spec) => {
            const count = doctors?.filter(d => d.speciality?.toLowerCase() === spec.toLowerCase()).length || 0;
            const isActive = speciality?.toLowerCase() === spec.toLowerCase();
            return (
              <button
                type="button"
                key={spec}
                onClick={() => isActive ? navigate('/doctors') : navigate(`/doctors/${spec}`)}
                aria-current={isActive ? 'page' : undefined}
                className={`w-full pl-3 py-2 pr-4 border border-gray-300 rounded-lg transition-all flex justify-between items-center hover:bg-gray-50 cursor-pointer ${isActive ? 'bg-blue-50 text-blue-700 font-semibold border-blue-200 shadow-sm' : ''}`}
              >
                <span>{spec}</span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Doctors grid */}
        <div className="w-full">
          {doctorsLoading ? (
            <p className="py-16 text-center text-gray-500" role="status">Loading doctors…</p>
          ) : filterDoc.length === 0 ? (
            <div className="py-16 text-center text-gray-500 border border-dashed rounded-xl">
              <p className="text-lg font-medium">No doctors found matching your selection.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setAvailableOnly(false);
                  setSortBy('recommended');
                  navigate('/doctors');
                }}
                className="mt-4 px-6 py-2 bg-blue-600 text-white text-sm rounded-full hover:bg-blue-700 transition-all cursor-pointer shadow-sm hover:scale-105"
              >
                Show All Doctors
              </button>
            </div>
          ) : (
            <div className="w-full grid gap-5 grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
              {filterDoc.map((item) => (
                <button
                  type="button"
                  onClick={() => { navigate(`/appointment/${item._id || item.id}`); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:border-blue-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 cursor-pointer group"
                  key={item._id || item.id}
                >
                  <div className="bg-[#F1F5F9] w-full h-44 overflow-hidden flex items-center justify-center">
                    <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src={item.image} alt={item.name} onError={handleImageError} />
                  </div>
                  <div className="p-4">
                    <div className={`flex items-center gap-2 text-xs font-medium mb-1 ${item.available ? 'text-green-600' : 'text-gray-500'}`}>
                      <span className={`w-2 h-2 rounded-full ${item.available ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
                      <p>{item.available ? 'Available' : 'Not Available'}</p>
                    </div>
                    <p className="text-gray-900 text-base font-semibold group-hover:text-blue-600 transition-colors">{item.name}</p>
                    <p className="text-gray-600 text-xs">{item.speciality} &bull; {item.experience}</p>
                    <p className="text-blue-600 text-sm font-semibold mt-2">${item.fees} <span className="text-xs text-gray-500 font-normal">per visit</span></p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Doctors;
