import { useState, useEffect } from 'react';
import api from '../../services/axios';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/users').then((res) => {
      setUsers(res.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleToggleActive = async (id, isActive) => {
    try {
      await api.patch(`/admin/users/${id}`, { isActive: !isActive });
      setUsers(users.map((u) => u._id === id ? { ...u, isActive: !isActive } : u));
      toast.success(`User ${isActive ? 'suspended' : 'activated'}`);
    } catch (err) {
      toast.error('Failed');
    }
  };

  const handleRoleChange = async (id, role) => {
    try {
      await api.patch(`/admin/users/${id}`, { role });
      setUsers(users.map((u) => u._id === id ? { ...u, role } : u));
      toast.success('Role updated');
    } catch (err) {
      toast.error('Failed');
    }
  };

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-6">Users</h1>
      <div className="space-y-2">
        {users.map((user) => (
          <div key={user._id} className="glass rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center text-sm">
                {user.name?.[0]}
              </div>
              <div>
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={user.role}
                onChange={(e) => handleRoleChange(user._id, e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="user">User</option>
                <option value="organizer">Organizer</option>
                <option value="admin">Admin</option>
              </select>
              <button
                onClick={() => handleToggleActive(user._id, user.isActive)}
                className={`text-xs px-2 py-1 rounded-lg ${user.isActive ? 'text-red-400 hover:bg-red-500/10' : 'text-green-400 hover:bg-green-500/10'}`}
              >
                {user.isActive ? 'Suspend' : 'Activate'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
