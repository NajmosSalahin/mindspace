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
        <div key={unit} className="bg-deep border border-border rounded-lg p-3">
          <div className="font-mono text-xl font-semibold text-rose tabular-nums">{String(time[unit] || 0).padStart(2, '0')}</div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-gray-600 mt-0.5">{unit}</div>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-64 bg-surface border border-border rounded-xl animate-pulse mb-8" />
        <div className="h-8 w-1/2 bg-surface border border-border rounded animate-pulse mb-4" />
        <div className="h-4 w-1/3 bg-surface border border-border rounded animate-pulse" />
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="font-display text-6xl text-gray-800 mb-4">?</p>
        <p className="text-gray-600">Event not found or has been removed.</p>
        <Link to="/events" className="text-rose text-sm mt-4 inline-block hover:text-rose-400 transition">Browse all events →</Link>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Banner */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-deep via-deep/60 to-transparent z-10" />
        {event.banner ? (
          <img src={event.banner} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-rose/10 to-cyan/10" />
        )}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-6 md:p-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-rose bg-rose/10 px-2.5 py-1 rounded">{event.category}</span>
              {event.isFeatured && <span className="font-mono text-[10px] uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded">Featured</span>}
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-white tracking-display">{event.title}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Tabs */}
          <div className="flex gap-6 border-b border-border mb-6">
            {['overview', 'sessions', 'speakers', 'reviews'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`pb-3 text-sm transition border-b-2 ${
                  tab === t
                    ? 'text-rose border-rose font-medium'
                    : 'text-gray-600 border-transparent hover:text-gray-400'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {tab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="bg-surface border border-border rounded-xl p-6">
                  <h2 className="font-display text-xl font-bold text-white tracking-display mb-3">About this event</h2>
                  <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-line prose-event">{event.description}</p>
                </div>

                <div className="bg-surface border border-border rounded-xl p-6">
                  <h2 className="font-display text-xl font-bold text-white tracking-display mb-4">Date & venue</h2>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-rose w-12 shrink-0">Date</span>
                      <span className="text-gray-400">{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-rose w-12 shrink-0">Time</span>
                      <span className="text-gray-400">{formatTime(event.startTime)} — {formatTime(event.endTime)}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-rose w-12 shrink-0">Venue</span>
                      <span className="text-gray-400">{event.venue}, {event.address}, {event.city}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-rose w-12 shrink-0">Host</span>
                      <span className="text-gray-400">{event.organizerId?.name}</span>
                    </div>
                  </div>
                </div>

                {event.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag) => (
                      <span key={tag} className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded bg-surface border border-border text-gray-600">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {tab === 'sessions' && (
              <motion.div key="sessions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                {event.sessions?.length > 0 ? event.sessions.map((s, i) => (
                  <div key={s._id || i} className="bg-surface border border-border rounded-xl p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-semibold text-white">{s.title}</h3>
                        <p className="text-xs text-gray-600 mt-1">{s.description}</p>
                      </div>
                      <span className="font-mono text-[10px] text-gray-600 shrink-0 mt-0.5">
                        {s.startTime ? formatTime(s.startTime) : ''}{s.endTime ? ` — ${formatTime(s.endTime)}` : ''}
                        {s.room && ` • ${s.room}`}
                      </span>
                    </div>
                  </div>
                )) : <p className="text-gray-600 text-sm">No sessions added yet.</p>}
              </motion.div>
            )}

            {tab === 'speakers' && (
              <motion.div key="speakers" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {event.speakers?.length > 0 ? event.speakers.map((s, i) => (
                  <div key={s._id || i} className="bg-surface border border-border rounded-xl p-5 flex gap-4 items-start">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-rose/20 to-cyan/20 shrink-0 flex items-center justify-center overflow-hidden">
                      {s.image ? (
                        <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-display text-lg text-gray-700">{s.name?.[0]}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{s.name}</h3>
                      <p className="font-mono text-[10px] uppercase tracking-wider text-rose mt-0.5">{s.designation}</p>
                      <p className="text-xs text-gray-600 mt-1">{s.bio}</p>
                    </div>
                  </div>
                )) : <p className="text-gray-600 text-sm col-span-2">No speakers added yet.</p>}
              </motion.div>
            )}

            {tab === 'reviews' && (
              <motion.div key="reviews" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="text-gray-600 text-sm">Reviews coming soon.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sticky Sidebar */}
        <div className="lg:w-80 shrink-0">
          <div className="sticky top-24 space-y-4">
            <div className="bg-surface border border-border rounded-xl p-5">
              <h3 className="font-mono text-[10px] uppercase tracking-widest text-rose mb-3">Countdown</h3>
              <Countdown date={event.date} />
            </div>

            <div className="bg-surface border border-border rounded-xl p-5">
              <h3 className="font-mono text-[10px] uppercase tracking-widest text-rose mb-3">Tickets</h3>
              <div className="space-y-3">
                {event.ticketTypes?.map((tt) => (
                  <div key={tt.name} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">{tt.name}</p>
                      <p className="font-mono text-xs text-gray-600 mt-0.5">
                        {tt.remaining} left
                        {tt.price === 0 ? ' • Free' : ` • ${formatCurrency(tt.price)}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedTickets((prev) => ({ ...prev, [tt.name]: Math.max(0, (prev[tt.name] || 0) - 1) }))}
                        className="w-7 h-7 rounded-lg bg-deep border border-border flex items-center justify-center text-sm text-gray-400 hover:text-white hover:border-rose/30 transition"
                      >
                        −
                      </button>
                      <span className="font-mono w-5 text-center text-sm text-white tabular-nums">{selectedTickets[tt.name] || 0}</span>
                      <button
                        onClick={() => setSelectedTickets((prev) => ({ ...prev, [tt.name]: Math.min(tt.remaining, (prev[tt.name] || 0) + 1) }))}
                        className="w-7 h-7 rounded-lg bg-deep border border-border flex items-center justify-center text-sm text-gray-400 hover:text-white hover:border-rose/30 transition"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={handleBuy} className="gradient-btn w-full py-3 rounded-lg text-sm font-medium">
              Get tickets
            </button>

            <button onClick={handleWishlist} className="w-full py-2.5 rounded-lg text-sm bg-surface border border-border text-gray-500 hover:text-rose hover:border-rose/30 transition">
              Add to wishlist
            </button>

            <Link to={`/organizers/${event.organizerId?._id}`} className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3 hover:border-rose/20 transition block">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose/20 to-cyan/20 flex items-center justify-center text-sm font-display text-gray-400">
                {event.organizerId?.name?.[0] || 'O'}
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-gray-600">Organized by</p>
                <p className="text-sm font-medium text-white">{event.organizerId?.name}</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
