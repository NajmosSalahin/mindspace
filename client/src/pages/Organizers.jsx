import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/axios';

export default function Organizers() {
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/organizers').then((res) => {
      setOrganizers(res.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="h-8 w-1/4 bg-white/10 rounded animate-pulse mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass rounded-2xl p-6">
              <div className="w-14 h-14 bg-white/10 rounded-xl animate-pulse mb-4" />
              <div className="h-5 w-2/3 bg-white/10 rounded animate-pulse mb-2" />
              <div className="h-4 w-1/2 bg-white/10 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="font-display text-4xl font-bold mb-2">Organizers</h1>
      <p className="text-gray-500 text-sm mb-8">Meet the people behind the events</p>

      {organizers.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-4">🎪</p>
          <p className="text-gray-500">No organizers found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {organizers.map((org) => (
            <Link
              key={org._id}
              to={`/organizers/${org._id}`}
              className="glass glass-hover rounded-2xl p-6 flex items-start gap-4"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center text-xl font-display text-gray-400 shrink-0 overflow-hidden">
                {org.profileImage ? (
                  <img src={org.profileImage} alt={org.name} className="w-full h-full object-cover" />
                ) : (
                  org.name?.[0] || 'O'
                )}
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-sm text-white truncate">{org.name}</h3>
                {org.email && <p className="text-xs text-gray-600 mt-0.5 truncate">{org.email}</p>}
                {org.bio && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{org.bio}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
