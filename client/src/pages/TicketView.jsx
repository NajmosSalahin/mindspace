import { useParams } from 'react-router-dom';
import { useGetEventByIdQuery } from '../redux/services/eventService';

export default function TicketView() {
  const { id } = useParams();
  const { data } = useGetEventByIdQuery(id);

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="glass rounded-2xl p-8 text-center">
        <h1 className="font-display text-2xl font-bold mb-4">🎟️ Ticket</h1>
        <p className="text-gray-400 text-sm">{data?.data?.title || 'Event Ticket'}</p>
      </div>
    </div>
  );
}
