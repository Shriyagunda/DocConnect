import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Doctors from './pages/Doctors';
import Navbar from './components/Navbar';
import About from './pages/About';
import Appointment from './pages/Appointment';
import MyProfile from './pages/MyProfile';
import MyAppointments from './pages/MyAppointments';
import Contact from './pages/Contact';
import DoctorLogin from './pages/DoctorLogin';
import DoctorDashboard from './pages/DoctorDashboard';
import Footer from './components/Footer';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Main App component

const App = () => {
  return (
    <div className='mx-4 sm:mx-[10%]'>
      <ToastContainer position='top-center' theme='colored' />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/doctors/:speciality" element={<Doctors />} />
        <Route path="/login" element={<Login />} />
        <Route path="/doctor/login" element={<DoctorLogin />} />
        <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
        <Route path="/my-profile" element={<MyProfile />} />
        <Route path="/my-appointments" element={<MyAppointments />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/appointment/:docId" element={<Appointment />} />
      </Routes>
      <Footer />
    </div>
  );
};

export default App;