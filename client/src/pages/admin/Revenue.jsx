import { useState, useEffect } from 'react';
import api from '../../services/axios';
import { formatCurrency } from '../../utils/formatters';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function AdminRevenue() {
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState('all');

  useEffect(() => {
    api.get('/admin/revenue').then((res) => setData(res.data.data)).catch(() => {});
  }, []);

  const chartData = data?.revenue?.map((r) => ({
    date: r._id,
    revenue: r.total,
    orders: r.count,
  })) || [];

  const filteredData = period === '7d'
    ? chartData.slice(-7)
    : period === '30d'
    ? chartData.slice(-30)
    : chartData;

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-6">Revenue</h1>

      {data && (
        <>
          <div className="glass rounded-2xl p-6 mb-6">
            <p className="text-sm text-gray-500 mb-2">Total Revenue</p>
            <p className="text-4xl font-bold gradient-text">{formatCurrency(data.total)}</p>
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-sm">Revenue Over Time</h3>
              <div className="flex gap-2">
                {['7d', '30d', 'all'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`text-xs px-3 py-1 rounded-lg transition ${
                      period === p ? 'bg-indigo-500/20 text-indigo-400' : 'text-gray-600 hover:text-gray-400'
                    }`}
                  >
                    {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : 'All Time'}
                  </button>
                ))}
              </div>
            </div>

            {filteredData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={filteredData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={(v) => v?.slice(5) || ''} />
                  <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 13 }}
                    labelFormatter={(v) => `Date: ${v}`}
                    formatter={(value) => [formatCurrency(value), 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-sm text-center py-8">No revenue data yet.</p>
            )}
          </div>
        </>
      )}

      {!data && (
        <div className="text-center py-16">
          <p className="text-4xl mb-4">📊</p>
          <p className="text-gray-500">Loading revenue data...</p>
        </div>
      )}
    </div>
  );
}
