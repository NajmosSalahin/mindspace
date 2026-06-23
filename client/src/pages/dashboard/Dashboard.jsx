import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function Dashboard() {
  const { user } = useSelector((state) => state.auth);

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-2">Welcome, {user?.name}</h1>
      <p className="text-gray-500 text-sm mb-8">Manage your tickets, wishlist, and profile</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link to="/dashboard/tickets" className="glass glass-hover rounded-2xl p-6">
          <p className="text-2xl mb-2">🎟️</p>
          <h3 className="font-semibold text-sm">My Tickets</h3>
          <p className="text-xs text-gray-500 mt-1">View your purchased tickets</p>
        </Link>
        <Link to="/dashboard/wishlist" className="glass glass-hover rounded-2xl p-6">
          <p className="text-2xl mb-2">♥️</p>
          <h3 className="font-semibold text-sm">Wishlist</h3>
          <p className="text-xs text-gray-500 mt-1">Your saved events</p>
        </Link>
        <Link to="/dashboard/profile" className="glass glass-hover rounded-2xl p-6">
          <p className="text-2xl mb-2">👤</p>
          <h3 className="font-semibold text-sm">Profile</h3>
          <p className="text-xs text-gray-500 mt-1">Manage your profile</p>
        </Link>
      </div>
    </div>
  );
}
