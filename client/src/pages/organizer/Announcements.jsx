import { useState, useEffect } from 'react';
import api from '../../services/axios';
import toast from 'react-hot-toast';

export default function OrgAnnouncements() {
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/events?organizer=me&limit=50').then((res) => setEvents(res.data.data)).catch(() => {});
  }, []);

  const handleSend = async () => {
    if (!eventId || !message.trim()) return toast.error('Select event and enter message');
    try {
      await api.post('/notifications/send-announcement', { eventId, message });
      toast.success('Announcement sent to all ticket holders');
      setMessage('');
    } catch (err) {
      toast.error('Failed to send');
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl font-bold mb-6">Send Announcement</h1>
      <div className="glass rounded-2xl p-6 space-y-4">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Event</label>
          <select value={eventId} onChange={(e) => setEventId(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500">
            <option value="">Select event...</option>
            {events.map((e) => <option key={e._id} value={e._id}>{e.title}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Message</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" placeholder="Enter your announcement..." />
        </div>
        <button onClick={handleSend} className="gradient-btn px-6 py-2.5 rounded-xl text-sm font-medium">Send to All Attendees</button>
      </div>
    </div>
  );
}
