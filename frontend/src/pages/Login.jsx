import { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const { backendUrl, token, setToken } = useContext(AppContext);
  const navigate = useNavigate();
  const [state, setState] = useState('Sign Up');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      const endpoint = state === 'Sign Up' ? '/api/user/register' : '/api/user/login';
      const payload = state === 'Sign Up' ? { name, email, password } : { email, password };
      const { data } = await axios.post(`${backendUrl}${endpoint}`, payload);

      if (!data.success) {
        toast.error(data.message || 'Unable to authenticate.');
        return;
      }

      localStorage.setItem('token', data.token);
      setToken(data.token);
    } catch (error) {
      const message = error.response?.data?.message
        || (error.code === 'ERR_NETWORK'
          ? `Cannot reach the backend at ${backendUrl}. Start the backend server and try again.`
          : error.message)
        || 'Unable to authenticate.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (token) navigate('/');
  }, [token, navigate]);

  const toggleState = () => setState((current) => current === 'Sign Up' ? 'Login' : 'Sign Up');

  return (
    <form onSubmit={onSubmitHandler} className="flex min-h-[80vh] items-center" aria-busy={submitting}>
      <div className="m-auto flex min-w-[340px] flex-col items-start gap-3 rounded-xl border p-8 text-sm text-[#5E5E5E] shadow-lg sm:min-w-96 bg-white">
        <p className="text-2xl font-semibold text-gray-800">{state === 'Sign Up' ? 'Create Account' : 'Login'}</p>
        <p>Please {state === 'Sign Up' ? 'sign up' : 'log in'} to book an appointment.</p>
        {state === 'Sign Up' && (
          <label className="w-full">
            Full Name
            <input
              autoComplete="name"
              onChange={(event) => setName(event.target.value)}
              value={name}
              className="mt-1 w-full rounded border border-[#DADADA] p-2 focus:border-blue-500 focus:outline-none transition-colors"
              type="text"
              required
            />
          </label>
        )}
        <label className="w-full">
          Email
          <input
            autoComplete="email"
            onChange={(event) => setEmail(event.target.value)}
            value={email}
            className="mt-1 w-full rounded border border-[#DADADA] p-2 focus:border-blue-500 focus:outline-none transition-colors"
            type="email"
            required
          />
        </label>
        <label className="w-full">
          Password
          <input
            autoComplete={state === 'Sign Up' ? 'new-password' : 'current-password'}
            onChange={(event) => setPassword(event.target.value)}
            value={password}
            className="mt-1 w-full rounded border border-[#DADADA] p-2 focus:border-blue-500 focus:outline-none transition-colors"
            type="password"
            required
          />
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="my-2 w-full rounded-md bg-blue-600 py-2.5 text-base text-white transition-all hover:bg-blue-700 hover:shadow disabled:cursor-wait disabled:opacity-60 cursor-pointer active:scale-95"
        >
          {submitting ? 'Please wait…' : state === 'Sign Up' ? 'Create account' : 'Login'}
        </button>
        <p>
          {state === 'Sign Up' ? 'Already have an account? ' : 'Need an account? '}
          <button type="button" onClick={toggleState} className="text-blue-600 underline font-medium hover:text-blue-700 cursor-pointer">
            {state === 'Sign Up' ? 'Login here' : 'Create account'}
          </button>
        </p>
        <div className="mt-1 w-full border-t pt-3 text-center">
          <p className="text-xs text-gray-500">
            Are you a doctor?{' '}
            <Link to="/doctor/login" className="font-semibold text-blue-600 underline hover:text-blue-700">
              Doctor Portal Login
            </Link>
          </p>
        </div>
      </div>
    </form>
  );
};

export default Login;