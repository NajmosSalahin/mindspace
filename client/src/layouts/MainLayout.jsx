import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useState, useEffect } from 'react';
import { useLogoutMutation } from '../redux/services/authService';
import { logout } from '../redux/slices/authSlice';
import { useSocket } from '../hooks/useSocket';

export default function MainLayout() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notifications);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [doLogout] = useLogoutMutation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useSocket();

  const isHome = location.pathname === '/';

  useEffect(() => {
    if (!isHome) { setScrolled(true); return; }
    const onScroll = () => setScrolled(window.scrollY > 64);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHome]);

  const handleLogout = async () => {
    await doLogout();
    dispatch(logout());
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-deep">
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-deep/95 backdrop-blur-lg border-b border-border'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="font-display text-2xl font-bold text-white tracking-display">
              EventSphere
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link to="/events" className="text-sm text-gray-400 hover:text-white transition">Events</Link>
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="text-sm text-gray-400 hover:text-white transition">Dashboard</Link>
                  {user?.role === 'organizer' && (
                    <Link to="/organizer" className="text-sm text-gray-400 hover:text-white transition">Organizer</Link>
                  )}
                  {user?.role === 'admin' && (
                    <Link to="/admin" className="text-sm text-gray-400 hover:text-white transition">Admin</Link>
                  )}
                  <Link to="/dashboard/notifications" className="relative">
                    <svg className="w-5 h-5 text-gray-400 hover:text-white transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose rounded-full text-[10px] flex items-center justify-center font-bold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                  <div className="flex items-center gap-3 pl-4 border-l border-border">
                    <span className="text-sm text-gray-500">{user?.name}</span>
                    <button onClick={handleLogout} className="text-xs text-gray-600 hover:text-rose transition">Logout</button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-4">
                  <Link to="/login" className="text-sm text-gray-400 hover:text-white transition">Sign in</Link>
                  <Link to="/register" className="gradient-btn px-4 py-2 rounded-lg text-sm font-medium">Get started</Link>
                </div>
              )}
            </div>

            <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setMenuOpen(!menuOpen)}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {menuOpen && (
            <div className="md:hidden pb-4 space-y-2 border-t border-border pt-4">
              <Link to="/events" className="block text-sm text-gray-400 py-1.5">Events</Link>
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="block text-sm text-gray-400 py-1.5">Dashboard</Link>
                  {user?.role === 'organizer' && (
                    <Link to="/organizer" className="block text-sm text-gray-400 py-1.5">Organizer</Link>
                  )}
                  {user?.role === 'admin' && (
                    <Link to="/admin" className="block text-sm text-gray-400 py-1.5">Admin</Link>
                  )}
                  <button onClick={handleLogout} className="block text-sm text-gray-600 hover:text-rose py-1.5">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block text-sm text-gray-400 py-1.5">Sign in</Link>
                  <Link to="/register" className="block text-sm text-rose py-1.5">Get started</Link>
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      <main className={isHome ? '' : 'pt-16'}>
        <Outlet />
      </main>

      <footer className="border-t border-border mt-24">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-display text-xl text-white tracking-display">EventSphere</p>
              <p className="text-sm text-gray-600 mt-1">Where your next story begins.</p>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <Link to="/about" className="hover:text-gray-400 transition">About</Link>
              <Link to="/contact" className="hover:text-gray-400 transition">Contact</Link>
              <Link to="/organizers" className="hover:text-gray-400 transition">Organizers</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
