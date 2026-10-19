import { Link } from 'react-router-dom';
import { assets } from '../assets/assets';

const Footer = () => {
  return (
    <footer className='md:mx-10'>
      <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>

        <div>
          <Link to="/" aria-label="DocConnect home" className="inline-block transition-transform duration-200 hover:scale-105">
            <img className='mb-5 w-40' src={assets.logo} alt="DocConnect" />
          </Link>
          <p className='w-full md:w-2/3 text-gray-600 leading-6'>Find trusted doctors, explore specialties, and manage your appointments in one place.</p>
        </div>

        <div>
          <p className='text-xl font-medium mb-5'>COMPANY</p>
          <ul className='flex flex-col gap-2 text-gray-600'>
            <li><Link className="hover:text-blue-600 transition-colors" to="/">Home</Link></li>
            <li><Link className="hover:text-blue-600 transition-colors" to="/doctors">Find a doctor</Link></li>
            <li><Link className="hover:text-blue-600 transition-colors" to="/about">About us</Link></li>
            <li><Link className="hover:text-blue-600 transition-colors" to="/contact">Contact</Link></li>
          </ul>
        </div>

        <div>
          <p className='text-xl font-medium mb-5'>GET IN TOUCH</p>
          <ul className='flex flex-col gap-2 text-gray-600'>
            <li><Link className="hover:text-blue-600 transition-colors" to="/contact">Contact information</Link></li>
            <li><Link className="hover:text-blue-600 transition-colors" to="/my-appointments">My appointments</Link></li>
          </ul>
        </div>

      </div>

      <div>
        <hr className="border-gray-200" />
        <p className='py-5 text-sm text-center text-gray-500'>© {new Date().getFullYear()} DocConnect. All rights reserved.</p>
      </div>

    </footer>
  );
};

export default Footer;
