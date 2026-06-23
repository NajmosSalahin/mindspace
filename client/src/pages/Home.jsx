import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGetTrendingEventsQuery, useGetFeaturedEventsQuery } from '../redux/services/eventService';
import { formatDate, formatCurrency } from '../utils/formatters';

function CountdownTimer({ date }) {
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

  if (!time.days && !time.hours && !time.minutes) return null;

  return (
    <div className="flex gap-3 font-mono text-xs">
      <div className="text-center">
        <span className="text-lg font-semibold text-white block tabular-nums">{String(time.days || 0).padStart(2, '0')}</span>
        <span className="text-gray-600 text-[10px] uppercase tracking-wider">days</span>
      </div>
      <span className="text-gray-700 self-start mt-1">:</span>
      <div className="text-center">
        <span className="text-lg font-semibold text-white block tabular-nums">{String(time.hours || 0).padStart(2, '0')}</span>
        <span className="text-gray-600 text-[10px] uppercase tracking-wider">hrs</span>
      </div>
      <span className="text-gray-700 self-start mt-1">:</span>
      <div className="text-center">
        <span className="text-lg font-semibold text-white block tabular-nums">{String(time.minutes || 0).padStart(2, '0')}</span>
        <span className="text-gray-600 text-[10px] uppercase tracking-wider">min</span>
      </div>
    </div>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Home() {
  const [searchTitle, setSearchTitle] = useState('');
  const { data: trending } = useGetTrendingEventsQuery();
  const { data: featured } = useGetFeaturedEventsQuery();

  const categories = ['Tech', 'Music', 'Sports', 'Business', 'Education', 'Gaming', 'Workshop', 'Other'];

  const marqueeEvents = trending?.data?.length > 0
    ? [...trending.data, ...trending.data]
    : [];

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center gradient-mesh overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-deep pointer-events-none" />
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <span className="section-eyebrow">EventSphere</span>
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.08] tracking-display mt-4">
                Find your people.<br />Find your moment.
              </h1>
              <p className="text-gray-500 text-base sm:text-lg mt-6 max-w-lg leading-relaxed">
                From tech conferences to underground shows — discover and book the events that actually matter to you.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mt-8 max-w-lg">
                <input
                  value={searchTitle}
                  onChange={(e) => setSearchTitle(e.target.value)}
                  placeholder="Search events by title, city, or category..."
                  className="flex-1 bg-surface border border-border rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-rose/50 transition"
                />
                <Link
                  to={`/events?search=${encodeURIComponent(searchTitle)}`}
                  className="gradient-btn px-6 py-3 rounded-lg text-sm font-medium text-center whitespace-nowrap"
                >
                  Explore
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
              className="hidden lg:block"
            >
              <div className="bg-surface border border-border rounded-xl p-6">
                <span className="section-eyebrow">Next event</span>
                {featured?.data?.[0] ? (
                  <div className="mt-4">
                    <p className="font-display text-2xl font-bold text-white mt-1">{featured.data[0].title}</p>
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-rose font-mono text-xs">DATE</span>
                        <span className="text-gray-400">{formatDate(featured.data[0].date)}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-rose font-mono text-xs">VENUE</span>
                        <span className="text-gray-400">{featured.data[0].venue}, {featured.data[0].city}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-rose font-mono text-xs">FROM</span>
                        <span className="text-gray-400">{featured.data[0].ticketTypes?.some(t => t.price === 0) ? 'Free' : formatCurrency(featured.data[0].ticketTypes?.[0]?.price || 0)}</span>
                      </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-border">
                      <CountdownTimer date={featured.data[0].date} />
                    </div>
                    <Link
                      to={`/events/${featured.data[0]._id}`}
                      className="mt-6 inline-flex items-center gap-2 text-sm text-rose hover:text-rose-400 transition"
                    >
                      Get tickets
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm mt-4">Loading featured event...</p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Marquee Ticker */}
      <section className="-mt-16 relative z-20 overflow-hidden">
        <div className="bg-surface border-y border-border py-4">
          {marqueeEvents.length > 0 ? (
            <div className="announce-marquee flex gap-12 whitespace-nowrap hover:[animation-play-state:paused]">
              {Array.from({ length: 4 }).flatMap(() =>
                (trending?.data || []).map((event) => (
                  <Link
                    key={event._id + Math.random()}
                    to={`/events/${event._id}`}
                    className="inline-flex items-center gap-4 shrink-0"
                  >
                    <span className="font-mono text-xs text-rose">{formatDate(event.date).split(',')[0]}</span>
                    <span className="text-sm text-white font-medium">{event.title}</span>
                    <span className="text-xs text-gray-600">{event.city}</span>
                    <span className="text-gray-800">•</span>
                  </Link>
                ))
              )}
            </div>
          ) : (
            <div className="text-center text-sm text-gray-600">Loading upcoming events...</div>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <span className="section-eyebrow">Browse by</span>
          <h2 className="font-display text-3xl font-bold text-white mt-1 mb-8 tracking-display">Categories</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat, i) => (
              <motion.div key={cat} variants={itemVariants}>
                <Link
                  to={`/events?category=${cat}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface border border-border text-sm text-gray-400 hover:text-white hover:border-rose/30 hover:bg-rose/[0.03] transition card-hover"
                >
                  {cat}
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Featured Events */}
      {featured?.data?.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <span className="section-eyebrow">Curated picks</span>
            <h2 className="font-display text-3xl font-bold text-white mt-1 mb-8 tracking-display">Featured events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {featured.data.slice(0, 6).map((event) => (
                <motion.div
                  key={event._id}
                  whileHover={{ y: -3 }}
                  className="bg-surface border border-border rounded-xl overflow-hidden card-hover group"
                >
                  <div className="h-40 bg-gradient-to-br from-rose/5 to-cyan/5 flex items-center justify-center overflow-hidden">
                    {event.banner ? (
                      <img src={event.banner} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    ) : (
                      <span className="font-display text-5xl text-gray-800">ES</span>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-rose">{event.category}</span>
                      {event.isFeatured && (
                        <span className="font-mono text-[10px] uppercase tracking-widest text-amber-400">Featured</span>
                      )}
                    </div>
                    <h3 className="text-base font-semibold text-white leading-snug">{event.title}</h3>
                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
                      <span>{formatDate(event.date)}</span>
                      <span className="text-gray-800">•</span>
                      <span>{event.city}</span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                      <span className="font-mono text-sm text-rose">
                        {event.ticketTypes?.some(t => t.price === 0) ? 'Free' : formatCurrency(event.ticketTypes?.[0]?.price || 0) + '+'}
                      </span>
                      <span className="text-xs text-gray-600 group-hover:text-rose transition">View details →</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* Trending Now */}
      {trending?.data?.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="section-eyebrow">Popular</span>
                <h2 className="font-display text-3xl font-bold text-white mt-1 tracking-display">Trending now</h2>
              </div>
              <Link to="/events?sort=popular" className="text-sm text-gray-600 hover:text-rose transition">View all →</Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x scrollbar-none">
              {trending.data.map((event) => (
                <motion.div
                  key={event._id}
                  whileHover={{ y: -3 }}
                  className="bg-surface border border-border rounded-xl overflow-hidden min-w-[260px] max-w-[260px] snap-start shrink-0 card-hover group"
                >
                  <div className="h-32 bg-gradient-to-br from-rose/5 to-cyan/5 flex items-center justify-center">
                    {event.banner ? (
                      <img src={event.banner} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    ) : (
                      <span className="font-display text-4xl text-gray-800">ES</span>
                    )}
                  </div>
                  <div className="p-4">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-rose">{event.category}</span>
                    <h3 className="text-sm font-semibold text-white mt-1 line-clamp-2">{event.title}</h3>
                    <div className="mt-3 flex items-center justify-between">
                      <CountdownTimer date={event.date} />
                      <Link to={`/events/${event._id}`} className="font-mono text-xs text-rose hover:text-rose-400 transition">Book →</Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-surface border border-border rounded-xl p-8 md:p-12"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Events hosted', value: '500+' },
              { label: 'Happy attendees', value: '50K+' },
              { label: 'Cities covered', value: '100+' },
              { label: 'Active organizers', value: '1K+' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display text-4xl md:text-5xl font-bold text-white tracking-display">{stat.value}</div>
                <div className="font-mono text-xs text-gray-600 uppercase tracking-wider mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <div className="text-center mb-12">
            <span className="section-eyebrow">Testimonials</span>
            <h2 className="font-display text-3xl font-bold text-white mt-1 tracking-display">What people say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { name: 'Sarah K.', role: 'Attendee', text: 'EventSphere made finding and booking events so easy. The interface is stunning!' },
              { name: 'Mark T.', role: 'Organizer', text: 'As an organizer, the dashboard is incredible. Analytics, check-in, everything I need.' },
              { name: 'Emily R.', role: 'Regular', text: 'I love the QR ticket system. No more paper tickets, just show my phone and go!' },
            ].map((t) => (
              <motion.div key={t.name} whileHover={{ y: -2 }} className="bg-surface border border-border rounded-xl p-6 card-hover">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg key={s} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">"{t.text}"</p>
                <div>
                  <p className="text-sm font-medium text-white">{t.name}</p>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-gray-600">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Newsletter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-surface border border-border rounded-xl p-8 md:p-12 text-center"
        >
          <span className="section-eyebrow">Stay updated</span>
          <h2 className="font-display text-3xl font-bold text-white mt-1 mb-2 tracking-display">Never miss an event</h2>
          <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">Get the best events delivered to your inbox, every week.</p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
            <input
              placeholder="your@email.com"
              className="flex-1 bg-deep border border-border rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-rose/50 transition"
            />
            <button className="gradient-btn px-6 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap">Subscribe</button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
