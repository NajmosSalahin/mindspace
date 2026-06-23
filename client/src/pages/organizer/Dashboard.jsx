import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-6">Organizer Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link to="/organizer/events" className="glass glass-hover rounded-2xl p-6">
          <p className="text-2xl mb-2">📅</p>
          <h3 className="font-semibold text-sm">My Events</h3>
          <p className="text-xs text-gray-500 mt-1">Manage your events</p>
        </Link>
        <Link to="/organizer/events/create" className="glass glass-hover rounded-2xl p-6">
          <p className="text-2xl mb-2">➕</p>
          <h3 className="font-semibold text-sm">Create Event</h3>
          <p className="text-xs text-gray-500 mt-1">Create a new event</p>
        </Link>
        <Link to="/organizer/analytics" className="glass glass-hover rounded-2xl p-6">
          <p className="text-2xl mb-2">📊</p>
          <h3 className="font-semibold text-sm">Analytics</h3>
          <p className="text-xs text-gray-500 mt-1">View performance</p>
        </Link>
        <Link to="/organizer/coupons" className="glass glass-hover rounded-2xl p-6">
          <p className="text-2xl mb-2">🏷️</p>
          <h3 className="font-semibold text-sm">Coupons</h3>
          <p className="text-xs text-gray-500 mt-1">Manage discounts</p>
        </Link>
        <Link to="/organizer/surveys" className="glass glass-hover rounded-2xl p-6">
          <p className="text-2xl mb-2">📋</p>
          <h3 className="font-semibold text-sm">Surveys</h3>
          <p className="text-xs text-gray-500 mt-1">Gather feedback</p>
        </Link>
        <Link to="/organizer/certificates" className="glass glass-hover rounded-2xl p-6">
          <p className="text-2xl mb-2">🏆</p>
          <h3 className="font-semibold text-sm">Certificates</h3>
          <p className="text-xs text-gray-500 mt-1">Generate certificates</p>
        </Link>
      </div>
    </div>
  );
}
