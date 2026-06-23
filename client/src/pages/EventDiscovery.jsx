import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGetEventsQuery } from '../redux/services/eventService';
import { formatDate, formatCurrency } from '../utils/formatters';
import { CATEGORIES, CITIES } from '../constants';

export default function EventDiscovery() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const filters = {
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    city: searchParams.get('city') || '',
    sort: searchParams.get('sort') || 'date',
    page: parseInt(searchParams.get('page') || '1'),
  };

  const { data, isLoading, isError } = useGetEventsQuery(filters);

  const setFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== 'page') params.set('page', '1');
    setSearchParams(params);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl font-bold">Discover Events</h1>
          <p className="text-gray-500 text-sm mt-1">{data?.pagination?.total || 0} events found</p>
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className="lg:hidden glass px-4 py-2 rounded-xl text-sm">
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      <div className="flex gap-8">
        {/* Filters */}
        <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-64 shrink-0`}>
          <div className="glass rounded-2xl p-5 space-y-5 sticky top-24">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Search</label>
              <input
                value={filters.search}
                onChange={(e) => setFilter('search', e.target.value)}
                placeholder="Search events..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Category</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => setFilter('category', filters.category === cat.name ? '' : cat.name)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                      filters.category === cat.name
                        ? 'border-indigo-500 bg-indigo-500/20 text-indigo-400'
                        : 'border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">City</label>
              <select
                value={filters.city}
                onChange={(e) => setFilter('city', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="">All Cities</option>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Sort By</label>
              <select
                value={filters.sort}
                onChange={(e) => setFilter('sort', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="date">Date: Soonest</option>
                <option value="popular">Most Popular</option>
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="glass rounded-2xl overflow-hidden animate-pulse">
                  <div className="h-36 bg-white/5" />
                  <div className="p-4 space-y-3">
                    <div className="h-3 w-16 bg-white/5 rounded" />
                    <div className="h-4 w-3/4 bg-white/5 rounded" />
                    <div className="h-3 w-1/2 bg-white/5 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-20">
              <p className="text-gray-500">Failed to load events. Try again later.</p>
            </div>
          ) : data?.data?.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">🔍</p>
              <p className="text-gray-500">No events found. Try adjusting your filters.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {data?.data?.map((event, i) => (
                  <motion.div
                    key={event._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (i % 6) * 0.05 }}
                    whileHover={{ y: -5 }}
                  >
                    <Link to={`/events/${event._id}`} className="glass glass-hover rounded-2xl overflow-hidden block h-full">
                      <div className="h-36 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center">
                        {event.banner ? (
                          <img src={event.banner} alt={event.title} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-3xl opacity-30">🎪</span>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] uppercase tracking-wider text-indigo-400 font-medium">{event.category}</span>
                          {event.isFeatured && <span className="text-[10px] text-gold-400">★ Featured</span>}
                        </div>
                        <h3 className="text-sm font-semibold mb-2 line-clamp-2">{event.title}</h3>
                        <p className="text-xs text-gray-500 mb-1">{formatDate(event.date)}</p>
                        <p className="text-xs text-gray-500 mb-3">{event.city} • {event.venue}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium gradient-text">
                            {event.ticketTypes?.some(t => t.price === 0) ? 'Free' : formatCurrency(event.ticketTypes?.[0]?.price || 0) + '+'}
                          </span>
                          <span className="text-xs text-gray-500">{event.viewCount} views</span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {data?.pagination?.pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  {Array.from({ length: data.pagination.pages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setFilter('page', p.toString())}
                      className={`w-8 h-8 rounded-lg text-xs font-medium transition ${
                        filters.page === p
                          ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                          : 'text-gray-500 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
