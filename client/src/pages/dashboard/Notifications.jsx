import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import api from '../../services/axios';
import { setNotifications, markAllRead, markRead } from '../../redux/slices/notificationSlice';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function Notifications() {
  const dispatch = useDispatch();
  const { notifications } = useSelector((state) => state.notifications);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notifications').then((res) => {
      dispatch(setNotifications(res.data.data));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [dispatch]);

  const handleMarkRead = async (id) => {
    await api.patch(`/notifications/${id}/read`);
    dispatch(markRead(id));
  };

  const handleMarkAll = async () => {
    await api.patch('/notifications/read-all');
    dispatch(markAllRead());
    toast.success('All marked as read');
  };

  if (loading) return (
    <div>
      <div className="h-8 w-48 bg-white/10 rounded animate-pulse mb-6" />
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass rounded-xl p-4">
            <div className="h-4 w-3/4 bg-white/10 rounded animate-pulse mb-2" />
            <div className="h-3 w-20 bg-white/10 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-bold">Notifications</h1>
        <button onClick={handleMarkAll} className="text-xs text-indigo-400 hover:text-indigo-300">Mark all as read</button>
      </div>
      {notifications.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-4">🔔</p>
          <p className="text-gray-500">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => !n.isRead && handleMarkRead(n._id)}
              className={`glass rounded-xl p-4 cursor-pointer transition ${n.isRead ? 'opacity-60' : 'border-l-2 border-indigo-500'}`}
            >
              <p className="text-sm">{n.message}</p>
              <p className="text-xs text-gray-500 mt-1">{formatDate(n.createdAt)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
