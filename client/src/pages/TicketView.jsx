import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/axios';
import { QRCode } from 'react-qr-code';
import { formatDate, formatTime, formatCurrency } from '../utils/formatters';

export default function TicketView() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/tickets/${id}`).then((res) => {
      setTicket(res.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="glass rounded-2xl p-8">
          <div className="h-6 w-1/2 bg-white/10 rounded animate-pulse mb-4" />
          <div className="h-4 w-1/3 bg-white/10 rounded animate-pulse mb-8" />
          <div className="w-48 h-48 mx-auto bg-white/10 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-6xl mb-4">🎫</p>
        <p className="text-gray-500 mb-4">Ticket not found</p>
        <Link to="/dashboard/tickets" className="text-rose text-sm hover:text-rose-400 transition">My Tickets →</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="glass rounded-2xl p-8 text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center text-3xl">
          🎟️
        </div>

        <div>
          <h1 className="font-display text-2xl font-bold">{ticket.eventId?.title || 'Event Ticket'}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {ticket.eventId?.date ? `${formatDate(ticket.eventId.date)} • ${ticket.eventId?.venue}` : ''}
          </p>
        </div>

        <div className="bg-deep rounded-xl p-6 inline-block">
          <QRCode value={ticket.qrCode} size={180} />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-surface rounded-xl p-4">
            <p className="text-gray-500 text-xs">Type</p>
            <p className="text-white font-medium mt-0.5">{ticket.ticketType?.name || 'General'}</p>
          </div>
          <div className="bg-surface rounded-xl p-4">
            <p className="text-gray-500 text-xs">Price</p>
            <p className="text-white font-medium mt-0.5">{ticket.ticketType?.price ? formatCurrency(ticket.ticketType.price) : 'Free'}</p>
          </div>
          <div className="bg-surface rounded-xl p-4">
            <p className="text-gray-500 text-xs">Status</p>
            <span className={`text-xs mt-0.5 inline-block px-2 py-0.5 rounded-full ${
              ticket.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>{ticket.status}</span>
          </div>
          <div className="bg-surface rounded-xl p-4">
            <p className="text-gray-500 text-xs">Holder</p>
            <p className="text-white font-medium mt-0.5">{ticket.userId?.name || 'You'}</p>
          </div>
        </div>

        <Link to="/dashboard/tickets" className="text-sm text-gray-500 hover:text-white transition inline-block">
          ← Back to My Tickets
        </Link>
      </div>
    </div>
  );
}
