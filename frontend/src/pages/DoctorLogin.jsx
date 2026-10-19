import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';

const doctorTokenKey = 'dtoken';

const DoctorLogin = () => {
  const { backendUrl } = useContext(AppContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(doctorTokenKey)) {
      navigate('/doctor/dashboard', { replace: true });
    }
  }, [navigate]);

  const onSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      const { data } = await axios.post(`${backendUrl}/api/doctor/login`, { email, password });
      if (!data.success || !data.token) {
        toast.error(data.message || 'Unable to log in.');
        return;
      }

      localStorage.setItem(doctorTokenKey, data.token);
      navigate('/doctor/dashboard', { replace: true });
    } catch (error) {
      toast.error(
        error.response?.data?.message
          || (error.code === 'ERR_NETWORK'
            ? `Cannot reach the backend at ${backendUrl}. Start the backend server and try again.`
            : error.message)
          || 'Unable to log in.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-[70vh] items-center justify-center py-10">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm" aria-busy={submitting}>
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Doctor portal</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-800">Sign in to your account</h1>
        <p className="mt-2 text-sm text-slate-500">Review and manage your patient appointments.</p>

        <label className="mt-6 block text-sm font-medium text-slate-700">
          Email
          <input
            autoComplete="username"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </label>

        <label className="mt-4 block text-sm font-medium text-slate-700">
          Password
          <input
            autoComplete="current-password"
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>

        <p className="mt-5 text-center text-sm text-slate-500">
          Patient? <Link to="/login" className="font-medium text-blue-600 hover:underline">Go to patient login</Link>
        </p>
      </form>
    </main>
  );
};

export default DoctorLogin;
