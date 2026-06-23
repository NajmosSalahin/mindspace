import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useGetEventsQuery } from '../redux/services/eventService';
import { formatDate, formatCurrency } from '../utils/formatters';
import { CATEGORIES, CITIES } from '../constants';

export default function EventDiscovery() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [mapView, setMapView] = useState(false);

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

  const eventsWithCoords = data?.data?.filter((e) => e.coordinates?.lat && e.coordinates?.lng && (e.coordinates.lat !== 0 || e.coordinates.lng !== 0)) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="section-eyebrow">Discovery</span>
          <h1 className="font-display text-4xl font-bold text-white mt-1 tracking-display">All events</h1>
          <p className="text-gray-600 text-sm mt-1">{data?.pagination?.total || 0} events found</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMapView(!mapView)}
            className="bg-surface border border-border px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white transition flex items-center gap-2"
          >
            {mapView ? 'List view' : 'Map view'}
          </button>
          <button onClick={() => setShowFilters(!showFilters)} className="lg:hidden bg-surface border border-border px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white transition">
            {showFilters ? 'Hide filters' : 'Show filters'}
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Filters */}
        <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-64 shrink-0`}>
          <div className="bg-surface border border-border rounded-xl p-5 space-y-5 sticky top-24">
            <div>
              <label className="font-mono text-[10px] uppercase tracking-widest text-rose mb-2 block">Search</label>
              <input
                value={filters.search}
                onChange={(e) => setFilter('search', e.target.value)}
                placeholder="Search events..."
                className="w-full bg-deep border border-border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-rose/50 transition"
              />
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase tracking-widest text-rose mb-2 block">Category</label>
              <div className="space-y-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => setFilter('category', filters.category === cat.name ? '' : cat.name)}
                    className={`block w-full text-left text-sm px-3 py-1.5 rounded-lg transition ${
                      filters.category === cat.name
                        ? 'bg-rose/10 text-rose'
                        : 'text-gray-500 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase tracking-widest text-rose mb-2 block">City</label>
              <select
                value={filters.city}
                onChange={(e) => setFilter('city', e.target.value)}
                className="w-full bg-deep border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-rose/50 transition"
              >
                <option value="">All cities</option>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase tracking-widest text-rose mb-2 block">Sort by</label>
              <select
                value={filters.sort}
                onChange={(e) => setFilter('sort', e.target.value)}
                className="w-full bg-deep border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-rose/50 transition"
              >
                <option value="date">Date: Soonest</option>
                <option value="popular">Most popular</option>
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to high</option>
                <option value="price-desc">Price: High to low</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1">
          {mapView && eventsWithCoords.length > 0 ? (
            <div className="glass rounded-2xl p-4 mb-4">
              <div className="h-96 rounded-xl overflow-hidden">
                <MapContainer
                  center={[eventsWithCoords[0].coordinates.lat, eventsWithCoords[0].coordinates.lng]}
                  zoom={4}
                  scrollWheelZoom={true}
                  className="h-full w-full"
                  style={{ background: '#0A0F1E' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {eventsWithCoords.map((event) => (
                    <Marker key={event._id} position={[event.coordinates.lat, event.coordinates.lng]}>
                      <Popup>
                        <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13 }}>
                          <strong>{event.title}</strong>
                          <br />
                          {event.venue}, {event.city}
                          <br />
                          <a href={`/events/${event._id}`} style={{ color: '#4F46E5' }}>View event →</a>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-surface border border-border rounded-xl overflow-hidden animate-pulse">
                  <div className="h-36 bg-border" />
                  <div className="p-4 space-y-3">
                    <div className="h-3 w-16 bg-border rounded" />
                    <div className="h-4 w-3/4 bg-border rounded" />
                    <div className="h-3 w-1/2 bg-border rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-20">
              <p className="text-gray-600">Failed to load events. Try again later.</p>
            </div>
          ) : data?.data?.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-display text-6xl text-gray-800 mb-4">0</p>
              <p className="text-gray-600">No events found. Try adjusting your filters.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {data?.data?.map((event, i) => (
                  <motion.div
                    key={event._id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (i % 6) * 0.05 }}
                  >
                    <Link
                      to={`/events/${event._id}`}
                      className="bg-surface border border-border rounded-xl overflow-hidden block card-hover group"
                    >
                      <div className="h-36 bg-gradient-to-br from-rose/5 to-cyan/5 flex items-center justify-center overflow-hidden">
                        {event.banner ? (
                          <img src={event.banner} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                        ) : (
                          <span className="font-display text-4xl text-gray-800">ES</span>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-mono text-[10px] uppercase tracking-widest text-rose">{event.category}</span>
                          {event.isFeatured && <span className="font-mono text-[10px] uppercase tracking-widest text-amber-400">Featured</span>}
                        </div>
                        <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2">{event.title}</h3>
                        <div className="mt-2 text-xs text-gray-600">
                          <p>{formatDate(event.date)}</p>
                          <p className="mt-0.5">{event.city} — {event.venue}</p>
                        </div>
                        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                          <span className="font-mono text-sm text-rose">
                            {event.ticketTypes?.some(t => t.price === 0) ? 'Free' : formatCurrency(event.ticketTypes?.[0]?.price || 0) + '+'}
                          </span>
                          <span className="font-mono text-[10px] text-gray-600">{event.viewCount} views</span>
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
                      className={`w-8 h-8 rounded-lg text-xs font-mono font-medium transition ${
                        filters.page === p
                          ? 'bg-rose/10 text-rose border border-rose/30'
                          : 'text-gray-600 hover:text-white hover:bg-white/5'
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
