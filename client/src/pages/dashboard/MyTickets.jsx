import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/axios';
import { formatDate, formatTime, formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';
import { QRCode } from 'react-qr-code';

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQr, setSelectedQr] = useState(null);

  useEffect(() => {
    api.get('/tickets/my-tickets').then((res) => {
      setTickets(res.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleCancel = async (id) => {
    try {
      await api.post(`/tickets/${id}/cancel`);
      setTickets(tickets.map((t) => t._id === id ? { ...t, status: 'cancelled' } : t));
      toast.success('Ticket cancelled');
    } catch (err) {
      toast.error('Failed to cancel ticket');
    }
  };

  if (loading) return <p className="text-gray-500">Loading tickets...</p>;

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-6">My Tickets</h1>
      {tickets.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-4">🎟️</p>
          <p className="text-gray-500 mb-4">No tickets yet</p>
          <Link to="/events" className="gradient-btn px-6 py-2.5 rounded-xl text-sm font-medium inline-block">Browse Events</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div key={ticket._id} className={`glass rounded-2xl p-5 flex items-center justify-between ${ticket.status === 'cancelled' ? 'opacity-50' : ''}`}>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center text-2xl">
                  🎟️
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{ticket.eventId?.title}</h3>
                  <p className="text-xs text-gray-500">{formatDate(ticket.eventId?.date)} • {formatTime(ticket.eventId?.startTime)}</p>
                  <p className="text-xs text-gray-500">{ticket.eventId?.venue} • {ticket.eventId?.city}</p>
                  <span className={`text-xs mt-1 inline-block px-2 py-0.5 rounded-full ${
                    ticket.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {ticket.status}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setSelectedQr(ticket.qrCode)} className="glass px-3 py-1.5 rounded-lg text-xs hover:bg-white/10">
                  Show QR
                </button>
                {ticket.status === 'active' && (
                  <button onClick={() => handleCancel(ticket._id)} className="glass px-3 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-500/10">
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSelectedQr(null)}>
          <div className="glass rounded-2xl p-8 max-w-sm w-full text-center" onClick={(e) => e.stopPropagation()}>
            <QRCode value={selectedQr} size={200} />
            <p className="text-xs text-gray-500 mt-4">Show this at the entrance</p>
            <button onClick={() => setSelectedQr(null)} className="mt-4 text-sm text-indigo-400">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
