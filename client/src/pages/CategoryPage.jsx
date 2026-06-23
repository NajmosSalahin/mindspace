import { useParams } from 'react-router-dom';
import { useGetEventsByCategoryQuery } from '../redux/services/eventService';
import { Link } from 'react-router-dom';

export default function CategoryPage() {
  const { slug } = useParams();
  const { data } = useGetEventsByCategoryQuery(slug);

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <h1 className="font-display text-4xl font-bold capitalize mb-6">{slug} Events</h1>
      {data?.data?.length === 0 ? (
        <p className="text-gray-500">No events in this category.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {data?.data?.map((event) => (
            <Link key={event._id} to={`/events/${event._id}`} className="glass glass-hover rounded-2xl p-4">
              <h3 className="font-semibold text-sm">{event.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{event.city}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
