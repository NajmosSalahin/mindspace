import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetEventByIdQuery, useToggleWishlistMutation } from '../redux/services/eventService';
import { formatDate, formatTime, formatCurrency } from '../utils/formatters';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';

function Countdown({ date }) {
  const [time, setTime] = useState({});
  useEffect(() => {
    const tick = () => {
      const diff = new Date(date).getTime() - Date.now();
      if (diff <= 0) return;
      setTime({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [date]);

  return (
    <div className="grid grid-cols-4 gap-2 text-center">
      {['days', 'hours', 'minutes', 'seconds'].map((unit) => (
        <div key={unit} className="glass rounded-xl p-3">
          <div className="text-2xl font-bold text-indigo-400">{time[unit] || 0}</div>
          <div className="text-[10px] uppercase text-gray-500">{unit}</div>
        </div>
      ))}
    </div>
  );
}

export default function EventDetail() {
  const { id } = useParams();
  const { data, isLoading, isError } = useGetEventByIdQuery(id);
  const [toggleWishlist] = useToggleWishlistMutation();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [tab, setTab] = useState('overview');
  const [selectedTickets, setSelectedTickets] = useState({});

  const event = data?.data;

  const handleWishlist = async () => {
    if (!isAuthenticated) return toast.error('Please login first');
    try {
      const res = await toggleWishlist(id).unwrap();
      toast.success(res.message);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed');
    }
  };

  const handleBuy = () => {
    if (!isAuthenticated) return toast.error('Please login to purchase tickets');
    const tickets = Object.entries(selectedTickets).filter(([, qty]) => qty > 0).map(([type, quantity]) => ({ type, quantity }));
    if (tickets.length === 0) return toast.error('Select at least one ticket');
    window.location.href = `/order-confirmation/${id}?tickets=${encodeURIComponent(JSON.stringify(tickets))}`;
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="h-64 bg-white/5 rounded-2xl animate-pulse mb-8" />
        <div className="h-8 w-1/2 bg-white/5 rounded animate-pulse mb-4" />
        <div className="h-4 w-1/3 bg-white/5 rounded animate-pulse" />
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-4xl mb-4">🔍</p>
        <p className="text-gray-500">Event not found or has been removed.</p>
        <Link to="/events" className="text-indigo-400 text-sm mt-4 inline-block">Browse all events →</Link>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Banner */}
      <div className="relative h-64 md:h-96 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/30 to-navy/90 z-10" />
        {event.banner ? (
          <img src={event.banner} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20" />
        )}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-6 md:p-10">
          <div className="max-w-7xl mx-auto">
            <span className="text-xs uppercase tracking-wider text-indigo-400 font-medium bg-indigo-500/20 px-3 py-1 rounded-full">{event.category}</span>
            <h1 className="font-display text-3xl md:text-5xl font-bold mt-3">{event.title}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1">
          {/* Tabs */}
          <div className="flex gap-4 border-b border-white/10 mb-6">
            {['overview', 'sessions', 'speakers', 'reviews'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`pb-3 text-sm font-medium capitalize transition border-b-2 ${
                  tab === t ? 'text-indigo-400 border-indigo-500' : 'text-gray-500 border-transparent hover:text-gray-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {tab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="glass rounded-2xl p-6">
                  <h2 className="font-display text-xl font-bold mb-3">About This Event</h2>
                  <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-line">{event.description}</p>
                </div>

                <div className="glass rounded-2xl p-6">
                  <h2 className="font-display text-xl font-bold mb-4">Date & Venue</h2>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3">
                      <span className="text-indigo-400">📅</span>
                      <span className="text-gray-300">{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-indigo-400">⏰</span>
                      <span className="text-gray-300">{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-indigo-400">📍</span>
                      <span className="text-gray-300">{event.venue}, {event.address}, {event.city}, {event.country}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-indigo-400">👤</span>
                      <span className="text-gray-300">Organized by {event.organizerId?.name}</span>
                    </div>
                  </div>
                </div>

                {event.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag) => (
                      <span key={tag} className="text-xs px-3 py-1 rounded-full bg-white/5 text-gray-400">#{tag}</span>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {tab === 'sessions' && (
              <motion.div key="sessions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                {event.sessions?.length > 0 ? event.sessions.map((s, i) => (
                  <div key={s._id || i} className="glass rounded-2xl p-5">
                    <h3 className="font-semibold text-sm mb-1">{s.title}</h3>
                    <p className="text-xs text-gray-400 mb-2">{formatTime(s.startTime)} - {formatTime(s.endTime)} {s.room && `• ${s.room}`}</p>
                    <p className="text-xs text-gray-500">{s.description}</p>
                  </div>
                )) : <p className="text-gray-500 text-sm">No sessions added yet.</p>}
              </motion.div>
            )}

            {tab === 'speakers' && (
              <motion.div key="speakers" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {event.speakers?.length > 0 ? event.speakers.map((s, i) => (
                  <div key={s._id || i} className="glass rounded-2xl p-5 flex gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500/30 to-violet-500/30 shrink-0 flex items-center justify-center text-xl">
                      {s.image ? <img src={s.image} alt={s.name} className="w-full h-full rounded-full object-cover" /> : '🎤'}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold">{s.name}</h3>
                      <p className="text-xs text-indigo-400">{s.designation}</p>
                      <p className="text-xs text-gray-500 mt-1">{s.bio}</p>
                    </div>
                  </div>
                )) : <p className="text-gray-500 text-sm">No speakers added yet.</p>}
              </motion.div>
            )}

            {tab === 'reviews' && (
              <motion.div key="reviews" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="text-gray-500 text-sm">Reviews coming soon.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sticky Sidebar */}
        <div className="lg:w-80 shrink-0">
          <div className="sticky top-24 space-y-4">
            <div className="glass rounded-2xl p-6">
              <h3 className="font-display text-lg font-bold mb-4">Event Countdown</h3>
              <Countdown date={event.date} />
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="font-display text-lg font-bold mb-4">Select Tickets</h3>
              <div className="space-y-3">
                {event.ticketTypes?.map((tt) => (
                  <div key={tt.name} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{tt.name}</p>
                      <p className="text-xs text-gray-500">{tt.remaining} left • {tt.price === 0 ? 'Free' : formatCurrency(tt.price)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedTickets((prev) => ({ ...prev, [tt.name]: Math.max(0, (prev[tt.name] || 0) - 1) }))}
                        className="w-7 h-7 rounded-lg glass flex items-center justify-center text-sm hover:bg-white/10"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-sm">{selectedTickets[tt.name] || 0}</span>
                      <button
                        onClick={() => setSelectedTickets((prev) => ({ ...prev, [tt.name]: Math.min(tt.remaining, (prev[tt.name] || 0) + 1) }))}
                        className="w-7 h-7 rounded-lg glass flex items-center justify-center text-sm hover:bg-white/10"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={handleBuy} className="gradient-btn w-full py-3 rounded-xl text-sm font-medium">
              Get Tickets
            </button>

            <button onClick={handleWishlist} className="w-full py-2.5 rounded-xl text-sm glass text-gray-400 hover:text-white transition">
              ♥ Add to Wishlist
            </button>

            <Link to={`/organizers/${event.organizerId?._id}`} className="glass rounded-2xl p-4 flex items-center gap-3 hover:bg-white/5 transition block">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/30 to-violet-500/30 flex items-center justify-center text-sm">
                {event.organizerId?.name?.[0] || 'O'}
              </div>
              <div>
                <p className="text-xs text-gray-500">Organized by</p>
                <p className="text-sm font-medium">{event.organizerId?.name}</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
