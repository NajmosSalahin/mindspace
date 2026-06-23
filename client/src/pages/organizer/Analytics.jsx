import { useState, useEffect } from 'react';
import api from '../../services/axios';
import { formatCurrency } from '../../utils/formatters';

export default function Analytics() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    api.get('/events?organizer=me&limit=50').then((res) => setEvents(res.data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedEvent) return;
    api.get(`/events/${selectedEvent}/analytics`).then((res) => setAnalytics(res.data.data)).catch(() => {});
  }, [selectedEvent]);

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-6">Analytics</h1>
      <div className="glass rounded-2xl p-6 mb-6">
        <label className="text-xs text-gray-500 block mb-2">Select Event</label>
        <select
          value={selectedEvent || ''}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
        >
          <option value="">Choose an event...</option>
          {events.map((e) => <option key={e._id} value={e._id}>{e.title}</option>)}
        </select>
      </div>

      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass rounded-2xl p-5 text-center">
            <p className="text-2xl font-bold gradient-text">{analytics.totalTickets}</p>
            <p className="text-xs text-gray-500">Tickets Sold</p>
          </div>
          <div className="glass rounded-2xl p-5 text-center">
            <p className="text-2xl font-bold gradient-text">{analytics.checkedIn}</p>
            <p className="text-xs text-gray-500">Checked In</p>
          </div>
          <div className="glass rounded-2xl p-5 text-center">
            <p className="text-2xl font-bold gradient-text">{analytics.attendanceRate?.toFixed(1)}%</p>
            <p className="text-xs text-gray-500">Attendance Rate</p>
          </div>
          <div className="glass rounded-2xl p-5 text-center">
            <p className="text-2xl font-bold gradient-text">{formatCurrency(analytics.totalRevenue)}</p>
            <p className="text-xs text-gray-500">Revenue</p>
          </div>
        </div>
      )}
    </div>
  );
}
