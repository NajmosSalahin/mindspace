import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/axios';

export default function OrgAttendees() {
  const { id } = useParams();
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/events/${id}/attendees`).then((res) => {
      setAttendees(res.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Attendees</h1>
        <Link to={`/organizer/events/${id}/checkin`} className="gradient-btn px-4 py-2 rounded-xl text-sm font-medium">QR Scanner</Link>
      </div>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : attendees.length === 0 ? (
        <p className="text-gray-500 text-center py-16">No attendees yet</p>
      ) : (
        <div className="space-y-2">
          {attendees.map((ticket) => (
            <div key={ticket._id} className="glass rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center text-sm">
                  {ticket.userId?.name?.[0] || '?'}
                </div>
                <div>
                  <p className="text-sm font-medium">{ticket.userId?.name}</p>
                  <p className="text-xs text-gray-500">{ticket.userId?.email}</p>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${ticket.checkedIn ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                {ticket.checkedIn ? 'Checked In' : 'Not Checked'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
