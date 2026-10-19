import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { assets, handleImageError } from "../assets/assets";
import RelatedDoctors from "../components/RelatedDoctors";
import { toast } from "react-toastify";
import axios from "axios";

const Appointment = () => {
  const { docId } = useParams();
  const { doctors, doctorsLoading, currencySymbol, getDoctorsData, backendUrl, token } =
    useContext(AppContext);
  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const [docInfo, setDocInfo] = useState(false);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState("");
  const [activeTab, setActiveTab] = useState("about"); // 'about' | 'address'
  const [booking, setBooking] = useState(false);

  const navigate = useNavigate();

  const bookAppointment = async () => {
    if (!token) {
      toast.warning("Login to book appointment");
      return navigate("/login");
    }

    if (!slotTime || !docSlots[slotIndex]?.slots.some((slot) => slot.time === slotTime)) {
      toast.error("Please select a valid slot");
      return;
    }

    if (!docInfo.available) {
      toast.error('This doctor is not currently accepting appointments.');
      return;
    }

    const { date } = docSlots[slotIndex];
    const slotDate = `${date.getDate()}_${date.getMonth() + 1}_${date.getFullYear()}`;

    try {
      setBooking(true);
      const { data } = await axios.post(
        backendUrl + "/api/user/book-appointment",
        { docId, slotDate, slotTime },
        { headers: { token } }
      );
      if (data.success) {
        toast.success(data.message);
        getDoctorsData();
        navigate("/my-appointments");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Unable to book this appointment.');
    } finally {
      setBooking(false);
    }
  };

  useEffect(() => {
    const foundDoctor = doctors.find((doc) => doc._id === docId || doc.id === docId);
    setDocInfo(foundDoctor || false);
  }, [doctors, docId]);

  useEffect(() => {
    if (!docInfo) return;

    const now = new Date();
    const availableDays = [];

    for (let dayOffset = 0; dayOffset < 7; dayOffset += 1) {
      const date = new Date(now);
      date.setDate(now.getDate() + dayOffset);
      date.setHours(0, 0, 0, 0);

      const startTime = new Date(date);
      startTime.setHours(10, 0, 0, 0);
      if (dayOffset === 0 && now >= startTime) {
        const elapsedMinutes = (now.getTime() - startTime.getTime()) / 60000;
        const nextSlotMinutes = (Math.floor(elapsedMinutes / 30) + 1) * 30;
        startTime.setMinutes(nextSlotMinutes);
      }

      const endTime = new Date(date);
      endTime.setHours(21, 0, 0, 0);

      const slotDate = `${date.getDate()}_${date.getMonth() + 1}_${date.getFullYear()}`;
      const slots = [];
      const currentTime = new Date(startTime);

      while (currentTime < endTime) {
        const time = currentTime.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });
        if (!docInfo.slots_booked?.[slotDate]?.includes(time)) {
          slots.push({ time });
        }
        currentTime.setMinutes(currentTime.getMinutes() + 30);
      }

      availableDays.push({ date, slots });
    }

    setDocSlots(availableDays);
    setSlotIndex(0);
    setSlotTime('');
  }, [docInfo]);

  if (!docInfo) {
    return (
      <div className="py-20 text-center text-gray-500">
        <p className="text-xl">
          {doctorsLoading ? 'Loading doctor details…' : 'Doctor not found.'}
        </p>
        <button
          type="button"
          onClick={() => navigate('/doctors')}
          className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors shadow-sm cursor-pointer"
        >
          Browse All Doctors
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* ---------- Doctor Details ----------- */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div>
          <img
            className="bg-[#F1F5F9] border border-slate-200 w-full sm:max-w-72 rounded-lg transition-transform duration-300 hover:scale-[1.01]"
            src={docInfo.image}
            alt={`${docInfo.name}, ${docInfo.speciality}`}
            onError={handleImageError}
          />
        </div>

        <div className="flex-1 border border-slate-200 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0 shadow-sm transition-all duration-300 hover:shadow-md">
          <p className="flex items-center gap-2 text-3xl font-medium text-gray-700">
            {docInfo.name}{" "}
            <img className="w-5 transition-transform duration-300 hover:rotate-12" src={assets.verified_icon} alt="" />
          </p>
          <div className="flex items-center gap-2 mt-1 text-gray-600">
            <p>
              {docInfo.degree} - {docInfo.speciality}
            </p>
            <span className="py-0.5 px-2 border text-xs rounded-full bg-gray-50">
              {docInfo.experience}
            </span>
          </div>

          {/* Animated Tab Switcher */}
          <div className="flex items-center gap-4 mt-4 border-b border-gray-200 pb-1 text-sm font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('about')}
              className={`flex items-center gap-1.5 pb-1 transition-all duration-200 cursor-pointer relative ${
                activeTab === 'about'
                  ? 'text-blue-600 font-semibold after:content-[""] after:absolute after:bottom-[-5px] after:left-0 after:right-0 after:h-[2px] after:bg-blue-600'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <span>About</span>
              <img className="w-3" src={assets.info_icon} alt="" />
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('address')}
              className={`flex items-center gap-1.5 pb-1 transition-all duration-200 cursor-pointer relative ${
                activeTab === 'address'
                  ? 'text-blue-600 font-semibold after:content-[""] after:absolute after:bottom-[-5px] after:left-0 after:right-0 after:h-[2px] after:bg-blue-600'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <span>Address & Timings</span>
            </button>
          </div>

          {/* Animated Tab Content */}
          <div className="min-h-[70px] mt-2">
            {activeTab === 'about' ? (
              <p className="text-sm text-gray-600 max-w-[700px] leading-relaxed animate-fade-in">
                {docInfo.about}
              </p>
            ) : (
              <div className="text-sm text-gray-600 space-y-1 animate-fade-in">
                <p className="font-medium text-gray-700">Clinic Location:</p>
                <p>{docInfo.address?.line1 || '17th Cross, Richmond'}</p>
                <p>{docInfo.address?.line2 || 'Circle, Ring Road, London'}</p>
                <p className="text-xs text-blue-600 pt-1 font-medium">Available Consultation Hours: 10:00 AM – 9:00 PM</p>
              </div>
            )}
          </div>

          <p className="text-gray-600 font-medium mt-4">
            Appointment fee:{" "}
            <span className="text-gray-800 font-semibold">
              {currencySymbol}
              {docInfo.fees}
            </span>{" "}
          </p>
        </div>
      </div>

      {/* Booking slots */}
      <div className="sm:ml-72 sm:pl-4 mt-8 font-medium text-[#565656]">
        <p className="flex items-center gap-2">
          <span>Booking slots</span>
          {slotTime && (
            <span className="text-xs text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full font-semibold animate-fade-in">
              Selected: {slotTime}
            </span>
          )}
        </p>

        {/* 7-Day Date Selector with Smooth Animations */}
        <div className="flex gap-3 items-center w-full overflow-x-auto mt-4 flex-nowrap py-1">
          {docSlots.map((day, index) => (
            <button
              type="button"
              onClick={() => {
                setSlotIndex(index);
                setSlotTime('');
              }}
              key={index}
              disabled={day.slots.length === 0}
              aria-pressed={slotIndex === index}
              className={`text-center py-6 min-w-16 flex-shrink-0 rounded-full cursor-pointer transition-all duration-200 active:scale-95 ${
                slotIndex === index
                  ? "bg-blue-600 text-white shadow-sm scale-105 font-medium"
                  : "border border-gray-200 hover:border-blue-400 hover:scale-105 bg-white text-gray-700"
              } ${day.slots.length === 0 ? 'cursor-not-allowed opacity-40 hover:scale-100 bg-gray-50' : ''}`}
            >
              <span className="block text-xs">{daysOfWeek[day.date.getDay()]}</span>
              <span className="block text-base font-semibold">{day.date.getDate()}</span>
            </button>
          ))}
        </div>

        {/* Time Slots with Pop Animation */}
        <div className="flex items-center gap-3 w-full overflow-x-auto mt-4 flex-nowrap py-1 min-h-[46px]">
          {docSlots[slotIndex]?.slots.map((item) => {
            const isSelected = item.time === slotTime;
            return (
              <button
                type="button"
                onClick={() => setSlotTime(item.time)}
                key={item.time}
                aria-pressed={isSelected}
                className={`text-sm flex-shrink-0 px-5 py-2 rounded-full cursor-pointer transition-all duration-200 active:scale-95 ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-sm font-medium animate-slot-pop scale-105"
                    : "text-gray-600 border border-gray-300 hover:border-blue-400 hover:text-blue-600 hover:scale-105 bg-white"
                }`}
              >
                {isSelected && <span className="mr-1 font-bold">✓</span>}
                {item.time.toLowerCase()}
              </button>
            );
          })}
          {docSlots[slotIndex]?.slots.length === 0 && (
            <p className="py-2 text-sm text-gray-500 animate-fade-in">No available slots for this day. Choose another date.</p>
          )}
        </div>

        {/* Interactive Book Button */}
        <button
          type="button"
          onClick={bookAppointment}
          disabled={booking || !slotTime || !docInfo.available}
          className="bg-blue-600 text-white text-sm font-medium px-20 py-3 rounded-full my-6 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-blue-700 hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
        >
          {booking ? 'Booking…' : !docInfo.available ? 'Not accepting appointments' : 'Book an appointment'}
        </button>
      </div>

      <RelatedDoctors speciality={docInfo.speciality} docId={docId} />
    </div>
  );
};

export default Appointment;
