import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useSelector, useDispatch } from 'react-redux';
import { addNotification, setUnreadCount } from '../redux/slices/notificationSlice';

export const useSocket = () => {
  const socketRef = useRef(null);
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user) return;
    const socketUrl = import.meta.env.VITE_SOCKET_URL || '';
    socketRef.current = io(socketUrl, { withCredentials: true });
    socketRef.current.emit('join', user.id);
    socketRef.current.on('notification', (notification) => {
      dispatch(addNotification(notification));
    });
    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave', user.id);
        socketRef.current.disconnect();
      }
    };
  }, [user, dispatch]);

  return socketRef;
};
