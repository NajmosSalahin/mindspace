import { useState, useEffect } from 'react';
import api from '../../services/axios';

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/reports').then((res) => {
      setReports(res.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-6">Reported Content</h1>
      {reports.length === 0 ? (
        <p className="text-gray-500 text-center py-16">No reported content</p>
      ) : (
        <div className="space-y-2">
          {reports.map((review) => (
            <div key={review._id} className="glass rounded-xl p-4">
              <p className="text-sm">{review.comment}</p>
              <p className="text-xs text-gray-500 mt-1">By {review.userId?.name} on {review.eventId?.title}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
