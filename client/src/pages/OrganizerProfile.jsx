import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/axios';
import { formatDate } from '../utils/formatters';

export default function OrganizerProfile() {
  const { id } = useParams();
  const [organizer, setOrganizer] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/users/${id}/profile`),
      api.get(`/users/${id}/events`),
    ]).then(([userRes, eventsRes]) => {
      setOrganizer(userRes.data.data);
      setEvents(eventsRes.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-20 bg-white/10 rounded-2xl animate-pulse" />
          <div>
            <div className="h-6 w-48 bg-white/10 rounded animate-pulse mb-2" />
            <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass rounded-2xl p-4 h-32 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!organizer) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-6xl mb-4">👤</p>
        <p className="text-gray-500 mb-4">Organizer not found</p>
        <Link to="/organizers" className="text-rose text-sm hover:text-rose-400 transition">All Organizers →</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Link to="/organizers" className="text-sm text-gray-500 hover:text-white transition mb-6 inline-block">
        ← All Organizers
      </Link>

      <div className="glass rounded-2xl p-8 mb-8">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center text-3xl font-display text-gray-400 shrink-0 overflow-hidden">
            {organizer.profileImage ? (
              <img src={organizer.profileImage} alt={organizer.name} className="w-full h-full object-cover" />
            ) : (
              organizer.name?.[0] || 'O'
            )}
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold">{organizer.name}</h1>
            {organizer.email && <p className="text-gray-500 text-sm mt-1">{organizer.email}</p>}
            {organizer.bio && <p className="text-gray-400 text-sm mt-2 max-w-xl">{organizer.bio}</p>}
          </div>
        </div>
      </div>

      <h2 className="font-display text-2xl font-bold mb-4">Events by {organizer.name}</h2>

      {events.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-4">📅</p>
          <p className="text-gray-500">No events yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <Link key={event._id} to={`/events/${event._id}`} className="glass glass-hover rounded-2xl p-5">
              <div className="w-full h-32 rounded-xl bg-gradient-to-br from-rose/10 to-cyan/10 mb-3 overflow-hidden">
                {event.banner && <img src={event.banner} alt={event.title} className="w-full h-full object-cover" />}
              </div>
              <h3 className="font-semibold text-sm text-white">{event.title}</h3>
              <p className="text-xs text-gray-500 mt-1">
                {event.date ? formatDate(event.date) : ''}{event.city ? ` • ${event.city}` : ''}
              </p>
              <span className={`text-xs mt-2 inline-block px-2 py-0.5 rounded-full ${
                event.status === 'published' ? 'bg-green-500/20 text-green-400' :
                event.status === 'draft' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
              }`}>{event.status}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
