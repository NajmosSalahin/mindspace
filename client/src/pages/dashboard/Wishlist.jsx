import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/axios';
import { formatDate } from '../../utils/formatters';

export default function Wishlist() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/favorites').then((res) => {
      setEvents(res.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-6">My Wishlist</h1>
      {events.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-4">♥️</p>
          <p className="text-gray-500">No saved events yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <Link key={event._id} to={`/events/${event._id}`} className="glass glass-hover rounded-2xl p-4">
              <h3 className="font-semibold text-sm">{event.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{formatDate(event.date)} • {event.city}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
