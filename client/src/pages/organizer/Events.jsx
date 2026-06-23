import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/axios';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function OrgEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/events?organizer=me&limit=50').then((res) => {
      setEvents(res.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this event?')) return;
    try {
      await api.delete(`/events/${id}`);
      setEvents(events.filter((e) => e._id !== id));
      toast.success('Event deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleStatus = async (id, status) => {
    try {
      const res = await api.patch(`/events/${id}/status`, { status });
      setEvents(events.map((e) => e._id === id ? res.data.data : e));
      toast.success(`Event ${status}`);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-bold">My Events</h1>
        <Link to="/organizer/events/create" className="gradient-btn px-4 py-2 rounded-xl text-sm font-medium">Create Event</Link>
      </div>
      {events.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-4">📅</p>
          <p className="text-gray-500 mb-4">No events yet</p>
          <Link to="/organizer/events/create" className="gradient-btn px-6 py-2.5 rounded-xl text-sm font-medium inline-block">Create Your First Event</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <div key={event._id} className="glass rounded-2xl p-5 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm">{event.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{formatDate(event.date)} • {event.city}</p>
                <span className={`text-xs mt-1 inline-block px-2 py-0.5 rounded-full ${
                  event.status === 'published' ? 'bg-green-500/20 text-green-400' :
                  event.status === 'draft' ? 'bg-yellow-500/20 text-yellow-400' :
                  event.status === 'cancelled' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                }`}>{event.status}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => navigate(`/organizer/events/${event._id}/attendees`)} className="glass px-3 py-1.5 rounded-lg text-xs hover:bg-white/10">Attendees</button>
                <button onClick={() => navigate(`/organizer/events/${event._id}/edit`)} className="glass px-3 py-1.5 rounded-lg text-xs hover:bg-white/10">Edit</button>
                {event.status === 'draft' && (
                  <button onClick={() => handleStatus(event._id, 'published')} className="glass px-3 py-1.5 rounded-lg text-xs text-green-400 hover:bg-green-500/10">Publish</button>
                )}
                {event.status === 'published' && (
                  <button onClick={() => handleStatus(event._id, 'cancelled')} className="glass px-3 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-500/10">Cancel</button>
                )}
                <button onClick={() => handleDelete(event._id)} className="glass px-3 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-500/10">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
