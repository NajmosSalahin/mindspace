import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/axios';
import toast from 'react-hot-toast';

export default function Following() {
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/following').then((res) => {
      setFollowing(res.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleUnfollow = async (id, name) => {
    try {
      await api.delete(`/users/${id}/unfollow`);
      setFollowing(following.filter((u) => u._id !== id));
      toast.success(`Unfollowed ${name}`);
    } catch (err) {
      toast.error('Failed to unfollow');
    }
  };

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-6">Following</h1>
      {following.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-4">👥</p>
          <p className="text-gray-500 mb-4">Not following anyone yet</p>
          <Link to="/organizers" className="text-rose text-sm hover:text-rose-400 transition">Browse Organizers →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {following.map((user) => (
            <div key={user._id} className="glass rounded-2xl p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center text-lg font-display text-gray-400 shrink-0 overflow-hidden">
                  {user.profileImage ? (
                    <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name?.[0] || 'U'
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{user.name}</h3>
                  {user.role && <p className="text-xs text-gray-500 mt-0.5 capitalize">{user.role}</p>}
                </div>
              </div>
              <button
                onClick={() => handleUnfollow(user._id, user.name)}
                className="glass px-3 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-500/10"
              >
                Unfollow
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
