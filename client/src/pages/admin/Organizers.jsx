import { useState, useEffect } from 'react';
import api from '../../services/axios';
import toast from 'react-hot-toast';

export default function AdminOrganizers() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/users?role=user&search=&limit=50').then((res) => {
      const users = res.data.data;
      setRequests(users.filter((u) => u.organizerRequested));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleAction = async (userId, action) => {
    try {
      await api.patch('/admin/approve-organizer', { userId, action });
      setRequests(requests.filter((r) => r._id !== userId));
      toast.success(`Request ${action}d`);
    } catch (err) {
      toast.error('Failed');
    }
  };

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-6">Organizer Requests</h1>
      {requests.length === 0 ? (
        <p className="text-gray-500 text-center py-16">No pending requests</p>
      ) : (
        <div className="space-y-2">
          {requests.map((user) => (
            <div key={user._id} className="glass rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleAction(user._id, 'approve')} className="gradient-btn px-4 py-1.5 rounded-lg text-xs font-medium">Approve</button>
                <button onClick={() => handleAction(user._id, 'reject')} className="glass px-4 py-1.5 rounded-lg text-xs hover:bg-red-500/10 text-red-400">Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
