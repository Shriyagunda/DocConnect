import { useContext, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { assets, handleImageError } from '../assets/assets';
import { AppContext } from '../context/AppContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { token, setToken, userData } = useContext(AppContext);
  const [showMenu, setShowMenu] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const closeMenus = () => {
    setShowMenu(false);
    setShowAccountMenu(false);
  };

  const goTo = (path) => {
    closeMenus();
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(false);
    closeMenus();
    navigate('/');
  };

  const links = [
    { to: '/', label: 'HOME' },
    { to: '/doctors', label: 'ALL DOCTORS' },
    { to: '/about', label: 'ABOUT' },
    { to: '/contact', label: 'CONTACT' },
  ];

  const accountLinks = [
    { to: '/my-profile', label: 'My Profile' },
    { to: '/my-appointments', label: 'My Appointments' },
  ];

  return (
    <header className="relative z-30 flex items-center justify-between gap-4 border-b border-gray-300 py-4 mb-5 text-sm">
      <button
        type="button"
        onClick={() => goTo('/')}
        aria-label="DocConnect home"
        className="shrink-0 transition-transform duration-200 hover:scale-105"
      >
        <img className="w-36 cursor-pointer" src={assets.logo} alt="DocConnect" />
      </button>

      <nav aria-label="Main navigation" className="hidden md:block">
        <ul className="flex items-center gap-5 font-medium">
          {links.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `py-2 transition-all duration-200 hover:text-blue-600 relative ${
                    isActive ? 'text-blue-600 font-semibold' : 'text-gray-700'
                  }`
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="ml-auto flex items-center gap-3">
        <button
          type="button"
          onClick={() => goTo('/doctor/login')}
          className="hidden sm:inline-flex rounded-full border border-blue-500 px-4 py-2 text-xs font-medium text-blue-600 transition-all duration-200 hover:bg-blue-50 hover:shadow-sm active:scale-95"
        >
          Doctor Portal
        </button>

        {token ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowAccountMenu((visible) => !visible)}
              aria-expanded={showAccountMenu}
              className="flex items-center gap-2 rounded-full p-1 hover:bg-gray-100 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
            >
              <img
                className="h-9 w-9 rounded-full object-cover border border-gray-200"
                src={userData?.image || assets.profile_pic}
                alt=""
                onError={handleImageError}
              />
              <span className="hidden lg:block max-w-28 truncate text-gray-700 font-medium">
                {userData?.name || 'My account'}
              </span>
              <img className="w-2.5 transition-transform duration-200" src={assets.dropdown_icon} alt="" />
            </button>
            {showAccountMenu && (
              <div
                className="absolute right-0 top-full mt-2 flex min-w-48 flex-col gap-1 rounded-xl bg-white p-2 text-sm text-gray-700 shadow-lg ring-1 ring-black/5 z-50 animate-in fade-in duration-150"
              >
                {accountLinks.map(({ to, label }) => (
                  <button
                    type="button"
                    key={to}
                    onClick={() => goTo(to)}
                    className="rounded-lg px-3 py-2 text-left hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  >
                    {label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-lg px-3 py-2 text-left text-red-600 hover:bg-red-50 transition-colors"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => goTo('/login')}
            className="hidden rounded-full bg-blue-600 px-5 py-2.5 text-sm text-white shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow hover:scale-105 active:scale-95 md:inline-flex"
          >
            Create account
          </button>
        )}

        <button
          type="button"
          onClick={() => setShowMenu(true)}
          aria-label="Open navigation menu"
          aria-expanded={showMenu}
          className="rounded-lg p-2 hover:bg-gray-100 md:hidden transition-colors"
        >
          <img className="w-6" src={assets.menu_icon} alt="" />
        </button>
      </div>

      <div
        className={`fixed inset-0 z-40 bg-white transition-transform duration-300 md:hidden ${
          showMenu ? 'visible translate-x-0' : 'invisible translate-x-full'
        }`}
        aria-hidden={!showMenu}
      >
        <div className="flex items-center justify-between border-b px-5 py-5">
          <img src={assets.logo} className="w-36" alt="DocConnect" />
          <button
            type="button"
            onClick={() => setShowMenu(false)}
            aria-label="Close navigation menu"
            className="rounded-lg p-2 hover:bg-gray-100 transition-colors"
          >
            <img src={assets.cross_icon} className="w-6" alt="" />
          </button>
        </div>
        <nav aria-label="Mobile navigation">
          <ul className="flex flex-col gap-1 px-5 py-4 text-base font-medium">
            {links.map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === '/'}
                  onClick={closeMenus}
                  className={({ isActive }) =>
                    `block rounded-lg px-4 py-3 transition-colors ${isActive ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
            {token ? (
              <>
                {accountLinks.map(({ to, label }) => (
                  <li key={to}>
                    <NavLink
                      to={to}
                      onClick={closeMenus}
                      className={({ isActive }) =>
                        `block rounded-lg px-4 py-3 transition-colors ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`
                      }
                    >
                      {label}
                    </NavLink>
                  </li>
                ))}
                <li>
                  <button
                    type="button"
                    onClick={logout}
                    className="w-full rounded-lg px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Log out
                  </button>
                </li>
              </>
            ) : (
              <li>
                <button
                  type="button"
                  onClick={() => goTo('/login')}
                  className="w-full rounded-lg px-4 py-3 text-left text-blue-700 hover:bg-blue-50 transition-colors"
                >
                  Sign in / Create account
                </button>
              </li>
            )}
            <li>
              <button
                type="button"
                onClick={() => goTo('/doctor/login')}
                className="w-full rounded-lg px-4 py-3 text-left text-blue-700 hover:bg-blue-50 transition-colors"
              >
                Doctor Portal
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
