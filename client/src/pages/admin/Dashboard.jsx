import { useState, useEffect } from 'react';
import api from '../../services/axios';
import { formatCurrency } from '../../utils/formatters';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin/stats').then((res) => setStats(res.data.data)).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-6">Admin Dashboard</h1>
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass rounded-2xl p-5 text-center">
            <p className="text-2xl font-bold gradient-text">{stats.totalUsers}</p>
            <p className="text-xs text-gray-500">Users</p>
          </div>
          <div className="glass rounded-2xl p-5 text-center">
            <p className="text-2xl font-bold gradient-text">{stats.totalEvents}</p>
            <p className="text-xs text-gray-500">Events</p>
          </div>
          <div className="glass rounded-2xl p-5 text-center">
            <p className="text-2xl font-bold gradient-text">{stats.totalOrders}</p>
            <p className="text-xs text-gray-500">Orders</p>
          </div>
          <div className="glass rounded-2xl p-5 text-center">
            <p className="text-2xl font-bold gradient-text">{formatCurrency(stats.totalRevenue)}</p>
            <p className="text-xs text-gray-500">Revenue</p>
          </div>
        </div>
      )}
    </div>
  );
}
