import { useState, useEffect } from 'react';
import api from '../../services/axios';
import { formatDate, formatCurrency } from '../../utils/formatters';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/payments/history').then((res) => {
      setOrders(res.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div>
      <div className="h-8 w-48 bg-white/10 rounded animate-pulse mb-6" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass rounded-2xl p-4">
            <div className="h-4 w-24 bg-white/10 rounded animate-pulse mb-2" />
            <div className="h-3 w-16 bg-white/10 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-6">Order History</h1>
      {orders.length === 0 ? (
        <p className="text-gray-500 text-center py-16">No orders yet</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order._id} className="glass rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{formatCurrency(order.amount)}</p>
                <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                order.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
              }`}>{order.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
