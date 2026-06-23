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
      });
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [date]);

  return (
    <div className="flex gap-3 text-xs">
      <div className="text-center"><span className="text-lg font-bold text-white block">{time.days || 0}</span><span className="text-gray-500">days</span></div>
      <div className="text-center"><span className="text-lg font-bold text-white block">{time.hours || 0}</span><span className="text-gray-500">hrs</span></div>
      <div className="text-center"><span className="text-lg font-bold text-white block">{time.minutes || 0}</span><span className="text-gray-500">min</span></div>
    </div>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function Home() {
  const [searchTitle, setSearchTitle] = useState('');
  const { data: trending } = useGetTrendingEventsQuery();
  const { data: featured } = useGetFeaturedEventsQuery();

  const categories = ['Tech', 'Music', 'Sports', 'Business', 'Education', 'Gaming', 'Workshop', 'Other'];
  const categoryIcons = {
    Tech: '💻', Music: '🎵', Sports: '🏆', Business: '💼',
    Education: '📚', Gaming: '🎮', Workshop: '🔧', Other: '📅',
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center gradient-mesh overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-500/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-500/10 rounded-full blur-[120px]" />
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Discover Events That <span className="gradient-text">Move You</span>
            </h1>
            <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto">
              From tech conferences to music festivals — find and book the best events in your city.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
              <input
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                placeholder="Search events by title..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
              <Link
                to={`/events?search=${encodeURIComponent(searchTitle)}`}
                className="gradient-btn px-8 py-3 rounded-xl text-sm font-medium text-center"
              >
                Explore Events
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 -mt-20 relative z-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3"
        >
          {categories.map((cat) => (
            <motion.div key={cat} variants={itemVariants}>
              <Link
                to={`/events?category=${cat}`}
                className="glass glass-hover rounded-xl p-4 text-center block transition"
              >
                <span className="text-2xl block mb-1">{categoryIcons[cat]}</span>
                <span className="text-xs text-gray-300">{cat}</span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Featured Events */}
      {featured?.data?.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 mt-20">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h2 className="font-display text-3xl font-bold mb-2">Featured Events</h2>
            <p className="text-gray-500 text-sm mb-8">Hand-picked events you don't want to miss</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.data.slice(0, 6).map((event) => (
                <motion.div key={event._id} whileHover={{ y: -5 }} className="glass glass-hover rounded-2xl overflow-hidden">
                  <div className="h-40 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center">
                    {event.banner ? (
                      <img src={event.banner} alt={event.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl opacity-30">🎪</span>
                    )}
                  </div>
                  <div className="p-5">
                    <span className="text-[10px] uppercase tracking-wider text-indigo-400 font-medium">{event.category}</span>
                    <h3 className="text-lg font-semibold mt-1 mb-2">{event.title}</h3>
                    <p className="text-xs text-gray-500 mb-3">{formatDate(event.date)} • {event.city}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium gradient-text">
                        {event.ticketTypes?.some(t => t.price === 0) ? 'Free' : formatCurrency(event.ticketTypes?.[0]?.price || 0) + '+'}
                      </span>
                      <Link to={`/events/${event._id}`} className="text-xs text-indigo-400 hover:text-indigo-300">View Details →</Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* Trending Events */}
      {trending?.data?.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 mt-20">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h2 className="font-display text-3xl font-bold mb-2">Trending Now</h2>
            <p className="text-gray-500 text-sm mb-8">Most popular events this week</p>
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x">
              {trending.data.map((event) => (
                <motion.div
                  key={event._id}
                  whileHover={{ y: -5 }}
                  className="glass glass-hover rounded-2xl overflow-hidden min-w-[280px] max-w-[280px] snap-start shrink-0"
                >
                  <div className="h-36 bg-gradient-to-br from-violet-500/20 to-gold-500/10 flex items-center justify-center">
                    {event.banner ? (
                      <img src={event.banner} alt={event.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl opacity-30">🔥</span>
                    )}
                  </div>
                  <div className="p-4">
                    <span className="text-[10px] uppercase tracking-wider text-gold-400 font-medium">{event.category}</span>
                    <h3 className="text-sm font-semibold mt-1 mb-2 line-clamp-2">{event.title}</h3>
                    <div className="flex items-center justify-between">
                      <CountdownTimer date={event.date} />
                      <Link to={`/events/${event._id}`} className="text-xs text-indigo-400">Book →</Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 mt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-2xl p-8 md:p-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
        >
          {[
            { label: 'Events Hosted', value: '500+' },
            { label: 'Happy Attendees', value: '50K+' },
            { label: 'Cities', value: '100+' },
            { label: 'Organizers', value: '1K+' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="font-display text-3xl md:text-4xl font-bold gradient-text">{stat.value}</div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 mt-20">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <h2 className="font-display text-3xl font-bold text-center mb-10">What People Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Sarah K.', role: 'Event Attendee', text: 'EventSphere made finding and booking events so easy. The interface is stunning!' },
              { name: 'Mark T.', role: 'Organizer', text: 'As an organizer, the dashboard is incredible. Analytics, check-in, everything I need.' },
              { name: 'Emily R.', role: 'Regular User', text: 'I love the QR ticket system. No more paper tickets, just show my phone and go!' },
            ].map((t) => (
              <motion.div key={t.name} whileHover={{ y: -3 }} className="glass rounded-2xl p-6">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg key={s} className="w-4 h-4 text-gold-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  ))}
                </div>
                <p className="text-sm text-gray-400 mb-4">"{t.text}"</p>
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Newsletter */}
      <section className="max-w-7xl mx-auto px-4 mt-20 mb-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass rounded-2xl p-8 md:p-12 text-center"
        >
          <h2 className="font-display text-3xl font-bold mb-2">Stay in the Loop</h2>
          <p className="text-gray-400 text-sm mb-6">Get notified about the best events in your area</p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input placeholder="your@email.com" className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500" />
            <button className="gradient-btn px-6 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap">Subscribe</button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
