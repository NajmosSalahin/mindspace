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

  if (loading) return <p className="text-gray-500">Loading...</p>;

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
