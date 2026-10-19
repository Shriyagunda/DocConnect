import { useCallback, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';

const doctorTokenKey = 'dtoken';
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatSlotDate(value) {
  const parts = typeof value === 'string' ? value.split('_').map(Number) : [];
  if (parts.length !== 3 || parts.some((part) => !Number.isInteger(part))) {
    return value || 'Date unavailable';
  }
  const [day, month, year] = parts;
  if (month < 1 || month > 12) return value;
  return `${day} ${months[month - 1]} ${year}`;
}

function getAppointmentStatus(appointment) {
  if (appointment.cancelled) return { label: 'Cancelled', className: 'bg-red-50 text-red-700 ring-red-200' };
  if (appointment.isCompleted) return { label: 'Completed', className: 'bg-slate-100 text-slate-700 ring-slate-200' };
  if (appointment.isConfirmed) return { label: 'Accepted', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' };
  return { label: 'Needs review', className: 'bg-amber-50 text-amber-700 ring-amber-200' };
}

const DoctorDashboard = () => {
  const { backendUrl } = useContext(AppContext);
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyAppointment, setBusyAppointment] = useState('');

  const loadDashboard = useCallback(async () => {
    const dtoken = localStorage.getItem(doctorTokenKey);
    if (!dtoken) {
      navigate('/doctor/login', { replace: true });
      return;
    }

    setLoading(true);
    try {
      const [profileResponse, appointmentsResponse] = await Promise.all([
        axios.get(`${backendUrl}/api/doctor/profile`, { headers: { dtoken } }),
        axios.get(`${backendUrl}/api/doctor/appointments`, { headers: { dtoken } }),
      ]);

      if (!profileResponse.data.success || !appointmentsResponse.data.success) {
        throw new Error(profileResponse.data.message || appointmentsResponse.data.message || 'Unable to load doctor dashboard.');
      }

      setDoctor(profileResponse.data.profileData);
      setAppointments(appointmentsResponse.data.appointments || []);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Unable to load doctor dashboard.';
      if (error.response?.status === 401 || /not authorized|login again|jwt/i.test(message)) {
        localStorage.removeItem(doctorTokenKey);
        toast.error('Your doctor session expired. Please sign in again.');
        navigate('/doctor/login', { replace: true });
      } else {
        toast.error(
          error.code === 'ERR_NETWORK'
            ? `Cannot reach the backend at ${backendUrl}. Start the backend server and try again.`
            : message
        );
      }
    } finally {
      setLoading(false);
    }
  }, [backendUrl, navigate]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const updateAppointment = async (appointment, action) => {
    if (busyAppointment) return;
    const dtoken = localStorage.getItem(doctorTokenKey);
    const endpoint = action === 'accept' ? 'confirm-appointment' : 'cancel-appointment';
    const confirmation = action === 'accept'
      ? 'Accept this appointment?'
      : 'Reject and cancel this appointment? This cannot be undone.';
    if (!window.confirm(confirmation)) return;

    setBusyAppointment(appointment._id);
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/doctor/${endpoint}`,
        { appointmentId: appointment._id },
        { headers: { dtoken } }
      );
      if (!data.success) {
        toast.error(data.message || 'Unable to update appointment.');
        return;
      }
      toast.success(action === 'accept' ? 'Appointment accepted.' : 'Appointment rejected.');
      await loadDashboard();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Unable to update appointment.');
    } finally {
      setBusyAppointment('');
    }
  };

  const logout = () => {
    localStorage.removeItem(doctorTokenKey);
    navigate('/doctor/login', { replace: true });
  };

  const pendingCount = appointments.filter((item) => !item.cancelled && !item.isCompleted && !item.isConfirmed).length;

  return (
    <main className="mx-auto min-h-[70vh] max-w-6xl py-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Doctor portal</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-800">
            {doctor?.name ? `Welcome, ${doctor.name}` : 'Appointments'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {doctor?.speciality || 'Manage your appointment requests and patient visits.'}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={loadDashboard}
            disabled={loading}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={logout}
            className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
          >
            Sign out
          </button>
        </div>
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-3" aria-label="Appointment summary">
        {[
          { label: 'Total appointments', value: appointments.length },
          { label: 'Needs your review', value: pendingCount },
          { label: 'Accepted', value: appointments.filter((item) => item.isConfirmed && !item.cancelled).length },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-800">{value}</p>
          </div>
        ))}
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-slate-800">Patient appointments</h2>
          <span className="text-sm text-slate-500">{appointments.length} total</span>
        </div>

        {loading ? (
          <p className="rounded-xl border border-slate-200 bg-white py-14 text-center text-slate-500" role="status">Loading appointments…</p>
        ) : appointments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white py-14 text-center">
            <p className="font-medium text-slate-700">No appointments yet</p>
            <p className="mt-1 text-sm text-slate-500">New patient bookings will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => {
              const status = getAppointmentStatus(appointment);
              const patient = appointment.userData || {};
              const appointmentId = appointment._id || appointment.id;
              const canReview = !appointment.cancelled && !appointment.isCompleted && !appointment.isConfirmed;

              return (
                <article key={appointmentId} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-slate-800">{patient.name || 'Patient'}</h3>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${status.className}`}>
                          {status.label}
                        </span>
                      </div>
                      <div className="mt-3 grid gap-x-8 gap-y-2 text-sm text-slate-600 sm:grid-cols-2">
                        <p><span className="font-medium text-slate-700">Date:</span> {formatSlotDate(appointment.slotDate)}</p>
                        <p><span className="font-medium text-slate-700">Time:</span> {appointment.slotTime || 'Unavailable'}</p>
                        {patient.email && <p className="break-all"><span className="font-medium text-slate-700">Email:</span> {patient.email}</p>}
                        {patient.phone && <p><span className="font-medium text-slate-700">Phone:</span> {patient.phone}</p>}
                        <p><span className="font-medium text-slate-700">Fee:</span> ${Number(appointment.amount || 0).toFixed(2)}</p>
                      </div>
                    </div>

                    {canReview && (
                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() => updateAppointment({ ...appointment, _id: appointmentId }, 'accept')}
                          disabled={Boolean(busyAppointment)}
                          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-60"
                        >
                          {busyAppointment === appointmentId ? 'Please wait…' : 'Accept'}
                        </button>
                        <button
                          type="button"
                          onClick={() => updateAppointment({ ...appointment, _id: appointmentId }, 'reject')}
                          disabled={Boolean(busyAppointment)}
                          className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
};

export default DoctorDashboard;
