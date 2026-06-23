import { useState, useEffect } from 'react';
import api from '../../services/axios';
import { formatCurrency } from '../../utils/formatters';

export default function AdminRevenue() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/admin/revenue').then((res) => setData(res.data.data)).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-6">Revenue</h1>
      {data && (
        <div className="glass rounded-2xl p-6">
          <p className="text-sm text-gray-500 mb-2">Total Revenue</p>
          <p className="text-4xl font-bold gradient-text">{formatCurrency(data.total)}</p>
        </div>
      )}
    </div>
  );
}
