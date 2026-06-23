import { useState, useEffect } from 'react';
import api from '../../services/axios';
import toast from 'react-hot-toast';

export default function OrgCertificates() {
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState('');

  useEffect(() => {
    api.get('/events?organizer=me&limit=50').then((res) => setEvents(res.data.data)).catch(() => {});
  }, []);

  const handleGenerate = async () => {
    if (!eventId) return toast.error('Select an event');
    try {
      const res = await api.post(`/certificates/generate/${eventId}`);
      toast.success(`${res.data.count} certificates generated`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed');
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl font-bold mb-6">Generate Certificates</h1>
      <div className="glass rounded-2xl p-6 space-y-4">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Event</label>
          <select value={eventId} onChange={(e) => setEventId(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500">
            <option value="">Select event...</option>
            {events.map((e) => <option key={e._id} value={e._id}>{e.title}</option>)}
          </select>
        </div>
        <button onClick={handleGenerate} className="gradient-btn px-6 py-2.5 rounded-xl text-sm font-medium">
          Generate Certificates for Checked-in Attendees
        </button>
      </div>
    </div>
  );
}
