import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGetTrendingEventsQuery, useGetFeaturedEventsQuery } from '../redux/services/eventService';
import { formatDate, formatCurrency } from '../utils/formatters';

const _now = new Date();
const _y = _now.getFullYear();
const _m = _now.getMonth();
const _d = _now.getDate();

const DEMO_EVENTS = [
  { _id: 'demo-1', title: 'Summer Music Festival', date: new Date(_y, _m, _d + 1).toISOString(), venue: 'Central Park', city: 'New York', description: 'An outdoor music festival featuring top artists from around the world. Three stages, food vendors, and art installations.', ticketTypes: [{ price: 89 }], category: 'Music' },
  { _id: 'demo-2', title: 'Jazz & Blues Night', date: new Date(_y, _m, _d + 2).toISOString(), venue: 'Blue Note', city: 'New York', description: 'An evening of world-class jazz and blues performances in an intimate setting.', ticketTypes: [{ price: 45 }], category: 'Music' },
  { _id: 'demo-3', title: 'Tech Summit 2026', date: new Date(_y, _m, _d + 3).toISOString(), venue: 'Pier 17', city: 'San Francisco', description: 'The biggest tech conference of the year featuring keynote speakers, workshops, and networking.', ticketTypes: [{ price: 299 }], category: 'Tech' },
  { _id: 'demo-4', title: 'Modern Art Walk', date: new Date(_y, _m, _d + 4).toISOString(), venue: 'MoMA', city: 'New York', description: 'A curated walk through the most exciting contemporary art exhibitions.', ticketTypes: [{ price: 0 }], category: 'Art' },
  { _id: 'demo-5', title: 'International Food Fest', date: new Date(_y, _m, _d + 5).toISOString(), venue: 'Barclays Center', city: 'Brooklyn', description: 'Taste cuisines from over 30 countries in one weekend.', ticketTypes: [{ price: 25 }], category: 'Food' },
  { _id: 'demo-6', title: 'Indie Film Premiere', date: new Date(_y, _m, _d + 6).toISOString(), venue: 'Lincoln Center', city: 'New York', description: 'Exclusive premiere of the most anticipated indie film of the year.', ticketTypes: [{ price: 18 }], category: 'Art' },
];

function CalendarColumn({ event, day, dateNum, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: 'easeOut' }}
      className="flex flex-col"
    >
      <div className="text-center">
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-amber-400">{day}</span>
        <p className="font-mono text-4xl sm:text-5xl font-semibold text-white mt-1 tabular-nums leading-none">
          {dateNum}
        </p>
      </div>
      <div className="w-8 h-px bg-border mx-auto my-4" />
      {event ? (
        <Link to={`/events/${event._id}`} className="group block text-center">
          <p className="text-sm font-medium text-white group-hover:text-amber-400 transition leading-snug">
            {event.title}
          </p>
          <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
            {event.venue}, {event.city}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-wider text-amber-400/60 mt-2 group-hover:text-amber-400 transition">
            Tickets
          </p>
        </Link>
      ) : (
        <div className="text-center">
          <p className="text-xs text-gray-700 italic">TBA</p>
        </div>
      )}
    </motion.div>
  );
}

function MonthBanner() {
  const now = new Date();
  const month = now.toLocaleDateString('en-US', { month: 'long' });
  const year = now.getFullYear();
  return <>{month} {year}</>;
}

function TrendingRow({ event }) {
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    const tick = () => {
      const diff = new Date(event.date).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft('Started'); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      setTimeLeft(d > 0 ? `${d}d ${h}h` : `${h}h`);
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [event.date]);

  return (
    <Link to={`/events/${event._id}`} className="group flex items-center gap-4 py-3 border-b border-border last:border-0 hover:bg-white/[0.02] -mx-3 px-3 rounded-lg transition">
      <span className="font-mono text-xs text-gray-600 w-12 shrink-0 tabular-nums">{timeLeft}</span>
      <span className="text-sm text-white group-hover:text-amber-400 transition flex-1 truncate">{event.title}</span>
      <span className="text-xs text-gray-600 shrink-0">{event.city}</span>
      <span className="font-mono text-xs text-amber-400/60 group-hover:text-amber-400 transition shrink-0">
        {event.ticketTypes?.some(t => t.price === 0) ? 'Free' : formatCurrency(event.ticketTypes?.[0]?.price || 0)}
      </span>
    </Link>
  );
}

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function Home() {
  const { data: trending } = useGetTrendingEventsQuery();
  const { data: featured } = useGetFeaturedEventsQuery();

  const categories = ['Music', 'Tech', 'Sports', 'Art', 'Food', 'Business', 'Education', 'Gaming'];

  const calendarEvents = useMemo(() => {
    const pool = featured?.data?.length > 0 ? featured.data : (trending?.data?.length > 0 ? trending.data : DEMO_EVENTS);
    return pool.slice(0, 5);
  }, [featured, trending]);

  const getDay = (dateStr) => {
    if (!dateStr) return '---';
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  };

  const getDateNum = (dateStr) => {
    if (!dateStr) return '--';
    return new Date(dateStr).getDate();
  };

  const heroEvent = featured?.data?.[0] || trending?.data?.[0] || DEMO_EVENTS[0];
  const trendingEvents = trending?.data?.length > 0 ? trending.data : DEMO_EVENTS;

  return (
    <div>
      {/* ── Hero: Schedule Board ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/[0.02] via-transparent to-deep pointer-events-none" />
        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between mb-16"
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-amber-400">EventSphere</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-gray-600">
              <MonthBanner />
            </span>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-8 gap-y-10 lg:gap-x-4">
            {Array.from({ length: 5 }).map((_, i) => {
              const event = calendarEvents[i] || null;
              const day = event ? getDay(event.date) : '---';
              const dateNum = event ? getDateNum(event.date) : '--';
              return (
                <CalendarColumn key={i} event={event} day={day} dateNum={dateNum} index={i} />
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-16 text-center"
          >
            <Link
              to="/events"
              className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-gray-600 hover:text-amber-400 transition"
            >
              Browse all events
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-gray-600 mr-2">Categories</span>
            {categories.map((cat, i) => (
              <motion.span key={cat} variants={fadeUp}>
                <Link
                  to={`/events?category=${cat}`}
                  className="text-gray-500 hover:text-amber-400 transition"
                >
                  {cat}{i < categories.length - 1 ? null : ''}
                </Link>
                {i < categories.length - 1 && (
                  <span className="text-gray-800 mx-2">/</span>
                )}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Featured ── */}
      {heroEvent && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-amber-400">Featured</span>
            <div className="mt-4 bg-surface border border-border rounded-xl overflow-hidden">
              <div className="grid lg:grid-cols-5">
                <div className="lg:col-span-2 h-48 lg:h-auto bg-gradient-to-br from-amber-500/10 to-violet-500/10 flex items-center justify-center overflow-hidden">
                  {heroEvent.banner ? (
                    <img src={heroEvent.banner} alt={heroEvent.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-display text-6xl text-gray-800">ES</span>
                  )}
                </div>
                <div className="lg:col-span-3 p-6 lg:p-8 flex flex-col justify-center">
                  <p className="font-mono text-xs text-amber-400 mb-2">
                    {formatDate(heroEvent.date)} — {heroEvent.city}
                  </p>
                  <h2 className="font-display text-2xl lg:text-3xl font-bold text-white tracking-display">
                    {heroEvent.title}
                  </h2>
                  <p className="text-sm text-gray-500 mt-3 line-clamp-2 leading-relaxed">
                    {heroEvent.description}
                  </p>
                  <div className="flex items-center gap-4 mt-5">
                    <Link
                      to={`/events/${heroEvent._id}`}
                      className="gradient-btn px-5 py-2 rounded-lg text-sm font-medium"
                    >
                      Get tickets
                    </Link>
                    <span className="font-mono text-xs text-gray-600">
                      {heroEvent.venue} — {heroEvent.ticketTypes?.some(t => t.price === 0) ? 'Free' : formatCurrency(heroEvent.ticketTypes?.[0]?.price || 0) + '+'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      )}

      {/* ── Trending ── */}
      {trendingEvents.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-amber-400">Trending</span>
              <Link to="/events?sort=popular" className="font-mono text-[10px] uppercase tracking-wider text-gray-600 hover:text-amber-400 transition">View all</Link>
            </div>
            <div className="bg-surface border border-border rounded-xl p-3">
              {trendingEvents.slice(0, 6).map((event) => (
                <TrendingRow key={event._id} event={event} />
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* ── Stats ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-sm text-gray-500">
            <span className="text-white font-semibold">500+</span> events hosted
            <span className="mx-3 text-gray-800">·</span>
            <span className="text-white font-semibold">50k+</span> happy attendees
            <span className="mx-3 text-gray-800">·</span>
            <span className="text-white font-semibold">100+</span> cities
            <span className="mx-3 text-gray-800">·</span>
            <span className="text-white font-semibold">1k+</span> organizers
          </p>
        </motion.div>
      </section>

      {/* ── Testimonials ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-amber-400 block text-center mb-8">Voices</span>
          <div className="grid md:grid-cols-2 gap-5">
            {[
              { name: 'Sarah K.', role: 'Attendee', text: 'Made finding and booking events so easy. The interface is beautiful — I actually enjoy browsing.' },
              { name: 'Mark T.', role: 'Organizer', text: 'The dashboard alone is worth it. Analytics, QR check-in, ticket management — everything I need in one place.' },
              { name: 'Emily R.', role: 'Regular', text: 'No more paper tickets. I show my phone, scan, and I\'m in. Couldn\'t be simpler.' },
              { name: 'David L.', role: 'Event-goer', text: 'I found a underground jazz night through EventSphere that I never would have discovered otherwise.' },
            ].map((t, i) => (
              <motion.div key={t.name} variants={fadeUp} className="bg-surface border border-border rounded-xl p-6">
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg key={s} className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                <div>
                  <p className="text-xs font-medium text-white">{t.name}</p>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-gray-600">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Newsletter ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="border-t border-border pt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
        >
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-amber-400">Stay in the loop</span>
            <p className="text-sm text-gray-500 mt-1">The best events, delivered weekly.</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <input
              placeholder="your@email.com"
              className="flex-1 sm:w-64 bg-surface border border-border rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-400/50 transition"
            />
            <button className="gradient-btn px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap">Subscribe</button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
