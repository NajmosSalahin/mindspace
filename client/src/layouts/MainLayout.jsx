import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useState } from 'react';
import { useLogoutMutation } from '../redux/services/authService';
import { logout } from '../redux/slices/authSlice';
import { useSocket } from '../hooks/useSocket';

export default function MainLayout() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notifications);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [doLogout] = useLogoutMutation();
  const [menuOpen, setMenuOpen] = useState(false);
  useSocket();

  const handleLogout = async () => {
    await doLogout();
    dispatch(logout());
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-navy">
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="font-display text-2xl font-bold gradient-text">
              EventSphere
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link to="/events" className="text-sm text-gray-300 hover:text-white transition">Events</Link>
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="text-sm text-gray-300 hover:text-white transition">Dashboard</Link>
                  {user?.role === 'organizer' && (
                    <Link to="/organizer" className="text-sm text-gray-300 hover:text-white transition">Organizer</Link>
                  )}
                  {user?.role === 'admin' && (
                    <Link to="/admin" className="text-sm text-gray-300 hover:text-white transition">Admin</Link>
                  )}
                  <Link to="/dashboard/notifications" className="relative">
                    <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 rounded-full text-[10px] flex items-center justify-center font-bold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-400">{user?.name}</span>
                    <button onClick={handleLogout} className="text-xs text-gray-500 hover:text-red-400 transition">Logout</button>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-sm text-gray-300 hover:text-white transition">Login</Link>
                  <Link to="/register" className="gradient-btn px-4 py-2 rounded-xl text-sm font-medium">Sign Up</Link>
                </>
              )}
            </div>

            <button className="md:hidden text-white" onClick={() => setMenuOpen(!menuOpen)}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {menuOpen && (
            <div className="md:hidden pb-4 space-y-2">
              <Link to="/events" className="block text-sm text-gray-300 py-1">Events</Link>
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="block text-sm text-gray-300 py-1">Dashboard</Link>
                  <button onClick={handleLogout} className="block text-sm text-red-400 py-1">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block text-sm text-gray-300 py-1">Login</Link>
                  <Link to="/register" className="block text-sm text-gray-300 py-1">Register</Link>
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      <main className="pt-16">
        <Outlet />
      </main>

      <footer className="border-t border-white/5 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="font-display text-xl gradient-text mb-2">EventSphere</p>
          <p className="text-sm text-gray-500">Discover events that move you.</p>
        </div>
      </footer>
    </div>
  );
}
