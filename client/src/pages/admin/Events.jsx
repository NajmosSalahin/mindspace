import { useState, useEffect } from 'react';
import api from '../../services/axios';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/events').then((res) => {
      setEvents(res.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this event?')) return;
    try {
      await api.delete(`/admin/events/${id}`);
      setEvents(events.filter((e) => e._id !== id));
      toast.success('Event deleted');
    } catch (err) {
      toast.error('Failed');
    }
  };

  const handleFeature = async (id, isFeatured) => {
    try {
      await api.post(`/admin/feature-event/${id}`, { isFeatured: !isFeatured });
      setEvents(events.map((e) => e._id === id ? { ...e, isFeatured: !isFeatured } : e));
      toast.success(`Event ${isFeatured ? 'unfeatured' : 'featured'}`);
    } catch (err) {
      toast.error('Failed');
    }
  };

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-6">All Events</h1>
      <div className="space-y-2">
        {events.map((event) => (
          <div key={event._id} className="glass rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{event.title}</p>
              <p className="text-xs text-gray-500">{event.organizerId?.name} • {formatDate(event.date)} • {event.category}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded-full ${
                event.status === 'published' ? 'bg-green-500/20 text-green-400' : 
                event.status === 'draft' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
              }`}>{event.status}</span>
              <button onClick={() => handleFeature(event._id, event.isFeatured)} className="text-xs px-2 py-1 rounded-lg text-gold-400 hover:bg-gold-500/10">
                {event.isFeatured ? '★ Featured' : '☆ Feature'}
              </button>
              <button onClick={() => handleDelete(event._id)} className="text-xs px-2 py-1 rounded-lg text-red-400 hover:bg-red-500/10">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
